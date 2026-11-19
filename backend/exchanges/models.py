from django.conf import settings
from django.db import models


class ExchangeRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"
        CANCELLED = "CANCELLED", "Cancelled"

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_exchanges"
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_exchanges"
    )
    offered_skill = models.ForeignKey(
        "skills.Skill",
        on_delete=models.PROTECT,
        related_name="exchange_offers"
    )
    requested_skill = models.ForeignKey(
        "skills.Skill",
        on_delete=models.PROTECT,
        related_name="exchange_requests"
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender_id} -> {self.receiver_id}: {self.status}"