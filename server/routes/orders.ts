import express from 'express';
import crypto from 'crypto';
import { memoryOrders, memoryIngredients, memoryUsers, MemoryOrder } from '../store.js';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../mail.js';
import { specialtyPizzas } from './menu.js';
import {
  authenticateToken,
  requireAdmin,
  AuthenticatedRequest,
} from '../middleware/auth.js';

const router = express.Router();
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'UMOFN0mf3s21asLPkQGXbnX3';

// Helper: Calculate verified item price on server
function calculateItemPrice(item: any): { unitPrice: number; details: string; ingredientsUsed: string[] } {
  const ingredientsUsed: string[] = [];

  if (item.isCustom) {
    let price = 0;
    const baseObj = memoryIngredients.find((i) => i.name === item.base && i.category === 'base');
    const sauceObj = memoryIngredients.find((i) => i.name === item.sauce && i.category === 'sauce');
    const cheeseObj = memoryIngredients.find((i) => i.name === item.cheese && i.category === 'cheese');

    if (baseObj) {
      price += baseObj.price;
      ingredientsUsed.push(baseObj.name);
    }
    if (sauceObj) {
      price += sauceObj.price;
      ingredientsUsed.push(sauceObj.name);
    }
    if (cheeseObj) {
      price += cheeseObj.price;
      ingredientsUsed.push(cheeseObj.name);
    }

    if (Array.isArray(item.veggies)) {
      for (const vegName of item.veggies) {
        const vegObj = memoryIngredients.find((i) => i.name === vegName && i.category === 'veggie');
        if (vegObj) {
          price += vegObj.price;
          ingredientsUsed.push(vegObj.name);
        }
      }
    }

    const details = `Crust: ${item.base || 'Hand Tossed'} · Sauce: ${item.sauce || 'Marinara'} · Cheese: ${item.cheese || 'Mozzarella'}${
      item.veggies?.length ? ` · Toppings: ${item.veggies.join(', ')}` : ''
    }`;

    return { unitPrice: Math.round(price * 100) / 100, details, ingredientsUsed };
  } else {
    const special = specialtyPizzas.find((p) => p.name === item.name);
    const unitPrice = special ? special.price : 14.99;
    if (special) {
      ingredientsUsed.push(special.base, special.sauce, special.cheese, ...(special.veggies || []));
    }
    return { unitPrice, details: special?.tagline || 'Specialty Chef Recipe', ingredientsUsed };
  }
}

