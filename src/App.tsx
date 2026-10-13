import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { Navbar } from './components/Navbar.js';
import { SplashScreen } from './components/SplashScreen.js';
import { AuthScreen } from './components/AuthScreen.js';
import { CinematicShowcase } from './components/CinematicShowcase.js';
import { SpecialtyMenu } from './components/SpecialtyMenu.js';
import { CustomPizzaBuilder } from './components/CustomPizzaBuilder.js';
import { CartDrawer } from './components/CartDrawer.js';
import { OrderTrackingView } from './components/OrderTrackingView.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { DeliveryDashboard } from './components/DeliveryDashboard.js';
import { UserProfileView } from './components/UserProfileView.js';
import { Footer } from './components/Footer.js';
import { api } from './services/api.js';
import { Ingredient, SpecialtyPizza, Order } from './types.js';
import { ChefHat, Flame, Loader2 } from 'lucide-react';
import { ease } from './lib/animations.js';

const pageVariant = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: ease.out } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: ease.inOut } },
};

function MainAppContent() {
  const { user, role, authState } = useAuth();
  const shouldReduce = useReducedMotion();

  // Startup splash screen sequence
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem('pizza_splash_seen');
  });

  const [activeView, setActiveView] = useState<'home' | 'builder' | 'tracker' | 'admin' | 'delivery' | 'profile'>('home');
  const [trackedOrderId, setTrackedOrderId] = useState<string | undefined>(undefined);

  // Menu data (fetched after authentication or in parallel)
  const [bases, setBases] = useState<Ingredient[]>([]);
  const [sauces, setSauces] = useState<Ingredient[]>([]);
  const [cheeses, setCheeses] = useState<Ingredient[]>([]);
  const [veggies, setVeggies] = useState<Ingredient[]>([]);
  const [specialtyPizzas, setSpecialtyPizzas] = useState<SpecialtyPizza[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  // Sync default view when authenticated role changes
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setActiveView('admin');
      } else if (user.role === 'delivery') {
        setActiveView('delivery');
      } else {
        if (activeView === 'admin' || activeView === 'delivery') {
          setActiveView('home');
        }
      }
    }
  }, [user]);

  // Fetch menu data when authenticated as customer
  useEffect(() => {
    if (user && user.role === 'customer') {
      async function fetchMenu() {
        try {
          const data = await api.getMenu();
          setBases(data.bases || []);
          setSauces(data.sauces || []);
          setCheeses(data.cheeses || []);
          setVeggies(data.veggies || []);
          setSpecialtyPizzas(data.specialtyPizzas || []);
        } catch (err) {
          console.error('Failed to load menu:', err);
        } finally {
          setIsLoadingMenu(false);
        }
      }
      fetchMenu();
    }
  }, [user]);

  const handleOrderCompleted = (order: Order) => {
    setTrackedOrderId(order.orderNumber);
    setActiveView('tracker');
  };

  const handleAuthSuccess = (authenticatedRole: string) => {
    if (authenticatedRole === 'admin') {
      setActiveView('admin');
    } else if (authenticatedRole === 'delivery') {
      setActiveView('delivery');
    } else {
      setActiveView('home');
    }
  };

  // 1. Brief animated splash screen (Session startup sequence step 1)
  if (showSplash) {
    return (
      <SplashScreen
        onComplete={() => {
          sessionStorage.setItem('pizza_splash_seen', 'true');
          setShowSplash(false);
        }}
      />
    );
  }

  // 2. While checking existing token: show clean hearth loading without flashing protected UI
  if (authState === 'checking') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 text-stone-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-500 border border-amber-500/30 flex items-center justify-center">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
            <span>Validating secure session...</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Unauthenticated session: Render ONLY the dedicated authentication interface
  // (No menu, no showcase, no rotating pizza, no builder, no cart, no dashboards)
  if (authState === 'unauthenticated' || !user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // 4. Authenticated session: Render role-appropriate interface
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-900 antialiased selection:bg-amber-200">
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAuth={() => {}}
      />

      {/* Main Content Areas with Role-Based Rendering */}
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {/* CUSTOMER VIEWS */}
          {role === 'customer' && (
            <>
              {activeView === 'home' && (
                <motion.div
                  key="view-home"
                  variants={shouldReduce ? undefined : pageVariant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {/* Rotating Pizza Scroll-Driven Showcase */}
                  <CinematicShowcase
                    pizzas={specialtyPizzas}
                    onStartCustom={() => setActiveView('builder')}
                    onExploreMenu={() => {
                      const el = document.getElementById('specialty-menu');
                      el ? el.scrollIntoView({ behavior: 'smooth' }) : null;
                    }}
                  />

                  {!isLoadingMenu && (
                    <>
                      {/* Specialty Pizza Menu Catalog */}
                      <SpecialtyMenu pizzas={specialtyPizzas} />

                      {/* Custom Pizza Builder Tab Callout Banner */}
                      <section className="bg-stone-900 text-white py-12 px-4 border-y border-stone-800">
                        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                          <div className="space-y-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              <ChefHat className="w-3.5 h-3.5" />
                              <span>Interactive Artisan Workshop</span>
                            </span>
                            <h3 className="text-2xl font-bold tracking-tight">Want to design your own pizza from scratch?</h3>
                            <p className="text-stone-400 text-sm max-w-xl">
                              Select from 5 hand-crafted crusts, 5 slow-simmered sauces, imported cheeses, and farm-fresh toppings with our realistic visualizer.
                            </p>
                          </div>
                          <motion.button
                            onClick={() => setActiveView('builder')}
                            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-xl shadow-lg transition-colors cursor-pointer shrink-0"
                            whileHover={shouldReduce ? {} : { scale: 1.04 }}
                            whileTap={shouldReduce ? {} : { scale: 0.96 }}
                          >
                            Open Custom Pizza Builder Tab →
                          </motion.button>
                        </div>
                      </section>
                    </>
                  )}
                </motion.div>
              )}

              {/* CUSTOM PIZZA BUILDER — STANDALONE TAB */}
              {activeView === 'builder' && (
                <motion.div
                  key="view-builder"
                  className="py-6"
                  variants={shouldReduce ? undefined : pageVariant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <CustomPizzaBuilder
                    bases={bases}
                    sauces={sauces}
                    cheeses={cheeses}
                    veggies={veggies}
                  />
                </motion.div>
              )}

              {/* ORDER TRACKING VIEW */}
              {activeView === 'tracker' && (
                <motion.div
                  key="view-tracker"
                  variants={shouldReduce ? undefined : pageVariant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <OrderTrackingView
                    initialOrderId={trackedOrderId}
                    onBackToMenu={() => setActiveView('home')}
                  />
                </motion.div>
              )}

              {/* CUSTOMER PROFILE VIEW */}
              {activeView === 'profile' && (
                <motion.div
                  key="view-profile"
                  variants={shouldReduce ? undefined : pageVariant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <UserProfileView
                    onTrackOrder={(orderId) => {
                      setTrackedOrderId(orderId);
                      setActiveView('tracker');
                    }}
                    onNavigateHome={() => setActiveView('home')}
                  />
                </motion.div>
              )}
            </>
          )}

          {/* ADMIN PORTAL VIEW */}
          {role === 'admin' && (
            <motion.div
              key="view-admin"
              variants={shouldReduce ? undefined : pageVariant}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminDashboard />
            </motion.div>
          )}

          {/* DELIVERY STAFF VIEW */}
          {role === 'delivery' && (
            <motion.div
              key="view-delivery"
              variants={shouldReduce ? undefined : pageVariant}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <DeliveryDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Cart & Checkout Slide-Over (Accessible to customer) */}
      {role === 'customer' && (
        <CartDrawer onOrderCompleted={handleOrderCompleted} />
      )}

      {/* Footer */}
      <Footer
        onOpenAdmin={() => {
          if (role === 'admin') setActiveView('admin');
        }}
        onOpenDelivery={() => {
          if (role === 'delivery') setActiveView('delivery');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </AuthProvider>
  );
}
