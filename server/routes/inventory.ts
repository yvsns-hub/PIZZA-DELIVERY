import express from 'express';
import { memoryIngredients } from '../store.js';
import { sendLowInventoryAlertEmail } from '../mail.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All inventory endpoints require verified Administrator privileges
router.use(authenticateToken, requireAdmin);

// GET /api/inventory - List all ingredients and stock levels
router.get('/', (req, res) => {
  const items = memoryIngredients.map((item) => {
    let stockLevel: 'good' | 'low' | 'out_of_stock' = 'good';
    if (item.stock === 0) stockLevel = 'out_of_stock';
    else if (item.stock <= item.threshold) stockLevel = 'low';

    return {
      ...item,
      stockLevel,
    };
  });

  const lowStockCount = items.filter((i) => i.stock <= i.threshold).length;

  res.json({
    inventory: items,
    summary: {
      totalItems: items.length,
      lowStockCount,
      outOfStockCount: items.filter((i) => i.stock === 0).length,
    },
  });
});

// PATCH /api/inventory/:id - Update stock or threshold
router.patch('/:id', (req, res) => {
  try {
    const { stock, threshold, isAvailable, price } = req.body;
    const item = memoryIngredients.find((i) => i.id === req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    if (typeof stock === 'number') {
      item.stock = Math.max(0, Math.floor(stock));
    }
    if (typeof threshold === 'number') {
      item.threshold = Math.max(1, Math.floor(threshold));
    }
    if (typeof isAvailable === 'boolean') {
      item.isAvailable = isAvailable;
    }
    if (typeof price === 'number') {
      item.price = Math.max(0, price);
    }

    res.json({
      message: 'Ingredient stock updated successfully',
      item: {
        ...item,
        stockLevel: item.stock === 0 ? 'out_of_stock' : item.stock <= item.threshold ? 'low' : 'good',
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inventory/check-low-stock - Run stock audit and dispatch email alert
router.post('/check-low-stock', async (req, res) => {
  try {
    const { recipientEmail } = req.body;
    const lowStockItems = memoryIngredients.filter((i) => i.stock <= i.threshold);

    if (lowStockItems.length === 0) {
      return res.json({
        message: 'All ingredient stock levels are healthy! No alert needed.',
        lowStockCount: 0,
        items: [],
      });
    }

    const emailResult = await sendLowInventoryAlertEmail(
      lowStockItems.map((i) => ({
        name: i.name,
        category: i.category,
        stock: i.stock,
        threshold: i.threshold,
      })),
      recipientEmail || 'yvsns7035@gmail.com'
    );

    res.json({
      message: `Low stock alert dispatched for ${lowStockItems.length} items to ${recipientEmail || 'yvsns7035@gmail.com'}`,
      lowStockCount: lowStockItems.length,
      items: lowStockItems,
      emailResult,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
