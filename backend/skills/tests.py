from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Skill, UserSkill


class SkillAPITests(APITestCase):
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

        self.python_skill = Skill.objects.create(
            name="Python",
            category="Programming"
        )

        self.client.force_authenticate(user=self.rahul)

    def test_list_skills(self):
        response = self.client.get("/api/skills/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_add_skill(self):
        response = self.client.post(
            "/api/skills/mine/",
            {
                "skill": self.python_skill.id,
                "skill_type": "OFFER"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            UserSkill.objects.filter(
                user=self.rahul,
                skill=self.python_skill,
                skill_type="OFFER"
            ).exists()
        )

    def test_duplicate_skill_rejected(self):
        UserSkill.objects.create(
            user=self.rahul,
            skill=self.python_skill,
            skill_type="OFFER"
        )

        response = self.client.post(
            "/api/skills/mine/",
            {
                "skill": self.python_skill.id,
                "skill_type": "OFFER"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 400)

    def test_invalid_skill_type_rejected(self):
        response = self.client.post(
            "/api/skills/mine/",
            {
                "skill": self.python_skill.id,
                "skill_type": "EXPERT"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 400)

    def test_user_cannot_delete_others_skill(self):
        priya_skill = UserSkill.objects.create(
            user=self.priya,
            skill=self.python_skill,
            skill_type="OFFER"
        )

        response = self.client.delete(
            f"/api/skills/mine/{priya_skill.id}/"
        )

        self.assertEqual(response.status_code, 404)
        self.assertTrue(
            UserSkill.objects.filter(
                id=priya_skill.id
            ).exists()
        )

    def test_unauthenticated_user_rejected(self):
        self.client.force_authenticate(user=None)

        response = self.client.get("/api/skills/mine/")
        self.assertEqual(response.status_code, 401)