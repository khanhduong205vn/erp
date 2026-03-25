require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./database');
const { createAuthRoutes } = require('./routes/auth');
const { createEmployeeRoutes } = require('./routes/employees');
const { createAssetRoutes } = require('./routes/assets');
const { createBookingRoutes } = require('./routes/bookings');
const { createDashboardRoutes } = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3005;

// Full CORS configuration — allow all origins during development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
}));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Boot server after database is ready
(async () => {
  try {
    const pool = await initDatabase({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'erp_1tr',
    });

    // Mount API routes
    app.use('/api/auth', createAuthRoutes(pool));
    app.use('/api/employees', createEmployeeRoutes(pool));
    app.use('/api/assets', createAssetRoutes(pool));
    app.use('/api/bookings', createBookingRoutes(pool));
    app.use('/api/dashboard', createDashboardRoutes(pool));

    // Health check
    app.get('/api/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    app.listen(PORT, () => {
      console.log(`✅ ERP Backend running on http://localhost:${PORT}`);
      console.log(`📦 Database: ${process.env.DB_NAME || 'erp_1tr'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
})();
