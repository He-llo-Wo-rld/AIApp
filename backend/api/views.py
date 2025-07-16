import random
from tokenize import TokenError

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.db import IntegrityError
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import VerificationCode


class VerifyCodeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        code = request.data.get("code")
        if not username or not code:
            return Response(
                {"detail": "Username and code required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        try:
            vcode = VerificationCode.objects.filter(user=user, is_used=False).latest(
                "created_at"
            )
        except VerificationCode.DoesNotExist:
            return Response(
                {"detail": "No verification code found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if vcode.is_expired():
            return Response(
                {"detail": "Code expired"}, status=status.HTTP_400_BAD_REQUEST
            )
        if vcode.code != code:
            return Response(
                {"detail": "Invalid code"}, status=status.HTTP_400_BAD_REQUEST
            )
        user.is_active = True
        user.save()
        vcode.is_used = True
        vcode.save()
        return Response(
            {"detail": "Account verified. You can now log in."},
            status=status.HTTP_200_OK,
        )


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email", "")
        if not username or not password:
            return Response(
                {"detail": "Username and password required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if email and User.objects.filter(email=email).exists():
            return Response(
                {"detail": "BAD_REQUEST"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = User.objects.create_user(
                username=username, password=password, email=email, is_active=False
            )
        except IntegrityError:
            return Response(
                {"detail": "BAD_REQUEST"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        code = f"{random.randint(100000, 999999)}"
        VerificationCode.objects.create(user=user, code=code)

        if email:
            print(f"DEBUG: email={email}, code={code}")
            try:
                send_mail(
                    subject="Ваш код підтвердження",
                    message=f"Ваш код для підтвердження реєстрації: {code}",
                    from_email=None,
                    recipient_list=[email],
                    fail_silently=False,
                )
            except Exception as e:
                # logging.error(f"Email send error: {e}")
                return Response({"detail": f"Email send error: {e}"}, status=500)
        return Response(
            {
                "detail": "Registration successful. Enter verification code.",
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request=request, username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            response = Response(
                {"detail": "Login successful"}, status=status.HTTP_200_OK
            )
            response.set_cookie(
                key="access",
                value=access_token,
                httponly=True,
                secure=False,  # Для локальної розробки!
                samesite="Lax",  # Для роботи між портами на localhost
                max_age=300,
                path="/",
                domain=None,
            )
            response.set_cookie(
                key="refresh",
                value=str(refresh),
                httponly=True,
                secure=False,  # <-- ДЛЯ ЛОКАЛЬНОЇ РОЗРОБКИ!
                samesite="Lax",
                max_age=86400,
                path="/",
                domain=None,
            )
            return response
        return Response(
            {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                "username": user.username,
                "email": user.email,
                "id": user.id,
            }
        )


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        response = Response({"detail": "Logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie("access")
        response.delete_cookie("refresh")
        return response


import random


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response(
                {"detail": "Email required"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        code = f"{random.randint(100000, 999999)}"
        VerificationCode.objects.create(user=user, code=code, purpose="reset")
        send_mail(
            subject="Скидання пароля",
            message=f"Ваш код для скидання пароля: {code}",
            from_email=None,
            recipient_list=[email],
            fail_silently=False,
        )
        return Response(
            {"detail": "Reset code sent to email"}, status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")
        new_password = request.data.get("new_password")
        if not email or not code or not new_password:
            return Response(
                {"detail": "Email, code, and new password required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        try:
            vcode = VerificationCode.objects.filter(
                user=user, is_used=False, purpose="reset"
            ).latest("created_at")
        except VerificationCode.DoesNotExist:
            return Response(
                {"detail": "No reset code found"}, status=status.HTTP_404_NOT_FOUND
            )
        if vcode.is_expired():
            return Response(
                {"detail": "Code expired"}, status=status.HTTP_400_BAD_REQUEST
            )
        if vcode.code != code:
            return Response(
                {"detail": "Invalid code"}, status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(new_password)
        user.save()
        vcode.is_used = True
        vcode.save()
        return Response(
            {"detail": "Password reset successful"}, status=status.HTTP_200_OK
        )


class RefreshTokenView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh")
        if not refresh_token:
            return Response({"detail": "No refresh token"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            response = Response({"access": access_token}, status=status.HTTP_200_OK)
            response.set_cookie(
                key="access",
                value=access_token,
                httponly=True,
                secure=False,  # Для локальної розробки
                samesite="Lax",
                max_age=300,
                path="/",
                domain=None,
            )
            return response
        except TokenError as e:
            return Response({"detail": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)