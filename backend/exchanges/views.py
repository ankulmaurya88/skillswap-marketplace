from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.exceptions import (
    PermissionDenied, ValidationError
)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import get_object_or_404

from .models import ExchangeRequest
from .serializers import (
    ExchangeRequestSerializer,
    ExchangeStatusSerializer,
)


def visible_exchanges(user):
    return (
        ExchangeRequest.objects
        .filter(Q(sender=user) | Q(receiver=user))
        .select_related(
            "sender", "receiver",
            "offered_skill", "requested_skill"
        )
        .order_by("-created_at", "-id")
    )


class ExchangeListCreateView(generics.ListCreateAPIView):
    serializer_class = ExchangeRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = visible_exchanges(self.request.user)

        direction = self.request.query_params.get("direction")

        if direction == "sent":
            return queryset.filter(sender=self.request.user)
        if direction == "received":
            return queryset.filter(receiver=self.request.user)
        if direction not in (None, "all"):
            raise ValidationError({
                "direction": "Use all, sent or received."
            })

        return queryset

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


class ExchangeDetailView(generics.RetrieveAPIView):
    serializer_class = ExchangeRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return visible_exchanges(self.request.user)


class ExchangeStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        exchange = get_object_or_404(
            visible_exchanges(request.user),
            pk=pk
        )

        serializer = ExchangeStatusSerializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data["status"]

        if new_status == "CANCELLED":
            if exchange.sender_id != request.user.id:
                raise PermissionDenied(
                    "Only the sender can cancel."
                )
        else:
            if exchange.receiver_id != request.user.id:
                raise PermissionDenied(
                    "Only the receiver can accept or reject."
                )

        # Conditional update avoids changing a request
        # that another operation already finalized.
        changed = ExchangeRequest.objects.filter(
            pk=exchange.pk,
            status=ExchangeRequest.Status.PENDING
        ).update(status=new_status)

        if changed == 0:
            return Response(
                {"detail": "Request is no longer pending."},
                status=status.HTTP_409_CONFLICT
            )

        exchange.refresh_from_db()

        return Response(
            ExchangeRequestSerializer(exchange).data
        )