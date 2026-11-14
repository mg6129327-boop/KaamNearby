# Deploy KaamNearby on PythonAnywhere (step by step)

Free account is enough to start. You get `https://YOURUSERNAME.pythonanywhere.com`.

## 0. Before anything: rotate secrets
- Delete the Gemini key you shared earlier and create a new one in Google AI Studio.
- Do NOT upload `.env` anywhere. It is not in this zip. You will create it on the server (step 4).

## 1. Create the account
1. Sign up at https://www.pythonanywhere.com (choose "Beginner"/free).
2. Note your username, for example `mridul`. Replace `YOURUSERNAME` below with it.

## 2. Upload the code
1. Go to the **Files** tab, click **Upload a file** and choose `kaamnearby_deploy.zip`. It appears in your home folder.
2. Open a **Bash console** (Consoles tab → Bash) and run:
   ```bash
   cd ~
   unzip kaamnearby_deploy.zip
   cd ~/kaamnearby
   mkdir -p instance uploads/verifications
   ```

## 3. Create the Python environment
In the same Bash console (Python 3.12 is recommended; match the version you pick in step 6):
```bash
python3.12 -m venv ~/.venvs/kaamnearby
source ~/.venvs/kaamnearby/bin/activate
pip install -r ~/kaamnearby/requirements.txt
```

## 4. Create the server-only `.env` file
```bash
cd ~/kaamnearby
nano .env
```
Paste this, then replace the values:
```
SECRET_KEY=PASTE_A_LONG_RANDOM_STRING
KAAMNEARBY_PRODUCTION=1
GEMINI_API_KEY=YOUR_NEW_GEMINI_KEY
GEMINI_MODEL=gemini-2.5-flash
DATABASE_PATH=/home/YOURUSERNAME/kaamnearby/instance/kaamnearby.db
UPLOAD_FOLDER=/home/YOURUSERNAME/kaamnearby/uploads/verifications
```
To generate SECRET_KEY, run: `python3 -c "import secrets; print(secrets.token_hex(32))"`
Save with Ctrl+O, Enter, then Ctrl+X.

## 5. Create tables, categories and your admin account (one time)
```bash
cd ~/kaamnearby
source ~/.venvs/kaamnearby/bin/activate
set -a; source .env; set +a
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='YourLongPassword2026' python production_setup.py
```
You should see "Categories ready" and "Admin account created". No demo users are created.
Use a password of 12+ characters. Keep it safe.

## 6. Create the web app
1. Go to the **Web** tab → **Add a new web app** → **Manual configuration** → **Python 3.12**.
2. In the settings page, set:
   - **Source code:** `/home/YOURUSERNAME/kaamnearby`
   - **Working directory:** `/home/YOURUSERNAME/kaamnearby`
   - **Virtualenv:** `/home/YOURUSERNAME/.venvs/kaamnearby`
3. Click the **WSGI configuration file** link. Replace ALL its content with:
   ```python
   import sys
   path = '/home/YOURUSERNAME/kaamnearby'
   if path not in sys.path:
       sys.path.insert(0, path)
   from wsgi import application
   ```
   Save.
4. In **Static files**, add:
   - URL: `/static/`   Directory: `/home/YOURUSERNAME/kaamnearby/static`

## 7. Go live
Click the green **Reload** button on the Web tab. Open `https://YOURUSERNAME.pythonanywhere.com`.

Check:
- Homepage loads, the Help widget opens.
- Log in with your admin account. Admin dashboard opens.
- Register a test customer. Sign up as a worker and upload an ID (goes to admin for approval).

## Updating the site later
1. Make changes on your PC and create a new zip the same way.
2. Upload it, then in Bash: `cd ~ && unzip -o kaamnearby_deploy.zip` (this does not touch `.env`, `instance/` or `uploads/`).
3. Click **Reload** on the Web tab.

## Backups (important)
Your data is in `~/kaamnearby/instance/kaamnearby.db` and uploaded IDs are in `~/kaamnearby/uploads/`.
From the **Files** tab, download these regularly.

## Known limits on the free plan
- Outbound internet is restricted on free accounts. If the Gemini assistant shows a `network error` reason, the assistant still answers from the built-in app answers. A paid plan removes this restriction.
- One free web app, reloaded manually after changes.
- Free accounts may be limited in CPU. Fine for testing and a demo.

## If something breaks
- Web tab → **Error log** link shows the traceback. Send it to the developer.
- Missing `SECRET_KEY` error: `.env` is missing or wrong. Check step 4.
