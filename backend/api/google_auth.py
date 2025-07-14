import requests
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken


class GoogleAuthView(APIView):
    permission_classes = []

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response(
                {"detail": "No token provided"}, status=status.HTTP_400_BAD_REQUEST
            )
        # Verify token with Google
        google_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
        resp = requests.get(google_url)
        if resp.status_code != 200:
            return Response(
                {"detail": "Invalid Google token"}, status=status.HTTP_400_BAD_REQUEST
            )
        data = resp.json()
        email = data.get("email")
        if not email:
            return Response(
                {"detail": "No email in Google token"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user, created = User.objects.get_or_create(
            email=email, defaults={"username": email, "is_active": True}
        )
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        response = Response(
            {"detail": "Google login successful"}, status=status.HTTP_200_OK
        )
        response.set_cookie(
            key="access",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="Strict",
            max_age=300,
        )
        response.set_cookie(
            key="refresh",
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite="Strict",
            max_age=86400,
        )
        return response
