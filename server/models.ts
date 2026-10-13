import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'admin' | 'delivery';
  phone?: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  loginOtp?: string;
  loginOtpExpires?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin', 'delivery'], default: 'customer' },
  phone: { type: String, default: '' },
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  loginOtp: { type: String },
  loginOtpExpires: { type: Date },
  resetToken: { type: String },
  resetTokenExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Ingredient Schema
export interface IIngredient extends Document {
  name: string;
  category: 'base' | 'sauce' | 'cheese' | 'veggie';
  price: number;
  stock: number;
  threshold: number;
  description: string;
  isAvailable: boolean;
}

const IngredientSchema = new Schema<IIngredient>({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['base', 'sauce', 'cheese', 'veggie'] },
  price: { type: Number, required: true, default: 0 },
  stock: { type: Number, required: true, default: 50 },
  threshold: { type: Number, required: true, default: 15 },
  description: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
});

// Order Schema
export interface IOrderItem {
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
}

export interface IStatusLog {
  status: string;
  timestamp: Date;
  note?: string;
  updatedBy?: string;
}

export interface IOrder extends Document {
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
  items: IOrderItem[];
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
  statusHistory: IStatusLog[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  customerId: { type: String },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    landmark: { type: String },
    pincode: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
    mapUrl: { type: String },
  },
  items: [
    {
      name: { type: String, required: true },
      isCustom: { type: Boolean, default: false },
      base: { type: String },
      sauce: { type: String },
      cheese: { type: String },
      veggies: [{ type: String }],
      quantity: { type: Number, required: true, default: 1 },
      unitPrice: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      details: { type: String },
    },
  ],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
  paymentMethod: { type: String, default: 'RAZORPAY' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  orderStatus: {
    type: String,
    enum: ['ORDER_CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'ASSIGNED_TO_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    default: 'ORDER_CONFIRMED',
  },
  deliveryStaffId: { type: String },
  deliveryStaffName: { type: String },
  deliveryStaffPhone: { type: String },
  statusHistory: [
    {
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String },
      updatedBy: { type: String },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const IngredientModel = mongoose.models.Ingredient || mongoose.model<IIngredient>('Ingredient', IngredientSchema);
export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
