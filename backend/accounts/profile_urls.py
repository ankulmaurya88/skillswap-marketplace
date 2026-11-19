from django.urls import path

from .views import MyProfileView, PublicProfileView

urlpatterns = [
    path("me/", MyProfileView.as_view()),
    path(
        "users/<int:user_id>/",
        PublicProfileView.as_view()
    ),
]