import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

print("--- Sanitizing User Data ---")
users = User.objects.all()
for u in users:
    original = u.username
    sanitized = u.username.lower().strip()
    if original != sanitized:
        print(f"Updating '{original}' -> '{sanitized}'")
        u.username = sanitized
        u.save()
    
    # Also force password to admin123 for all staff for troubleshooting
    if u.is_staff:
        print(f"Standardizing password for '{u.username}'")
        u.set_password('admin123')
        u.save()

# Ensure 'admin' exists explicitly
if not User.objects.filter(username='admin').exists():
    print("Creating 'admin' user...")
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
else:
    print("'admin' user exists and is sanitized.")

print("--- Done ---")
