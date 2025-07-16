from django.http import JsonResponse
from django.urls import resolve


class RegistrationRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        public_paths = [
            "/login/",
            "/register/",
            "/auth/",
            "/api/token/",
            "/api/token/refresh/",
        ]
        if request.path in public_paths:
            return self.get_response(request)
        return self.get_response(request)


class JWTAuthCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        access_token = request.COOKIES.get("access")
        if access_token and "HTTP_AUTHORIZATION" not in request.META:
            request.META["HTTP_AUTHORIZATION"] = f"Bearer {access_token}"
        return self.get_response(request)
