import express from 'express';
import cors from 'cors';
import { connectDB, dbStatus } from './db.js';
import { seedInitialData, memoryIngredients, memoryOrders, memoryUsers } from './store.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import inventoryRoutes from './routes/inventory.js';
import deliveryRoutes from './routes/delivery.js';

let initialized = false;

export async function initApp() {
  if (!initialized) {
    try {
      await connectDB();
      await seedInitialData();
      initialized = true;
    } catch (e) {
      console.error('[App] Init error:', e);
    }
  }
}

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Middleware ensuring DB & store initialized on every request
  app.use(async (req, res, next) => {
    if (!initialized) {
      await initApp();
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    const lowStock = memoryIngredients.filter((i) => i.stock <= i.threshold).length;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbStatus.isConnected,
        mode: dbStatus.mode,
        host: dbStatus.host || 'MongoDB Atlas Cluster0',
        error: dbStatus.error,
      },
      smtp: {
        configured: !!process.env.SMTP_USER,
        user: process.env.SMTP_USER || 'yvsns7035@gmail.com',
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        sender: 'PIZZA DELIVERY',
      },
      stats: {
        ingredients: memoryIngredients.length,
        users: memoryUsers.length,
        orders: memoryOrders.length,
        lowStockAlerts: lowStock,
      },
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/delivery-staff', deliveryRoutes);

  return app;
}
