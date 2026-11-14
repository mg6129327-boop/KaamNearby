import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

def _load_env():
    """Load key-value pairs from .env or .ENV if present."""
    for filename in ['.env', '.ENV']:
        env_file = os.path.join(BASE_DIR, filename)
        if os.path.isfile(env_file):
            try:
                with open(env_file, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith('#') or '=' not in line:
                            continue
                        k, v = line.split('=', 1)
                        k = k.strip()
                        v = v.strip().strip('\'"')
                        if k and k not in os.environ:
                            os.environ[k] = v
            except Exception:
                pass

_load_env()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'kaamnearby-secret-key-prod-random-2026')
    DATABASE = os.environ.get('DATABASE_PATH', os.path.join(BASE_DIR, 'instance', 'kaamnearby.db'))
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', os.path.join(BASE_DIR, 'uploads', 'verifications'))
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    ITEMS_PER_PAGE = 8

    # Google OAuth 2.0 Credentials
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True
    DEBUG = False
    DATABASE = os.path.join(BASE_DIR, 'instance', 'test_kaamnearby.db')
    SECRET_KEY = 'test-secret-key-1234'
    WTF_CSRF_ENABLED = False

class ProductionConfig(Config):
    DEBUG = False
    SESSION_COOKIE_SECURE = True

