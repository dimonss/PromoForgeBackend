import { getApiBaseUrl, getApiUrl } from '../config/urls.js';

// Базовый URL для тестов
export const BASE_URL = getApiBaseUrl();

// Утилиты для тестов
export const testUtils = {
  /**
   * Получает полный URL для API endpoint
   * @param {string} endpoint - Путь к endpoint
   * @returns {string} Полный URL
   */
  getApiUrl: (endpoint) => getApiUrl(endpoint),
  
  /**
   * Получает базовый URL
   * @returns {string} Базовый URL
   */
  getBaseUrl: () => BASE_URL,
  
  /**
   * Создает заголовки для аутентификации
   * @param {string} token - JWT токен
   * @returns {object} Заголовки
   */
  getAuthHeaders: (token) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }),
  
  /**
   * Создает базовые заголовки
   * @returns {object} Заголовки
   */
  getBaseHeaders: () => ({
    'Content-Type': 'application/json'
  })
};
