from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Staff

class HealthCheckAndApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check(self):
        response = self.client.get('/api/health-check/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('status', response.data)
        self.assertEqual(response.data['status'], 'healthy')

    def test_role_based_login(self):
        # Create a staff member and associated user
        staff = Staff.objects.create(
            full_name="Jane Pharmacist",
            email="jane@pharmacy.com",
            phone_number="1234567890",
            role="Pharmacist",
            department="Pharmacy",
            employee_id="EMP-202"
        )
        user = User.objects.create_user(
            username="emp-202",
            email="jane@pharmacy.com",
            password="password123",
            is_staff=True
        )

        response = self.client.post('/api/token/', {
            'username': 'emp-202',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['role'], 'Pharmacist')
        self.assertEqual(response.data['full_name'], 'Jane Pharmacist')
        self.assertEqual(response.data['department'], 'Pharmacy')

    def test_non_superuser_non_staff_record_login(self):
        # Create a user that is not a superuser and does not have a Staff record entry
        user = User.objects.create_user(
            username="admin",
            password="adminpassword",
            is_staff=True,
            is_superuser=False
        )

        response = self.client.post('/api/token/', {
            'username': 'admin',
            'password': 'adminpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['role'], 'Staff')
        self.assertEqual(response.data['department'], 'General')

    def test_login_with_staff_record_having_none_fields(self):
        staff = Staff.objects.create(
            full_name="",
            email="nonefields@pharmacy.com",
            phone_number="0000000000",
            role="",
            department="",
            employee_id="EMP-NONE"
        )
        user = User.objects.create_user(
            username="emp-none",
            email="nonefields@pharmacy.com",
            password="password123",
            is_staff=True
        )

        response = self.client.post('/api/token/', {
            'username': 'emp-none',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['role'], 'Staff')

    def test_system_settings_public_access(self):
        response = self.client.get('/api/settings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
