from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProfile
from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def perform_create(self, serializer):
        user = serializer.save()
        UserProfile.objects.get_or_create(user=user)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)