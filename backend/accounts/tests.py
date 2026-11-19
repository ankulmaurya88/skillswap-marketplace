from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import UserProfile


class ProfileAPITests(APITestCase):
    def setUp(self):
        User = get_user_model()

        self.rahul = User.objects.create_user(
            username="rahul",
            password="TestPass@12345"
        )
        self.priya = User.objects.create_user(
            username="priya",
            password="TestPass@12345"
        )

        UserProfile.objects.create(user=self.rahul)
        UserProfile.objects.create(
            user=self.priya,
            bio="Priya original bio"
        )

    def test_get_profile_without_login(self):
        response = self.client.get("/api/profile/me/")
        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_get_own_profile(self):
        self.client.force_authenticate(user=self.rahul)

        response = self.client.get("/api/profile/me/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["username"],
            "rahul"
        )

    def test_update_own_profile(self):
        self.client.force_authenticate(user=self.rahul)

        response = self.client.patch(
            "/api/profile/me/",
            {"bio": "I teach Python."},
            format="json"
        )

        self.assertEqual(response.status_code, 200)

        profile = UserProfile.objects.get(user=self.rahul)
        self.assertEqual(profile.bio, "I teach Python.")

    def test_cannot_change_profile_owner(self):
        self.client.force_authenticate(user=self.rahul)

        response = self.client.patch(
            "/api/profile/me/",
            {
                "user_id": self.priya.id,
                "username": "hacked",
                "bio": "New bio"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 200)

        rahul_profile = UserProfile.objects.get(user=self.rahul)
        priya_profile = UserProfile.objects.get(user=self.priya)

        self.assertEqual(rahul_profile.user_id, self.rahul.id)
        self.assertEqual(self.rahul.username, "rahul")
        self.assertEqual(priya_profile.bio, "Priya original bio")

    def test_public_profile_hides_email(self):
        response = self.client.get(
            f"/api/profile/users/{self.priya.id}/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("email", response.data)

    def test_bio_length_validation(self):
        self.client.force_authenticate(user=self.rahul)

        response = self.client.patch(
            "/api/profile/me/",
            {"bio": "A" * 1001},
            format="json"
        )

        self.assertEqual(response.status_code, 400)