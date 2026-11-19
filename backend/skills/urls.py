from django.urls import path

from .views import (
    SkillListView,
    MySkillListCreateView,
    MySkillDeleteView,
)
from .discovery_views import DiscoverUsersView

urlpatterns = [
    path("", SkillListView.as_view()),
    path("mine/", MySkillListCreateView.as_view()),
    path("mine/<int:pk>/", MySkillDeleteView.as_view()),
    path("discover/", DiscoverUsersView.as_view()),
]