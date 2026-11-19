from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from skills.models import Skill, UserSkill
from exchanges.models import ExchangeRequest


class DashboardAPITests(APITestCase):
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
        self.other = User.objects.create_user(
            username="other",
            password="TestPass@12345"
        )

        self.python = Skill.objects.create(name="Python")
        self.react = Skill.objects.create(name="React")

        UserSkill.objects.create(
            user=self.rahul,
            skill=self.python,
            skill_type="OFFER"
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

        self.exchange = ExchangeRequest.objects.create(
            sender=self.rahul,
            receiver=self.priya,
            offered_skill=self.python,
            requested_skill=self.react,
            status="PENDING"
        )

        self.client.force_authenticate(user=self.rahul)

    def test_dashboard_skill_counts(self):
        response = self.client.get(
            "/api/dashboard/summary/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["skills"]["offered"], 1)
        self.assertEqual(response.data["skills"]["learning"], 1)

    def test_pending_sent_count(self):
        response = self.client.get(
            "/api/dashboard/summary/"
        )

        self.assertEqual(
            response.data["exchanges"]["pending_sent"],
            1
        )
        self.assertEqual(
            response.data["exchanges"]["pending_received"],
            0
        )

    def test_accepted_exchange_count(self):
        self.exchange.status = "ACCEPTED"
        self.exchange.save()

        response = self.client.get(
            "/api/dashboard/summary/"
        )

        self.assertEqual(
            response.data["exchanges"]["accepted"],
            1
        )

    def test_another_user_dashboard(self):
        self.client.force_authenticate(user=self.other)

        response = self.client.get(
            "/api/dashboard/summary/"
        )

        self.assertEqual(response.data["skills"]["offered"], 0)
        self.assertEqual(response.data["exchanges"]["accepted"], 0)
        self.assertEqual(response.data["recent_activity"], [])

    def test_recent_activity_contains_own_request(self):
        response = self.client.get(
            "/api/dashboard/summary/"
        )

        self.assertEqual(
            len(response.data["recent_activity"]),
            1
        )
        self.assertEqual(
            response.data["recent_activity"][0]["id"],
            self.exchange.id
        )

    def test_dashboard_requires_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(
            "/api/dashboard/summary/"
        )

        self.assertEqual(response.status_code, 401)