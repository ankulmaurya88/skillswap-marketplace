from django.contrib.auth import get_user_model
from rest_framework import serializers

from skills.models import Skill, UserSkill
from .models import ExchangeRequest

User = get_user_model()


class ExchangeRequestSerializer(serializers.ModelSerializer):
    receiver = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_active=True)
    )
    offered_skill = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all()
    )
    requested_skill = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all()
    )

    sender_id = serializers.IntegerField(
        source="sender.id", read_only=True
    )
    sender_name = serializers.CharField(
        source="sender.username", read_only=True
    )
    receiver_name = serializers.CharField(
        source="receiver.username", read_only=True
    )
    offered_skill_name = serializers.CharField(
        source="offered_skill.name", read_only=True
    )
    requested_skill_name = serializers.CharField(
        source="requested_skill.name", read_only=True
    )

    class Meta:
        model = ExchangeRequest
        fields = [
            "id", "sender_id", "sender_name",
            "receiver", "receiver_name",
            "offered_skill", "offered_skill_name",
            "requested_skill", "requested_skill_name",
            "status", "created_at",
        ]
        read_only_fields = [
            "id", "sender_id", "sender_name",
            "receiver_name", "offered_skill_name",
            "requested_skill_name", "status",
            "created_at",
        ]

    def validate(self, attrs):
        sender = self.context["request"].user
        receiver = attrs["receiver"]
        offered = attrs["offered_skill"]
        requested = attrs["requested_skill"]

        if sender.pk == receiver.pk:
            raise serializers.ValidationError(
                "You cannot exchange skills with yourself."
            )

        if not UserSkill.objects.filter(
            user=sender,
            skill=offered,
            skill_type="OFFER"
        ).exists():
            raise serializers.ValidationError(
                "You do not offer the selected skill."
            )

        if not UserSkill.objects.filter(
            user=receiver,
            skill=requested,
            skill_type="OFFER"
        ).exists():
            raise serializers.ValidationError(
                "Receiver does not offer the requested skill."
            )

        if ExchangeRequest.objects.filter(
            sender=sender,
            receiver=receiver,
            offered_skill=offered,
            requested_skill=requested,
            status=ExchangeRequest.Status.PENDING,
        ).exists():
            raise serializers.ValidationError(
                "An identical pending request already exists."
            )

        return attrs


class ExchangeStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[
            "ACCEPTED", "REJECTED", "CANCELLED"
        ]
    )