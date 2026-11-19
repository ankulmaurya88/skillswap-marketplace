from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="testuser",
            email="test@example.com",
            password="TestPass@12345"
        )

    def test_login(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "testuser",
                "password": "TestPass@12345"
            },
            format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_protected_api_without_token(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, 401)

    def test_logout_blacklists_refresh_token(self):
        login = self.client.post(
            "/api/auth/login/",
            {
                "username": "testuser",
                "password": "TestPass@12345"
            },
            format="json"
        )

        access = login.data["access"]
        refresh = login.data["refresh"]

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {access}"
        )

        logout = self.client.post(
            "/api/auth/logout/",
            {"refresh": refresh},
            format="json"
        )

        self.assertEqual(logout.status_code, 204)

        refresh_response = self.client.post(
            "/api/auth/refresh/",
            {"refresh": refresh},
            format="json"
        )

        self.assertEqual(refresh_response.status_code, 401)