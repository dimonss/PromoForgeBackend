# 📚 PromoForge API Documentation (Swagger)

Интерактивная документация API для PromoForge, созданная с помощью Swagger UI.

## 🚀 Доступ к документации

### Локальная разработка
```
http://localhost:3001/api-docs
```

### Продакшн
```
https://api.promoforge.com/api-docs
```

## 📋 Структура API

### 🔐 **Authentication** - Аутентификация
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/me` - Информация о текущем пользователе
- `POST /api/auth/logout` - Выход из системы

### 🎫 **Promo Codes** - Промо-коды
- `POST /api/promo/generate` - Генерация промо-кода (UUID)
- `GET /api/promo/status/{promoCode}` - Проверка статуса промо-кода
- `POST /api/promo/deactivate` - Деактивация промо-кода

### 🏥 **System** - Система
- `GET /health` - Проверка состояния сервера

## 🔑 Аутентификация

### Два типа аутентификации:

#### 1. **API Key** (для генерации промокодов)
- Заголовок: `x-api-key`
- Используется для: `POST /api/promo/generate`

#### 2. **JWT Token** (для пользователей)
- Заголовок: `Authorization: Bearer <token>`
- Используется для: проверки статуса и деактивации

### Получение JWT токена
1. Перейдите в раздел **Authentication**
2. Выберите `POST /api/auth/login`
3. Нажмите **"Try it out"**
4. Введите данные:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
5. Нажмите **"Execute"**
6. Скопируйте токен из ответа

### Использование токена
1. Нажмите кнопку **"Authorize"** в верхней части страницы
2. Введите токен в формате: `Bearer YOUR_TOKEN_HERE`
3. Нажмите **"Authorize"**
4. Теперь все защищенные endpoints будут использовать этот токен

## 🧪 Тестирование API

### 1. **Генерация промо-кода (UUID)**
```bash
POST /api/promo/generate
Headers:
  x-api-key: your-api-key-here
```
**Ответ:**
```json
{
  "message": "Promo code generated successfully",
  "promoCode": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 2. **Проверка статуса**
```bash
GET /api/promo/status/550e8400-e29b-41d4-a716-446655440000
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```
**Ответ:**
```json
{
  "message": "Promo code status retrieved successfully",
  "status": {
    "code": "550e8400-e29b-41d4-a716-446655440000",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "deactivatedAt": null,
    "deactivatedBy": null,
    "deactivationReason": null
  }
}
```

### 3. **Деактивация промо-кода**
```json
POST /api/promo/deactivate
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
Body:
{
  "promoCode": "550e8400-e29b-41d4-a716-446655440000",
  "reason": "Customer requested refund"
}
```
**Ответ:**
```json
{
  "message": "Promo code deactivated successfully",
  "deactivatedAt": "2024-01-15T10:35:00.000Z",
  "deactivatedBy": "admin",
  "reason": "Customer requested refund"
}
```

## 📊 Схемы данных

### **LoginRequest**
```json
{
  "username": "string",
  "password": "string"
}
```

### **LoginResponse**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "fullName": "Administrator"
  }
}
```

### **PromoCodeStatus**
```json
{
  "code": "string (UUID)",
  "isActive": "boolean",
  "createdAt": "string (ISO date)",
  "deactivatedAt": "string (ISO date) | null",
  "deactivatedBy": "string (username) | null",
  "deactivationReason": "string | null"
}
```

### **DeactivateRequest**
```json
{
  "promoCode": "string (UUID)",
  "reason": "string (optional)"
}
```

### **Error Response**
```json
{
  "error": "Error message"
}
```

### **ValidationError**
```json
{
  "errors": [
    {
      "msg": "Validation error message",
      "param": "fieldName",
      "location": "body"
    }
  ]
}
```

## 🔧 Коды ответов

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Ресурс создан |
| 400 | Ошибка валидации |
| 401 | Требуется аутентификация |
| 403 | Доступ запрещен (неверный API ключ) |
| 404 | Ресурс не найден |
| 409 | Конфликт (промо-код уже деактивирован) |
| 500 | Внутренняя ошибка сервера |

## 🛠️ Особенности

### **Rate Limiting**
- 100 запросов в 15 минут на IP
- При превышении лимита возвращается 429

### **CORS**
- Разрешены запросы с `localhost:3000` и `localhost:3001`
- В продакшне настраивается отдельно

### **Валидация**
- Все входные данные валидируются
- Подробные сообщения об ошибках
- Поддержка русских сообщений

### **Упрощенная логика**
- Промокоды - это простые UUID
- Нет сложной валидации или внешних API
- Простая система статусов (активен/деактивирован)

## 📱 Примеры использования

### **JavaScript (Fetch)**
```javascript
// Логин
const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

