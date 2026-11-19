from django.urls import path

from .views import (
    ExchangeListCreateView,
    ExchangeDetailView,
    ExchangeStatusView,
)

urlpatterns = [
    path("", ExchangeListCreateView.as_view()),
    path("<int:pk>/", ExchangeDetailView.as_view()),
    path("<int:pk>/status/", ExchangeStatusView.as_view()),
]