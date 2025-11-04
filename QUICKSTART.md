# Быстрый запуск IDMS

## Запуск Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python run.py
```

Или альтернативно:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Запуск Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

## Доступ к приложению

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Документация**: http://localhost:8000/docs

## Первый запуск

1. Откройте http://localhost:5173
2. Зарегистрируйтесь с новым аккаунтом
3. Создайте первый проект
4. Добавьте диаграмму и начните редактирование

## Остановка

- **Backend**: Ctrl+C в терминале с backend
- **Frontend**: Ctrl+C в терминале с frontend

## Требования

- Python 3.11.14
- Node.js 20
- npm или yarn




