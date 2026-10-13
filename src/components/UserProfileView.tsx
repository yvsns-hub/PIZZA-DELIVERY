import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { User, Mail, Phone, MapPin, Edit3, Save, X, Clock, CheckCircle2, AlertCircle, ShoppingBag, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { api } from '../services/api.js';
import { Order } from '../types.js';
import { ease } from '../lib/animations.js';

interface UserProfileViewProps {
  onBackToMenu?: () => void;
  onNavigateHome?: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onBackToMenu, onNavigateHome, onTrackOrder }) => {
  const { user, updateProfile, logout } = useAuth();
  const { deliveryAddress, setDeliveryAddress } = useCart();
  const shouldReduce = useReducedMotion();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(deliveryAddress.street || '');
  const [city, setCity] = useState(deliveryAddress.city || '');
  const [pincode, setPincode] = useState(deliveryAddress.pincode || '');

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // User's order history
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      setIsLoadingOrders(true);
      try {
        const res = await api.getOrders({ customerEmail: user.email });
        setUserOrders(res.orders || []);
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    }
    fetchOrders();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      await updateProfile({ name, phone });
      setDeliveryAddress({ street, city, pincode });
      setIsEditing(false);
      setStatusMessage({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
    setStreet(deliveryAddress.street || '');
    setCity(deliveryAddress.city || '');
    setPincode(deliveryAddress.pincode || '');
    setIsEditing(false);
    setStatusMessage(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between pb-6 border-b border-stone-200">
        <div>
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">Customer Account</span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 mt-0.5">My Profile &amp; Orders</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMenu}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-colors cursor-pointer"
          >
            ← Back to Menu
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-4 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{statusMessage.text}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* ── Left Column: Profile Card ───────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg font-display">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900">{name || 'Customer'}</h2>
                  <span className="text-xs text-stone-500 font-mono capitalize">{user?.role || 'customer'} Account</span>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit Profile"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address (Protected)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3 py-2 text-xs bg-stone-100 border border-stone-200 rounded-xl text-stone-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                  />
                </div>

                <div className="pt-2 border-t border-stone-100">
                  <span className="block text-xs font-semibold text-stone-800 mb-2">Saved Delivery Address</span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Street Address, Apt / Suite"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                      />
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 border border-stone-200 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center gap-2.5 text-stone-600">
                  <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                  <span className="font-mono text-stone-900">{user?.email || 'N/A'}</span>
                  {user?.isEmailVerified && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 text-stone-600">
                  <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>{phone || 'No phone number added'}</span>
                </div>

                <div className="flex items-start gap-2.5 text-stone-600 pt-2 border-t border-stone-100">
                  <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-800 block">Default Delivery Address</span>
                    <span className="text-stone-600 block mt-0.5">
                      {street ? `${street}, ${city} ${pincode}` : 'No address saved yet. Configure during checkout.'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Order History ─────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-800" />
              <h3 className="text-base font-bold text-stone-900">Your Order History</h3>
            </div>
            <span className="text-xs text-stone-500 font-mono">{userOrders.length} Orders</span>
          </div>

          {isLoadingOrders ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-xs text-stone-500">
              Loading your previous orders...
            </div>
          ) : userOrders.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 space-y-3">
              <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-semibold text-stone-800">No Orders Yet</p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Explore our chef specialty pizzas or build your custom masterpiece to enjoy wood-fired delivery.
              </p>
              <button
                onClick={onBackToMenu}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors cursor-pointer"
              >
                Browse Menu Now →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-400 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-stone-900">{order.orderNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          order.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-1">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-0.5">
                      <span className="font-mono">${order.totalAmount.toFixed(2)}</span>
                      <span>·</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span className="capitalize">{order.paymentMethod} ({order.paymentStatus})</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onTrackOrder(order.orderNumber)}
                    className="px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <span>Track Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
