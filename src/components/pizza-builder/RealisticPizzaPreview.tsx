import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  MushroomSlice,
  BellPepperPiece,
  OnionRing,
  BlackOliveSlice,
  JalapenoSlice,
  CornCluster,
  BasilLeaf,
  CherryTomatoHalf,
  GarlicConfitClove,
} from './ToppingGraphics.js';

interface RealisticPizzaPreviewProps {
  selectedBase: string;
  selectedSauce: string;
  selectedCheese: string;
  selectedVeggies: string[];
}

// Stable deterministic topping coordinate tables (percentages within 100x100 pizza canvas)
// Coordinates are carefully bounded between 24% and 74% so toppings stay strictly on the edible area
const TOPPING_CONFIGS: Record<
  string,
  Array<{ x: number; y: number; rot: number; scale: number; variant?: 'red' | 'green' | 'yellow' }>
> = {
  'Bell Peppers': [
    { x: 32, y: 30, rot: -25, scale: 1.0, variant: 'red' },
    { x: 64, y: 33, rot: 40, scale: 1.05, variant: 'green' },
    { x: 40, y: 62, rot: 110, scale: 0.95, variant: 'yellow' },
    { x: 66, y: 58, rot: -65, scale: 1.0, variant: 'red' },
    { x: 48, y: 44, rot: 15, scale: 1.0, variant: 'green' },
    { x: 26, y: 50, rot: -80, scale: 0.9, variant: 'yellow' },
  ],
  Mushrooms: [
    { x: 38, y: 25, rot: 15, scale: 1.0 },
    { x: 62, y: 42, rot: -35, scale: 1.05 },
    { x: 34, y: 50, rot: 75, scale: 0.95 },
    { x: 54, y: 64, rot: -15, scale: 1.0 },
    { x: 48, y: 34, rot: 120, scale: 0.9 },
  ],
  'Caramelized Red Onions': [
    { x: 44, y: 28, rot: -45, scale: 1.0 },
    { x: 58, y: 30, rot: 50, scale: 1.05 },
    { x: 30, y: 40, rot: -15, scale: 0.95 },
    { x: 62, y: 52, rot: 130, scale: 1.0 },
    { x: 42, y: 66, rot: -70, scale: 0.9 },
    { x: 52, y: 46, rot: 25, scale: 0.95 },
  ],
  'Spanish Black Olives': [
    { x: 28, y: 32, rot: 10, scale: 1.0 },
    { x: 68, y: 36, rot: -40, scale: 1.05 },
    { x: 36, y: 58, rot: 30, scale: 0.95 },
    { x: 60, y: 62, rot: -20, scale: 1.0 },
    { x: 46, y: 22, rot: 45, scale: 0.9 },
    { x: 54, y: 48, rot: -10, scale: 1.0 },
  ],
  'Pickled Jalapeños': [
    { x: 34, y: 36, rot: -15, scale: 1.0 },
    { x: 56, y: 24, rot: 35, scale: 0.95 },
    { x: 64, y: 46, rot: -50, scale: 1.05 },
    { x: 46, y: 58, rot: 20, scale: 1.0 },
    { x: 30, y: 56, rot: 65, scale: 0.9 },
  ],
  'Sweet Golden Corn': [
    { x: 40, y: 32, rot: 20, scale: 1.0 },
    { x: 54, y: 36, rot: -30, scale: 1.05 },
    { x: 34, y: 46, rot: 45, scale: 0.95 },
    { x: 58, y: 56, rot: -15, scale: 1.0 },
    { x: 44, y: 52, rot: 80, scale: 0.9 },
    { x: 48, y: 23, rot: -40, scale: 1.0 },
  ],
  'Fresh Genovese Basil': [
    { x: 46, y: 30, rot: -10, scale: 1.1 },
    { x: 34, y: 42, rot: 65, scale: 1.0 },
    { x: 58, y: 40, rot: -45, scale: 1.05 },
    { x: 42, y: 56, rot: 120, scale: 0.95 },
    { x: 56, y: 58, rot: 30, scale: 1.0 },
  ],
  'Cherry Tomatoes': [
    { x: 32, y: 26, rot: 25, scale: 1.0 },
    { x: 60, y: 28, rot: -20, scale: 1.05 },
    { x: 38, y: 52, rot: 80, scale: 0.95 },
    { x: 62, y: 50, rot: -60, scale: 1.0 },
    { x: 48, y: 42, rot: 15, scale: 0.9 },
  ],
  'Roasted Garlic Confit': [
    { x: 42, y: 26, rot: 30, scale: 1.0 },
    { x: 56, y: 34, rot: -45, scale: 0.95 },
    { x: 34, y: 54, rot: 15, scale: 1.05 },
    { x: 52, y: 56, rot: -30, scale: 1.0 },
  ],
};

function getVegCategoryKey(name: string): string | null {
  const keys = Object.keys(TOPPING_CONFIGS);
  for (const k of keys) {
    if (name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase())) {
      return k;
    }
  }
  return null;
}

