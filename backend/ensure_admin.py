import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

password = 'admin123'
staff_users = User.objects.filter(is_staff=True)

print(f"--- Standardizing Staff Passwords to '{password}' ---")
for user in staff_users:
    user.set_password(password)
    user.save()
    print(f"Reset: {user.username}")

# Also ensure 'admin' exists just in case
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', password)
    print("Created missing 'admin' user.")

print("--- Done ---")