const { token } = await loginResponse.json();

// Генерация промо-кода (UUID)
const generateResponse = await fetch('http://localhost:3001/api/promo/generate', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-api-key-here'
  }
});

const { promoCode } = await generateResponse.json();

// Проверка статуса
const statusResponse = await fetch(`http://localhost:3001/api/promo/status/${promoCode}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Деактивация
const deactivateResponse = await fetch('http://localhost:3001/api/promo/deactivate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    promoCode: promoCode,
    reason: 'Test deactivation'
  })
});
```

### **cURL**
```bash
# Логин
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Генерация промо-кода
curl -X POST http://localhost:3001/api/promo/generate \
  -H "x-api-key: your-api-key-here"

# Проверка статуса
curl -X GET "http://localhost:3001/api/promo/status/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Деактивация
curl -X POST http://localhost:3001/api/promo/deactivate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"promoCode":"550e8400-e29b-41d4-a716-446655440000","reason":"Test"}'
```

### **Python (requests)**
```python
import requests

# Логин
login_data = {
    "username": "admin",
    "password": "admin123"
}
response = requests.post('http://localhost:3001/api/auth/login', json=login_data)
token = response.json()['token']

# Генерация промо-кода
headers = {'x-api-key': 'your-api-key-here'}
response = requests.post('http://localhost:3001/api/promo/generate', headers=headers)
promo_code = response.json()['promoCode']

# Проверка статуса
headers = {'Authorization': f'Bearer {token}'}
response = requests.get(f'http://localhost:3001/api/promo/status/{promo_code}', headers=headers)

# Деактивация
deactivate_data = {
    "promoCode": promo_code,
    "reason": "Test deactivation"
}
response = requests.post('http://localhost:3001/api/promo/deactivate', 
                        json=deactivate_data, headers=headers)
```

## 🔍 Отладка

### **Проверка состояния сервера**
```bash
curl http://localhost:3001/health
```

### **Проверка Swagger**
```bash
curl http://localhost:3001/api-docs/
```

### **Логи сервера**
Сервер выводит подробные логи в консоль:
- Запросы к API
- Ошибки валидации
- Ошибки базы данных
- Информация о деактивации промокодов

## 🗄️ База данных

### **Таблицы:**
- `users` - пользователи системы
- `promo_codes` - промокоды (UUID)

### **Скрипты управления БД:**
```bash
npm run setup-db    # Инициализация БД
npm run reset-db    # Сброс БД (с бэкапом)
npm run check-db    # Проверка состояния БД
```

## 📚 Дополнительные ресурсы

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [JWT.io](https://jwt.io/) - для декодирования JWT токенов
- [UUID Generator](https://www.uuidgenerator.net/) - для генерации UUID

---

**💡 Совет**: Используйте Swagger UI для интерактивного тестирования API. Это поможет быстро понять структуру данных и протестировать все endpoints!

**🔑 Важно**: 
- Для генерации промокодов используйте API ключ в заголовке `x-api-key`
- Для проверки статуса и деактивации используйте JWT токен в заголовке `Authorization`
- Промокоды генерируются как UUID и сохраняются в базе данных