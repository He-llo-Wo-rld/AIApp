# Django JWT Cookie Auth API

## Опис

API для авторизації через JWT у HttpOnly, Secure, SameSite=Strict cookie. Використовується Django, Django REST Framework, SimpleJWT, CORS для http://localhost:3000.

## Основні endpoint-и

- `POST /login/` — логін, встановлює JWT токени у cookie
- `GET /profile/` — повертає інформацію про авторизованого користувача
- `POST /logout/` — видаляє JWT cookie

## Особливості

- JWT читається з cookie, не з Authorization заголовка
- Кастомний клас автентифікації
- CORS для Next.js фронтенду

## Запуск

```bash
poetry install
poetry run python manage.py migrate
poetry run python manage.py createsuperuser
poetry run python manage.py runserver
```

## Структура

- `api/authentication.py` — кастомний JWTAuthentication
- `api/views.py` — login, profile, logout
- `api/urls.py` — маршрути
- `config/settings.py` — налаштування
