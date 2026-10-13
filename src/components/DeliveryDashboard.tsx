import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Bike,
  MapPin,
  Phone,
  ExternalLink,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
  Navigation,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Order } from '../types.js';
import { fadeUp, staggerContainer, tabContent, notificationBanner, ease } from '../lib/animations.js';

export const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth();
  const shouldReduce = useReducedMotion();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedTab, setSelectedTab] = useState<'active' | 'history'>('active');

  const loadAssignedOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.getOrders({
        role: 'delivery',
        deliveryStaffId: user?.id,
      });
      setOrders(res.orders || []);
    } catch (err: any) {
      console.error('Failed to load courier orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignedOrders();
  }, [user]);

  const handleUpdateStatus = async (orderId: string, status: string, note: string) => {
    setUpdatingOrderId(orderId);
    try {
      await api.updateOrderStatus(orderId, status, note, user?.name || 'Courier');
      setActionFeedback({
        type: 'success',
        message: `Order successfully updated to ${status.replace(/_/g, ' ')}!`,
      });
      setTimeout(() => setActionFeedback(null), 3000);
      await loadAssignedOrders();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to update order status' });
      setTimeout(() => setActionFeedback(null), 3500);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const activeOrders = orders.filter((o) =>
    ['ASSIGNED_TO_DELIVERY', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP'].includes(o.orderStatus)
  );
  const historyOrders = orders.filter((o) => o.orderStatus === 'DELIVERED');

  return (
    <div className="py-8 bg-stone-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between pb-4 border-b border-stone-200"
          variants={shouldReduce ? {} : fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="p-2.5 bg-amber-800 text-white rounded-xl shadow-xs"
              whileHover={shouldReduce ? {} : { rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Bike className="w-5 h-5" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
                Courier Delivery Hub
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live Dispatch
                </span>
              </h1>
              <p className="text-xs text-stone-500">
                Logged in as <span className="font-semibold text-stone-900">{user?.name}</span> ({user?.phone})
              </p>
            </div>
          </div>

          <motion.button
            onClick={loadAssignedOrders}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
            whileHover={shouldReduce ? {} : { scale: 1.04 }}
            whileTap={shouldReduce ? {} : { scale: 0.95 }}
          >
            <motion.span
              animate={isLoading && !shouldReduce ? { rotate: 360 } : { rotate: 0 }}
              transition={isLoading ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : {}}
              style={{ display: 'inline-block' }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </motion.span>
            <span>Refresh Run</span>
          </motion.button>
        </motion.div>

        {/* Action feedback notification banner */}
        <AnimatePresence>
          {actionFeedback && (
            <motion.div
              className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                actionFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
              variants={shouldReduce ? {} : notificationBanner}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {actionFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{actionFeedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 bg-stone-200/60 rounded-xl w-fit border border-stone-200/50">
          <button
            onClick={() => setSelectedTab('active')}
            className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-colors z-10 cursor-pointer ${
              selectedTab === 'active' ? 'text-white' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            {selectedTab === 'active' && (
              <motion.div
                layoutId="courier-active-pill"
                className="absolute inset-0 bg-amber-800 rounded-lg -z-10 shadow-xs"
                transition={{ duration: 0.25, ease: ease.out }}
              />
            )}
            Active Deliveries ({activeOrders.length})
          </button>
          <button
            onClick={() => setSelectedTab('history')}
            className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-colors z-10 cursor-pointer ${
              selectedTab === 'history' ? 'text-white' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            {selectedTab === 'history' && (
              <motion.div
                layoutId="courier-active-pill"
                className="absolute inset-0 bg-amber-800 rounded-lg -z-10 shadow-xs"
                transition={{ duration: 0.25, ease: ease.out }}
              />
            )}
            Completed Runs ({historyOrders.length})
          </button>
        </div>

        {/* List of orders with Layout Animation */}
        <AnimatePresence mode="wait">
          {selectedTab === 'active' ? (
            <motion.div
              key="active-tab"
              variants={shouldReduce ? {} : tabContent}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-4"
            >
              {activeOrders.length === 0 ? (
                <motion.div
                  className="bg-white p-12 text-center rounded-2xl border border-stone-200/80 shadow-xs space-y-3"
                  initial={shouldReduce ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: ease.out }}
                >
                  <motion.div
                    animate={shouldReduce ? {} : { y: [0, -4, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="inline-block"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  </motion.div>
                  <h3 className="text-base font-bold text-stone-900">All Caught Up!</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    No pending deliveries right now. Check back when the wood-fired kitchen finishes baking!
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {activeOrders.map((ord, idx) => (
                      <motion.div
                        key={ord.id}
                        layout
                        className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-5 sm:p-6 space-y-4 transition-shadow hover:shadow-md"
                        initial={shouldReduce ? false : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={
                          shouldReduce
                            ? { opacity: 0 }
                            : { opacity: 0, scale: 0.96, height: 0, overflow: 'hidden', padding: 0 }
                        }
                        transition={{
                          delay: idx * 0.05,
                          duration: 0.35,
                          ease: ease.out,
                          layout: { type: 'spring', stiffness: 450, damping: 30 },
                        }}
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-bold text-base text-stone-900">
                              #{ord.orderNumber}
                            </span>
                            <motion.span
                              key={ord.orderStatus}
                              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 uppercase tracking-wide"
                              initial={shouldReduce ? false : { scale: 0.85 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            >
                              {ord.orderStatus.replace(/_/g, ' ')}
                            </motion.span>
                          </div>
                          <span className="font-mono tabular-nums text-sm font-bold text-stone-900">
                            ${ord.totalAmount.toFixed(2)}
                          </span>
                        </div>

                        {/* Customer & Address Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600">
                          <div className="p-3 bg-stone-50/70 rounded-xl space-y-1 border border-stone-100">
                            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Customer</span>
                            <p className="font-semibold text-stone-900 text-sm">{ord.customerName}</p>
                            <motion.a
                              href={`tel:${ord.customerPhone}`}
                              className="inline-flex items-center gap-1.5 text-amber-800 hover:text-amber-900 font-mono font-medium pt-0.5"
                              whileHover={shouldReduce ? {} : { x: 2 }}
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{ord.customerPhone}</span>
                            </motion.a>
                          </div>

                          <div className="p-3 bg-stone-50/70 rounded-xl space-y-1 border border-stone-100">
                            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Delivery Address</span>
                            <p className="text-stone-800 font-medium">{ord.deliveryAddress.street}</p>
                            <p className="text-stone-500 text-[11px]">{ord.deliveryAddress.city}, {ord.deliveryAddress.pincode}</p>
                            {ord.deliveryAddress.mapUrl && (
                              <motion.a
                                href={ord.deliveryAddress.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 hover:underline font-semibold text-[11px] pt-1"
                                whileHover={shouldReduce ? {} : { x: 2 }}
                              >
                                <MapPin className="w-3 h-3 text-amber-700" />
                                <span>Open in Google Maps Navigation</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </motion.a>
                            )}
                          </div>
                        </div>

                        {/* Items brief */}
                        <div className="pt-2 border-t border-stone-100 text-xs text-stone-600">
                          <span className="text-[11px] text-stone-400 font-semibold block mb-1">Package Contents:</span>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                            {ord.items.map((it, itemIdx) => (
                              <li key={itemIdx}>
                                <span className="font-semibold text-stone-800">{it.name}</span> x {it.quantity}{' '}
                                <span className="text-stone-500">({it.details})</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Status Action Buttons with Responsive Feedback */}
                        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2.5">
                          {ord.orderStatus === 'ASSIGNED_TO_DELIVERY' || ord.orderStatus === 'READY_FOR_PICKUP' ? (
                            <motion.button
                              onClick={() =>
                                handleUpdateStatus(ord.id, 'OUT_FOR_DELIVERY', 'Picked up from oven hearth & riding to address')
                              }
                              disabled={updatingOrderId === ord.id}
                              className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                              whileHover={shouldReduce || updatingOrderId === ord.id ? {} : { scale: 1.02 }}
                              whileTap={shouldReduce || updatingOrderId === ord.id ? {} : { scale: 0.96 }}
                            >
                              {updatingOrderId === ord.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Starting Ride...</span>
                                </>
                              ) : (
                                <>
                                  <Bike className="w-4 h-4" />
                                  <span>Picked Up & Start Ride (Out for Delivery)</span>
                                </>
                              )}
                            </motion.button>
                          ) : null}

                          {ord.orderStatus === 'OUT_FOR_DELIVERY' ? (
                            <motion.button
                              onClick={() =>
                                handleUpdateStatus(ord.id, 'DELIVERED', 'Delivered hot directly to customer doorstep')
                              }
                              disabled={updatingOrderId === ord.id}
                              className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                              whileHover={shouldReduce || updatingOrderId === ord.id ? {} : { scale: 1.02 }}
                              whileTap={shouldReduce || updatingOrderId === ord.id ? {} : { scale: 0.96 }}
                            >
                              {updatingOrderId === ord.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Confirming Delivery...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Confirm Handover (Delivered)</span>
                                </>
                              )}
                            </motion.button>
                          ) : null}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="history-tab"
              variants={shouldReduce ? {} : tabContent}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-3"
            >
              {historyOrders.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-stone-200 text-stone-500 text-xs">
                  No completed delivery history recorded yet.
                </div>
              ) : (
                historyOrders.map((ord, idx) => (
                  <motion.div
                    key={ord.id}
                    layout="position"
                    className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs text-xs flex items-center justify-between"
                    initial={shouldReduce ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.28, ease: ease.out }}
                  >
                    <div>
                      <span className="font-mono font-bold text-stone-900 block text-sm">#{ord.orderNumber}</span>
                      <span className="text-stone-500">{ord.customerName} · {ord.deliveryAddress.street}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-700 font-bold block text-xs">DELIVERED</span>
                      <span className="font-mono text-stone-400 text-[11px]">
                        {new Date(ord.updatedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
