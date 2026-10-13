import { Ingredient, SpecialtyPizza, Order, DeliveryStaff, User } from '../types.js';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('pizza_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Auth
  async register(data: { name: string; email: string; password: string; phone?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed');
    return json;
  },

  async verifyEmail(email: string, code: string) {
    const res = await fetch(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Verification failed');
    return json;
  },

  async login(email: string, password: string, expectedRole?: 'customer' | 'delivery'): Promise<{ requiresOtp?: boolean; email?: string; message?: string; token?: string; user?: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, expectedRole }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json;
  },

  async verifyLoginOtp(email: string, otp: string, expectedRole?: 'customer' | 'delivery'): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/verify-login-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, expectedRole }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'OTP verification failed');
    return json;
  },

  async resendOtp(email: string, type?: 'login' | 'signup'): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to resend code');
    return json;
  },

  async updateProfile(data: { name?: string; phone?: string }) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update profile');
    return json;
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Request failed');
    return json;
  },

  async resetPassword(data: { email: string; token: string; newPassword: string }) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Reset failed');
    return json;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch user');
    return json;
  },

  async getEmailLogs() {
    const res = await fetch(`${API_BASE}/auth/email-logs`);
    return res.json();
  },

  // Menu
  async getMenu(): Promise<{
    bases: Ingredient[];
    sauces: Ingredient[];
    cheeses: Ingredient[];
    veggies: Ingredient[];
    specialtyPizzas: SpecialtyPizza[];
  }> {
    const res = await fetch(`${API_BASE}/menu`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to load menu');
    return json;
  },

  async createMenuItem(data: Partial<SpecialtyPizza>) {
    const res = await fetch(`${API_BASE}/menu`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add pizza to menu');
    return json;
  },

  async updateMenuItem(id: string, data: Partial<SpecialtyPizza>) {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update pizza');
    return json;
  },

  async deleteMenuItem(id: string) {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to remove pizza');
    return json;
  },

  async uploadMenuImage(fileOrData: File | string, filename?: string) {
    let imageData = '';
    let name = filename;
    if (typeof fileOrData === 'string') {
      imageData = fileOrData;
    } else {
      name = name || fileOrData.name;
      imageData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrData);
      });
    }
    const res = await fetch(`${API_BASE}/menu/upload-image`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ imageData, filename: name }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to upload image');
    return json;
  },

  // Orders
  async getQuote(items: any[]) {
    const res = await fetch(`${API_BASE}/orders/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to calculate quote');
    return json;
  },

  async createOrder(data: any) {
    const res = await fetch(`${API_BASE}/orders/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create order');
    return json;
  },

  async simulateTestPayment(orderId: string): Promise<{ paymentId: string; signature: string; razorpayOrderId: string }> {
    const res = await fetch(`${API_BASE}/orders/simulate-test-payment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ orderId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to simulate test payment signature');
    return json;
  },

  async verifyPayment(orderId: string, razorpayPaymentId?: string, razorpaySignature?: string) {
    const res = await fetch(`${API_BASE}/orders/verify-payment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ orderId, razorpayPaymentId, razorpaySignature }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Payment verification failed');
    return json;
  },

  async getOrders(params?: { role?: string; customerEmail?: string; customerId?: string; deliveryStaffId?: string; status?: string }): Promise<{ orders: Order[] }> {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set('role', params.role);
    if (params?.customerEmail) searchParams.set('customerEmail', params.customerEmail);
    if (params?.customerId) searchParams.set('customerId', params.customerId);
    if (params?.deliveryStaffId) searchParams.set('deliveryStaffId', params.deliveryStaffId);
    if (params?.status) searchParams.set('status', params.status);

    const res = await fetch(`${API_BASE}/orders?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch orders');
    return json;
  },

  async getOrder(id: string): Promise<{ order: Order }> {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch order');
    return json;
  },

  async updateOrderStatus(id: string, status: string, note?: string, updatedBy?: string) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, note, updatedBy }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update order status');
    return json;
  },

  async assignDeliveryStaff(orderId: string, deliveryStaffId: string) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/assign`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ deliveryStaffId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to assign staff');
    return json;
  },

  // Inventory
  async getInventory(): Promise<{ inventory: Ingredient[]; summary: any }> {
    const res = await fetch(`${API_BASE}/inventory`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch inventory');
    return json;
  },

  async updateInventory(id: string, updates: Partial<Ingredient>) {
    const res = await fetch(`${API_BASE}/inventory/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update inventory');
    return json;
  },

  async checkLowStock(recipientEmail?: string) {
    const res = await fetch(`${API_BASE}/inventory/check-low-stock`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ recipientEmail }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to run stock check');
    return json;
  },

  // Delivery
  async getDeliveryStaff(): Promise<{ staff: DeliveryStaff[] }> {
    const res = await fetch(`${API_BASE}/delivery-staff`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch staff');
    return json;
  },

  async createDeliveryStaff(data: { name: string; email: string; phone: string; password: string }) {
    const res = await fetch(`${API_BASE}/delivery-staff`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create staff');
    return json;
  },
};
