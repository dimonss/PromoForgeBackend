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
- `POST /api/auth/change-password` - Смена пароля
- `POST /api/auth/logout` - Выход из системы

### 🎫 **Promo Codes** - Промо-коды
- `POST /api/promo/generate` - Генерация промо-кода
- `GET /api/promo/status/{promoCode}` - Проверка статуса промо-кода
- `POST /api/promo/activate` - Активация промо-кода
- `GET /api/promo/activations` - История активаций
- `GET /api/promo/logs` - Логи API запросов

### 🏥 **System** - Система
- `GET /health` - Проверка состояния сервера

## 🔑 Аутентификация

### Получение токена
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

### 1. **Генерация промо-кода**
```json
POST /api/promo/generate
{
  "campaignId": "SUMMER2024",
  "value": 10,
  "expiryDate": "2024-12-31T23:59:59.000Z"
}
```

### 2. **Проверка статуса**
```
GET /api/promo/status/SUMMER2024-ABC123
```

### 3. **Активация промо-кода**
```json
POST /api/promo/activate
{
  "promoCode": "SUMMER2024-ABC123",
  "customerInfo": "Иван Иванов, +7-999-123-45-67",
  "notes": "Активация в магазине №1"
}
```

### 4. **История активаций**
```
GET /api/promo/activations?page=1&limit=10&search=SUMMER
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
  "role": "admin"
}
```

### **PromoGenerateRequest**
```json
{
  "campaignId": "string",
  "value": 10,
  "expiryDate": "2024-12-31T23:59:59.000Z"
}
```

### **PromoActivateRequest**
```json
{
  "promoCode": "string",
  "customerInfo": "string (optional)",
  "notes": "string (optional)"
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
| 403 | Доступ запрещен |
| 404 | Ресурс не найден |
| 409 | Конфликт (например, промо-код уже активирован) |
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

### **Логирование**
- Все запросы к внешнему API логируются
- История активаций сохраняется
- Детальная информация об ошибках

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

// Генерация промо-кода
const generateResponse = await fetch('http://localhost:3001/api/promo/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    campaignId: 'SUMMER2024',
    value: 10,
    expiryDate: '2024-12-31T23:59:59.000Z'
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
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"campaignId":"SUMMER2024","value":10,"expiryDate":"2024-12-31T23:59:59.000Z"}'
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
headers = {'Authorization': f'Bearer {token}'}
generate_data = {
    "campaignId": "SUMMER2024",
    "value": 10,
    "expiryDate": "2024-12-31T23:59:59.000Z"
}
response = requests.post('http://localhost:3001/api/promo/generate', 
                        json=generate_data, headers=headers)
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
- Ошибки внешнего API
- Ошибки базы данных

## 📚 Дополнительные ресурсы

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [JWT.io](https://jwt.io/) - для декодирования JWT токенов
- [JSON Schema Validator](https://www.jsonschemavalidator.net/) - для проверки JSON

---

**💡 Совет**: Используйте Swagger UI для интерактивного тестирования API. Это поможет быстро понять структуру данных и протестировать все endpoints!
