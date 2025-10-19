# PromoForge Backend Tests

Комплексные тесты API для бэкенда PromoForge.

## Структура тестов

### 📁 Файлы тестов

- **`auth.test.js`** - Тесты аутентификации
- **`promo.test.js`** - Тесты промо-кодов
- **`integration.test.js`** - Интеграционные тесты
- **`health.test.js`** - Тесты health check
- **`setup.js`** - Настройка тестовой среды
- **`test-server.js`** - Тестовый сервер

### 🧪 Типы тестов

#### 1. **Authentication Tests** (`auth.test.js`)
- ✅ Логин с валидными/невалидными данными
- ✅ Получение информации о пользователе
- ✅ Смена пароля
- ✅ Логаут
- ✅ Валидация токенов

#### 2. **Promo Code Tests** (`promo.test.js`)
- ✅ Генерация промо-кодов
- ✅ Проверка статуса промо-кодов
- ✅ Активация промо-кодов
- ✅ История активаций
- ✅ Логи API запросов
- ✅ Обработка ошибок внешнего API

#### 3. **Integration Tests** (`integration.test.js`)
- ✅ Полный цикл работы с промо-кодами
- ✅ Аутентификация и смена пароля
- ✅ Обработка ошибок
- ✅ Rate limiting
- ✅ Консистентность данных

#### 4. **Health Check Tests** (`health.test.js`)
- ✅ Проверка health endpoint
- ✅ CORS заголовки
- ✅ Security заголовки
- ✅ 404 обработка

## 🚀 Запуск тестов

### Все тесты
```bash
npm test
```

### Отдельные группы тестов
```bash
# Тесты аутентификации
npm run test:auth

# Тесты промо-кодов
npm run test:promo

# Интеграционные тесты
npm run test:integration

# Тесты health check
npm run test:health
```

### Режимы запуска
```bash
# С покрытием кода
npm run test:coverage

# В режиме наблюдения
npm run test:watch
```

## 🔧 Настройка тестовой среды

### Автоматическая настройка
Тесты автоматически:
- Создают тестовую базу данных SQLite
- Запускают тестовый сервер на порту 3001
- Очищают данные между тестами
- Останавливают сервер после завершения

### Переменные окружения для тестов
```env
NODE_ENV=test
DATABASE_PATH=./test-database.sqlite
JWT_SECRET=test-jwt-secret-key
EXTERNAL_API_BASE_URL=https://test-api.example.com
EXTERNAL_API_KEY=test-api-key
```

## 📊 Покрытие кода

Запуск с покрытием:
```bash
npm run test:coverage
```

Отчеты сохраняются в папке `coverage/`:
- **HTML отчет**: `coverage/lcov-report/index.html`
- **LCOV файл**: `coverage/lcov.info`

## 🧪 Тестовые данные

### Пользователи по умолчанию
- **Username**: `admin`
- **Password**: `admin123`

### Тестовые промо-коды
- `TEST123` - для базовых тестов
- `WORKFLOW123` - для интеграционных тестов
- `TEST001`, `TEST002`, `TEST003` - для тестов консистентности

## 🔍 Mock'и

### Внешний API
Все вызовы внешнего API мокаются с помощью `jest.fn()`:
```javascript
// Успешный ответ
fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ code: 'TEST123', status: 'active' })
});

// Ошибка API
fetch.mockRejectedValueOnce(new Error('API Error'));
```

## 📝 Добавление новых тестов

### 1. Создание нового тестового файла
```javascript
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestEnvironment, cleanupTestEnvironment, clearTestData } from './setup.js';

describe('New Feature Tests', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  beforeEach(async () => {
    await clearTestData();
  });

  test('should test new feature', async () => {
    // Your test here
  });
});
```

### 2. Добавление в package.json
```json
{
  "scripts": {
    "test:new-feature": "jest tests/new-feature.test.js --detectOpenHandles --forceExit"
  }
}
```

## 🐛 Отладка тестов

### Проблемы с базой данных
```bash
# Проверить состояние тестовой БД
npm run check-db

# Сбросить тестовую БД
npm run reset-db
```

### Проблемы с портами
Если порт 3001 занят:
```bash
# Найти процесс на порту 3001
lsof -i :3001

# Остановить процесс
kill -9 <PID>
```

### Логи тестов
```bash
# Запуск с подробными логами
npm test -- --verbose

# Запуск одного теста
npm test -- --testNamePattern="should login with valid credentials"
```

## 📈 Метрики качества

### Цели покрытия кода
- **Общее покрытие**: > 80%
- **Критические функции**: > 90%
- **API endpoints**: > 95%

### Время выполнения
- **Быстрые тесты**: < 1 секунды
- **Интеграционные тесты**: < 5 секунд
- **Полный набор тестов**: < 30 секунд

## 🔒 Безопасность тестов

- Тестовые токены имеют короткое время жизни
- Тестовая база данных изолирована
- Нет реальных API ключей в тестах
- Автоматическая очистка тестовых данных
