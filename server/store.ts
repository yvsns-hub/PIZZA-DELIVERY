import bcrypt from 'bcryptjs';
import { dbStatus } from './db.js';
import { UserModel, IngredientModel, OrderModel } from './models.js';

export interface MemoryIngredient {
  id: string;
  name: string;
  category: 'base' | 'sauce' | 'cheese' | 'veggie';
  price: number;
  stock: number;
  threshold: number;
  description: string;
  isAvailable: boolean;
}

export interface MemoryUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'admin' | 'delivery';
  phone?: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  loginOtp?: string;
  loginOtpExpires?: Date;
  resetToken?: string;
  resetTokenExpires?: Date;
  createdAt: Date;
}

export interface MemoryOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: {
    street: string;
    city: string;
    landmark?: string;
    pincode: string;
    lat?: number;
    lng?: number;
    mapUrl?: string;
  };
  items: Array<{
    name: string;
    isCustom: boolean;
    base?: string;
    sauce?: string;
    cheese?: string;
    veggies?: string[];
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    details?: string;
  }>;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  paymentMethod: 'RAZORPAY' | 'COD';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderStatus: 'ORDER_CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'ASSIGNED_TO_DELIVERY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  deliveryStaffId?: string;
  deliveryStaffName?: string;
  deliveryStaffPhone?: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Memory stores
export const memoryIngredients: MemoryIngredient[] = [
  // 5 Bases
  { id: 'b1', name: 'Classic Hand Tossed', category: 'base', price: 4.00, stock: 45, threshold: 10, description: 'Traditional airy, bubbly crust baked golden brown', isAvailable: true },
  { id: 'b2', name: 'Crispy Thin Crust', category: 'base', price: 3.50, stock: 40, threshold: 10, description: 'Ultra-thin, light cracker-style crust', isAvailable: true },
  { id: 'b3', name: 'Cheese Burst Crust', category: 'base', price: 5.50, stock: 35, threshold: 12, description: 'Stuffed molten mozzarella encased in soft crust', isAvailable: true },
  { id: 'b4', name: 'Deep Dish Pan Crust', category: 'base', price: 4.50, stock: 30, threshold: 10, description: 'Thick, buttery crust with golden caramelized edges', isAvailable: true },
  { id: 'b5', name: 'Artisan Sourdough', category: 'base', price: 5.00, stock: 25, threshold: 10, description: 'Slow-fermented 48-hour sourdough with deep flavor', isAvailable: true },

  // 5 Sauces
  { id: 's1', name: 'San Marzano Marinara', category: 'sauce', price: 1.50, stock: 60, threshold: 15, description: 'Crushed Italian tomatoes with garlic, oregano & olive oil', isAvailable: true },
  { id: 's2', name: 'Spicy Peri Peri Sauce', category: 'sauce', price: 2.00, stock: 50, threshold: 12, description: 'Fiery bird’s eye chili with tangy roasted paprika', isAvailable: true },
  { id: 's3', name: 'Creamy Garlic Alfredo', category: 'sauce', price: 2.25, stock: 45, threshold: 12, description: 'Rich parmesan cream infused with slow-roasted garlic', isAvailable: true },
  { id: 's4', name: 'Smoky Chipotle BBQ', category: 'sauce', price: 2.00, stock: 50, threshold: 12, description: 'Sweet hickory smoke with savory brown sugar molasses', isAvailable: true },
  { id: 's5', name: 'Fresh Basil Pesto', category: 'sauce', price: 2.50, stock: 35, threshold: 10, description: 'Crushed Genovese basil with pine nuts, olive oil and pecorino', isAvailable: true },

  // Cheeses
  { id: 'c1', name: 'Fresh Fior Di Latte Mozzarella', category: 'cheese', price: 2.50, stock: 55, threshold: 15, description: 'Creamy whole milk mozzarella with optimal stretch', isAvailable: true },
  { id: 'c2', name: 'Sharp Aged Cheddar', category: 'cheese', price: 2.75, stock: 40, threshold: 12, description: 'Aged 12 months for sharp punchy savory depth', isAvailable: true },
  { id: 'c3', name: 'Whipped Ricotta Dollops', category: 'cheese', price: 3.00, stock: 30, threshold: 10, description: 'Silky, slightly sweet Italian curd cheese', isAvailable: true },
  { id: 'c4', name: 'Smoked Gouda', category: 'cheese', price: 3.25, stock: 28, threshold: 10, description: 'Dutch smoked cheese with aromatic nutty flavor', isAvailable: true },
  { id: 'c5', name: 'Plant-Based Almond Mozzarella', category: 'cheese', price: 3.50, stock: 20, threshold: 8, description: '100% vegan dairy-free melt with creamy texture', isAvailable: true },

  // Vegetables
  { id: 'v1', name: 'Crisp Bell Peppers', category: 'veggie', price: 1.00, stock: 65, threshold: 15, description: 'Trio of red, yellow, and green sweet peppers', isAvailable: true },
  { id: 'v2', name: 'Crimini Sliced Mushrooms', category: 'veggie', price: 1.25, stock: 50, threshold: 15, description: 'Earthy brown baby portobellos, sauteed lightly', isAvailable: true },
  { id: 'v3', name: 'Caramelized Red Onions', category: 'veggie', price: 0.75, stock: 60, threshold: 15, description: 'Thinly sliced sweet red onions', isAvailable: true },
  { id: 'v4', name: 'Spanish Black Olives', category: 'veggie', price: 1.25, stock: 40, threshold: 10, description: 'Sliced pitted Spanish black pearls', isAvailable: true },
  { id: 'v5', name: 'Pickled Jalapeños', category: 'veggie', price: 1.00, stock: 35, threshold: 10, description: 'Spicy tangy slices with a kick', isAvailable: true },
  { id: 'v6', name: 'Sweet Golden Corn', category: 'veggie', price: 1.00, stock: 45, threshold: 12, description: 'Crisp tender sweet corn kernels', isAvailable: true },
  { id: 'v7', name: 'Fresh Genovese Basil', category: 'veggie', price: 0.75, stock: 50, threshold: 10, description: 'Aromatic green leaves torn fresh upon baking', isAvailable: true },
  { id: 'v8', name: 'Cherry Tomatoes', category: 'veggie', price: 1.25, stock: 40, threshold: 12, description: 'Sweet roasted cherry tomato halves', isAvailable: true },
  { id: 'v9', name: 'Roasted Garlic Confit', category: 'veggie', price: 1.50, stock: 8, threshold: 10, description: 'Slow-simmered caramelized whole garlic cloves', isAvailable: true }, // Low stock sample!
];

