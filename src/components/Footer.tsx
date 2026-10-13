import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Flame, ShieldCheck, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { fadeUp } from '../lib/animations.js';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenDelivery: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenDelivery }) => {
  const shouldReduce = useReducedMotion();

  return (
    <footer className="bg-stone-950 text-stone-400 text-xs border-t border-stone-800/80 relative overflow-hidden">
      {/* Subtle top glow line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-stone-800/80"
          variants={shouldReduce ? {} : fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {/* Brand Info */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <motion.div
                animate={shouldReduce ? {} : { rotate: [-4, 4, -4], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-7 h-7 rounded-lg bg-amber-600/20 text-amber-500 flex items-center justify-center border border-amber-500/30"
              >
                <Flame className="w-4 h-4" />
              </motion.div>
              <span className="text-base font-bold text-white tracking-tight font-display">
                Pizza Artisan
              </span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              Hand-tossed 48-hour fermented dough baked at 900°F in our stone wood-fired oven. Real-time delivery fleet tracking and dynamic crust builder.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-stone-200 uppercase tracking-wider block">
              Menu & Builder
            </span>
            <ul className="space-y-2">
              <li>
                <a href="#specialty-menu" className="hover:text-amber-400 transition-colors inline-block">
                  Specialty Pizzas
                </a>
              </li>
              <li>
                <a href="#custom-builder" className="hover:text-amber-400 transition-colors inline-block">
                  5 Crusts & 5 Sauces
                </a>
              </li>
              <li>
                <a href="#custom-builder" className="hover:text-amber-400 transition-colors inline-block">
                  Farmhouse Toppings
                </a>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-stone-200 uppercase tracking-wider block">
              Staff Portals
            </span>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Kitchen & Inventory Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenDelivery}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Courier Delivery Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-2.5 text-stone-400">
            <span className="text-xs font-semibold text-stone-200 uppercase tracking-wider block">
              Hearth Location
            </span>
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span>742 Evergreen Terrace, Springfield</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span>Hotline: +1 (555) 019-9021</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span>Notifications: yvsns7035@gmail.com</span>
            </p>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div>
            © {new Date().getFullYear()} Pizza Artisan Management System. Handcrafted with passion.
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-emerald-400/90 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Razorpay Sandbox
            </span>
            <span aria-hidden="true" className="text-stone-700">·</span>
            <span>Gmail SMTP Active</span>
            <span aria-hidden="true" className="text-stone-700">·</span>
            <span>MongoDB Atlas</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
