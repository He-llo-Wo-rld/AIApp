import os

import openai
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import BlockedIP, ChatMessage, UserChatLimit
from .serializers import ChatMessageSerializer
from .throttling import ChatRateThrottle

client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


class ChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ChatRateThrottle]

    def get(self, request):
        messages = ChatMessage.objects.filter(user=request.user).order_by("created_at")
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Check IP block
        ip = request.META.get("REMOTE_ADDR")
        if BlockedIP.objects.filter(ip=ip).exists():
            return Response({"detail": "Your IP is blocked."}, status=429)
        # Check user block
        user_limit, _ = UserChatLimit.objects.get_or_create(user=request.user)
        if user_limit.is_blocked:
            return Response({"detail": "Your account is blocked."}, status=429)
        content = request.data.get("content", "")
        if not content:
            return Response({"detail": "No content provided."}, status=400)
        # Save user message
        ChatMessage.objects.create(user=request.user, role="user", content=content)
        # Call OpenAI (new API)
        try:
            try:
                response = client.chat.completions.create(
                    model="gpt-4.1",
                    messages=[{"role": "user", "content": content}],
                    max_tokens=256,
                    temperature=0.7,
                )
            except Exception as e:
                print("OpenAI error (gpt-4.1):", e)
                # fallback to gpt-3.5-turbo
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": content}],
                    max_tokens=256,
                    temperature=0.7,
                )
            reply = response.choices[0].message.content
        except Exception as e:
            print("OpenAI error (fallback):", e)
            return Response({"detail": str(e)}, status=500)
        # Save assistant message
        ChatMessage.objects.create(user=request.user, role="assistant", content=reply)
        return Response({"reply": reply})
