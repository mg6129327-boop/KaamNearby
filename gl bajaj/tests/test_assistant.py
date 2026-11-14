import io
import json
import os
import urllib.error
from unittest.mock import patch

import app as app_module
from assistant import (
    AssistantError, RateLimiter, clean_text, sanitize_history, generate_reply,
    MAX_HISTORY_TURNS, MAX_MESSAGE_CHARS, DEFAULT_MODEL
)
from tests.test_base import BaseTestCase

FAKE_KEY = 'TEST-GEMINI-KEY-do-not-leak-998877'


def gemini_ok(text):
    return {'candidates': [{'content': {'parts': [{'text': text}]}}]}


class AssistantUnitTests(BaseTestCase):
    def test_clean_text_removes_control_chars_and_limits_length(self):
        self.assertEqual(clean_text('  hi\x00there\x07  ', 100), 'hithere')
        self.assertEqual(len(clean_text('a' * 1000, MAX_MESSAGE_CHARS)), MAX_MESSAGE_CHARS)
        self.assertEqual(clean_text(12345, 100), '')

    def test_history_keeps_last_turns_maps_roles_and_starts_with_user(self):
        history = [{'role': 'assistant', 'content': 'early bot'}]
        for i in range(10):
            history.append({'role': 'user', 'content': f'q{i}'})
            history.append({'role': 'assistant', 'content': f'a{i}'})
        history.append({'role': 'system', 'content': 'hack'})   # invalid role is dropped
        history.append({'role': 'user', 'content': ''})         # empty is dropped
        turns = sanitize_history(history)
        self.assertLessEqual(len(turns), MAX_HISTORY_TURNS)
        self.assertEqual(turns[0]['role'], 'user')
        self.assertTrue(all(t['role'] in ('user', 'model') for t in turns))
        self.assertNotIn('hack', [t['content'] for t in turns])

    def test_rate_limiter_blocks_after_limit_and_recovers_after_window(self):
        limiter = RateLimiter(max_calls=2, window_seconds=60)
        self.assertTrue(limiter.allow('ip', now=0))
        self.assertTrue(limiter.allow('ip', now=1))
        self.assertFalse(limiter.allow('ip', now=2))
        self.assertTrue(limiter.allow('ip', now=100))

    def test_empty_message_raises_400(self):
        with self.assertRaises(AssistantError) as ctx:
            generate_reply('   ', [], api_key=FAKE_KEY)
        self.assertEqual(ctx.exception.status, 400)

    def test_payload_contains_system_prompt_and_never_the_api_key(self):
        captured = {}

        def fake_post(model, api_key, payload):
            captured['model'] = model
            captured['payload'] = payload
            return gemini_ok('Booking ke liye worker profile kholiye.')

        with patch('assistant._post_json', side_effect=fake_post):
            reply = generate_reply('Booking kaise karein?', [], api_key=FAKE_KEY)

        self.assertEqual(reply, 'Booking ke liye worker profile kholiye.')
        self.assertEqual(captured['model'], DEFAULT_MODEL)
        self.assertIn('systemInstruction', captured['payload'])
        self.assertNotIn(FAKE_KEY, json.dumps(captured['payload']))

    def test_empty_candidates_gives_safe_fallback(self):
        with patch('assistant._post_json', return_value={'candidates': []}):
            with self.assertRaises(AssistantError) as ctx:
                generate_reply('hello', [], api_key=FAKE_KEY)
        self.assertEqual(ctx.exception.status, 502)
        self.assertNotIn(FAKE_KEY, ctx.exception.public_message)


