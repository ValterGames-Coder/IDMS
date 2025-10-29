# IDMS - Interactive Diagram Management System

Веб-приложение для создания и редактирования диаграмм с поддержкой различных нотаций (BPMN, ERD, DFD).

## Технический стек

- **Backend**: FastAPI (Python)
- **Frontend**: React + Vite
- **База данных**: SQLite
- **UI**: Tailwind CSS

## Функциональность

- ✅ Система аутентификации и пользователей
- ✅ Управление проектами
- ✅ Создание и редактирование диаграмм
- ✅ Поддержка BPMN, ERD, DFD нотаций
- ✅ Система блокировки диаграмм
- ✅ Drag & Drop редактор
- ✅ Автосохранение
- ✅ Современный адаптивный UI

## Запуск проекта

### 1. Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend будет доступен по адресу: http://localhost:8000

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен по адресу: http://localhost:5173

## API Документация

После запуска backend, документация API доступна по адресу:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Структура проекта

```
IDMS/
├── backend/                 # FastAPI backend
│   ├── main.py             # Основной файл приложения
│   ├── models.py           # SQLAlchemy модели
│   ├── schemas.py          # Pydantic схемы
│   ├── auth.py             # Аутентификация
│   ├── crud.py             # CRUD операции
│   ├── database.py         # Настройка БД
│   └── requirements.txt    # Python зависимости
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── pages/          # Страницы приложения
│   │   ├── hooks/          # Custom hooks
│   │   ├── api/            # API клиент
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Использование

1. Зарегистрируйтесь или войдите в систему
2. Создайте новый проект
3. Откройте проект и создайте диаграмму
4. Выберите тип диаграммы (BPMN, ERD, DFD)
5. Перетаскивайте элементы из палитры на canvas
6. Сохраняйте изменения (автосохранение включено)

## Разработка

### Backend разработка

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend разработка

```bash
cd frontend
npm install
npm run dev
```

## Лицензия

MIT License