import dotenv from 'dotenv';

dotenv.config();

/**
 * Получает базовый URL API в зависимости от окружения
 * @returns {string} Базовый URL API
 */
export function getApiBaseUrl() {
  if (process.env.NODE_ENV === 'production') {
    return process.env.API_BASE_URL_PROD || "http://localhost:3001";
  }
  return 'http://localhost:3001';
}

/**
 * Получает полный URL для API endpoint
 * @param {string} endpoint - Путь к endpoint (например, '/auth/login')
 * @returns {string} Полный URL
 */
export function getApiUrl(endpoint = '') {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Получает URL для Swagger документации
 * @returns {string} URL Swagger UI
 */
export function getSwaggerUrl() {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api/api-docs`;
}

/**
 * Получает URL для health check
 * @returns {string} URL health check
 */
export function getHealthUrl() {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api/health`;
}

/**
 * Получает CORS origins для текущего окружения
 * @returns {string[]} Массив разрешенных origins
 */
export function getCorsOrigins() {
  if (process.env.NODE_ENV === 'production') {
    return [process.env.DOMAIN];
  }
  return ['http://localhost:3000', 'http://localhost:3001'];
}
