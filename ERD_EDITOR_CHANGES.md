# ERD Editor - Полное обновление

## Изменения

### 1. Упрощенная палитра ERD
Теперь палитра содержит только:
- **Entity** - сущность для хранения данных с атрибутами
- **Relationship** - связь между сущностями (автоматически создается при соединении двух Entity)

### 2. Управление атрибутами

#### Атрибуты Entity:
- **Двойной клик** на Entity открывает диалог редактирования
- Можно добавлять атрибуты, один на строку
- Для первичного ключа используйте префикс `PK:` перед именем атрибута
- Пример:
  ```
  PK:id
  name
  email
  created_at
  ```
- Первичные ключи отображаются жирным шрифтом с подчеркиванием и меткой "PK"

#### Атрибуты Relationship:
- **Двойной клик** на Relationship открывает диалог редактирования
- Можно добавлять атрибуты связи, один на строку
- Пример:
  ```
  date
  quantity
  status
  ```

### 3. Crow's Foot Notation (Куриная лапка)

Реализованы следующие типы связей:

#### Обозначения:
- **| (вертикальная черта)** - "Один" (обязательное отношение)
- **O (кружок)** - "Ноль" (необязательное/nullable отношение)
- **< (куриная лапка)** - "Много"

#### Доступные типы связей:
1. **One to One (Mandatory)** - |——|
   - Ровно один к одному, обязательные с обеих сторон
   
2. **One to One (Optional)** - O——O
   - Один к одному, необязательные (nullable)
   
3. **One to Many (Mandatory)** - |——<
   - Один ко многим, обязательная связь
   
4. **One to Many (Optional)** - O——<
   - Один ко многим, необязательная связь (nullable)
   
5. **Many to Many** - <——<
   - Много ко многим

### 4. Автоматическое создание Relationship

При соединении двух Entity:
1. Автоматически создается блок Relationship посередине между ними
2. Создаются два ребра (edge): Entity1 → Relationship → Entity2
3. Кардинальность и nullable определяются выбранным типом связи

## Как тестировать

### Шаг 1: Создание ERD диаграммы
1. Откройте проект
2. Создайте новую диаграмму типа "ERD"

### Шаг 2: Добавление сущностей
1. Перетащите **Entity** из палитры на холст
2. Создайте несколько сущностей (например: User, Order, Product)
3. **Дважды кликните** на каждую сущность для добавления атрибутов:
   - User:
     ```
     PK:id
     username
     email
     password
     ```
   - Order:
     ```
     PK:order_id
     order_date
     total_amount
     ```
   - Product:
     ```
     PK:product_id
     name
     price
     stock
     ```

### Шаг 3: Создание связей
1. Выберите тип связи из секции "Connection Types" в палитре
2. Например, выберите "One to Many (Mandatory)"
3. Соедините User → Order (один пользователь может иметь много заказов)
4. Relationship блок создастся автоматически между ними
5. **Дважды кликните** на Relationship для добавления атрибутов связи (если нужно)

### Шаг 4: Проверка crow's foot notation
1. Проверьте, что на концах связей правильно отображаются символы:
   - Вертикальная черта | для "один"
   - Кружок O для nullable
   - Куриная лапка < для "много"

### Шаг 5: Редактирование
1. Дважды кликните на Entity или Relationship для изменения имени и атрибутов
2. Нажмите Delete/Backspace для удаления выбранных элементов
3. Перетаскивайте элементы для изменения расположения

### Шаг 6: Сохранение
1. Диаграмма автоматически сохраняется каждые 2 секунды
2. Или нажмите кнопку "Save" вручную

## Примеры использования

### Пример 1: Система управления заказами
```
Entities:
- Customer (PK:customer_id, name, email)
- Order (PK:order_id, order_date, status)
- Product (PK:product_id, name, price)

Relationships:
- Customer → Places → Order (One to Many)
- Order → Contains → Product (Many to Many)
```

### Пример 2: Социальная сеть
```
Entities:
- User (PK:user_id, username, email)
- Post (PK:post_id, content, created_at)
- Comment (PK:comment_id, text, created_at)

Relationships:
- User → Creates → Post (One to Many)
- Post → Has → Comment (One to Many)
- User → Writes → Comment (One to Many)
```

## Технические детали

### Компоненты:
- `DiagramPalette.jsx` - упрощенная палитра ERD элементов
- `ShapeNode.jsx` - рендеринг Entity и Relationship с атрибутами
- `ERDEdge.jsx` - отображение crow's foot notation
- `DiagramEditor.jsx` - логика создания связей и редактирования атрибутов

### Структура данных атрибута:
```javascript
{
  name: "id",
  primary: true  // для первичного ключа
}
```

### Структура данных связи:
```javascript
{
  sourceCardinality: 'one' | 'many',
  targetCardinality: 'one' | 'many',
  sourceOptional: boolean,
  targetOptional: boolean
}
```

## Что улучшено
✅ Убраны лишние типы элементов (attributes, weak entity, associative entity, etc.)
✅ Атрибуты теперь внутри Entity, а не отдельные узлы
✅ Добавлена поддержка первичных ключей (primary key)
✅ Автоматическое создание Relationship при соединении Entity
✅ Правильная crow's foot notation с поддержкой nullable
✅ Интуитивный интерфейс редактирования атрибутов
✅ У Relationship теперь тоже могут быть атрибуты

