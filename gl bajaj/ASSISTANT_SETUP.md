# KaamNearby Help Assistant (Google Gemini) — Setup

The chat widget (bottom-right "Help" button) calls `POST /api/assistant`, which sends the user's question to Google Gemini.

## 1. Get an API key
1. Open Google AI Studio and create an API key.
2. Keep the key secret. Never paste it into code, chat, screenshots, or commit it to Git.

## 2. Set the key (Windows PowerShell, same terminal where you run `python app.py`)
```powershell
$env:GEMINI_API_KEY = "paste-your-key-here"
$env:GEMINI_MODEL = "gemini-2.5-flash"   # optional, this is the default
python app.py
```
The variable only lasts for that terminal session. For a permanent setting, use Windows "Environment Variables".

## 3. Test it
Open http://127.0.0.1:5000, click **Help**, and ask "Booking kaise karein?".
- If you see "abhi configure nahi hai", the key is not set in that terminal.
- If you see "Assistant abhi available nahi hai", check the key, internet connection, and `GEMINI_MODEL` name (Google sometimes renames models).

## 4. Safety built in
- The key is read only from the environment variable and sent in a header, not in the URL, responses, or logs.
- Requests need the CSRF token, so other websites cannot use your key through a visitor's browser.
- Each IP can send 15 messages per 10 minutes (in-memory; resets on restart).
- Only the question and the last few chat turns go to Gemini. No account, booking, or document data is sent.
- Messages are shown as plain text in the browser, so model output cannot inject HTML.
- The assistant is instructed to answer only about KaamNearby and never to ask for passwords, Aadhaar, PAN, or bank details.

## 5. Tests
```powershell
python -m unittest discover tests
```
The assistant tests mock the Gemini network call, so they run without an API key or internet.

## Known limits
- Gemini answers can be wrong. The widget shows a disclaimer; for real policies, the Contact page is the source of truth.
- The rate limiter is per-process memory. For multiple servers, use Redis or a database.
- Before public launch, rotate any key that was ever shared, and set `SECRET_KEY` as an environment variable.
