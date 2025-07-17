from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class ChatMessage(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="chat_messages"
    )
    role = models.CharField(
        max_length=16, choices=[("user", "User"), ("assistant", "Assistant")]
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class UserChatLimit(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="chat_limit"
    )
    request_count = models.PositiveIntegerField(default=0)
    last_reset = models.DateTimeField(auto_now_add=True)
    is_blocked = models.BooleanField(default=False)


class BlockedIP(models.Model):
    ip = models.GenericIPAddressField(unique=True)
    blocked_at = models.DateTimeField(auto_now_add=True)
    reason = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.ip