// POST /api/orders/quote - Calculate server-validated price (Public calculation helper)
router.post('/quote', (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let subtotal = 0;
    const validatedItems = items.map((rawItem: any) => {
      const { unitPrice, details } = calculateItemPrice(rawItem);
      const quantity = Math.max(1, parseInt(rawItem.quantity || 1, 10));
      const totalPrice = Math.round(unitPrice * quantity * 100) / 100;
      subtotal += totalPrice;

      return {
        ...rawItem,
        quantity,
        unitPrice,
        totalPrice,
        details,
      };
    });

    const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% sales tax
    const deliveryFee = subtotal > 35 ? 0 : 2.50; // Free delivery over $35
    const totalAmount = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

    res.json({
      items: validatedItems,
      subtotal,
      tax,
      deliveryFee,
      totalAmount,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders/create - Initialize order and test Razorpay order (MUST BE AUTHENTICATED)
router.post('/create', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required to place an order.' });
    }

    // Delivery riders cannot place customer food orders
    if (req.user.role === 'delivery') {
      return res.status(403).json({ error: 'Delivery staff accounts cannot place orders. Please use a customer account.' });
    }

    const { items, customerName, customerPhone, deliveryAddress, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must contain at least one pizza' });
    }
    if (!deliveryAddress?.street) {
      return res.status(400).json({ error: 'Delivery street address is required' });
    }

    // Always bind order to the cryptographically authenticated user identity
    const verifiedCustomerId = req.user.userId;
    const verifiedCustomerEmail = req.user.email;
    const verifiedCustomerName = customerName?.trim() || req.user.name;
    const verifiedCustomerPhone = customerPhone?.trim() || '+1 555-010-0000';

    // Validate server prices and ingredients stock
    let subtotal = 0;
    const validatedItems = [];
    const neededIngredients: Record<string, number> = {};

    for (const rawItem of items) {
      const { unitPrice, details, ingredientsUsed } = calculateItemPrice(rawItem);
      const quantity = Math.max(1, parseInt(rawItem.quantity || 1, 10));
      const totalPrice = Math.round(unitPrice * quantity * 100) / 100;
      subtotal += totalPrice;

      // Track stock needed
      for (const ing of ingredientsUsed) {
        neededIngredients[ing] = (neededIngredients[ing] || 0) + quantity;
      }

      validatedItems.push({
        name: rawItem.name || 'Custom Artisan Pizza',
        isCustom: !!rawItem.isCustom,
        base: rawItem.base,
        sauce: rawItem.sauce,
        cheese: rawItem.cheese,
        veggies: rawItem.veggies,
        quantity,
        unitPrice,
        totalPrice,
        details,
      });
    }

    // Check inventory stock
    for (const [ingName, countNeeded] of Object.entries(neededIngredients)) {
      const ing = memoryIngredients.find((i) => i.name === ingName);
      if (ing && ing.stock < countNeeded) {
        return res.status(400).json({
          error: `Ingredient "${ingName}" is currently out of stock (Available: ${ing.stock}, Requested: ${countNeeded}). Please adjust your toppings.`,
        });
      }
    }

    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const deliveryFee = subtotal > 35 ? 0 : 2.50;
    const totalAmount = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

    const orderNumber = 'PZA-' + Math.floor(1000 + Math.random() * 9000);
    const orderId = 'ord_' + Date.now();
    const isCod = paymentMethod === 'COD';
    const razorpayOrderId = isCod ? undefined : 'order_rzp_' + Math.random().toString(36).substring(2, 10);

    const mapUrl = deliveryAddress.lat && deliveryAddress.lng
      ? `https://www.google.com/maps?q=${deliveryAddress.lat},${deliveryAddress.lng}`
      : `https://www.google.com/maps?q=${encodeURIComponent([deliveryAddress.street, deliveryAddress.locality, deliveryAddress.city, deliveryAddress.state, deliveryAddress.pincode].filter(Boolean).join(', '))}`;

    // If COD, deduct inventory immediately upon order placement
    if (isCod) {
      for (const [ingName, countNeeded] of Object.entries(neededIngredients)) {
        const ing = memoryIngredients.find((i) => i.name === ingName);
        if (ing) {
          ing.stock = Math.max(0, ing.stock - countNeeded);
        }
      }
    }

    const newOrder: MemoryOrder = {
      id: orderId,
      orderNumber,
      customerId: verifiedCustomerId,
      customerName: verifiedCustomerName,
      customerEmail: verifiedCustomerEmail,
      customerPhone: verifiedCustomerPhone,
      deliveryAddress: {
        ...deliveryAddress,
        mapUrl,
      },
      items: validatedItems,
      subtotal,
      tax,
      deliveryFee,
      totalAmount,
      paymentStatus: isCod ? 'PENDING' : 'PENDING',
      paymentMethod: isCod ? 'COD' : 'RAZORPAY',
      razorpayOrderId,
      orderStatus: 'ORDER_CONFIRMED',
      statusHistory: [
        {
          status: isCod ? 'ORDER_CONFIRMED' : 'PENDING_PAYMENT',
          timestamp: new Date().toISOString(),
          note: isCod ? 'Cash on Delivery confirmed — payment to be collected at doorstep' : 'Awaiting Razorpay test checkout confirmation',
          updatedBy: 'System',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryOrders.unshift(newOrder);

    // Send confirmation email for COD immediately
    if (isCod) {
      sendOrderConfirmationEmail(newOrder).catch((e: any) =>
        console.error('[Mail] Failed to send COD order confirmation:', e.message)
      );
    }

    res.status(201).json({
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      totalAmount: newOrder.totalAmount,
      currency: 'USD',
      isCod,
      razorpayOrderId: newOrder.razorpayOrderId,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TnM5ZmX69bT10q',
      order: newOrder,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders/simulate-test-payment - Cryptographically sign a sandbox test payment
router.post('/simulate-test-payment', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { orderId } = req.body;
    const order = memoryOrders.find((o) => o.id === orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Ownership check
    if (order.customerId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: You can only pay for your own orders.' });
    }

    if (!order.razorpayOrderId) {
      return res.status(400).json({ error: 'Order does not require Razorpay online payment.' });
    }

    const paymentId = 'pay_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const signature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${paymentId}`)
      .digest('hex');

    res.json({
      paymentId,
      signature,
      razorpayOrderId: order.razorpayOrderId,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders/verify-payment - Verify signature and confirm payment (MUST BE AUTHENTICATED)
router.post('/verify-payment', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { orderId, razorpayPaymentId, razorpaySignature } = req.body;
    const order = memoryOrders.find((o) => o.id === orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Ownership check: Customer can only confirm their own order; Admin can confirm any order
    if (order.customerId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: You do not own this order.' });
    }

    // Idempotent check
    if (order.paymentStatus === 'PAID') {
      return res.json({ message: 'Order is already confirmed', order });
    }

    // Razorpay signature verification
    if (!razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        error: 'Payment verification failed: Payment ID and cryptographic signature are required.',
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (razorpaySignature !== expectedSignature) {
      return res.status(400).json({
        error: 'Payment verification failed: Invalid or fabricated payment signature.',
      });
    }

    // Set payment details
    order.paymentStatus = 'PAID';
    order.razorpayPaymentId = razorpayPaymentId;
    order.orderStatus = 'ORDER_CONFIRMED';
    order.statusHistory.push({
      status: 'ORDER_CONFIRMED',
      timestamp: new Date().toISOString(),
      note: `Payment verified ($${order.totalAmount.toFixed(2)} via Razorpay sandbox)`,
      updatedBy: 'Razorpay Gateway',
    });
    order.updatedAt = new Date().toISOString();

    // Safely deduct stock for ingredients used
    for (const item of order.items) {
      const { ingredientsUsed } = calculateItemPrice(item);
      for (const ingName of ingredientsUsed) {
        const ing = memoryIngredients.find((i) => i.name === ingName);
        if (ing) {
          ing.stock = Math.max(0, ing.stock - item.quantity);
        }
      }
    }

    // Send order confirmation email via Gmail SMTP
    await sendOrderConfirmationEmail(order);

    res.json({
      message: 'Payment verified and order placed successfully!',
      order,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders - List orders with strict role-based isolation (MUST BE AUTHENTICATED)
router.get('/', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { status } = req.query;
  let filtered = [...memoryOrders];

  if (status && typeof status === 'string') {
    filtered = filtered.filter((o) => o.orderStatus === status);
  }

  if (req.user.role === 'admin') {
    // Admin has access to all orders
    return res.json({ orders: filtered });
  }

  if (req.user.role === 'delivery') {
    // Delivery rider can ONLY view orders assigned to them or waiting for courier pickup
    filtered = filtered.filter(
      (o) => o.deliveryStaffId === req.user!.userId || o.orderStatus === 'READY_FOR_PICKUP'
    );
    return res.json({ orders: filtered });
  }

  if (req.user.role === 'customer') {
    // Customer can ONLY view their own orders
    filtered = filtered.filter((o) => o.customerId === req.user!.userId);
    return res.json({ orders: filtered });
  }

  res.status(403).json({ error: 'Forbidden: Unrecognized role' });
});

// GET /api/orders/:id - Get order details with authorization checks (MUST BE AUTHENTICATED)
router.get('/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const order = memoryOrders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Admin has access to all orders
  if (req.user.role === 'admin') {
    return res.json({ order });
  }

  // Customer can only view their own order
  if (req.user.role === 'customer') {
    if (order.customerId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to view this order.' });
    }
    return res.json({ order });
  }

  // Delivery rider can only view orders assigned to them or ready for pickup
  if (req.user.role === 'delivery') {
    if (order.deliveryStaffId !== req.user.userId && order.orderStatus !== 'READY_FOR_PICKUP') {
      return res.status(403).json({
        error: 'Forbidden: Access denied. This order is not assigned to you.',
      });
    }
    return res.json({ order });
  }

  res.status(403).json({ error: 'Forbidden: Insufficient permissions.' });
});

// PATCH /api/orders/:id/status - Update order lifecycle status (MUST BE AUTHENTICATED)
router.patch('/:id/status', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Customers cannot update order statuses
    if (req.user.role === 'customer') {
      return res.status(403).json({ error: 'Forbidden: Customers cannot update order statuses.' });
    }

    const { status, note, updatedBy } = req.body;
    const validStatuses = [
      'ORDER_CONFIRMED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'ASSIGNED_TO_DELIVERY',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const order = memoryOrders.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Delivery riders can ONLY update orders assigned to them, and only to delivery statuses
    if (req.user.role === 'delivery') {
      if (order.deliveryStaffId !== req.user.userId) {
        return res.status(403).json({ error: 'Forbidden: You can only update orders assigned to you.' });
      }
      const allowedRiderStatuses = ['OUT_FOR_DELIVERY', 'DELIVERED'];
      if (!allowedRiderStatuses.includes(status)) {
        return res.status(403).json({
          error: `Forbidden: Delivery personnel can only mark orders as ${allowedRiderStatuses.join(' or ')}.`,
        });
      }
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status updated from ${oldStatus} to ${status}`,
      updatedBy: updatedBy || req.user.name,
    });
    order.updatedAt = new Date().toISOString();

    // If cancelled, release stock back
    if (status === 'CANCELLED' && oldStatus !== 'CANCELLED') {
      for (const item of order.items) {
        const { ingredientsUsed } = calculateItemPrice(item);
        for (const ingName of ingredientsUsed) {
          const ing = memoryIngredients.find((i) => i.name === ingName);
          if (ing) {
            ing.stock += item.quantity;
          }
        }
      }
    }

    // Send email notification to customer on status change
    await sendOrderStatusUpdateEmail(order, status);

    res.json({ message: 'Order status updated successfully', order });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/orders/:id/assign - Assign delivery personnel (ADMIN ONLY)
router.patch('/:id/assign', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { deliveryStaffId } = req.body;
    const order = memoryOrders.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const staff = memoryUsers.find((u) => u.id === deliveryStaffId && u.role === 'delivery');
    if (!staff) {
      return res.status(404).json({ error: 'Delivery personnel not found' });
    }

    order.deliveryStaffId = staff.id;
    order.deliveryStaffName = staff.name;
    order.deliveryStaffPhone = staff.phone || '+1 555-010-0000';
    order.orderStatus = 'ASSIGNED_TO_DELIVERY';
    order.statusHistory.push({
      status: 'ASSIGNED_TO_DELIVERY',
      timestamp: new Date().toISOString(),
      note: `Assigned to delivery rider ${staff.name}`,
      updatedBy: 'Admin',
    });
    order.updatedAt = new Date().toISOString();

    await sendOrderStatusUpdateEmail(order, 'ASSIGNED_TO_DELIVERY');

    res.json({ message: 'Order assigned to rider successfully', order });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
