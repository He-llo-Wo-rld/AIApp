from django.conf import settings
from django.utils import timezone
from rest_framework.throttling import BaseThrottle

from .models import BlockedIP, UserChatLimit


class ChatRateThrottle(BaseThrottle):
    rate = 100  # max requests per day

    def allow_request(self, request, view):
        user = request.user if request.user.is_authenticated else None
        ip = self.get_ident(request)
        now = timezone.now()
        # Blocked IP check
        if BlockedIP.objects.filter(ip=ip).exists():
            return False
        # User block check
        if user:
            limit, _ = UserChatLimit.objects.get_or_create(user=user)
            if limit.is_blocked:
                return False
            # Reset counter every 24h
            if (now - limit.last_reset).days >= 1:
                limit.request_count = 0
                limit.last_reset = now
            if limit.request_count >= self.rate:
                limit.is_blocked = True
                limit.save()
                return False
            limit.request_count += 1
            limit.save()
            return True
        # For anonymous/IP
        return True
