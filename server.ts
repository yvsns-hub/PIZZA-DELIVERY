import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { connectDB, dbStatus } from './server/db.js';
import { seedInitialData, memoryIngredients, memoryOrders, memoryUsers } from './server/store.js';
import authRoutes from './server/routes/auth.js';
import menuRoutes from './server/routes/menu.js';
import orderRoutes from './server/routes/orders.js';
import inventoryRoutes from './server/routes/inventory.js';
import deliveryRoutes from './server/routes/delivery.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  // Basic middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize DB & Seed Data
  await connectDB();
  await seedInitialData();

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

  // Serve static assets or mount Vite dev middleware
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Vite middleware mounted in dev mode.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Pizza Delivery Full-Stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
});
