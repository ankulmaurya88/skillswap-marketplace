from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from skills.models import Skill, UserSkill
from .models import ExchangeRequest


class ExchangeAPITests(APITestCase):
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
            user=self.priya,
            skill=self.react,
            skill_type="OFFER"
        )

        self.payload = {
            "receiver": self.priya.id,
            "offered_skill": self.python.id,
            "requested_skill": self.react.id,
        }

        self.client.force_authenticate(user=self.rahul)

    def create_request(self):
        return self.client.post(
            "/api/exchanges/",
            self.payload,
            format="json"
        )

    def test_send_valid_request(self):
        response = self.create_request()

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "PENDING")

    def test_self_request_rejected(self):
        self.payload["receiver"] = self.rahul.id
        response = self.create_request()
        self.assertEqual(response.status_code, 400)

    def test_duplicate_pending_request_rejected(self):
        self.create_request()
        response = self.create_request()
        self.assertEqual(response.status_code, 400)

    def test_sender_must_offer_skill(self):
        UserSkill.objects.filter(
            user=self.rahul,
            skill=self.python
        ).delete()

        response = self.create_request()
        self.assertEqual(response.status_code, 400)

    def test_receiver_must_offer_skill(self):
        UserSkill.objects.filter(
            user=self.priya,
            skill=self.react
        ).delete()

        response = self.create_request()
        self.assertEqual(response.status_code, 400)

    def test_receiver_can_accept(self):
        exchange_id = self.create_request().data["id"]

        self.client.force_authenticate(user=self.priya)

        response = self.client.patch(
            f"/api/exchanges/{exchange_id}/status/",
            {"status": "ACCEPTED"},
            format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "ACCEPTED")

    def test_sender_cannot_accept(self):
        exchange_id = self.create_request().data["id"]

        response = self.client.patch(
            f"/api/exchanges/{exchange_id}/status/",
            {"status": "ACCEPTED"},
            format="json"
        )

        self.assertEqual(response.status_code, 403)

    def test_sender_can_cancel(self):
        exchange_id = self.create_request().data["id"]

        response = self.client.patch(
            f"/api/exchanges/{exchange_id}/status/",
            {"status": "CANCELLED"},
            format="json"
        )

        self.assertEqual(response.status_code, 200)

    def test_finalized_request_cannot_change(self):
        exchange_id = self.create_request().data["id"]

        self.client.force_authenticate(user=self.priya)
        url = f"/api/exchanges/{exchange_id}/status/"

        self.client.patch(
            url, {"status": "REJECTED"}, format="json"
        )

        response = self.client.patch(
            url, {"status": "ACCEPTED"}, format="json"
        )

        self.assertEqual(response.status_code, 409)

    def test_unrelated_user_cannot_read_request(self):
        exchange_id = self.create_request().data["id"]

        self.client.force_authenticate(user=self.other)
        response = self.client.get(
            f"/api/exchanges/{exchange_id}/"
        )

        self.assertEqual(response.status_code, 404)

    def test_anonymous_request_rejected(self):
        self.client.force_authenticate(user=None)

        response = self.client.post(
            "/api/exchanges/",
            self.payload,
            format="json"
        )

        self.assertEqual(response.status_code, 401)