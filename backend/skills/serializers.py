from rest_framework import serializers
from .models import Skill, UserSkill


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "category"]


class UserSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(
        source="skill.name",
        read_only=True
    )

    class Meta:
        model = UserSkill
        fields = [
            "id",
            "skill",
            "skill_name",
            "skill_type",
        ]
        read_only_fields = ["id", "skill_name"]

    def validate(self, attrs):
        request = self.context["request"]

        skill = attrs["skill"]
        skill_type = attrs["skill_type"]

        exists = UserSkill.objects.filter(
            user=request.user,
            skill=skill,
            skill_type=skill_type
        ).exists()

        if exists:
            raise serializers.ValidationError(
                "You already added this skill with this type."
            )

        return attrs