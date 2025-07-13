from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


class VerificationCode(models.Model):
    PURPOSE_CHOICES = [
        ("register", "Register"),
        ("reset", "Reset Password"),
    ]
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="verification_codes"
    )
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    purpose = models.CharField(
        max_length=16, choices=PURPOSE_CHOICES, default="register"
    )

    def is_expired(self):
        return timezone.now() > self.created_at + timezone.timedelta(minutes=10)
