import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Navigation,
  ShoppingBag,
  ArrowRight,
  AlertTriangle,
  CreditCard,
  Banknote,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { RazorpayModal } from './RazorpayModal.js';
import { Order } from '../types.js';
import { slideInRight, backdrop, listItem, ease } from '../lib/animations.js';

interface CartDrawerProps {
  onOrderCompleted: (order: Order) => void;
  onOpenAuth?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOrderCompleted, onOpenAuth }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    tax,
    deliveryFee,
    totalAmount,
    deliveryAddress,
    setDeliveryAddress,
  } = useCart();

  const { user } = useAuth();
  const shouldReduce = useReducedMotion();

  // Drawer flow step: 'cart' | 'checkout'
  const [drawerStep, setDrawerStep] = useState<'cart' | 'checkout'>('cart');

  // Checkout Delivery Details
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(deliveryAddress.street || '');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState(deliveryAddress.city || 'Springfield');
  const [stateName, setStateName] = useState('OR');
  const [pincode, setPincode] = useState(deliveryAddress.pincode || '97477');
  const [instructions, setInstructions] = useState('');

  // Geolocation
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat?: number; lng?: number }>({});
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  // Payment Method: 'RAZORPAY' | 'COD'
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');

  // Processing state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Razorpay Test State
  const [razorpayOrderData, setRazorpayOrderData] = useState<any | null>(null);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);

  // Sync recipient with user if available
  React.useEffect(() => {
    if (user) {
      if (!recipientName) setRecipientName(user.name);
      if (!recipientPhone && user.phone) setRecipientPhone(user.phone);
    }
  }, [user]);

  // Request browser geolocation with clear user explanation
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported by your browser. Please enter your address manually.');
      return;
    }

    setGpsLoading(true);
    setLocationMessage('Requesting GPS location for accurate courier dispatch...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGpsCoordinates({ lat, lng });
        setLocationMessage(`GPS coordinates acquired (${lat.toFixed(4)}, ${lng.toFixed(4)}). Courier dispatch route optimized.`);
      },
      (err) => {
        setGpsLoading(false);
        // Fallback default coordinates without blocking checkout
        setGpsCoordinates({ lat: 44.0462, lng: -123.0220 });
        setLocationMessage('Location permission denied or unavailable. You can enter your address details manually.');
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  // Place Order / Submit Checkout
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('You must be signed in to place an order. Please log in to proceed.');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your bag is empty.');
      return;
    }
    if (!recipientName || !recipientPhone || !street || !city || !pincode) {
      setErrorMessage('Please complete all required delivery address fields.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const fullStreet = [street, locality].filter(Boolean).join(', ');
      const orderPayload = {
        items,
        customerId: user.id,
        customerName: recipientName.trim(),
        customerEmail: user.email,
        customerPhone: recipientPhone.trim(),
        paymentMethod,
        deliveryAddress: {
          recipientName: recipientName.trim(),
          street: fullStreet,
          locality,
          city: city.trim(),
          state: stateName.trim(),
          pincode: pincode.trim(),
          instructions: instructions.trim(),
          lat: gpsCoordinates.lat,
          lng: gpsCoordinates.lng,
        },
      };

      const res = await api.createOrder(orderPayload);

      // Save delivery address to context
      setDeliveryAddress({ street: fullStreet, city, pincode });

      if (paymentMethod === 'COD' || res.isCod) {
        // Cash on delivery: complete immediately
        clearCart();
        setIsCartOpen(false);
        setDrawerStep('cart');
        onOrderCompleted(res.order);
      } else {
        // Razorpay Test Online Payment: open modal
        setRazorpayOrderData({
          orderId: res.orderId,
          orderNumber: res.orderNumber,
          totalAmount: res.totalAmount,
          customerName: recipientName,
          customerEmail: user.email,
          customerPhone: recipientPhone,
        });
        setIsRazorpayOpen(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to create order. Please check ingredient stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string, signature: string) => {
    if (!razorpayOrderData) return;
    try {
      const res = await api.verifyPayment(razorpayOrderData.orderId, paymentId, signature);
      setIsRazorpayOpen(false);
      clearCart();
      setIsCartOpen(false);
      setDrawerStep('cart');
      onOrderCompleted(res.order);
    } catch (err: any) {
      setErrorMessage('Payment verification error: ' + err.message);
    }
  };

  const handlePaymentFailure = (errorMsg: string) => {
    setIsRazorpayOpen(false);
    setErrorMessage('Payment cancelled or failed: ' + errorMsg);
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs"
              variants={backdrop}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setIsCartOpen(false)}
            />

            {/* Slide-Over Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                className="w-screen max-w-md bg-white border-l border-stone-200 shadow-2xl flex flex-col justify-between"
                variants={slideInRight}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {/* ── Top Header ────────────────────────────────────────────── */}
                <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
                  <div className="flex items-center gap-2.5">
                    {drawerStep === 'checkout' && (
                      <button
                        onClick={() => {
                          setDrawerStep('cart');
                          setErrorMessage(null);
                        }}
                        className="p-1 rounded-lg text-stone-600 hover:text-stone-950 hover:bg-stone-200 transition-colors cursor-pointer mr-1"
                        title="Back to Bag"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}
                    <ShoppingBag className="w-5 h-5 text-amber-800" />
                    <div>
                      <h2 className="text-base font-bold font-display text-stone-900">
                        {drawerStep === 'checkout' ? 'Order Checkout & Delivery' : 'Your Shopping Bag'}
                      </h2>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {drawerStep === 'checkout' ? 'Step 2: Address & Payment' : `${items.length} artisan item${items.length === 1 ? '' : 's'}`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setDrawerStep('cart');
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
                    aria-label="Close cart"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Feedback Alerts */}
                {errorMessage && (
                  <div className="mx-5 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{errorMessage}</span>
                  </div>
                )}

                {/* ── STEP 1: BAG ITEMS LISTING ─────────────────────────────── */}
                {drawerStep === 'cart' && (
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {items.length === 0 ? (
                      <div className="py-20 text-center space-y-3">
                        <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
                        <p className="text-base font-bold text-stone-900">Your Bag is Empty</p>
                        <p className="text-xs text-stone-500 max-w-xs mx-auto">
                          Add our chef specialty pizzas or build your custom pie to begin your wood-fired feast.
                        </p>
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="px-4 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors cursor-pointer"
                        >
                          Explore Menu
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {items.map((item) => (
                          <motion.div
                            key={item.cartId}
                            variants={listItem}
                            className="bg-stone-50/70 p-4 rounded-xl border border-stone-200 flex flex-col gap-2.5 relative"
                          >
                            <div className="flex items-start justify-between pr-7">
                              <div>
                                <h3 className="text-xs font-bold text-stone-900">{item.name}</h3>
                                {item.details && (
                                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-snug">
                                    {item.details}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs font-mono font-bold text-stone-900">
                                ${(item.unitPrice * item.quantity).toFixed(2)}
                              </span>
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={() => removeFromCart(item.cartId)}
                              className="absolute top-3.5 right-3.5 p-1 text-stone-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Quantity controls */}
                            <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                              <span className="text-[11px] text-stone-500 font-mono">
                                ${item.unitPrice.toFixed(2)} each
                              </span>

                              <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                  className="p-1 px-2 text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 font-mono text-xs font-bold text-stone-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                  className="p-1 px-2 text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 2: CHECKOUT (ADDRESS & PAYMENT) ─────────────────── */}
                {drawerStep === 'checkout' && (
                  <form onSubmit={handleConfirmOrder} id="checkout-form" className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Recipient Details */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                        1. Recipient Contact
                      </span>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="Recipient Name"
                            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">Phone Number *</label>
                          <input
                            type="tel"
                            required
                            value={recipientPhone}
                            onChange={(e) => setRecipientPhone(e.target.value)}
                            placeholder="+1 555-012-3456"
                            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-3 pt-2 border-t border-stone-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                          2. Delivery Location
                        </span>

                        {/* Use My Current Location Action */}
                        <button
                          type="button"
                          onClick={handleRequestLocation}
                          disabled={gpsLoading}
                          className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Navigation className="w-3 h-3 text-amber-700" />
                          <span>{gpsLoading ? 'Detecting...' : 'Use My GPS Location'}</span>
                        </button>
                      </div>

                      {locationMessage && (
                        <p className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200 leading-snug">
                          {locationMessage}
                        </p>
                      )}

                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            House / Flat &amp; Street Address *
                          </label>
                          <input
                            type="text"
                            required
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="742 Evergreen Terrace, Apt 4B"
                            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            Area / Locality / Landmark
                          </label>
                          <input
                            type="text"
                            value={locality}
                            onChange={(e) => setLocality(e.target.value)}
                            placeholder="Near North Central Park"
                            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-600 mb-1">City *</label>
                            <input
                              type="text"
                              required
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="City"
                              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-600 mb-1">State</label>
                            <input
                              type="text"
                              value={stateName}
                              onChange={(e) => setStateName(e.target.value)}
                              placeholder="State"
                              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-600 mb-1">Postal Code *</label>
                            <input
                              type="text"
                              required
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value)}
                              placeholder="97477"
                              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            Delivery Instructions (Optional)
                          </label>
                          <input
                            type="text"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Leave at doorstep / Ring bell twice"
                            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-3 pt-2 border-t border-stone-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                        3. Payment Method
                      </span>

                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Razorpay Test Mode */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('RAZORPAY')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            paymentMethod === 'RAZORPAY'
                              ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-600/30'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <CreditCard className="w-4 h-4 text-amber-800" />
                            <span className="text-xs font-bold text-stone-900">Razorpay</span>
                          </div>
                          <span className="text-[11px] text-stone-500 block leading-snug">
                            Cards, UPI, NetBanking (Test Mode)
                          </span>
                        </button>

                        {/* Cash on Delivery */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('COD')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            paymentMethod === 'COD'
                              ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-600/30'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Banknote className="w-4 h-4 text-emerald-800" />
                            <span className="text-xs font-bold text-stone-900">Cash on Delivery</span>
                          </div>
                          <span className="text-[11px] text-stone-500 block leading-snug">
                            Pay with cash upon hot doorstep delivery
                          </span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* ── Bottom Summary & Actions (Directly Inside Drawer) ─────── */}
                {items.length > 0 && (
                  <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3 shrink-0">
                    {/* Price Breakdown */}
                    <div className="space-y-1.5 text-xs text-stone-600">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-mono tabular-nums text-stone-900">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sales Tax (8%)</span>
                        <span className="font-mono tabular-nums text-stone-900">${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hearth Delivery Fee</span>
                        <span className="font-mono tabular-nums text-stone-900">
                          {deliveryFee === 0 ? (
                            <span className="text-emerald-700 font-semibold">FREE</span>
                          ) : (
                            `$${deliveryFee.toFixed(2)}`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-stone-950 pt-2 border-t border-stone-200">
                        <span>Final Order Total</span>
                        <span className="font-mono tabular-nums text-base text-amber-900">
                          ${totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Step Actions: Place Order or Proceed to Checkout */}
                    {drawerStep === 'cart' ? (
                      <motion.button
                        onClick={() => {
                          setDrawerStep('checkout');
                          setErrorMessage(null);
                        }}
                        className="btn-amber-glow w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-amber-800 hover:bg-amber-900 transition-all shadow-md shadow-amber-900/20 flex items-center justify-center gap-2 cursor-pointer"
                        whileHover={shouldReduce ? {} : { scale: 1.02 }}
                        whileTap={shouldReduce ? {} : { scale: 0.97 }}
                      >
                        <span>Proceed to Checkout</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <motion.button
                        type="submit"
                        form="checkout-form"
                        disabled={isSubmitting}
                        className="btn-amber-glow w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-amber-800 hover:bg-amber-900 transition-all shadow-md shadow-amber-900/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        whileHover={shouldReduce ? {} : { scale: 1.02 }}
                        whileTap={shouldReduce ? {} : { scale: 0.97 }}
                      >
                        {isSubmitting ? (
                          <span>Processing Order...</span>
                        ) : paymentMethod === 'COD' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirm &amp; Place COD Order (${totalAmount.toFixed(2)})</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>Proceed to Razorpay Payment (${totalAmount.toFixed(2)})</span>
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Razorpay Test Modal */}
      {razorpayOrderData && (
        <RazorpayModal
          isOpen={isRazorpayOpen}
          orderData={razorpayOrderData}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
          onClose={() => setIsRazorpayOpen(false)}
        />
      )}
    </>
  );
};
