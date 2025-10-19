import express from 'express';
import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/init.js';
import { authenticateToken, authenticateApiKey } from './auth.js';

const router = express.Router();

// Custom validator for UUID format
const validatePromoCodeUUID = (value) => {
  if (!validateUUID(value)) {
    throw new Error('Promo code must be a valid UUID format');
  }
  return true;
};

/**
 * @swagger
 * components:
 *   tags:
 *     - name: Promo Codes
 *       description: Управление промо-кодами
 */

/**
 * @swagger
 * /api/promo/generate:
 *   post:
 *     summary: Генерация промо-кода
 *     description: Создание нового промо-кода (UUID) с использованием API ключа
 *     tags: [Promo Codes]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       201:
 *         description: Промо-код успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Promo code generated successfully"
 *                 promoCode:
 *                   type: string
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *       401:
 *         description: Неверный API ключ
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
router.post('/generate', authenticateApiKey, async (req, res) => {
  try {
    const db = getDatabase();
    const promoCode = uuidv4();

    // Insert new promo code into database
    db.run(
      'INSERT INTO promo_codes (code) VALUES (?)',
      [promoCode],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        res.status(201).json({
          message: 'Promo code generated successfully',
          promoCode: promoCode
        });
      }
    );
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
 *     description: Получение информации о статусе промо-кода
 *     tags: [Promo Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promoCode
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Промо-код для проверки (UUID формат)
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Статус промо-кода
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Promo code status retrieved successfully"
 *                 status:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     deactivatedAt:
 *                       type: string
 *                       format: date-time
 *                     deactivatedBy:
 *                       type: string
 *                     deactivationReason:
 *                       type: string
 *       401:
 *         description: Требуется аутентификация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Промо-код не найден
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
router.get('/status/:promoCode', authenticateToken, (req, res) => {
  try {
    const { promoCode } = req.params;
    const db = getDatabase();

    if (!promoCode || promoCode.trim().length === 0) {
      return res.status(400).json({ error: 'Promo code is required' });
    }

    // Validate UUID format
    if (!validateUUID(promoCode.trim())) {
      return res.status(400).json({ error: 'Promo code must be a valid UUID format' });
    }

    // Get promo code status from database
    db.get(
      `SELECT 
        pc.code,
        pc.is_active,
        pc.created_at,
        pc.deactivated_at,
        pc.deactivation_reason,
        u.username as deactivated_by_username
      FROM promo_codes pc
      LEFT JOIN users u ON pc.deactivated_by = u.id
      WHERE pc.code = ?`,
      [promoCode.trim()],
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!row) {
          return res.status(404).json({ error: 'Промокод не найден' });
        }

        res.json({
          message: 'Promo code status retrieved successfully',
          status: {
            code: row.code,
            isActive: Boolean(row.is_active),
            createdAt: row.created_at,
            deactivatedAt: row.deactivated_at,
            deactivatedBy: row.deactivated_by_username,
            deactivationReason: row.deactivation_reason
          }
        });
      }
    );
  } catch (error) {
    console.error('Check promo code status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/promo/deactivate:
 *   post:
 *     summary: Деактивация промо-кода
 *     description: Деактивация промо-кода с указанием причины
 *     tags: [Promo Codes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - promoCode
 *             properties:
 *               promoCode:
 *                 type: string
 *                 format: uuid
 *                 description: Промо-код для деактивации (UUID формат)
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Промо-код успешно деактивирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Promo code deactivated successfully"
 *                 deactivatedAt:
 *                   type: string
 *                   format: date-time
 *                 deactivatedBy:
 *                   type: string
 *                   example: "admin"
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
 *       404:
 *         description: Промо-код не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Промо-код уже деактивирован
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
router.post('/deactivate', [
  authenticateToken,
  body('promoCode')
    .notEmpty()
    .withMessage('Promo code is required')
    .custom(validatePromoCodeUUID)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { promoCode } = req.body;
    const db = getDatabase();

    // Check if promo code exists and is active
    db.get(
      'SELECT * FROM promo_codes WHERE code = ?',
      [promoCode.trim()],
      (err, promoCodeRow) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!promoCodeRow) {
          return res.status(404).json({ 
            error: 'Промокод не найден'
          });
        }

        if (!promoCodeRow.is_active) {
          return res.status(409).json({ 
            error: 'Promo code is already deactivated',
            deactivatedAt: promoCodeRow.deactivated_at,
            deactivatedBy: promoCodeRow.deactivated_by
          });
        }

        // Update promo code to mark as deactivated
        db.run(
          'UPDATE promo_codes SET is_active = 0, deactivated_at = CURRENT_TIMESTAMP, deactivated_by = ? WHERE code = ?',
          [req.user.id, promoCode.trim()],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({
              message: 'Promo code deactivated successfully',
              deactivatedAt: new Date().toISOString(),
              deactivatedBy: req.user.username
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Deactivate promo code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;