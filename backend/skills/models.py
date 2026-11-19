from django.conf import settings
from django.db import models


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.name


class UserSkill(models.Model):
    class SkillType(models.TextChoices):
        OFFER = "OFFER", "Can Teach"
        LEARN = "LEARN", "Want to Learn"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_skills"
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="user_skills"
    )
    skill_type = models.CharField(
        max_length=10,
        choices=SkillType.choices
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "skill", "skill_type"],
                name="unique_user_skill_type"
            )
        ]

    def __str__(self):
        return f"{self.user.username}: {self.skill.name}"