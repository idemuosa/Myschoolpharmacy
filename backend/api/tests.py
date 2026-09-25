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
