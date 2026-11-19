from django.db import IntegrityError, transaction
from django.db.models import Q

from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError

from .models import Skill, UserSkill
from .serializers import (
    SkillSerializer,
    UserSkillSerializer
)


class SkillListView(generics.ListAPIView):
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Skill.objects.all().order_by("name")

        search = self.request.query_params.get(
            "search", ""
        ).strip()

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(category__icontains=search)
            )

        return queryset


class MySkillListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = UserSkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSkill.objects.filter(
            user=self.request.user
        ).select_related("skill").order_by("id")

    def perform_create(self, serializer):
        try:
            with transaction.atomic():
                serializer.save(user=self.request.user)
        except IntegrityError:
            raise ValidationError(
                "You already added this skill with this type."
            )


class MySkillDeleteView(generics.DestroyAPIView):
    serializer_class = UserSkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSkill.objects.filter(
            user=self.request.user
        )