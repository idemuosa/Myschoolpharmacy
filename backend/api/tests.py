from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

class HealthCheckAndApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check(self):
        response = self.client.get('/api/health-check/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('status', response.data)
        self.assertEqual(response.data['status'], 'healthy')
