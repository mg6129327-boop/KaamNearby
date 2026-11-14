from tests.test_base import BaseTestCase
from database import get_db


class AddWorkerTests(BaseTestCase):
    OWNER = ('rahul.customer@example.com', 'Customer@12345')

    def setUp(self):
        super().setUp()
        self.login(*self.OWNER)

    def _csrf(self):
        self.client.get('/customer/add-worker')
        return self.get_csrf()

    def _form(self, token, **overrides):
        data = {
            'name': 'Vikram Friend', 'email': 'vikram.friend@example.com', 'phone': '9000000001',
            'city': 'Noida', 'category': 'Electrical Services', 'starting_price': '400',
            'experience_years': '3', 'service_area': 'Sector 62', 'bio': 'Fan and wiring work.',
            'password': 'Friend@12345', 'confirm_password': 'Friend@12345', 'csrf_token': token,
        }
        data.update(overrides)
        return data

    def test_owner_creates_worker_account_and_stays_logged_in(self):
        token = self._csrf()
        res = self.client.post('/customer/add-worker', data=self._form(token), follow_redirects=True)
        self.assertIn('1 worker account(s) created', res.get_data(as_text=True))
        # Owner session is unchanged: still on customer pages
        self.assertEqual(self.client.get('/customer/dashboard').status_code, 200)
        self.assertEqual(self.client.get('/worker/dashboard').status_code, 403)

    def test_created_worker_can_log_in_with_their_own_credentials(self):
        token = self._csrf()
        self.client.post('/customer/add-worker', data=self._form(token))
        self.login('vikram.friend@example.com', 'Friend@12345')
        self.assertEqual(self.client.get('/worker/dashboard').status_code, 200)

    def test_new_worker_is_pending_and_linked_to_owner(self):
        token = self._csrf()
        self.client.post('/customer/add-worker', data=self._form(token))
        with self.app.app_context():
            db = get_db()
            owner = db.execute("SELECT id FROM users WHERE email=?", (self.OWNER[0],)).fetchone()
            row = db.execute("""SELECT u.created_by, u.role, w.verification_status, w.category
                                FROM users u JOIN workers w ON w.user_id = u.id
                                WHERE u.email='vikram.friend@example.com'""").fetchone()
            self.assertEqual(row['created_by'], owner['id'])
            self.assertEqual(row['role'], 'worker')
            self.assertEqual(row['verification_status'], 'pending')

    def test_duplicate_email_is_rejected(self):
        token = self._csrf()
        self.client.post('/customer/add-worker', data=self._form(token))
        res = self.client.post('/customer/add-worker', data=self._form(token), follow_redirects=True)
        self.assertIn('already exists', res.get_data(as_text=True))

    def test_password_mismatch_and_short_password_rejected(self):
        token = self._csrf()
        res = self.client.post('/customer/add-worker', data=self._form(token, confirm_password='Other@12345'), follow_redirects=True)
        self.assertIn('Passwords do not match', res.get_data(as_text=True))
        res = self.client.post('/customer/add-worker', data=self._form(token, email='x2@example.com', password='short', confirm_password='short'), follow_redirects=True)
        self.assertIn('at least 8 characters', res.get_data(as_text=True))

    def test_invalid_category_rejected(self):
        token = self._csrf()
        res = self.client.post('/customer/add-worker', data=self._form(token, category='Astrology'), follow_redirects=True)
        self.assertIn('valid service category', res.get_data(as_text=True))

    def test_bulk_creates_valid_rows_and_reports_bad_row(self):
        token = self._csrf()
        data = {'csrf_token': token,
                'workers[0][name]': 'Ramesh Helper', 'workers[0][email]': 'ramesh.helper@example.com',
                'workers[0][city]': 'Noida', 'workers[0][category]': 'Plumbing',
                'workers[0][password]': 'Helper@12345', 'workers[0][confirm_password]': 'Helper@12345',
                'workers[1][name]': 'Bad Row', 'workers[1][email]': 'bad.row@example.com',
                'workers[1][city]': 'Noida', 'workers[1][category]': 'Plumbing',
                'workers[1][password]': 'short', 'workers[1][confirm_password]': 'short'}
        res = self.client.post('/customer/add-worker', data=data, follow_redirects=True)
        body = res.get_data(as_text=True)
        self.assertIn('1 worker account(s) created', body)
        self.assertIn('Worker 2: Password must be at least 8 characters', body)
        with self.app.app_context():
            db = get_db()
            self.assertIsNotNone(db.execute("SELECT id FROM users WHERE email='ramesh.helper@example.com'").fetchone())
            self.assertIsNone(db.execute("SELECT id FROM users WHERE email='bad.row@example.com'").fetchone())

    def test_no_total_limit_on_worker_accounts(self):
        token = self._csrf()
        with self.app.app_context():
            db = get_db()
            owner = db.execute("SELECT id FROM users WHERE email=?", (self.OWNER[0],)).fetchone()['id']
            for i in range(12):
                db.execute("INSERT INTO users (name,email,password_hash,role,city,created_by) VALUES (?,?,?,?,?,?)",
                           (f'W{i}', f'w{i}@x.com', 'x', 'worker', 'Noida', owner))
            db.commit()
        res = self.client.post('/customer/add-worker', data=self._form(token), follow_redirects=True)
        self.assertIn('1 worker account(s) created', res.get_data(as_text=True))

    def test_only_customers_can_use_add_worker(self):
        self.login('suresh.electrician@example.com', 'Worker@12345')
        self.assertEqual(self.client.get('/customer/add-worker').status_code, 403)
