import express from 'express';
import axios from 'axios';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/init.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   tags:
 *     - name: Promo Codes
 *       description: Управление промо-кодами
 */

// External API service for promo code operations
class ExternalPromoService {
  constructor() {
    this.baseURL = process.env.EXTERNAL_API_BASE_URL;
    this.apiKey = process.env.EXTERNAL_API_KEY;
  }

  async generatePromoCode(data) {
    try {
      const response = await axios.post(`${this.baseURL}/generate`, data, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('External API error (generate):', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'External API error' 
      };
    }
  }

  async checkPromoCodeStatus(promoCode) {
    try {
      const response = await axios.get(`${this.baseURL}/status/${promoCode}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('External API error (status):', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'External API error' 
      };
    }
  }
}

const externalService = new ExternalPromoService();

// Log API request to database
function logApiRequest(type, promoCode, response, status) {
  const db = getDatabase();
  db.run(
    'INSERT INTO promo_code_requests (request_type, promo_code, external_response, status) VALUES (?, ?, ?, ?)',
    [type, promoCode, JSON.stringify(response), status],
    (err) => {
      if (err) {
        console.error('Error logging API request:', err);
      }
    }
  );
}

/**
 * @swagger
 * /api/promo/generate:
 *   post:
 *     summary: Генерация промо-кода
 *     description: Создание нового промо-кода через внешний API
 *     tags: [Promo Codes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PromoGenerateRequest'
 *     responses:
 *       201:
 *         description: Промо-код успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PromoGenerateResponse'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Требуется аутентификация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка внешнего API или сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/generate', [
  authenticateToken,
  body('value').isNumeric().withMessage('Value must be a number'),
  body('type').isIn(['percentage', 'fixed']).withMessage('Type must be percentage or fixed'),
  body('expiryDate').optional().isISO8601().withMessage('Expiry date must be valid ISO date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { value, type, expiryDate, description } = req.body;

    const requestData = {
      value: parseFloat(value),
      type,
      expiryDate: expiryDate || null,
      description: description || 'Generated via PromoForge',
      generatedBy: req.user.username
    };

    const result = await externalService.generatePromoCode(requestData);
    
    logApiRequest('generate', null, result, result.success ? 'success' : 'error');

    if (result.success) {
      res.json({
        message: 'Promo code generated successfully',
        promoCode: result.data
      });
    } else {
      res.status(500).json({
        error: 'Failed to generate promo code',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Generate promo code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/promo/status/{promoCode}:
 *   get:
 *     summary: Проверка статуса промо-кода
 *     description: Получение информации о статусе промо-кода через внешний API
 *     tags: [Promo Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promoCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Промо-код для проверки
 *         example: SUMMER2024-ABC123
 *     responses:
 *       200:
 *         description: Статус промо-кода
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PromoStatus'
 *       401:
 *         description: Требуется аутентификация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка внешнего API или сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/status/:promoCode', [
  authenticateToken
], async (req, res) => {
  try {
    const { promoCode } = req.params;

    if (!promoCode || promoCode.trim().length === 0) {
      return res.status(400).json({ error: 'Promo code is required' });
    }

    const result = await externalService.checkPromoCodeStatus(promoCode.trim());
    
    logApiRequest('status', promoCode, result, result.success ? 'success' : 'error');

    if (result.success) {
      res.json({
        message: 'Promo code status retrieved successfully',
        status: result.data
      });
    } else {
      res.status(500).json({
        error: 'Failed to check promo code status',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Check promo code status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/promo/activate:
 *   post:
 *     summary: Активация промо-кода
 *     description: Активация промо-кода кассиром (внутренняя операция)
 *     tags: [Promo Codes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PromoActivateRequest'
 *     responses:
 *       200:
 *         description: Промо-код успешно активирован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PromoActivateResponse'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Требуется аутентификация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Промо-код уже активирован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/activate', [
  authenticateToken,
  body('promoCode').notEmpty().withMessage('Promo code is required'),
  body('customerInfo').optional().isString().withMessage('Customer info must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { promoCode, customerInfo, notes } = req.body;
    const db = getDatabase();

    // Check if promo code is already activated
    db.get(
      'SELECT * FROM activated_promo_codes WHERE promo_code = ?',
      [promoCode.trim()],
      (err, existingActivation) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (existingActivation) {
          return res.status(409).json({ 
            error: 'Promo code has already been activated',
            activatedAt: existingActivation.activated_at,
            activatedBy: existingActivation.cashier_id
          });
        }

        // Insert new activation record
        db.run(
          'INSERT INTO activated_promo_codes (promo_code, cashier_id, customer_info, notes) VALUES (?, ?, ?, ?)',
          [promoCode.trim(), req.user.id, customerInfo || null, notes || null],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({
              message: 'Promo code activated successfully',
              activationId: this.lastID,
              activatedAt: new Date().toISOString(),
              activatedBy: req.user.username
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Activate promo code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/promo/activations:
 *   get:
 *     summary: История активаций промо-кодов
 *     description: Получение истории активаций промо-кодов с пагинацией
 *     tags: [Promo Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Количество записей на страницу
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Поиск по промо-коду, информации о клиенте или кассире
 *     responses:
 *       200:
 *         description: История активаций
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivationHistory'
 *       401:
 *         description: Требуется аутентификация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/activations', [
  authenticateToken
], (req, res) => {
  try {
    const db = getDatabase();
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    db.all(
      `SELECT 
        apc.id,
        apc.promo_code,
        apc.activated_at,
        apc.customer_info,
        apc.notes,
        c.username as activated_by_username,
        c.full_name as activated_by_name
      FROM activated_promo_codes apc
      JOIN cashiers c ON apc.cashier_id = c.id
      ORDER BY apc.activated_at DESC
      LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)],
      (err, activations) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        // Get total count
        db.get(
          'SELECT COUNT(*) as total FROM activated_promo_codes',
          (err, countResult) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({
              activations,
              pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.total,
                totalPages: Math.ceil(countResult.total / limit)
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Get activations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/promo/logs:
 *   get:
 *     summary: Логи API запросов
 *     description: Получение логов запросов к внешнему API с пагинацией
 *     tags: [Promo Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Количество записей на страницу
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [generate, status]
 *         description: Фильтр по типу запроса
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [success, failed]
 *         description: Фильтр по статусу запроса
 *     responses:
 *       200:
 *         description: Логи API запросов
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiLogs'
 *       401:
 *         description: Требуется аутентификация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/logs', [
  authenticateToken
], (req, res) => {
  try {
    const db = getDatabase();
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    db.all(
      `SELECT * FROM promo_code_requests 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)],
      (err, logs) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        // Get total count
        db.get(
          'SELECT COUNT(*) as total FROM promo_code_requests',
          (err, countResult) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({
              logs,
              pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.total,
                totalPages: Math.ceil(countResult.total / limit)
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