export const memoryUsers: MemoryUser[] = [];
export const memoryOrders: MemoryOrder[] = [];

// Seed default users and sample orders
export async function seedInitialData() {
  const adminCustomHash = await bcrypt.hash('@Chirutha7035', 10);
  const adminBackupHash = await bcrypt.hash('Admin@12345', 10);
  const delivery1Hash = await bcrypt.hash('Delivery@12345', 10);
  const delivery2Hash = await bcrypt.hash('Delivery@12345', 10);
  const customerHash = await bcrypt.hash('Customer@12345', 10);

  memoryUsers.push(
    // Primary Admin User requested by user: yvsns7035@gmail.com / @Chirutha7035
    {
      id: 'usr_admin_yvsns',
      name: 'Head Chef Admin',
      email: 'yvsns7035@gmail.com',
      passwordHash: adminCustomHash,
      role: 'admin',
      phone: '+1 555-019-9021',
      isEmailVerified: true,
      createdAt: new Date(),
    },
    // Backup Admin User
    {
      id: 'usr_admin',
      name: 'Head Chef Admin (Demo)',
      email: 'admin@pizzadelivery.com',
      passwordHash: adminBackupHash,
      role: 'admin',
      phone: '+1 555-019-9021',
      isEmailVerified: true,
      createdAt: new Date(),
    },
    {
      id: 'usr_del1',
      name: 'Marcus Vance',
      email: 'delivery1@pizzadelivery.com',
      passwordHash: delivery1Hash,
      role: 'delivery',
      phone: '+1 555-014-4412',
      isEmailVerified: true,
      createdAt: new Date(),
    },
    {
      id: 'usr_del2',
      name: 'Elena Gomez',
      email: 'delivery2@pizzadelivery.com',
      passwordHash: delivery2Hash,
      role: 'delivery',
      phone: '+1 555-018-8833',
      isEmailVerified: true,
      createdAt: new Date(),
    },
    {
      id: 'usr_cust',
      name: 'Sophia Reynolds',
      email: 'customer@example.com',
      passwordHash: customerHash,
      role: 'customer',
      phone: '+1 555-012-3456',
      isEmailVerified: true,
      createdAt: new Date(),
    },
    {
      id: 'usr_david',
      name: 'David Kim',
      email: 'david.kim@example.com',
      passwordHash: customerHash,
      role: 'customer',
      phone: '+1 555-019-7733',
      isEmailVerified: true,
      createdAt: new Date(),
    }
  );

  // Sample order 1 (Out for delivery, assigned to Marcus Vance, owned by Sophia Reynolds)
  memoryOrders.push({
    id: 'ord_1001',
    orderNumber: 'PZA-1001',
    customerId: 'usr_cust',
    customerName: 'Sophia Reynolds',
    customerEmail: 'customer@example.com',
    customerPhone: '+1 555-012-3456',
    deliveryAddress: {
      street: '742 Evergreen Terrace, Apt 4B',
      city: 'Springfield',
      landmark: 'Near Oakwood Park',
      pincode: '97477',
      lat: 44.0462,
      lng: -123.0220,
      mapUrl: 'https://maps.google.com/?q=44.0462,-123.0220',
    },
    items: [
      {
        name: 'Custom Artisan Pizza',
        isCustom: true,
        base: 'Artisan Sourdough',
        sauce: 'San Marzano Marinara',
        cheese: 'Fresh Fior Di Latte Mozzarella',
        veggies: ['Crimini Sliced Mushrooms', 'Crisp Bell Peppers', 'Fresh Genovese Basil'],
        quantity: 1,
        unitPrice: 13.50,
        totalPrice: 13.50,
        details: 'Crust: Sourdough · Sauce: Marinara · Cheese: Mozzarella · Toppings: Mushrooms, Peppers, Basil',
      },
    ],
    subtotal: 13.50,
    tax: 1.08,
    deliveryFee: 2.50,
    totalAmount: 17.08,
    paymentStatus: 'PAID',
    paymentMethod: 'RAZORPAY',
    razorpayOrderId: 'order_test_9921',
    razorpayPaymentId: 'pay_test_8812',
    orderStatus: 'OUT_FOR_DELIVERY',
    deliveryStaffId: 'usr_del1',
    deliveryStaffName: 'Marcus Vance',
    deliveryStaffPhone: '+1 555-014-4412',
    statusHistory: [
      { status: 'ORDER_CONFIRMED', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), note: 'Payment verified via Razorpay', updatedBy: 'System' },
      { status: 'PREPARING', timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(), note: 'Pizza in wood-fired oven', updatedBy: 'Kitchen' },
      { status: 'READY_FOR_PICKUP', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), note: 'Boxed and heat-insulated', updatedBy: 'Kitchen' },
      { status: 'ASSIGNED_TO_DELIVERY', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), note: 'Assigned to Marcus Vance', updatedBy: 'Admin' },
      { status: 'OUT_FOR_DELIVERY', timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), note: 'Rider is on bike heading to address', updatedBy: 'Marcus Vance' },
    ],
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  });

  // Sample order 2 (Assigned to Elena Gomez, owned by David Kim)
  memoryOrders.push({
    id: 'ord_1002',
    orderNumber: 'PZA-1002',
    customerId: 'usr_david',
    customerName: 'David Kim',
    customerEmail: 'david.kim@example.com',
    customerPhone: '+1 555-019-7733',
    deliveryAddress: {
      street: '120 Market Street, Suite 500',
      city: 'Downtown',
      landmark: 'Next to Metro Station',
      pincode: '97401',
      lat: 44.0521,
      lng: -123.0868,
      mapUrl: 'https://maps.google.com/?q=44.0521,-123.0868',
    },
    items: [
      {
        name: 'Margherita Supreme',
        isCustom: false,
        base: 'Crispy Thin Crust',
        sauce: 'San Marzano Marinara',
        cheese: 'Fresh Fior Di Latte Mozzarella',
        veggies: ['Fresh Genovese Basil', 'Cherry Tomatoes'],
        quantity: 2,
        unitPrice: 14.99,
        totalPrice: 29.98,
        details: 'Chef Special Margherita with fresh buffalo mozzarella & sweet basil',
      },
    ],
    subtotal: 29.98,
    tax: 2.40,
    deliveryFee: 2.50,
    totalAmount: 34.88,
    paymentStatus: 'PAID',
    paymentMethod: 'RAZORPAY',
    razorpayOrderId: 'order_test_9922',
    razorpayPaymentId: 'pay_test_8813',
    orderStatus: 'ASSIGNED_TO_DELIVERY',
    deliveryStaffId: 'usr_del2',
    deliveryStaffName: 'Elena Gomez',
    deliveryStaffPhone: '+1 555-018-8833',
    statusHistory: [
      { status: 'ORDER_CONFIRMED', timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(), note: 'Payment verified', updatedBy: 'System' },
      { status: 'PREPARING', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), note: 'Chef baking thin crust', updatedBy: 'Kitchen' },
      { status: 'ASSIGNED_TO_DELIVERY', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), note: 'Assigned to Elena Gomez', updatedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  });

  console.log('[Store] Memory seed completed: 4 users, 23 ingredients, 2 sample orders.');

  // Also sync to MongoDB if connected
  if (dbStatus.isConnected) {
    try {
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        await UserModel.insertMany(memoryUsers as any);
        console.log('[Store] Seeded MongoDB Atlas users.');
      }
      const ingCount = await IngredientModel.countDocuments();
      if (ingCount === 0) {
        await IngredientModel.insertMany(memoryIngredients as any);
        console.log('[Store] Seeded MongoDB Atlas ingredients.');
      }
    } catch (err) {
      console.warn('[Store] MongoDB Atlas seed sync error:', err);
    }
  }
}
