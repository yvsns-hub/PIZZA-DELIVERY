import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  CheckCircle2, Clock, Bike, PackageCheck, ChefHat,
  MapPin, ExternalLink, RefreshCw, AlertCircle,
} from 'lucide-react';
import { Order } from '../types.js';
import { api } from '../services/api.js';
import { fadeUp, staggerContainer, notificationBanner, ease } from '../lib/animations.js';

interface OrderTrackingViewProps {
  initialOrderId?: string;
  onBackToMenu: () => void;
}

const ORDER_STEPS = [
  { key: 'ORDER_CONFIRMED',    label: 'Order Confirmed',    icon: CheckCircle2, desc: 'Payment verified & order queued' },
  { key: 'PREPARING',          label: 'Kitchen Preparing',  icon: ChefHat,      desc: 'Dough stretched & baking in hearth' },
  { key: 'READY_FOR_PICKUP',   label: 'Ready for Pickup',   icon: PackageCheck, desc: 'Insulated hot packaging sealed' },
  { key: 'ASSIGNED_TO_DELIVERY', label: 'Rider Assigned',   icon: Bike,         desc: 'Assigned to delivery courier' },
  { key: 'OUT_FOR_DELIVERY',   label: 'Out for Delivery',   icon: Bike,         desc: 'Courier en route with thermal bag' },
  { key: 'DELIVERED',          label: 'Delivered',          icon: CheckCircle2, desc: 'Handed over at doorstep' },
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ initialOrderId, onBackToMenu }) => {
  const [searchQuery, setSearchQuery] = useState(initialOrderId || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shouldReduce = useReducedMotion();

  const fetchOrder = async (idOrNumber: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getOrder(idOrNumber);
      setOrder(res.order);
      setSearchQuery(res.order.orderNumber);
    } catch (err: any) {
      setError(`Could not find order "${idOrNumber}". Please check the order number or choose from your recent orders below.`);
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await api.getOrders();
        if (!isMounted) return;
        const orders = res.orders || [];
        setUserOrders(orders);
        if (initialOrderId) {
          fetchOrder(initialOrderId);
        } else if (orders.length > 0) {
          fetchOrder(orders[0].id || orders[0].orderNumber);
        }
      } catch (err) {
        if (!isMounted) return;
        if (initialOrderId) {
          fetchOrder(initialOrderId);
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [initialOrderId]);

  const currentStepIndex = order
    ? ORDER_STEPS.findIndex((s) => s.key === order.orderStatus)
    : 0;

  return (
    <div className="py-12 bg-stone-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header & Search */}
        <motion.div
          className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col gap-4"
          initial={shouldReduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: ease.out }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">Live Order Tracker</h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Real-time pizza baking and delivery progress with GPS mapping.
              </p>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) fetchOrder(searchQuery.trim()); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. PZA-1001"
                className="px-3 py-2 text-xs font-mono border border-stone-200 rounded-md focus:outline-none focus:border-amber-700 bg-stone-50 w-36 sm:w-44 transition-colors"
              />
              <motion.button
                type="submit"
                disabled={isLoading || !searchQuery.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 disabled:opacity-50 rounded-md transition-colors"
                whileHover={shouldReduce ? {} : { scale: 1.03 }}
                whileTap={shouldReduce ? {} : { scale: 0.96 }}
              >
                Track
              </motion.button>
              <motion.button
                type="button"
                onClick={() => (order ? fetchOrder(order.id) : (searchQuery.trim() && fetchOrder(searchQuery.trim())))}
                disabled={isLoading}
                className="p-2 text-stone-500 hover:text-stone-800 border border-stone-200 rounded-md transition-colors"
                title="Refresh status"
                whileHover={shouldReduce ? {} : { scale: 1.06 }}
                whileTap={shouldReduce ? {} : { scale: 0.93 }}
              >
                <motion.span
                  animate={isLoading && !shouldReduce ? { rotate: 360 } : { rotate: 0 }}
                  transition={isLoading ? { duration: 0.9, repeat: Infinity, ease: 'linear' } : {}}
                  style={{ display: 'block' }}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.span>
              </motion.button>
            </form>
          </div>

          {/* Quick select your own orders if available */}
          {userOrders.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-stone-100">
              <span className="text-[11px] font-semibold text-stone-500">Your Placed Orders:</span>
              {userOrders.map((uo) => {
                const isSelected = order?.id === uo.id || order?.orderNumber === uo.orderNumber;
                return (
                  <button
                    key={uo.id}
                    type="button"
                    onClick={() => fetchOrder(uo.id || uo.orderNumber)}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-amber-800 text-white border-amber-800 font-bold'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    #{uo.orderNumber} ({uo.orderStatus.replace(/_/g, ' ')})
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2"
              variants={shouldReduce ? {} : notificationBanner}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {order && (
            <motion.div
              key={order.orderNumber}
              className="space-y-6"
              initial={shouldReduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: ease.out }}
            >

              {/* Status Progress Timeline */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-stone-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold font-mono text-stone-900">
                        Order #{order.orderNumber}
                      </span>
                      <motion.span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200"
                        initial={shouldReduce ? false : { scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        PAID VIA RAZORPAY
                      </motion.span>
                    </div>
                    <span className="text-xs text-stone-500">
                      Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-500 block">Current Status</span>
                    <motion.span
                      key={order.orderStatus}
                      className="text-sm font-bold text-amber-800"
                      initial={shouldReduce ? false : { opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {ORDER_STEPS.find((s) => s.key === order.orderStatus)?.label || order.orderStatus}
                    </motion.span>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="relative">
                  {/* Track background */}
                  <div className="hidden sm:block absolute top-5 left-0 right-0 h-0.5 bg-stone-200 z-0" />
                  {/* Active track — animated width */}
                  <motion.div
                    className="step-connector hidden sm:block absolute top-5 left-0 h-0.5 bg-amber-700 z-0"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.max(0, (currentStepIndex / (ORDER_STEPS.length - 1)) * 100)}%`,
                    }}
                    transition={{ duration: 0.8, ease: ease.out }}
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                    {ORDER_STEPS.map((step, idx) => {
                      const isDone = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      const StepIcon = step.icon;

                      return (
                        <motion.div
                          key={step.key}
                          className="flex flex-col items-center text-center"
                          initial={shouldReduce ? false : { opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.08, duration: 0.4 }}
                        >
                          <div className="relative">
                            {/* Pulse ring for active step */}
                            {isCurrent && !shouldReduce && (
                              <motion.div
                                className="absolute inset-0 rounded-full bg-amber-400"
                                animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                              />
                            )}
                            <motion.div
                              className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                isCurrent
                                  ? 'bg-amber-800 text-white border-amber-800 step-icon-active'
                                  : isDone
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-white text-stone-400 border-stone-200'
                              }`}
                              initial={shouldReduce ? false : isDone ? { scale: 0.5, opacity: 0 } : undefined}
                              animate={isDone ? { scale: 1, opacity: 1 } : undefined}
                              transition={
                                isDone
                                  ? { type: 'spring', stiffness: 400, damping: 20, delay: idx * 0.1 }
                                  : undefined
                              }
                            >
                              <StepIcon className="w-4 h-4" />
                            </motion.div>
                          </div>

                          <motion.span
                            className={`mt-2 text-xs font-semibold leading-tight ${
                              isCurrent ? 'text-amber-900 font-bold' : isDone ? 'text-stone-900' : 'text-stone-400'
                            }`}
                            animate={
                              isCurrent && !shouldReduce
                                ? { opacity: [1, 0.7, 1] }
                                : { opacity: 1 }
                            }
                            transition={
                              isCurrent ? { duration: 2, repeat: Infinity } : {}
                            }
                          >
                            {step.label}
                          </motion.span>
                          <span className="hidden sm:block mt-1 text-[10px] text-stone-400 leading-tight">
                            {step.desc}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Courier & Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Delivery Rider Card */}
                <motion.div
                  className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3"
                  initial={shouldReduce ? false : { opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.15, ease: ease.out }}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase tracking-wide">
                    <Bike className="w-4 h-4 text-amber-800" />
                    <span>Assigned Courier</span>
                  </div>
                  <AnimatePresence mode="wait">
                    {order.deliveryStaffName ? (
                      <motion.div
                        key="rider"
                        className="space-y-2"
                        initial={shouldReduce ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-stone-900">{order.deliveryStaffName}</span>
                          <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Active Rider
                          </span>
                        </div>
                        <p className="text-xs text-stone-600">
                          Contact: <span className="font-mono text-stone-900 font-semibold">{order.deliveryStaffPhone}</span>
                        </p>
                        <p className="text-[11px] text-stone-500">
                          Rider is carrying your insulated thermal bag to preserve hot, crispy crust.
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="no-rider"
                        className="py-4 text-center text-xs text-stone-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        A rider will be assigned once baking completes.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Destination Address */}
                <motion.div
                  className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3"
                  initial={shouldReduce ? false : { opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: ease.out }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase tracking-wide">
                      <MapPin className="w-4 h-4 text-amber-800" />
                      <span>Delivery Address</span>
                    </div>
                    {order.deliveryAddress.mapUrl && (
                      <a
                        href={order.deliveryAddress.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 transition-colors"
                      >
                        <span>Open in Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-stone-600">
                    <p className="font-semibold text-stone-900">{order.customerName}</p>
                    <p>{order.deliveryAddress.street}</p>
                    <p>{order.deliveryAddress.city}, {order.deliveryAddress.pincode}</p>
                    <p className="font-mono text-stone-500">{order.customerPhone}</p>
                  </div>
                </motion.div>
              </div>

              {/* Order Items */}
              <motion.div
                className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4"
                initial={shouldReduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25, ease: ease.out }}
              >
                <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
                  Order Items Summary
                </h3>
                <div className="divide-y divide-stone-100">
                  {order.items.map((item, i) => (
                    <motion.div
                      key={i}
                      className="py-3 flex items-start justify-between gap-4"
                      initial={shouldReduce ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 + 0.3 }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900">{item.name}</span>
                          <span className="text-xs font-mono text-stone-500">x {item.quantity}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">{item.details}</p>
                      </div>
                      <span className="font-mono tabular-nums text-xs font-semibold text-stone-900">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                  <span>Subtotal: ${order.subtotal.toFixed(2)} · Tax: ${order.tax.toFixed(2)} · Delivery: ${order.deliveryFee.toFixed(2)}</span>
                  <span className="text-sm font-bold font-mono text-amber-800">Total: ${order.totalAmount.toFixed(2)}</span>
                </div>
              </motion.div>

              {/* Activity Log */}
              <motion.div
                className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-3"
                initial={shouldReduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35, ease: ease.out }}
              >
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  Lifecycle Activity Log
                </h3>
                <div className="space-y-2 text-xs">
                  {order.statusHistory.map((log, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-3 text-stone-600 row-enter"
                      initial={shouldReduce ? false : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.07 + 0.4 }}
                    >
                      <span className="font-mono tabular-nums text-[11px] text-stone-400 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div>
                        <span className="font-semibold text-stone-800">{log.status}</span>
                        {log.note && <span className="text-stone-500"> — {log.note}</span>}
                        {log.updatedBy && <span className="text-[10px] text-stone-400"> ({log.updatedBy})</span>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state when no order loaded and no error */}
        {!order && !isLoading && !error && (
          <motion.div
            className="bg-white p-12 rounded-xl border border-stone-200 text-center max-w-md mx-auto space-y-4 shadow-xs"
            initial={shouldReduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-14 h-14 mx-auto bg-amber-50 rounded-full flex items-center justify-center text-amber-800 border border-amber-100">
              <PackageCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-900">No Active Order Selected</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {userOrders.length === 0
                  ? "You haven't placed any orders yet. Select a pizza from our artisanal menu or build your own to watch its live preparation and delivery!"
                  : "Enter an order number above or select from your recent orders to track live baking and rider progress."}
              </p>
            </div>
            {userOrders.length === 0 && (
              <motion.button
                type="button"
                onClick={onBackToMenu}
                className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors"
                whileHover={shouldReduce ? {} : { scale: 1.02 }}
                whileTap={shouldReduce ? {} : { scale: 0.98 }}
              >
                Browse Menu & Place Order
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
