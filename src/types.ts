export type UserRole = 'customer' | 'admin' | 'delivery';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isEmailVerified: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  category: 'base' | 'sauce' | 'cheese' | 'veggie';
  price: number;
  stock: number;
  threshold: number;
  description: string;
  isAvailable: boolean;
  stockLevel?: 'good' | 'low' | 'out_of_stock';
}

export interface SpecialtyPizza {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  base: string;
  sauce: string;
  cheese: string;
  veggies: string[];
  image: string;
  badge: string;
  isVeg: boolean;
}

export interface CartItem {
  cartId: string;
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
  image?: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state?: string;
  landmark?: string;
  pincode: string;
  phone?: string;
  instructions?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  mapUrl?: string;
}

export interface StatusHistoryItem {
  status: string;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: DeliveryAddress;
  items: CartItem[];
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
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  activeDeliveries: number;
  completedDeliveries: number;
}
