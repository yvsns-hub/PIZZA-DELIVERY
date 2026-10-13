import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ShoppingBag, User as UserIcon, Shield, Bike } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { ease } from '../lib/animations.js';

interface NavbarProps {
  activeView: 'home' | 'builder' | 'tracker' | 'admin' | 'delivery' | 'profile';
  setActiveView: (view: 'home' | 'builder' | 'tracker' | 'admin' | 'delivery' | 'profile') => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView, onOpenAuth }) => {
  const { user, role, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const shouldReduce = useReducedMotion();

  // Scroll shadow
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks: Array<{
    id: 'home' | 'builder' | 'tracker' | 'admin' | 'delivery';
    label: string;
    icon?: React.ReactNode;
  }> = role === 'admin'
    ? [{ id: 'admin', label: 'Kitchen & Orders Portal', icon: <Shield className="w-3.5 h-3.5" /> }]
    : role === 'delivery'
    ? [{ id: 'delivery', label: 'Rider Delivery Portal', icon: <Bike className="w-3.5 h-3.5" /> }]
    : [
        { id: 'home', label: 'Specialty Pizzas' },
        { id: 'builder', label: 'Custom Builder' },
        { id: 'tracker', label: 'Track Order' },
      ];



  return (
    <motion.header
      className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-shadow duration-300 ${
        scrolled ? 'navbar-scroll-shadow' : ''
      }`}
      initial={shouldReduce ? false : { y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: ease.out }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">

        {/* Zone 1: Brand wordmark */}
        <motion.button
          onClick={() => setActiveView('home')}
          className="text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 hover:text-amber-800 transition-colors cursor-pointer"
          whileHover={shouldReduce ? {} : { scale: 1.03 }}
          whileTap={shouldReduce ? {} : { scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          Pizza Artisan
        </motion.button>

        {/* Zone 2: Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          {navLinks.map((link) => (
            <motion.button
              key={link.id}
              onClick={() => setActiveView(link.id)}
              className={`relative whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeView === link.id ? 'text-amber-700 font-semibold' : 'hover:text-stone-900'
              }`}
              whileHover={shouldReduce ? {} : { y: -1 }}
              transition={{ duration: 0.15 }}
            >
              {link.icon}
              {link.label}
              {/* Active underline indicator */}
              {activeView === link.id && (
                <motion.span
                  layoutId="navbar-underline"
                  className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-amber-700 rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setActiveView('profile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border cursor-pointer ${
                  activeView === 'profile'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                }`}
                whileHover={shouldReduce ? {} : { scale: 1.03 }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
              >
                <UserIcon className="w-3.5 h-3.5 text-amber-700" />
                <span>{user.name.split(' ')[0]}</span>
                {role !== 'customer' && (
                  <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-stone-900 text-white rounded">
                    {role}
                  </span>
                )}
              </motion.button>
              <motion.button
                onClick={logout}
                className="px-2.5 py-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors whitespace-nowrap cursor-pointer"
                whileHover={shouldReduce ? {} : { scale: 1.04 }}
                whileTap={shouldReduce ? {} : { scale: 0.96 }}
              >
                Sign Out
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 text-xs font-semibold text-stone-800 hover:text-stone-950 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors whitespace-nowrap cursor-pointer"
              whileHover={shouldReduce ? {} : { scale: 1.03, borderColor: '#92400e' }}
              whileTap={shouldReduce ? {} : { scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              Sign In
            </motion.button>
          )}

          {/* Cart button (Customer only) */}
          {role === 'customer' && (
            <motion.button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-md transition-colors shadow-xs whitespace-nowrap shrink-0"
              aria-label="Open Shopping Cart"
              whileHover={shouldReduce ? {} : { scale: 1.04 }}
              whileTap={shouldReduce ? {} : { scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Bag</span>
              {itemCount > 0 && (
                <span className="tabular-nums font-mono bg-white text-amber-900 rounded-full px-1.5 text-[11px] font-bold">
                  {itemCount}
                </span>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
};
