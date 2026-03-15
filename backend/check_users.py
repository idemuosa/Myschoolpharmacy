import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

print("--- User Report ---")
users = User.objects.all()
if not users:
    print("No users found.")
else:
    for u in users:
        print(f"ID: {u.id} | Username: '{u.username}' | Staff: {u.is_staff} | Superuser: {u.is_superuser}")
print("--- End Report ---")
