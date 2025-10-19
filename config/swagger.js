import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PromoForge API',
      version: '1.0.0',
      description: 'API для управления промо-кодами PromoForge',
      contact: {
        name: 'PromoForge Team',
        email: 'support@promoforge.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.promoforge.com' 
          : 'http://localhost:3001',
        description: process.env.NODE_ENV === 'production' 
          ? 'Production server' 
          : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT токен для аутентификации'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Сообщение об ошибке'
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: {
                    type: 'string'
                  },
                  param: {
                    type: 'string'
                  },
                  location: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        Cashier: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор кассира'
            },
            username: {
              type: 'string',
              description: 'Имя пользователя'
            },
            role: {
              type: 'string',
              enum: ['cashier', 'admin'],
              description: 'Роль пользователя'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Имя пользователя',
              example: 'admin'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Пароль',
              example: 'admin123'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login successful'
            },
            token: {
              type: 'string',
              description: 'JWT токен',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            role: {
              type: 'string',
              enum: ['cashier', 'admin'],
              example: 'admin'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              minLength: 3,
              description: 'Имя пользователя',
              example: 'newuser'
            },
            password: {
              type: 'string',
              minLength: 6,
              format: 'password',
              description: 'Пароль',
              example: 'password123'
            },
            role: {
              type: 'string',
              enum: ['cashier', 'admin'],
              default: 'cashier',
              description: 'Роль пользователя',
              example: 'cashier'
            }
          }
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['oldPassword', 'newPassword'],
          properties: {
            oldPassword: {
              type: 'string',
              format: 'password',
              description: 'Текущий пароль'
            },
            newPassword: {
              type: 'string',
              minLength: 6,
              format: 'password',
              description: 'Новый пароль'
            }
          }
        },
        PromoGenerateRequest: {
          type: 'object',
          required: ['campaignId', 'value', 'expiryDate'],
          properties: {
            campaignId: {
              type: 'string',
              description: 'ID кампании',
              example: 'SUMMER2024'
            },
            value: {
              type: 'number',
              description: 'Значение промо-кода',
              example: 10
            },
            expiryDate: {
              type: 'string',
              format: 'date-time',
              description: 'Дата истечения',
              example: '2024-12-31T23:59:59.000Z'
            }
          }
        },
        PromoGenerateResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Promo code generated successfully'
            },
            promoCode: {
              type: 'string',
              description: 'Сгенерированный промо-код',
              example: 'SUMMER2024-ABC123'
            }
          }
        },
        PromoActivateRequest: {
          type: 'object',
          required: ['promoCode'],
          properties: {
            promoCode: {
              type: 'string',
              description: 'Промо-код для активации',
              example: 'SUMMER2024-ABC123'
            },
            customerInfo: {
              type: 'string',
              description: 'Информация о клиенте',
              example: 'Иван Иванов, +7-999-123-45-67'
            },
            notes: {
              type: 'string',
              description: 'Дополнительные заметки',
              example: 'Активация в магазине №1'
            }
          }
        },
        PromoActivateResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Promo code activated successfully'
            },
            activationId: {
              type: 'integer',
              description: 'ID активации',
              example: 123
            }
          }
        },
        PromoStatus: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'Промо-код'
            },
            status: {
              type: 'string',
              enum: ['active', 'expired', 'used', 'invalid'],
              description: 'Статус промо-кода'
            },
            value: {
              type: 'number',
              description: 'Значение промо-кода'
            },
            expiryDate: {
              type: 'string',
              format: 'date-time',
              description: 'Дата истечения'
            },
            campaignId: {
              type: 'string',
              description: 'ID кампании'
            }
          }
        },
        ActivationHistory: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Общее количество записей'
            },
            limit: {
              type: 'integer',
              description: 'Лимит записей на страницу'
            },
            offset: {
              type: 'integer',
              description: 'Смещение для пагинации'
            },
            history: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'integer'
                  },
                  promo_code: {
                    type: 'string'
                  },
                  customer_info: {
                    type: 'string'
                  },
                  notes: {
                    type: 'string'
                  },
                  activated_at: {
                    type: 'string',
                    format: 'date-time'
                  },
                  activated_by_username: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        ApiLogs: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Общее количество записей'
            },
            limit: {
              type: 'integer',
              description: 'Лимит записей на страницу'
            },
            offset: {
              type: 'integer',
              description: 'Смещение для пагинации'
            },
            logs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'integer'
                  },
                  type: {
                    type: 'string',
                    enum: ['generate', 'status']
                  },
                  promo_code: {
                    type: 'string'
                  },
                  status: {
                    type: 'string',
                    enum: ['success', 'failed']
                  },
                  response: {
                    type: 'object'
                  },
                  requested_at: {
                    type: 'string',
                    format: 'date-time'
                  }
                }
              }
            }
          }
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z'
            },
            version: {
              type: 'string',
              example: '1.0.0'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './server.js'
  ]
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
