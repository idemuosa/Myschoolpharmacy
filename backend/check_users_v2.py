import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

print("--- Detailed User Report ---")
users = User.objects.all()
if not users:
    print("No users found in database.")
else:
    for u in users:
        print(f"ID: {u.id} | Username: '{u.username}' | Active: {u.is_active} | Staff: {u.is_staff} | Super: {u.is_superuser}")
        # Check if password is set (though we can't see what it is, we can see if it's usable)
        print(f"    Has usable password: {u.has_usable_password()}")

print("\n--- Testing 'admin' lookup ---")
from django.contrib.auth import authenticate
user = authenticate(username='admin', password='admin123')
if user:
    print("SUCCESS: 'admin' authenticated with 'admin123'")
else:
    print("FAILURE: 'admin' failed to authenticate with 'admin123'")
    # Check if 'admin' exists but casing is different
    exists = User.objects.filter(username__iexact='admin').first()
    if exists:
        print(f"INFO: A user exists with name '{exists.username}' (iexact match)")

print("--- End Report ---")