class AssistantRouteTests(BaseTestCase):
    def _csrf(self):
        self.client.get('/')
        return self.get_csrf()

    def test_missing_api_key_uses_local_answer(self):
        token = self._csrf()
        with patch.dict(os.environ, {}, clear=False):
            os.environ.pop('GEMINI_API_KEY', None)
            res = self.client.post('/api/assistant', json={'message': 'Booking kaise karein?'},
                                   headers={'X-CSRFToken': token})
        body = res.get_json()
        self.assertEqual(res.status_code, 200)
        self.assertEqual(body['source'], 'local')
        self.assertIn('Services page', body['reply'])

    def test_request_without_csrf_token_is_rejected(self):
        self._csrf()
        with patch.dict(os.environ, {'GEMINI_API_KEY': FAKE_KEY}):
            res = self.client.post('/api/assistant', json={'message': 'hi'})
        self.assertEqual(res.status_code, 400)

    def test_successful_reply_is_returned(self):
        token = self._csrf()
        with patch.dict(os.environ, {'GEMINI_API_KEY': FAKE_KEY}), \
             patch('assistant._post_json', return_value=gemini_ok('Namaste, kaise madad karun?')):
            res = self.client.post('/api/assistant', json={'message': 'hi', 'history': []},
                                   headers={'X-CSRFToken': token})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()['reply'], 'Namaste, kaise madad karun?')

    def test_upstream_403_falls_back_to_local_and_never_leaks_key(self):
        token = self._csrf()
        http_err = urllib.error.HTTPError(
            url='https://example.test', code=403, msg='Forbidden',
            hdrs={}, fp=io.BytesIO(b'{"error": "API key invalid: ' + FAKE_KEY.encode() + b'"}'))
        with patch.dict(os.environ, {'GEMINI_API_KEY': FAKE_KEY}), \
             patch('assistant.urllib.request.urlopen', side_effect=http_err):
            res = self.client.post('/api/assistant', json={'message': 'hi'},
                                   headers={'X-CSRFToken': token})
        body = res.get_data(as_text=True)
        self.assertEqual(res.status_code, 200)
        self.assertNotIn(FAKE_KEY, body)
        self.assertNotIn('API key', body)
        self.assertEqual(res.get_json()['source'], 'local')

    def test_rate_limit_returns_429(self):
        token = self._csrf()
        original = app_module.assistant_limiter
        app_module.assistant_limiter = RateLimiter(max_calls=1, window_seconds=600)
        try:
            with patch.dict(os.environ, {'GEMINI_API_KEY': FAKE_KEY}), \
                 patch('assistant._post_json', return_value=gemini_ok('ok')):
                first = self.client.post('/api/assistant', json={'message': 'hi'},
                                         headers={'X-CSRFToken': token})
                second = self.client.post('/api/assistant', json={'message': 'hi again'},
                                          headers={'X-CSRFToken': token})
            self.assertEqual(first.status_code, 200)
            self.assertEqual(second.status_code, 429)
        finally:
            app_module.assistant_limiter = original

    def test_assistant_widget_is_rendered_on_public_pages(self):
        res = self.client.get('/')
        html = res.get_data(as_text=True)
        self.assertEqual(res.status_code, 200)
        self.assertIn('id="kaFab"', html)
        self.assertIn('meta name="csrf-token"', html)
        self.assertIn('js/assistant.js', html)

    def test_login_welcome_popup_is_shown_to_guests_on_home(self):
        res = self.client.get('/')
        html = res.get_data(as_text=True)
        self.assertEqual(res.status_code, 200)
        self.assertIn('id="kaWelcome"', html)
        self.assertIn('js/welcome.js', html)


class LocalAnswerTests(BaseTestCase):
    def test_keywords_map_to_expected_topics(self):
        from assistant import local_answer
        self.assertIn('Verified', local_answer('worker verification kaise hota hai'))
        self.assertIn('Price negotiation', local_answer('price negotiation kaise kaam karta hai'))
        self.assertIn('Add Worker', local_answer('dost ke liye worker account kaise banaun'))
        self.assertIn('Login', local_answer('login kahan hai'))

    def test_unknown_question_gets_helpful_default(self):
        from assistant import local_answer
        self.assertIn('KaamNearby', local_answer('xyz qwerty'))


class AssistantDiagnosticsTests(BaseTestCase):
    def _csrf(self):
        self.client.get('/')
        return self.get_csrf()

    def test_404_model_falls_back_to_next_model(self):
        calls = []

        def fake_post(model, api_key, payload):
            calls.append(model)
            if model == 'gemini-2.5-flash':
                raise AssistantError('not found', 502, reason='HTTP 404')
            return gemini_ok('Fallback model ka jawab.')

        with patch('assistant._post_json', side_effect=fake_post):
            reply = generate_reply('Booking kaise karein?', [], api_key=FAKE_KEY, model='gemini-2.5-flash')
        self.assertEqual(reply, 'Fallback model ka jawab.')
        self.assertEqual(calls[0], 'gemini-2.5-flash')
        self.assertEqual(calls[1], 'gemini-2.0-flash')

    def test_403_reason_is_shown_on_screen_without_key(self):
        token = self._csrf()
        with patch.dict(os.environ, {'GEMINI_API_KEY': FAKE_KEY}), \
             patch('assistant._post_json', side_effect=AssistantError('x', 502, reason='HTTP 403')):
            res = self.client.post('/api/assistant', json={'message': 'Booking kaise karein?'},
                                   headers={'X-CSRFToken': token})
        body = res.get_json()
        self.assertEqual(res.status_code, 200)
        self.assertIn('HTTP 403', body['reply'])
        self.assertIn('Services page', body['reply'])
        self.assertNotIn(FAKE_KEY, res.get_data(as_text=True))
        self.assertNotIn('available nahi', res.get_data(as_text=True))


class AssistantRetryTests(BaseTestCase):
    def test_429_is_retried_once_then_succeeds(self):
        calls = []

        def fake_post(model, api_key, payload):
            calls.append(model)
            if len(calls) == 1:
                raise AssistantError('limit', 502, reason='HTTP 429')
            return gemini_ok('Retry ke baad jawab.')

        with patch('assistant._post_json', side_effect=fake_post), patch('assistant.RETRY_DELAY_SECONDS', 0):
            reply = generate_reply('Booking kaise karein?', [], api_key=FAKE_KEY)
        self.assertEqual(reply, 'Retry ke baad jawab.')
        self.assertEqual(calls, ['gemini-2.5-flash', 'gemini-2.5-flash'])

    def test_auth_error_is_not_retried(self):
        calls = []

        def fake_post(model, api_key, payload):
            calls.append(model)
            raise AssistantError('bad key', 502, reason='HTTP 403')

        with patch('assistant._post_json', side_effect=fake_post), patch('assistant.RETRY_DELAY_SECONDS', 0):
            with self.assertRaises(AssistantError) as ctx:
                generate_reply('hello', [], api_key=FAKE_KEY)
        self.assertEqual(ctx.exception.reason, 'HTTP 403')
        self.assertEqual(len(calls), 1)
