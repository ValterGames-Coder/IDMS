# IDMS Backend

Backend для Integrated Diagram Modeling System (IDMS).

## Структура проекта

```
backend/
├── api/              # API endpoints (роутеры FastAPI)
│   ├── __init__.py
│   ├── auth.py       # Аутентификация и регистрация
│   ├── diagrams.py   # Управление диаграммами и блокировками
│   ├── invites.py    # Приглашения в проекты
│   └── projects.py   # Управление проектами
│
├── core/             # Базовые модули приложения
│   ├── __init__.py
│   ├── auth.py       # Утилиты аутентификации (JWT, пароли)
│   ├── config.py     # Конфигурация приложения
│   └── database.py   # Настройка подключения к БД
│
├── crud/             # CRUD операции с базой данных
│   ├── __init__.py
│   ├── diagram.py    # Операции с диаграммами
│   ├── invite.py     # Операции с приглашениями
│   ├── project.py    # Операции с проектами
│   └── user.py       # Операции с пользователями
│
├── models/           # SQLAlchemy модели
│   ├── __init__.py
│   ├── diagram.py    # Модели Diagram, DiagramElement, DiagramLock
│   ├── invite.py     # Модель ProjectInvite
│   ├── project.py    # Модель Project
│   └── user.py       # Модель User
│
├── schemas/          # Pydantic схемы для валидации
│   ├── __init__.py
│   ├── diagram.py    # Схемы для диаграмм
│   ├── invite.py     # Схемы для приглашений
│   ├── project.py    # Схемы для проектов
│   └── user.py       # Схемы для пользователей
│
├── main.py           # Главный файл FastAPI приложения
├── run.py            # Скрипт для запуска сервера
├── requirements.txt  # Зависимости Python
└── idms.db          # SQLite база данных
```

## Основные компоненты

### API (api/)
Содержит все HTTP endpoints, организованные по функциональности:
- **auth.py**: `/auth/*` - регистрация, вход, получение текущего пользователя
- **projects.py**: `/projects/*` - CRUD операции с проектами
- **diagrams.py**: `/diagrams/*`, `/projects/{id}/diagrams/*` - работа с диаграммами
- **invites.py**: `/invite/*`, `/projects/{id}/invite*` - система приглашений

### Core (core/)
Базовые модули, используемые во всем приложении:
- **auth.py**: JWT токены, хэширование паролей, проверка прав доступа
- **config.py**: Настройки приложения (секретный ключ, БД, токены)
- **database.py**: SQLAlchemy engine, сессии, Base класс

### CRUD (crud/)
Функции для работы с базой данных, разделенные по сущностям:
- Создание (Create)
- Чтение (Read)
- Обновление (Update)
- Удаление (Delete)

### Models (models/)
SQLAlchemy ORM модели, представляющие таблицы БД:
- **User**: Пользователи системы
- **Project**: Проекты с диаграммами
- **Diagram**: Диаграммы (BPMN, ERD, DFD)
- **DiagramLock**: Блокировки для совместной работы
- **ProjectInvite**: Приглашения в проекты

### Schemas (schemas/)
Pydantic схемы для валидации входных/выходных данных API:
- Валидация запросов
- Сериализация ответов
- Документация API (OpenAPI/Swagger)

## Запуск

```bash
# Установка зависимостей
pip install -r requirements.txt

# Запуск сервера
python run.py

# Или напрямую через uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Документация

После запуска сервера доступны:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Основные маршруты

### Аутентификация
- `POST /auth/register` - Регистрация нового пользователя
- `POST /auth/token` - Получение JWT токена
- `GET /auth/me` - Получение информации о текущем пользователе

### Проекты
- `GET /projects/` - Список доступных проектов
- `POST /projects/` - Создание проекта
- `GET /projects/{id}` - Получение проекта
- `DELETE /projects/{id}` - Удаление проекта

### Диаграммы
- `GET /projects/{id}/diagrams/` - Список диаграмм проекта
- `POST /projects/{id}/diagrams/` - Создание диаграммы
- `GET /diagrams/{id}` - Получение диаграммы
- `PUT /diagrams/{id}` - Обновление диаграммы
- `DELETE /diagrams/{id}` - Удаление диаграммы

### Блокировки
- `POST /diagrams/{id}/lock` - Заблокировать диаграмму
- `DELETE /diagrams/{id}/lock` - Разблокировать диаграмму
- `GET /diagrams/{id}/lock` - Получить информацию о блокировке

### Приглашения
- `POST /projects/{id}/invite` - Создать приглашение
- `GET /projects/{id}/invites` - Список приглашений проекта
- `GET /invite/{token}` - Информация о приглашении
- `POST /invite/{token}/accept` - Принять приглашение
- `DELETE /projects/{id}/invites/{invite_id}` - Деактивировать приглашение

## Технологии

- **FastAPI**: Современный веб-фреймворк
- **SQLAlchemy**: ORM для работы с БД
- **Pydantic**: Валидация данных
- **Passlib**: Хэширование паролей (Argon2)
- **python-jose**: JWT токены
- **SQLite**: База данных (можно заменить на PostgreSQL/MySQL)