function renderToppingGraphic(catKey: string, variant?: 'red' | 'green' | 'yellow') {
  switch (catKey) {
    case 'Bell Peppers':
      return <BellPepperPiece color={variant || 'green'} />;
    case 'Mushrooms':
      return <MushroomSlice />;
    case 'Caramelized Red Onions':
      return <OnionRing />;
    case 'Spanish Black Olives':
      return <BlackOliveSlice />;
    case 'Pickled Jalapeños':
      return <JalapenoSlice />;
    case 'Sweet Golden Corn':
      return <CornCluster />;
    case 'Fresh Genovese Basil':
      return <BasilLeaf />;
    case 'Cherry Tomatoes':
      return <CherryTomatoHalf />;
    case 'Roasted Garlic Confit':
      return <GarlicConfitClove />;
    default:
      return <BellPepperPiece color="red" />;
  }
}

export const RealisticPizzaPreview: React.FC<RealisticPizzaPreviewProps> = ({
  selectedBase,
  selectedSauce,
  selectedCheese,
  selectedVeggies,
}) => {
  const shouldReduce = useReducedMotion();

  // ─── CRUST VARIATION STYLES ───────────────────────────────────────────────
  // Different crusts have visual edge treatments (e.g. Cheese Burst has molten rim)
  const isCheeseBurst = selectedBase.includes('Cheese Burst');
  const isThinCrust = selectedBase.includes('Thin');
  const isDeepDish = selectedBase.includes('Deep Dish');
  const isSourdough = selectedBase.includes('Sourdough');

  // ─── SAUCE LAYER CONFIGURATION ────────────────────────────────────────────
  // Specific sauce tone, oil sheen, and herb speckle styling
  const sauceStyle = React.useMemo(() => {
    if (selectedSauce.includes('Pesto')) {
      return {
        bg: 'radial-gradient(circle, #2e7d32 0%, #1b5e20 65%, #0d3813 100%)',
        blend: 'mix-blend-multiply opacity-80',
        specks: 'rgba(238, 255, 65, 0.35)',
      };
    }
    if (selectedSauce.includes('Alfredo')) {
      return {
        bg: 'radial-gradient(circle, #fffde7 0%, #fff9c4 60%, #fbc02d 100%)',
        blend: 'mix-blend-soft-light opacity-85',
        specks: 'rgba(62, 39, 35, 0.3)',
      };
    }
    if (selectedSauce.includes('BBQ')) {
      return {
        bg: 'radial-gradient(circle, #4e342e 0%, #3e2723 60%, #21130d 100%)',
        blend: 'mix-blend-multiply opacity-75',
        specks: 'rgba(255, 179, 0, 0.25)',
      };
    }
    if (selectedSauce.includes('Peri Peri')) {
      return {
        bg: 'radial-gradient(circle, #e65100 0%, #bf360c 60%, #871400 100%)',
        blend: 'mix-blend-multiply opacity-80',
        specks: 'rgba(255, 235, 59, 0.4)',
      };
    }
    // Default: San Marzano Marinara
    return {
      bg: 'radial-gradient(circle, #c62828 0%, #b71c1c 65%, #7f0000 100%)',
      blend: 'mix-blend-multiply opacity-75',
      specks: 'rgba(76, 175, 80, 0.35)',
    };
  }, [selectedSauce]);

  // ─── CHEESE LAYER CONFIGURATION ───────────────────────────────────────────
  const cheeseFilter = React.useMemo(() => {
    if (selectedCheese.includes('Cheddar')) {
      return 'sepia(45%) saturate(180%) hue-rotate(-12deg) brightness(1.02)';
    }
    if (selectedCheese.includes('Ricotta')) {
      return 'brightness(1.15) contrast(95%) saturate(75%)';
    }
    if (selectedCheese.includes('Gouda')) {
      return 'sepia(25%) saturate(140%) brightness(0.98)';
    }
    if (selectedCheese.includes('Plant-Based')) {
      return 'brightness(1.08) saturate(85%)';
    }
    // Default: Fior Di Latte
    return 'none';
  }, [selectedCheese]);

  return (
    <div className="relative w-full aspect-square max-w-[340px] sm:max-w-[380px] lg:max-w-[420px] mx-auto select-none flex items-center justify-center p-2">
      {/* ── Outer Warm Plate & Parchment Backdrop ──────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(217, 119, 6, 0.12) 0%, rgba(120, 53, 15, 0.05) 55%, transparent 75%)',
          filter: 'blur(24px)',
        }}
      />

      {/* Outer Ceramic Plate Rim */}
      <div
        aria-hidden="true"
        className="absolute inset-1 sm:inset-2 rounded-full border border-stone-200/80 bg-stone-100/90 shadow-2xl shadow-stone-900/15"
        style={{
          background: 'radial-gradient(circle, #fafaf9 65%, #e7e5e4 95%, #d6d3d1 100%)',
        }}
      />

      {/* ── 1. REALISTIC BAKED CRUST LAYER ─────────────────────────────────── */}
      <motion.div
        className="relative w-[92%] h-[92%] rounded-full overflow-hidden shadow-2xl shadow-stone-950/40"
        initial={shouldReduce ? false : { scale: 0.96 }}
        animate={{ scale: isDeepDish ? 1.02 : isThinCrust ? 0.98 : 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Baked Crust Photography Asset */}
        <motion.img
          key={selectedBase}
          src="/src/assets/images/pizza_base_crust.jpg"
          alt="Freshly baked artisan pizza crust"
          className="w-full h-full object-cover object-center rounded-full"
          initial={shouldReduce ? false : { opacity: 0.8, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          style={{
            filter: isSourdough
              ? 'contrast(1.12) brightness(0.96) saturate(1.1)'
              : isThinCrust
              ? 'brightness(1.04) contrast(1.05)'
              : 'none',
          }}
        />

        {/* Cheese Burst Stuffed Molten Rim Effect */}
        <AnimatePresence>
          {isCheeseBurst && (
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 rounded-full pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                boxShadow:
                  'inset 0 0 0 10px rgba(251, 191, 36, 0.85), inset 0 0 22px rgba(245, 158, 11, 0.9), 0 0 16px rgba(251, 191, 36, 0.6)',
              }}
            />
          )}
        </AnimatePresence>

        {/* ── 2. SAUCE LAYER (Crossfades smoothly on change) ───────────────── */}
        <motion.div
          key={selectedSauce}
          className="absolute inset-[11%] rounded-full overflow-hidden pointer-events-none"
          initial={shouldReduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            background: sauceStyle.bg,
            boxShadow: 'inset 0 0 18px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Natural sauce texture & olive oil gleam */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40 mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4) 0%, transparent 60%), radial-gradient(${sauceStyle.specks} 1.5px, transparent 1.5px)`,
              backgroundSize: '100% 100%, 14px 14px',
            }}
          />
        </motion.div>

        {/* ── 3. MELTED CHEESE LAYER (Realistic baked mozzarella texture) ──── */}
        <motion.div
          key={selectedCheese}
          className="absolute inset-[11%] rounded-full overflow-hidden pointer-events-none"
          initial={shouldReduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            maskImage: 'radial-gradient(circle, black 82%, transparent 98%)',
            WebkitMaskImage: 'radial-gradient(circle, black 82%, transparent 98%)',
          }}
        >
          {/* Real bubbling baked cheese photo layer with sauce peek-through */}
          <img
            src="/src/assets/images/pizza_base_cheese.jpg"
            alt="Melted bubbling cheese layer"
            className="w-full h-full object-cover object-center rounded-full opacity-90"
            style={{
              filter: cheeseFilter,
            }}
          />

          {/* Ricotta Cream Dollops Overlay */}
          {selectedCheese.includes('Ricotta') && (
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
              {[
                { top: '35%', left: '38%' },
                { top: '42%', left: '60%' },
                { top: '60%', left: '40%' },
                { top: '56%', left: '62%' },
                { top: '48%', left: '50%' },
              ].map((pos, idx) => (
                <div
                  key={idx}
                  className="absolute w-7 h-7 rounded-full bg-white/95 border border-amber-100/80 shadow-md shadow-stone-900/30"
                  style={{
                    top: pos.top,
                    left: pos.left,
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #fef3c7 65%, #fde68a 100%)',
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* ── 4. STABLE, NATURAL TOPPING INSTANCES (Animated In/Out) ───────── */}
        <div className="absolute inset-0 pointer-events-none z-20">
          <AnimatePresence>
            {selectedVeggies.map((vegName) => {
              const catKey = getVegCategoryKey(vegName);
              if (!catKey || !TOPPING_CONFIGS[catKey]) return null;

              const instances = TOPPING_CONFIGS[catKey];

              return instances.map((item, idx) => {
                const uniqueKey = `top_${catKey}_${idx}`;

                return (
                  <motion.div
                    key={uniqueKey}
                    className="absolute pointer-events-none flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                    }}
                    initial={
                      shouldReduce
                        ? false
                        : {
                            scale: 0,
                            opacity: 0,
                            rotate: item.rot - 25,
                          }
                    }
                    animate={{
                      scale: item.scale,
                      opacity: 1,
                      rotate: item.rot,
                    }}
                    exit={
                      shouldReduce
                        ? {}
                        : {
                            scale: 0,
                            opacity: 0,
                            rotate: item.rot + 25,
                          }
                    }
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 24,
                      delay: idx * 0.035,
                    }}
                  >
                    {renderToppingGraphic(catKey, item.variant)}
                  </motion.div>
                );
              });
            })}
          </AnimatePresence>
        </div>

        {/* ── 5. OPTIONAL BAKED GARNISH & CRACKED HERB LAYER ────────────────── */}
        <div
          aria-hidden="true"
          className="absolute inset-[12%] rounded-full pointer-events-none mix-blend-multiply opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(46, 125, 50, 0.4) 1px, transparent 1px), radial-gradient(circle, rgba(62, 39, 35, 0.5) 1px, transparent 1px)',
            backgroundSize: '24px 24px, 32px 32px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        {/* ── 6. ORGANIC LIGHTING & GLOSSY OVEN SHEEN ──────────────────────── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full pointer-events-none mix-blend-screen opacity-25"
          style={{
            background: 'radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.8) 0%, transparent 55%)',
          }}
        />
      </motion.div>
    </div>
  );
};
