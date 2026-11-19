from django.urls import path

from .views import (
    SkillListView,
    MySkillListCreateView,
    MySkillDeleteView,
)

urlpatterns = [
    path("", SkillListView.as_view()),
    path("mine/", MySkillListCreateView.as_view()),
    path("mine/<int:pk>/", MySkillDeleteView.as_view()),
]