import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Shield,
  Package,
  Layers,
  Bike,
  Mail,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Plus,
  Send,
  UserPlus,
  Utensils,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Phone,
  MapPin,
  X,
  Save,
  Clock,
  Check,
} from 'lucide-react';
import { Order, Ingredient, DeliveryStaff, SpecialtyPizza } from '../types.js';
import { api } from '../services/api.js';
import { staggerContainer, fadeUp, tabContent, listItem, notificationBanner, ease } from '../lib/animations.js';

export const AdminDashboard: React.FC = () => {
  const shouldReduce = useReducedMotion();
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'inventory' | 'staff' | 'emails'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const [staff, setStaff] = useState<DeliveryStaff[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [specialtyPizzas, setSpecialtyPizzas] = useState<SpecialtyPizza[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Filter for orders
  const [orderFilter, setOrderFilter] = useState<string>('all');

  // Add staff modal state
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('Delivery@12345');

  // Menu item modal state
  const [isPizzaModalOpen, setIsPizzaModalOpen] = useState(false);
  const [isEditingPizza, setIsEditingPizza] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentPizza, setCurrentPizza] = useState<Partial<SpecialtyPizza>>({
    name: '',
    tagline: '',
    description: '',
    price: 15.99,
    base: 'Classic Hand-Tossed',
    sauce: 'San Marzano Marinara',
    cheese: 'Whole Milk Mozzarella',
    veggies: [],
    image: '',
    badge: "Artisan's Choice",
    isVeg: true,
  });
  const [veggiesInput, setVeggiesInput] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, invRes, staffRes, mailRes, menuRes] = await Promise.all([
        api.getOrders(),
        api.getInventory(),
        api.getDeliveryStaff(),
        api.getEmailLogs(),
        api.getMenu(),
      ]);
      setOrders(ordersRes.orders || []);
      setInventory(invRes.inventory || []);
      setStaff(staffRes.staff || []);
      setEmailLogs(mailRes.logs || []);
      setSpecialtyPizzas(menuRes.specialtyPizzas || []);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus, undefined, 'Head Chef Admin');
      setActionMessage(`Order status updated to ${newStatus}`);
      setTimeout(() => setActionMessage(null), 3000);
      loadData();
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Assign staff to order
  const handleAssignStaff = async (orderId: string, staffId: string) => {
    try {
      await api.assignDeliveryStaff(orderId, staffId);
      setActionMessage('Delivery staff assigned successfully!');
      setTimeout(() => setActionMessage(null), 3000);
      loadData();
    } catch (err: any) {
      alert('Error assigning staff: ' + err.message);
    }
  };

  // Update inventory stock
  const handleUpdateStock = async (item: Ingredient, delta: number) => {
    try {
      const newStock = Math.max(0, item.stock + delta);
      await api.updateInventory(item.id, { stock: newStock });
      setActionMessage(`Updated ${item.name} stock to ${newStock}`);
      setTimeout(() => setActionMessage(null), 2500);
      loadData();
    } catch (err: any) {
      alert('Error updating stock: ' + err.message);
    }
  };

  // Trigger low-stock alert
  const handleTriggerLowStockAlert = async () => {
    setIsLoading(true);
    try {
      const res = await api.checkLowStock('yvsns7035@gmail.com');
      setActionMessage(res.message);
      setTimeout(() => setActionMessage(null), 4000);
      loadData();
    } catch (err: any) {
      alert('Error sending alert: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new delivery staff
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDeliveryStaff({
        name: newStaffName,
        email: newStaffEmail,
        phone: newStaffPhone,
        password: newStaffPassword,
      });
      setIsAddingStaff(false);
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPhone('');
      setActionMessage('New delivery courier account registered!');
      setTimeout(() => setActionMessage(null), 3000);
      loadData();
    } catch (err: any) {
      alert('Error adding staff: ' + err.message);
    }
  };

  // Menu Management Handlers
  const openAddPizzaModal = () => {
    setIsEditingPizza(false);
    setCurrentPizza({
      name: '',
      tagline: '',
      description: '',
      price: 16.99,
      base: 'Classic Hand-Tossed',
      sauce: 'San Marzano Marinara',
      cheese: 'Whole Milk Mozzarella',
      veggies: ['Basil', 'Cherry Tomatoes'],
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      badge: "Chef's Special",
      isVeg: true,
    });
    setVeggiesInput('Basil, Cherry Tomatoes');
    setIsPizzaModalOpen(true);
  };

  const openEditPizzaModal = (pizza: SpecialtyPizza) => {
    setIsEditingPizza(true);
    setCurrentPizza({ ...pizza });
    setVeggiesInput((pizza.veggies || []).join(', '));
    setIsPizzaModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const res = await api.uploadMenuImage(file);
      setCurrentPizza((prev) => ({ ...prev, image: res.imageUrl }));
      setActionMessage('Pizza image uploaded successfully!');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert('Image upload failed: ' + err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSavePizza = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPizza.name || !currentPizza.price) {
      alert('Pizza name and price are required');
      return;
    }

    const veggiesArray = veggiesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const pizzaData: Partial<SpecialtyPizza> = {
      ...currentPizza,
      price: Number(currentPizza.price),
      veggies: veggiesArray,
    };

    try {
      if (isEditingPizza && currentPizza.id) {
        await api.updateMenuItem(currentPizza.id, pizzaData);
        setActionMessage(`Updated "${currentPizza.name}" successfully!`);
      } else {
        await api.createMenuItem(pizzaData);
        setActionMessage(`Added "${currentPizza.name}" to menu!`);
      }
      setIsPizzaModalOpen(false);
      setTimeout(() => setActionMessage(null), 3000);
      loadData();
    } catch (err: any) {
      alert('Failed to save menu item: ' + err.message);
    }
  };

  const handleDeletePizza = async (pizza: SpecialtyPizza) => {
    if (!confirm(`Are you sure you want to remove "${pizza.name}" from the active menu?`)) return;
    try {
      await api.deleteMenuItem(pizza.id);
      setActionMessage(`Removed "${pizza.name}" from menu`);
      setTimeout(() => setActionMessage(null), 3000);
      loadData();
    } catch (err: any) {
      alert('Failed to remove menu item: ' + err.message);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.orderStatus === orderFilter;
  });

  const lowStockCount = inventory.filter((i) => i.stock <= i.threshold).length;
  const activeOrdersCount = orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.orderStatus)).length;
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="py-8 bg-stone-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-4"
          variants={shouldReduce ? {} : fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-stone-900 text-amber-500 rounded-xl shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                Kitchen, Dispatch & Menu Administration
              </h1>
              <p className="text-xs text-stone-500">
                Live order fulfillment, customer GPS mapping, specialty catalog management, and stock replenishment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
              whileHover={shouldReduce ? {} : { scale: 1.02 }}
              whileTap={shouldReduce ? {} : { scale: 0.96 }}
            >
              <motion.span
                animate={isLoading && !shouldReduce ? { rotate: 360 } : { rotate: 0 }}
                transition={isLoading ? { duration: 0.9, repeat: Infinity, ease: 'linear' } : {}}
                style={{ display: 'block' }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </motion.span>
              <span>Refresh Data</span>
            </motion.button>
            <motion.button
              onClick={handleTriggerLowStockAlert}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors border border-amber-200 cursor-pointer"
              title="Runs inventory check and dispatches Gmail SMTP alert"
              whileHover={shouldReduce ? {} : { scale: 1.02 }}
              whileTap={shouldReduce ? {} : { scale: 0.96 }}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Trigger Stock Alert</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Action feedback banner */}
        <AnimatePresence>
          {actionMessage && (
            <motion.div
              className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 flex items-center gap-2 shadow-xs"
              variants={shouldReduce ? {} : notificationBanner}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* KPI Strip */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={staggerContainer(0.06, 0.04)}
          initial="hidden"
          animate="visible"
        >
          {[
            { label: 'Total Paid Revenue', value: `$${totalRevenue.toFixed(2)}`, color: 'text-stone-900' },
            { label: 'Active Kitchen Orders', value: String(activeOrdersCount), color: 'text-amber-800' },
            { label: 'Specialty Menu Items', value: `${specialtyPizzas.length} pizzas`, color: 'text-stone-900' },
            { label: 'Low Stock Alerts', value: `${lowStockCount} items`, color: lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600' },
          ].map((kpi) => (
            <motion.div
              key={kpi.label}
              className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs"
              variants={shouldReduce ? {} : { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: ease.out } } }}
            >
              <span className="text-xs text-stone-500 font-medium">{kpi.label}</span>
              <p className={`font-mono tabular-nums text-2xl font-bold mt-1 ${kpi.color}`}>
                {kpi.value}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/60 rounded-xl w-fit border border-stone-200/50">
          {[
            { id: 'orders' as const, label: `Orders Queue (${orders.length})` },
            { id: 'menu' as const, label: `Menu Management (${specialtyPizzas.length})` },
            { id: 'inventory' as const, label: `Inventory Stock (${inventory.length})` },
            { id: 'staff' as const, label: `Delivery Fleet (${staff.length})` },
            { id: 'emails' as const, label: `SMTP Dispatch Logs (${emailLogs.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer z-10 ${
                activeTab === tab.id ? 'text-white' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="admin-active-tab-pill"
                  className="absolute inset-0 bg-stone-900 rounded-lg -z-10 shadow-xs"
                  transition={{ duration: 0.25, ease: ease.out }}
                />
              )}
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ORDERS MANAGEMENT */}
        <AnimatePresence mode="wait" initial={false}>
        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden space-y-4 p-4"
            variants={shouldReduce ? {} : tabContent}
            initial="hidden" animate="visible" exit="hidden"
          >
            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-stone-400 mr-1">Filter Status:</span>
              {['all', 'ORDER_CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'ASSIGNED_TO_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderFilter(status)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    orderFilter === status ? 'bg-amber-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Order</th>
                    <th className="py-2.5 px-3">Customer & Location Details</th>
                    <th className="py-2.5 px-3">Ordered Items & Recipe</th>
                    <th className="py-2.5 px-3">Amount & Method</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Assign Courier</th>
                    <th className="py-2.5 px-3 text-right">Workflow Transitions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-stone-400">
                        No orders match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord, idx) => {
                      const hasGps = Boolean(ord.deliveryAddress.latitude || ord.deliveryAddress.lat);
                      const lat = ord.deliveryAddress.latitude || ord.deliveryAddress.lat;
                      const lng = ord.deliveryAddress.longitude || ord.deliveryAddress.lng;

                      return (
                        <motion.tr
                          key={ord.id}
                          layout="position"
                          className="hover:bg-stone-50/60 transition-colors"
                          initial={shouldReduce ? false : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03, duration: 0.28, ease: ease.out }}
                        >
                          <td className="py-3.5 px-3 align-top font-mono font-bold text-stone-900">
                            #{ord.orderNumber}
                            <div className="text-[10px] text-stone-400 font-normal">
                              {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-[9px] text-stone-400">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </div>
                          </td>

                          {/* Full Customer & Location Visibility */}
                          <td className="py-3.5 px-3 align-top max-w-xs space-y-1">
                            <div>
                              <span className="font-semibold text-stone-900">{ord.customerName}</span>
                              {ord.customerPhone && (
                                <a
                                  href={`tel:${ord.customerPhone}`}
                                  className="text-[11px] text-stone-600 flex items-center gap-1 hover:text-amber-800"
                                >
                                  <Phone className="w-2.5 h-2.5 text-stone-400" />
                                  <span>{ord.customerPhone}</span>
                                </a>
                              )}
                            </div>

                            <div className="text-[11px] text-stone-600 bg-stone-50 p-1.5 rounded border border-stone-200 space-y-0.5">
                              <p className="font-medium text-stone-800">{ord.deliveryAddress.street}</p>
                              <p className="text-[10px] text-stone-500">
                                {[ord.deliveryAddress.city, ord.deliveryAddress.state, ord.deliveryAddress.pincode].filter(Boolean).join(', ')}
                              </p>
                              {ord.deliveryAddress.instructions && (
                                <p className="text-[10px] text-amber-800 italic pt-0.5 border-t border-stone-200">
                                  Note: "{ord.deliveryAddress.instructions}"
                                </p>
                              )}
                            </div>

                            {hasGps && lat && lng && (
                              <div className="text-[10px] text-stone-500 flex items-center gap-1 font-mono">
                                <MapPin className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                <span>{lat.toFixed(5)}, {lng.toFixed(5)}</span>
                              </div>
                            )}

                            {ord.deliveryAddress.mapUrl && (
                              <a
                                href={ord.deliveryAddress.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 hover:underline pt-0.5"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Open Google Maps</span>
                              </a>
                            )}
                          </td>

                          {/* Itemized details including custom recipe breakdown */}
                          <td className="py-3.5 px-3 align-top max-w-xs">
                            {ord.items.map((it, itemIdx) => (
                              <div key={itemIdx} className="text-[11px] text-stone-700 mb-1.5 last:mb-0">
                                <div className="flex items-center gap-1 font-medium">
                                  <span>{it.name}</span>
                                  <span className="text-stone-400 font-mono">x{it.quantity}</span>
                                  <span className="text-[10px] text-stone-500 font-mono">(${it.totalPrice.toFixed(2)})</span>
                                </div>
                                {it.isCustom && (
                                  <div className="text-[10px] text-stone-600 bg-amber-50/60 rounded p-1.5 border border-amber-200/60 mt-1 space-y-0.5">
                                    {it.base && <div><span className="text-stone-500">Crust:</span> <span className="font-semibold">{it.base}</span></div>}
                                    {it.sauce && <div><span className="text-stone-500">Sauce:</span> <span className="font-semibold">{it.sauce}</span></div>}
                                    {it.cheese && <div><span className="text-stone-500">Cheese:</span> <span className="font-semibold">{it.cheese}</span></div>}
                                    {it.veggies && it.veggies.length > 0 && (
                                      <div><span className="text-stone-500">Toppings:</span> <span className="font-semibold">{it.veggies.join(', ')}</span></div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </td>

                          {/* Amount and payment method */}
                          <td className="py-3.5 px-3 align-top">
                            <div className="font-mono tabular-nums font-bold text-stone-900">
                              ${ord.totalAmount.toFixed(2)}
                            </div>
                            <div className="text-[10px] mt-1 space-y-0.5">
                              <div>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  ord.paymentMethod === 'COD' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-300'
                                }`}>
                                  {ord.paymentMethod === 'COD' ? 'CASH ON DELIVERY' : 'ONLINE (RAZORPAY)'}
                                </span>
                              </div>
                              <div>
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold ${
                                  ord.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                                }`}>
                                  {ord.paymentStatus}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Order status badge */}
                          <td className="py-3.5 px-3 align-top">
                            <motion.span
                              key={ord.orderStatus}
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                ord.orderStatus === 'DELIVERED'
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                  : ord.orderStatus === 'CANCELLED'
                                  ? 'bg-rose-50 text-rose-900 border-rose-200'
                                  : 'bg-amber-50 text-amber-900 border-amber-200'
                              }`}
                              initial={shouldReduce ? false : { scale: 0.85, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                            >
                              {ord.orderStatus}
                            </motion.span>
                          </td>

                          {/* Courier assignment */}
                          <td className="py-3.5 px-3 align-top">
                            <select
                              value={ord.deliveryStaffId || ''}
                              onChange={(e) => handleAssignStaff(ord.id, e.target.value)}
                              className="px-2 py-1 text-xs border border-stone-200 rounded-lg bg-white text-stone-800 focus:outline-none focus:border-amber-700"
                            >
                              <option value="">Unassigned</option>
                              {staff.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({s.activeDeliveries} active)
                                </option>
                              ))}
                            </select>
                            {ord.deliveryStaffName && (
                              <div className="text-[10px] text-stone-500 mt-1 flex items-center gap-1">
                                <Bike className="w-2.5 h-2.5 text-stone-400" />
                                <span>{ord.deliveryStaffName}</span>
                              </div>
                            )}
                          </td>

                          {/* Workflow status update buttons */}
                          <td className="py-3.5 px-3 align-top text-right space-y-1">
                            {ord.orderStatus === 'ORDER_CONFIRMED' && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'PREPARING')}
                                className="block w-full px-2.5 py-1 text-[11px] font-semibold bg-amber-800 text-white rounded-lg hover:bg-amber-900 cursor-pointer shadow-2xs"
                              >
                                Start Baking
                              </button>
                            )}
                            {ord.orderStatus === 'PREPARING' && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'READY_FOR_PICKUP')}
                                className="block w-full px-2.5 py-1 text-[11px] font-semibold bg-blue-700 text-white rounded-lg hover:bg-blue-800 cursor-pointer shadow-2xs"
                              >
                                Ready for Pickup
                              </button>
                            )}
                            {ord.orderStatus === 'READY_FOR_PICKUP' && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'ASSIGNED_TO_DELIVERY')}
                                className="block w-full px-2.5 py-1 text-[11px] font-semibold bg-purple-700 text-white rounded-lg hover:bg-purple-800 cursor-pointer shadow-2xs"
                              >
                                Assign Courier
                              </button>
                            )}
                            {ord.orderStatus === 'ASSIGNED_TO_DELIVERY' && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'OUT_FOR_DELIVERY')}
                                className="block w-full px-2.5 py-1 text-[11px] font-semibold bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 cursor-pointer shadow-2xs"
                              >
                                Dispatch Order
                              </button>
                            )}
                            {ord.orderStatus === 'OUT_FOR_DELIVERY' && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'DELIVERED')}
                                className="block w-full px-2.5 py-1 text-[11px] font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 cursor-pointer shadow-2xs"
                              >
                                Mark Delivered
                              </button>
                            )}
                            {ord.orderStatus !== 'CANCELLED' && ord.orderStatus !== 'DELIVERED' && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'CANCELLED')}
                                className="block w-full px-2 py-0.5 text-[10px] text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                              >
                                Cancel Order
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 2: MENU MANAGEMENT */}
        {activeTab === 'menu' && (
          <motion.div
            key="menu"
            className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 space-y-6"
            variants={shouldReduce ? {} : tabContent}
            initial="hidden" animate="visible" exit="hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-700" />
                  <span>Specialty Menu Catalog Management</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Add, update prices, edit recipe compositions, upload images, or archive artisan pizzas. Changes appear instantly in customer view.
                </p>
              </div>
              <motion.button
                onClick={openAddPizzaModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-xs transition-colors cursor-pointer"
                whileHover={shouldReduce ? {} : { scale: 1.02 }}
                whileTap={shouldReduce ? {} : { scale: 0.96 }}
              >
                <Plus className="w-4 h-4" />
                <span>Add New Specialty Pizza</span>
              </motion.button>
            </div>

            {/* Pizza Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {specialtyPizzas.map((pizza) => (
                <div
                  key={pizza.id}
                  className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-stone-200">
                      <img
                        src={pizza.image}
                        alt={pizza.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-950/80 text-amber-400 backdrop-blur-xs">
                        {pizza.badge || "Chef's Craft"}
                      </span>
                      <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-xs ${
                        pizza.isVeg ? 'bg-emerald-950/80 text-emerald-400' : 'bg-rose-950/80 text-rose-400'
                      }`}>
                        {pizza.isVeg ? 'Vegetarian' : 'Non-Veg'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-stone-900 text-sm">{pizza.name}</h4>
                        <span className="font-mono font-bold text-amber-800 text-sm">
                          ${pizza.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-amber-900/80 font-medium italic">{pizza.tagline}</p>
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2">{pizza.description}</p>
                    </div>

                    <div className="text-[11px] text-stone-500 bg-white p-2 rounded-lg border border-stone-200 space-y-0.5">
                      <div><span className="text-stone-400">Crust:</span> {pizza.base}</div>
                      <div><span className="text-stone-400">Sauce:</span> {pizza.sauce}</div>
                      <div><span className="text-stone-400">Cheese:</span> {pizza.cheese}</div>
                      <div><span className="text-stone-400">Toppings:</span> {(pizza.veggies || []).join(', ')}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200 mt-4">
                    <button
                      onClick={() => openEditPizzaModal(pizza)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit & Price</span>
                    </button>
                    <button
                      onClick={() => handleDeletePizza(pizza)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal for Add / Edit Pizza */}
            <AnimatePresence>
              {isPizzaModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <motion.div
                    className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                      <h3 className="font-bold text-stone-900 text-base">
                        {isEditingPizza ? `Edit: ${currentPizza.name}` : 'Add New Specialty Pizza'}
                      </h3>
                      <button
                        onClick={() => setIsPizzaModalOpen(false)}
                        className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSavePizza} className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-semibold text-stone-700">Pizza Name</label>
                          <input
                            type="text"
                            required
                            value={currentPizza.name || ''}
                            onChange={(e) => setCurrentPizza({ ...currentPizza, name: e.target.value })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:border-amber-700"
                            placeholder="e.g. Margherita Classico"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-stone-700">Selling Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={currentPizza.price || ''}
                            onChange={(e) => setCurrentPizza({ ...currentPizza, price: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:border-amber-700 font-mono"
                            placeholder="16.99"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-semibold text-stone-700">Tagline</label>
                          <input
                            type="text"
                            value={currentPizza.tagline || ''}
                            onChange={(e) => setCurrentPizza({ ...currentPizza, tagline: e.target.value })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:border-amber-700"
                            placeholder="e.g. Authentic Neapolitan Heritage"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-stone-700">Badge Label</label>
                          <input
                            type="text"
                            value={currentPizza.badge || ''}
                            onChange={(e) => setCurrentPizza({ ...currentPizza, badge: e.target.value })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:border-amber-700"
                            placeholder="e.g. Chef's Pick"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700">Description</label>
                        <textarea
                          rows={2}
                          value={currentPizza.description || ''}
                          onChange={(e) => setCurrentPizza({ ...currentPizza, description: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:border-amber-700"
                          placeholder="Rich San Marzano tomatoes, fresh buffalo mozzarella, and aromatic basil leaves."
                        />
                      </div>

                      {/* Ingredient Specifications */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="font-semibold text-stone-700">Crust Type</label>
                          <input
                            type="text"
                            value={currentPizza.base || ''}
                            onChange={(e) => setCurrentPizza({ ...currentPizza, base: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-stone-700">Sauce</label>
                          <input
                            type="text"
                            value={currentPizza.sauce || ''}
                            onChange={(e) => setCurrentPizza({ ...currentPizza, sauce: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-stone-700">Cheese</label>
                          <input
                            type="text"
                            value={currentPizza.cheese || ''}
                            onChange={(e) => setCurrentPizza({ ...currentPizza, cheese: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700">Toppings (comma separated)</label>
                        <input
                          type="text"
                          value={veggiesInput}
                          onChange={(e) => setVeggiesInput(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white"
                          placeholder="Basil, Cherry Tomatoes, Roasted Garlic"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isVegCheckbox"
                          checked={currentPizza.isVeg || false}
                          onChange={(e) => setCurrentPizza({ ...currentPizza, isVeg: e.target.checked })}
                          className="w-4 h-4 text-amber-700 rounded border-stone-300"
                        />
                        <label htmlFor="isVegCheckbox" className="font-semibold text-stone-700 cursor-pointer">
                          Vegetarian Recipe
                        </label>
                      </div>

                      {/* Image Upload and Preview */}
                      <div className="space-y-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <label className="font-semibold text-stone-700 block">Pizza Food Image</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            disabled={isUploadingImage}
                            className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-stone-800 cursor-pointer"
                          />
                          {isUploadingImage && <span className="text-amber-700">Uploading...</span>}
                        </div>
                        <input
                          type="text"
                          value={currentPizza.image || ''}
                          onChange={(e) => setCurrentPizza({ ...currentPizza, image: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white"
                          placeholder="Or paste direct image URL (https://...)"
                        />
                        {currentPizza.image && (
                          <div className="mt-2 flex items-center gap-3">
                            <img
                              src={currentPizza.image}
                              alt="Preview"
                              className="w-20 h-20 object-cover rounded-lg border border-stone-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80';
                              }}
                            />
                            <div className="text-[11px] text-stone-500">
                              <span className="font-semibold text-stone-800 block">Image Preview</span>
                              <span>Will display prominently in customer catalog.</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                        <button
                          type="button"
                          onClick={() => setIsPizzaModalOpen(false)}
                          className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isEditingPizza ? 'Update Pizza' : 'Add to Catalog'}</span>
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* TAB 3: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <motion.div
            key="inventory"
            className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 space-y-4"
            variants={shouldReduce ? {} : tabContent}
            initial="hidden" animate="visible" exit="hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-2">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Ingredients Stock & Low-Stock Alerts
                </h3>
                <p className="text-xs text-stone-500">
                  Crust bases (5), sauces (5), cheeses, and vegetable toppings with automatic deduction on paid orders.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {inventory.map((item) => {
                const isLow = item.stock <= item.threshold;
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between ${
                      isLow ? 'bg-rose-50/70 border-rose-200' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 text-sm">{item.name}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-200/80 text-stone-700">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-stone-500 text-[11px] mt-0.5">{item.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 block">Current Stock</span>
                        <span className={`font-mono font-bold text-base ${isLow ? 'text-rose-600' : 'text-stone-900'}`}>
                          {item.stock}
                        </span>
                        <span className="text-[10px] text-stone-400 ml-1">/ min {item.threshold}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateStock(item, -5)}
                          className="w-6 h-6 rounded bg-white border border-stone-300 font-bold hover:bg-stone-100 flex items-center justify-center cursor-pointer"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleUpdateStock(item, 10)}
                          className="w-6 h-6 rounded bg-stone-900 text-white font-bold hover:bg-stone-800 flex items-center justify-center cursor-pointer"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 4: DELIVERY FLEET */}
        {activeTab === 'staff' && (
          <motion.div
            key="staff"
            className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 space-y-4"
            variants={shouldReduce ? {} : tabContent}
            initial="hidden" animate="visible" exit="hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900">Delivery Fleet & Couriers</h3>
                <p className="text-xs text-stone-500">
                  Manage active delivery couriers and their real-time order loads
                </p>
              </div>
              <motion.button
                onClick={() => setIsAddingStaff(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                whileHover={shouldReduce ? {} : { scale: 1.02 }}
                whileTap={shouldReduce ? {} : { scale: 0.96 }}
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Courier</span>
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {staff.map((s) => (
                <div key={s.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 text-sm">{s.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                      {s.activeDeliveries} Active
                    </span>
                  </div>
                  <div className="text-stone-600 space-y-0.5">
                    <div>Email: {s.email}</div>
                    <div>Phone: {s.phone}</div>
                    <div>Completed Deliveries: {s.completedDeliveries}</div>
                  </div>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {isAddingStaff && (
                <motion.form
                  onSubmit={handleCreateStaff}
                  className="p-4 rounded-xl border border-stone-300 bg-stone-50 space-y-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h4 className="font-bold text-xs text-stone-900">Register New Delivery Courier</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Courier Name"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Courier Email"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone"
                      value={newStaffPhone}
                      onChange={(e) => setNewStaffPhone(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingStaff(false)}
                      className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs"
                    >
                      Save Courier
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* TAB 5: SMTP EMAIL LOGS */}
        {activeTab === 'emails' && (
          <motion.div
            key="emails"
            className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 space-y-4"
            variants={shouldReduce ? {} : tabContent}
            initial="hidden" animate="visible" exit="hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900">Gmail SMTP Email Dispatch Records</h3>
                <p className="text-xs text-stone-500">
                  Real notifications sent through Gmail SMTP credentials (yvsns7035@gmail.com)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {emailLogs.length === 0 ? (
                <p className="text-xs text-stone-500 py-4 text-center">No emails dispatched yet.</p>
              ) : (
                emailLogs.map((log, idx) => (
                  <motion.div
                    key={log.id}
                    className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs flex items-center justify-between"
                    initial={shouldReduce ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.25 }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900">{log.subject}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-stone-200 rounded text-stone-700 uppercase">
                          {log.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500">To: {log.to}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 font-mono block">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`text-[10px] font-bold ${log.status === 'sent' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};
