from django.contrib.auth import get_user_model
from django.db.models import Q, Prefetch

from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination

from .models import UserSkill
from .discovery_serializers import DiscoveryUserSerializer

User = get_user_model()


class DiscoveryPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class DiscoverUsersView(generics.ListAPIView):
    serializer_class = DiscoveryUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = DiscoveryPagination

    def get_queryset(self):
        search = self.request.query_params.get(
            "search", ""
        ).strip()

        skill_id = self.request.query_params.get("skill_id")

        filters = Q(user_skills__skill_type="OFFER")

        if search:
            filters &= (
                Q(user_skills__skill__name__icontains=search)
                | Q(user_skills__skill__category__icontains=search)
            )

        if skill_id is not None:
            if not skill_id.isdigit():
                raise ValidationError({
                    "skill_id": "Must be a positive integer."
                })

            filters &= Q(
                user_skills__skill_id=int(skill_id)
            )

        offered = UserSkill.objects.filter(
            skill_type="OFFER"
        ).select_related("skill")

        return (
            User.objects
            .filter(filters)
            .exclude(pk=self.request.user.pk)
            .select_related("profile")
            .prefetch_related(
                Prefetch(
                    "user_skills",
                    queryset=offered
                )
            )
            .distinct()
            .order_by("id")
        )