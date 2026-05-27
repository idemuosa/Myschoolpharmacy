import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

password = 'admin'
staff_users = User.objects.filter(is_staff=True)

print(f"--- Ensuring Admin user exists and setting password to '{password}' ---")
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', password)
    print("Created 'admin' user.")
else:
    admin = User.objects.get(username='admin')
    admin.set_password(password)
    admin.is_staff = True
    admin.is_superuser = True
    admin.save()
    print("Updated 'admin' user password.")

print("--- Done ---")
