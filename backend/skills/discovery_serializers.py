from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class DiscoveryUserSerializer(serializers.ModelSerializer):
    headline = serializers.CharField(
        source="profile.headline",
        read_only=True,
        default=""
    )
    location = serializers.CharField(
        source="profile.location",
        read_only=True,
        default=""
    )
    offered_skills = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "headline",
            "location",
            "offered_skills",
        ]

    def get_offered_skills(self, obj):
        return [
            {
                "id": item.skill.id,
                "name": item.skill.name,
                "category": item.skill.category,
            }
            for item in obj.user_skills.all()
        ]