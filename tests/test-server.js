import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

// ES6 modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import authRoutes from '../routes/auth.js';
import promoRoutes from '../routes/promo.js';
import { initializeDatabase } from '../database/init.js';

let testApp;
let testServer;

export const startTestServer = async () => {
  if (testServer) {
    return testServer;
  }

  testApp = express();
  const PORT = 3001;

  // Security middleware
  testApp.use(helmet());

  // CORS configuration
  testApp.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  }));

  // Rate limiting (more lenient for tests)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Higher limit for tests
    message: 'Too many requests from this IP, please try again later.'
  });
  testApp.use('/api/', limiter);

  // Body parsing middleware
  testApp.use(express.json({ limit: '10mb' }));
  testApp.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  testApp.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // API routes
  testApp.use('/api/auth', authRoutes);
  testApp.use('/api/promo', promoRoutes);

  // Error handling middleware
  testApp.use((err, req, res, next) => {
    console.error('Test server error:', err);
    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message
    });
  });

  // 404 handler
  testApp.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Initialize database and start server
  try {
    await initializeDatabase();
    console.log('Test database initialized successfully');
    
    testServer = testApp.listen(PORT, () => {
      console.log(`🧪 Test server running on port ${PORT}`);
    });

    return testServer;
  } catch (error) {
    console.error('Failed to start test server:', error);
    throw error;
  }
};

export const stopTestServer = async () => {
  if (testServer) {
    await new Promise((resolve) => {
      testServer.close(resolve);
    });
    testServer = null;
    testApp = null;
    console.log('🧪 Test server stopped');
  }
};

export { testApp };
