# 🧪 PromoForge Backend Testing Guide

Комплексная система тестирования для API бэкенда PromoForge.

## 📋 Обзор тестов

### ✅ Реализованные тесты

#### **1. Базовые тесты** (`tests/simple.test.js`)
- ✅ Проверка работы Jest
- ✅ Асинхронные операции
- ✅ Базовые математические операции

#### **2. API тесты** (`tests/api-offline.test.js`)
- ✅ Health check endpoint
- ✅ 404 обработка
- ✅ Аутентификация (отклонение без токена)
- ✅ Защищенные endpoints
- ✅ Автоматическое определение доступности сервера
- ✅ Пропуск тестов если сервер не запущен

#### **3. Расширенные тесты** (готовы к использованию)
- 📁 `tests/auth.test.js` - Полные тесты аутентификации
- 📁 `tests/promo.test.js` - Тесты промо-кодов
- 📁 `tests/integration.test.js` - Интеграционные тесты
- 📁 `tests/health.test.js` - Детальные тесты health check

## 🚀 Запуск тестов

### Все тесты
```bash
npm test
```

### Отдельные группы
```bash
# Базовые тесты
npm run test:simple

# API тесты
npm run test:api-offline
```

### Расширенные тесты (требуют настройки)
```bash
# Тесты аутентификации
npm run test:auth

# Тесты промо-кодов
npm run test:promo

# Интеграционные тесты
npm run test:integration

# Health check тесты
npm run test:health
```

## 🔧 Настройка тестовой среды

### Автоматическая настройка
```bash
# Установка зависимостей
npm install

# Настройка базы данных
npm run setup-db

# Проверка состояния
npm run check-db
```

### Ручная настройка
```bash
# Создание тестовой БД
npm run setup-db

# Сброс БД
npm run reset-db

# Проверка БД
npm run check-db
```

## 📊 Структура тестов

### Файлы тестов
```
tests/
├── simple.test.js          # Базовые тесты
├── api-basic.test.js       # API тесты
├── auth.test.js            # Аутентификация
├── promo.test.js           # Промо-коды
├── integration.test.js     # Интеграция
├── health.test.js          # Health check
├── setup.js                # Настройка среды
├── test-server.js          # Тестовый сервер
└── README.md               # Документация
```

### Конфигурация
```
jest.config.js              # Основная конфигурация
jest.simple.config.js       # Упрощенная конфигурация
```

## 🧪 Типы тестов

### 1. **Unit Tests** (Модульные тесты)
- Тестирование отдельных функций
- Изолированное тестирование компонентов
- Быстрое выполнение

### 2. **Integration Tests** (Интеграционные тесты)
- Тестирование взаимодействия компонентов
- Тестирование API endpoints
- Тестирование базы данных

### 3. **End-to-End Tests** (E2E тесты)
- Полные пользовательские сценарии
- Тестирование всего workflow
- Реальные HTTP запросы

## 📈 Покрытие кода

### Запуск с покрытием
```bash
npm run test:coverage
```

### Цели покрытия
- **Общее покрытие**: > 80%
- **Критические функции**: > 90%
- **API endpoints**: > 95%

### Отчеты
- **HTML**: `coverage/lcov-report/index.html`
- **LCOV**: `coverage/lcov.info`
- **Текст**: Консольный вывод

## 🔍 Тестовые данные

### Пользователи
```javascript
// По умолчанию
username: 'admin'
password: 'admin123'

// Тестовые пользователи
username: 'testuser'
password: 'testpass123'
```

### Промо-коды
```javascript
// Тестовые коды
'TEST123'      // Базовые тесты
'WORKFLOW123'  // Интеграционные тесты
'TEST001'      // Консистентность данных
```

## 🛠️ Отладка тестов

### Проблемы с запуском
```bash
# Проверить версию Node.js
node --version

# Проверить зависимости
npm list

# Очистить кэш
npm cache clean --force
```

### Проблемы с базой данных
```bash
# Проверить БД
npm run check-db

# Сбросить БД
npm run reset-db

# Пересоздать БД
npm run setup-db
```

### Проблемы с портами
```bash
# Найти процесс на порту 3001
lsof -i :3001

# Остановить процесс
kill -9 <PID>
```

## 📝 Добавление новых тестов

### 1. Создание тестового файла
```javascript
// tests/new-feature.test.js
describe('New Feature', () => {
  test('should test new functionality', () => {
    expect(true).toBe(true);
  });
});
```

### 2. Добавление в package.json
```json
{
  "scripts": {
    "test:new-feature": "npx jest tests/new-feature.test.js --config jest.simple.config.js"
  }
}
```

### 3. Запуск нового теста
```bash
npm run test:new-feature
```

## 🎯 Best Practices

### 1. **Именование тестов**
```javascript
// ✅ Хорошо
test('should return user data when valid token provided', () => {});

// ❌ Плохо
test('test user', () => {});
```

### 2. **Структура тестов**
```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Подготовка данных
  });

  test('should handle success case', () => {
    // Тест успешного сценария
  });

  test('should handle error case', () => {
    // Тест ошибочного сценария
  });
});
```

### 3. **Асинхронные тесты**
```javascript
test('should handle async operation', async () => {
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});
```

## 🔒 Безопасность тестов

### Изоляция данных
- Каждый тест использует отдельную БД
- Автоматическая очистка после тестов
- Нет влияния на продакшн данные

### Моки и стабы
- Внешние API мокаются
- Нет реальных HTTP запросов
- Предсказуемые результаты

## 📊 Метрики качества

### Время выполнения
- **Базовые тесты**: < 1 секунды
- **API тесты**: < 5 секунд
- **Полный набор**: < 30 секунд

### Надежность
- **Стабильность**: > 95%
- **Повторяемость**: 100%
- **Изоляция**: Полная

## 🚀 CI/CD Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '24.10.0'
      - run: npm install
      - run: npm test
```

### Pre-commit hooks
```bash
# Установка husky
npm install --save-dev husky

# Добавление pre-commit hook
npx husky add .husky/pre-commit "npm test"
```

## 📚 Дополнительные ресурсы

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [API Testing Guide](https://restfulapi.net/testing-rest-apis/)

---

**💡 Совет**: Начните с простых тестов и постепенно добавляйте более сложные. Всегда тестируйте как успешные, так и ошибочные сценарии!
