"""WSGI entry point for hosting (PythonAnywhere, Render, etc.).

Reads a `.env` file that exists ONLY on the server (it is never uploaded in the zip),
so secrets do not need to be typed into hosting dashboards or code.
"""
import os
import sys

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_DIR)


def load_env_file(path):
    if not os.path.exists(path):
        return
    with open(path, encoding='utf-8') as fh:
        for raw in fh:
            line = raw.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, value = line.split('=', 1)
            key = key.strip()
            value = value.strip().split(' #', 1)[0].strip().strip('"').strip("'")
            os.environ.setdefault(key, value)


load_env_file(os.path.join(PROJECT_DIR, '.env'))
os.environ.setdefault('KAAMNEARBY_PRODUCTION', '1')

from app import create_app  # noqa: E402

application = create_app()
