# PromoForge Backend

A Node.js/Express.js backend API for managing promo codes with external API integration.

## Features

- **Promo Code Generation**: Generate promo codes via external API
- **Promo Code Activation**: Activate promo codes (one-time use)
- **Status Checking**: Check promo code status via external API
- **Cashier Authentication**: JWT-based authentication for cashiers
- **Database Storage**: SQLite database for storing activations and logs
- **Rate Limiting**: Built-in rate limiting for API protection
- **Security**: Helmet.js for security headers, CORS configuration

## Prerequisites

- Node.js v24.10.0 or higher
- npm or yarn package manager

## Installation

1. Navigate to the backend directory:
   ```bash
   cd PromoForgeBackend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-here
   EXTERNAL_API_BASE_URL=https://api.external-promo-service.com
   EXTERNAL_API_KEY=your-external-api-key-here
   DATABASE_PATH=./database.sqlite
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

## Database Setup

The application uses SQLite database which is automatically created on first run. You can also manually set up the database:

### Automatic Setup (Recommended)
```bash
npm install  # This will automatically run database setup
```

### Manual Database Commands
```bash
# Setup database (create tables and default user)
npm run setup-db

# Check database status
npm run check-db

# Reset database (backup and recreate)
npm run reset-db
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## API Endpoints

### Authentication
- `POST /api/auth/login` - Cashier login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Promo Codes
- `POST /api/promo/generate` - Generate promo code (via external API)
- `GET /api/promo/status/:promoCode` - Check promo code status (via external API)
- `POST /api/promo/activate` - Activate promo code (internal)
- `GET /api/promo/activations` - Get activation history
- `GET /api/promo/logs` - Get API request logs

### Health Check
- `GET /health` - Server health status

## Default Credentials

The system creates a default cashier account on first run:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login!

## Database

The application uses SQLite database with the following tables:
- `cashiers` - Cashier accounts
- `activated_promo_codes` - Activated promo codes
- `promo_code_requests` - External API request logs

## External API Integration

The backend integrates with an external promo code service for:
- Generating new promo codes
- Checking promo code status

Configure the external API settings in your `.env` file:
- `EXTERNAL_API_BASE_URL` - Base URL of the external API
- `EXTERNAL_API_KEY` - API key for authentication

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Security headers with Helmet.js
- Input validation with express-validator

## Error Handling

The API includes comprehensive error handling:
- Validation errors
- Authentication errors
- Database errors
- External API errors
- Rate limiting errors

## Logging

All external API requests are logged to the database for monitoring and debugging purposes.

## Development

### Project Structure
```
PromoForgeBackend/
├── database/
│   └── init.js          # Database initialization
├── routes/
│   ├── auth.js          # Authentication routes
│   └── promo.js         # Promo code routes
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

### Adding New Features

1. Create new route files in the `routes/` directory
2. Add database migrations in `database/init.js` if needed
3. Update the main `server.js` to include new routes
4. Add appropriate error handling and validation

## Testing

Run tests with:
```bash
npm test
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a production-ready database (PostgreSQL, MySQL)
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Use a process manager like PM2
6. Set up monitoring and logging

## Troubleshooting

### Common Issues

1. **Database connection errors**: 
   - Run `npm run check-db` to verify database status
   - Run `npm run setup-db` to recreate database
   - Check database file permissions

2. **Server won't start**:
   - Ensure database is set up: `npm run setup-db`
   - Check if port 3001 is available
   - Verify environment variables in `.env` file

3. **External API errors**: 
   - Verify API URL and key configuration in `.env`
   - Check network connectivity
   - Review API request logs: `GET /api/promo/logs`

4. **Authentication issues**: 
   - Check JWT secret configuration
   - Verify default credentials (admin/admin123)
   - Reset database if needed: `npm run reset-db`

5. **CORS errors**: 
   - Verify frontend URL in CORS configuration
   - Check if frontend is running on correct port

### Database Commands

```bash
# Check database health
npm run check-db

# Recreate database with default user
npm run setup-db

# Reset database (backup existing data)
npm run reset-db
```

### Logs

Check the console output for detailed error messages and API request logs.
