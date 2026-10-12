import os
import django


def ensure_admin():
    username = os.environ.get('ADMIN_USERNAME', 'admin')
    password = os.environ.get('ADMIN_PASSWORD', 'admin123')
    email = os.environ.get('ADMIN_EMAIL', 'admin@example.com')

    from django.contrib.auth.models import User

    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'is_staff': True,
            'is_superuser': True,
        }
    )
    user.email = email
    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.save()

    if created:
        print(f"--- Created superuser '{username}' ---")
    else:
        print(f"--- Updated superuser '{username}' password and credentials ---")


if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()
    ensure_admin()
