"""One-time production setup. Creates tables, default categories and ONE admin account.
It does NOT create demo users or sample workers.

Run on the server, after setting ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters):
    python production_setup.py
"""
import os
import sys

from werkzeug.security import generate_password_hash

from database import get_db, init_db

CATEGORIES = [
    ("Electrical Services", "electrical", "zap", "Wiring, switchboard repair, appliance installation, and safety checks"),
    ("Plumbing", "plumbing", "droplet", "Pipe leakages, bathroom fittings, tap repairs, water tank installation"),
    ("Carpentry", "carpentry", "hammer", "Furniture repair, custom woodwork, door fixing, and cabinet assembly"),
    ("Painting", "painting", "paint-brush", "Interior and exterior wall painting, touch-ups, waterproof coating"),
    ("AC Repair", "ac-repair", "wind", "AC servicing, gas charging, filter cleanup, compressor maintenance"),
    ("Appliance Repair", "appliance-repair", "wrench", "Washing machines, refrigerators, microwaves, and geysers"),
    ("Cleaning", "cleaning", "sparkles", "Deep home cleaning, kitchen scrubbing, bathroom sanitization"),
    ("Other Services", "other-services", "wrench", "General handywork, masonry, welding, and local assistance"),
]


def bootstrap(app, admin_email, admin_password):
    """Idempotent: safe to run again. Returns a short list of messages."""
    messages = []
    with app.app_context():
        init_db(app)
        db = get_db()
        for name, slug, icon, desc in CATEGORIES:
            db.execute(
                "INSERT OR IGNORE INTO categories (name, slug, icon, description, is_active) VALUES (?, ?, ?, ?, 1)",
                (name, slug, icon, desc),
            )
        messages.append(f"Categories ready ({len(CATEGORIES)}).")

        if admin_email and admin_password:
            email = admin_email.strip().lower()
            if db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone():
                messages.append("Admin account already exists. Password was NOT changed.")
            else:
                db.execute(
                    "INSERT INTO users (name, email, password_hash, role, phone, city, is_active) "
                    "VALUES (?, ?, ?, 'admin', '', 'Noida', 1)",
                    ("Administrator", email, generate_password_hash(admin_password)),
                )
                messages.append(f"Admin account created: {email}")
        else:
            messages.append("No ADMIN_EMAIL/ADMIN_PASSWORD given. Admin not created.")
        db.commit()
    return messages


def main():
    from app import create_app
    email = os.environ.get('ADMIN_EMAIL', '')
    password = os.environ.get('ADMIN_PASSWORD', '')
    if password and len(password) < 12:
        sys.exit('ADMIN_PASSWORD must be at least 12 characters.')
    app = create_app()
    for line in bootstrap(app, email, password):
        print(line)


if __name__ == '__main__':
    main()
