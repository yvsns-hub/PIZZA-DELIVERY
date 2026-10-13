import express from 'express';
import bcrypt from 'bcryptjs';
import { memoryUsers, memoryOrders } from '../store.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Delivery staff management is restricted to Administrators
router.use(authenticateToken, requireAdmin);

// GET /api/delivery-staff - List all delivery personnel
router.get('/', (req, res) => {
  const staff = memoryUsers
    .filter((u) => u.role === 'delivery')
    .map((s) => {
      const activeDeliveries = memoryOrders.filter(
        (o) =>
          o.deliveryStaffId === s.id &&
          ['ASSIGNED_TO_DELIVERY', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)
      ).length;

      const completedDeliveries = memoryOrders.filter(
        (o) => o.deliveryStaffId === s.id && o.orderStatus === 'DELIVERED'
      ).length;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone || 'N/A',
        activeDeliveries,
        completedDeliveries,
      };
    });

  res.json({ staff });
});

// POST /api/delivery-staff - Admin creates a new delivery staff account
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and temporary password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (memoryUsers.find((u) => u.email === cleanEmail)) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newStaff = {
      id: 'usr_del_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: 'delivery' as const,
      phone: phone?.trim() || '+1 555-010-0000',
      isEmailVerified: true,
      createdAt: new Date(),
    };

    memoryUsers.push(newStaff);

    res.status(201).json({
      message: 'Delivery staff account created successfully',
      staff: {
        id: newStaff.id,
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
