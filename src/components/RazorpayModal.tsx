import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, ShieldCheck, CreditCard, AlertCircle, CheckCircle, Lock, Loader2 } from 'lucide-react';
import { backdrop, modalScale, tabContent, ease } from '../lib/animations.js';

import { api } from '../services/api.js';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  } | null;
  onPaymentSuccess: (paymentId: string, signature: string) => void;
  onPaymentFailure: (errorMessage: string) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  orderData,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const shouldReduce = useReducedMotion();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');

  const handleSimulateSuccess = async () => {
    if (!orderData) return;
    setIsProcessing(true);
    try {
      const res = await api.simulateTestPayment(orderData.orderId);
      setTimeout(() => {
        setIsProcessing(false);
        onPaymentSuccess(res.paymentId, res.signature);
      }, 800);
    } catch (err: any) {
      setIsProcessing(false);
      onPaymentFailure(err.message || 'Payment simulation failed');
    }
  };

  const handleSimulateFailure = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentFailure('Payment authorization failed: Bank decline or simulated customer abort.');
    }, 900);
  };

  return (
    <AnimatePresence>
      {isOpen && orderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs"
            variants={shouldReduce ? {} : backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl border border-stone-200/80 w-full max-w-md overflow-hidden z-10"
            variants={shouldReduce ? {} : modalScale}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header with Razorpay Branding */}
            <div className="bg-[#0c2340] text-white p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-sm tracking-tighter shadow-xs">
                  R
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-wide">Razorpay Checkout</span>
                    <span className="text-[10px] bg-amber-400 text-stone-950 font-bold px-1.5 py-0.5 rounded-xs">
                      TEST MODE
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-200">Pizza Artisan Delivery System</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="text-stone-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close Checkout"
                whileHover={shouldReduce ? {} : { rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Order Amount Banner */}
            <div className="bg-blue-50/70 px-5 py-3.5 border-b border-blue-100/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-500 font-medium block">Total Payable</span>
                <span className="font-mono tabular-nums text-xl font-bold text-stone-900">
                  ${orderData.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-stone-500 font-medium block">Order Reference</span>
                <span className="font-mono text-xs font-semibold text-stone-800 bg-white px-2 py-0.5 rounded border border-blue-200">
                  #{orderData.orderNumber}
                </span>
              </div>
            </div>

            {/* Payment Content */}
            <div className="p-5 space-y-4">
              {/* Method Selection with Animated Pill */}
              <div className="flex rounded-xl p-1 bg-stone-100 text-xs font-semibold text-stone-600 relative">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`flex-1 py-1.5 rounded-lg transition-colors relative z-10 text-center cursor-pointer ${
                    selectedMethod === 'card' ? 'text-stone-950 font-bold' : 'hover:text-stone-900'
                  }`}
                >
                  {selectedMethod === 'card' && (
                    <motion.div
                      layoutId="razorpay-tab-pill"
                      className="absolute inset-0 bg-white rounded-lg shadow-2xs -z-10"
                      transition={{ duration: 0.25, ease: ease.out }}
                    />
                  )}
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  className={`flex-1 py-1.5 rounded-lg transition-colors relative z-10 text-center cursor-pointer ${
                    selectedMethod === 'upi' ? 'text-stone-950 font-bold' : 'hover:text-stone-900'
                  }`}
                >
                  {selectedMethod === 'upi' && (
                    <motion.div
                      layoutId="razorpay-tab-pill"
                      className="absolute inset-0 bg-white rounded-lg shadow-2xs -z-10"
                      transition={{ duration: 0.25, ease: ease.out }}
                    />
                  )}
                  UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('netbanking')}
                  className={`flex-1 py-1.5 rounded-lg transition-colors relative z-10 text-center cursor-pointer ${
                    selectedMethod === 'netbanking' ? 'text-stone-950 font-bold' : 'hover:text-stone-900'
                  }`}
                >
                  {selectedMethod === 'netbanking' && (
                    <motion.div
                      layoutId="razorpay-tab-pill"
                      className="absolute inset-0 bg-white rounded-lg shadow-2xs -z-10"
                      transition={{ duration: 0.25, ease: ease.out }}
                    />
                  )}
                  Netbanking
                </button>
              </div>

              <AnimatePresence mode="wait">
                {selectedMethod === 'card' && (
                  <motion.div
                    key="card-method"
                    className="space-y-3"
                    variants={shouldReduce ? {} : tabContent}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                        Card Number (Test Cards Pre-Filled)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono border border-stone-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                        />
                        <CreditCard className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 block mb-1">Expiry</label>
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono border border-stone-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 block mb-1">CVV</label>
                        <input
                          type="password"
                          value={cvv}
                          maxLength={4}
                          onChange={(e) => setCvv(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono border border-stone-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {selectedMethod === 'upi' && (
                  <motion.div
                    key="upi-method"
                    className="text-center py-5 bg-stone-50 rounded-xl border border-dashed border-stone-200"
                    variants={shouldReduce ? {} : tabContent}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <span className="text-xs text-stone-600 font-medium block">Test UPI ID</span>
                    <span className="text-sm font-mono text-blue-700 font-bold block mt-0.5">success@razorpay</span>
                    <p className="text-[11px] text-stone-400 mt-2">Instant authorization in sandbox mode</p>
                  </motion.div>
                )}

                {selectedMethod === 'netbanking' && (
                  <motion.div
                    key="nb-method"
                    className="text-center py-5 bg-stone-50 rounded-xl border border-dashed border-stone-200"
                    variants={shouldReduce ? {} : tabContent}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <span className="text-xs text-stone-600 font-medium block">All Major Test Banks Supported</span>
                    <p className="text-[11px] text-stone-400 mt-1">HDFC, ICICI, SBI, Axis Test Portals</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-1.5 text-[11px] text-stone-500 justify-center">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit SSL encrypted · Razorpay Sandbox Verification</span>
              </div>

              {/* Test Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <motion.button
                  onClick={handleSimulateSuccess}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  whileHover={shouldReduce ? {} : { scale: 1.01 }}
                  whileTap={shouldReduce ? {} : { scale: 0.98 }}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying signature on server...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Pay & Confirm Order (${orderData.totalAmount.toFixed(2)})</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={handleSimulateFailure}
                  disabled={isProcessing}
                  className="w-full py-1.5 px-3 bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 border border-stone-200 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  whileHover={shouldReduce ? {} : { scale: 1.01 }}
                  whileTap={shouldReduce ? {} : { scale: 0.98 }}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Simulate Payment Decline / Failure Test</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
