from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from accounts.models import UserProfile
from .models import Skill, UserSkill


class DiscoveryTests(APITestCase):
    def setUp(self):
        User = get_user_model()

        self.rahul = User.objects.create_user(
            username="rahul", password="TestPass@12345"
        )
        self.priya = User.objects.create_user(
            username="priya", password="TestPass@12345"
        )
        self.amit = User.objects.create_user(
            username="amit", password="TestPass@12345"
        )

        for user in [self.rahul, self.priya, self.amit]:
            UserProfile.objects.create(user=user)

        self.react = Skill.objects.create(
            name="React", category="Frontend"
        )
        self.python = Skill.objects.create(
            name="Python", category="Programming"
        )

        UserSkill.objects.create(
            user=self.rahul,
            skill=self.react,
            skill_type="LEARN"
        )

        UserSkill.objects.create(
            user=self.priya,
            skill=self.react,
            skill_type="OFFER"
        )

        UserSkill.objects.create(
            user=self.amit,
            skill=self.python,
            skill_type="OFFER"
        )

        self.client.force_authenticate(user=self.rahul)

    def test_find_react_teacher(self):
        response = self.client.get(
            "/api/skills/discover/?search=react"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(
            response.data["results"][0]["username"],
            "priya"
        )

    def test_learner_not_returned_as_teacher(self):
        response = self.client.get(
            "/api/skills/discover/?search=react"
        )

        usernames = [
            user["username"]
            for user in response.data["results"]
        ]

        self.assertNotIn("rahul", usernames)

    def test_filter_by_skill_id(self):
        response = self.client.get(
            f"/api/skills/discover/?skill_id={self.python.id}"
        )

        self.assertEqual(response.data["count"], 1)
        self.assertEqual(
            response.data["results"][0]["username"],
            "amit"
        )

    def test_private_email_not_exposed(self):
        response = self.client.get(
            "/api/skills/discover/?search=react"
        )

        self.assertNotIn(
            "email", response.data["results"][0]
        )

    def test_invalid_skill_id(self):
        response = self.client.get(
            "/api/skills/discover/?skill_id=invalid"
        )

        self.assertEqual(response.status_code, 400)

    def test_unauthenticated_discovery_rejected(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(
            "/api/skills/discover/"
        )

        self.assertEqual(response.status_code, 401)