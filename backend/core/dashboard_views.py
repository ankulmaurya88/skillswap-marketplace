from django.db.models import Count, Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from skills.models import UserSkill
from exchanges.models import ExchangeRequest
from exchanges.serializers import ExchangeRequestSerializer


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        skill_rows = (
            UserSkill.objects.filter(user=user)
            .values("skill_type")
            .annotate(total=Count("id"))
        )

        skill_counts = {"OFFER": 0, "LEARN": 0}
        for row in skill_rows:
            skill_counts[row["skill_type"]] = row["total"]

        exchanges = ExchangeRequest.objects.filter(
            Q(sender=user) | Q(receiver=user)
        )

        exchange_counts = exchanges.aggregate(
            pending_received=Count(
                "id",
                filter=Q(
                    receiver=user,
                    status=ExchangeRequest.Status.PENDING
                )
            ),
            pending_sent=Count(
                "id",
                filter=Q(
                    sender=user,
                    status=ExchangeRequest.Status.PENDING
                )
            ),
            accepted=Count(
                "id",
                filter=Q(
                    status=ExchangeRequest.Status.ACCEPTED
                )
            )
        )

        recent = (
            exchanges
            .select_related(
                "sender",
                "receiver",
                "offered_skill",
                "requested_skill"
            )
            .order_by("-created_at", "-id")[:5]
        )

        return Response({
            "skills": {
                "offered": skill_counts["OFFER"],
                "learning": skill_counts["LEARN"],
            },
            "exchanges": exchange_counts,
            "recent_activity": ExchangeRequestSerializer(
                recent, many=True
            ).data,
        })