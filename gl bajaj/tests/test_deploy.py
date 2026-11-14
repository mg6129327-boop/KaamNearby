import os
from unittest.mock import patch

from tests.test_base import BaseTestCase
from production_setup import bootstrap
from database import get_db


class ProductionGuardTests(BaseTestCase):
    def test_production_refuses_to_start_without_secret_key(self):
        import app as app_module
        env = {'KAAMNEARBY_PRODUCTION': '1'}
        with patch.dict(os.environ, env, clear=False):
            os.environ.pop('SECRET_KEY', None)
            with self.assertRaises(RuntimeError):
                app_module.create_app()

    def test_production_mode_disables_debug_and_secures_cookies(self):
        import app as app_module
        with patch.dict(os.environ, {'KAAMNEARBY_PRODUCTION': '1', 'SECRET_KEY': 'x' * 40}):
            prod = app_module.create_app()
        self.assertFalse(prod.debug)
        self.assertTrue(prod.config['SESSION_COOKIE_SECURE'])


class ProductionBootstrapTests(BaseTestCase):
    def test_bootstrap_creates_categories_and_one_admin_only(self):
        with self.app.app_context():
            db = get_db()
            admins_before = db.execute("SELECT COUNT(*) FROM users WHERE role='admin'").fetchone()[0]
            users_before = db.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        messages = bootstrap(self.app, 'owner@example.com', 'LongOwnerPass123')
        self.assertTrue(any('Admin account created' in m for m in messages))
        with self.app.app_context():
            db = get_db()
            admins_after = db.execute("SELECT COUNT(*) FROM users WHERE role='admin'").fetchone()[0]
            users_after = db.execute("SELECT COUNT(*) FROM users").fetchone()[0]
            cats = db.execute("SELECT COUNT(*) FROM categories").fetchone()[0]
        self.assertEqual(admins_after, admins_before + 1)
        self.assertEqual(users_after, users_before + 1)   # only the admin was added, no sample users
        self.assertGreaterEqual(cats, 8)

    def test_bootstrap_is_idempotent_and_does_not_change_existing_admin_password(self):
        bootstrap(self.app, 'owner@example.com', 'LongOwnerPass123')
        messages = bootstrap(self.app, 'owner@example.com', 'AnotherPass12345')
        self.assertTrue(any('NOT changed' in m for m in messages))
        self.login('owner@example.com', 'LongOwnerPass123')
        self.assertEqual(self.client.get('/admin/dashboard').status_code, 200)
