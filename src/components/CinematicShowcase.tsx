import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { Sparkles, Flame, Plus, Check, ArrowRight, ChefHat, Star, Layers, ShieldCheck, Clock, Award } from 'lucide-react';
import { SpecialtyPizza } from '../types.js';
import { useCart } from '../context/CartContext.js';
import { ease } from '../lib/animations.js';

interface CinematicShowcaseProps {
  pizzas: SpecialtyPizza[];
  onStartCustom: () => void;
  onExploreMenu: () => void;
}

const HEADLINE_WORDS = ['THE', 'ART', 'OF', 'WOOD-FIRED', 'ALCHEMY'];

export const CinematicShowcase: React.FC<CinematicShowcaseProps> = ({
  pizzas,
  onStartCustom,
  onExploreMenu,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  // Active showcase pizzas from real menu data with reliable fallbacks
  const pizza1 = pizzas[0] || {
    id: 'spec_1',
    name: 'Margherita Supreme',
    tagline: 'Fresh Fior Di Latte, San Marzano sauce, fresh torn basil',
    description: 'The timeless Neapolitan classic made with crushed San Marzano tomatoes, whole milk fior di latte mozzarella, cold-pressed olive oil, and sweet garden basil.',
    price: 14.99,
    base: 'Crispy Thin Crust',
    sauce: 'San Marzano Marinara',
    cheese: 'Fresh Fior Di Latte Mozzarella',
    veggies: ['Fresh Genovese Basil', 'Cherry Tomatoes'],
    image: '/src/assets/images/pizza_margherita_supreme_1791884208030.jpg',
    badge: 'Chef Favorite',
    isVeg: true,
  };

  const pizza2 = pizzas[1] || {
    id: 'spec_2',
    name: 'Farmhouse Garden Feast',
    tagline: 'Crimini mushrooms, crisp peppers, sweet corn, red onions',
    description: 'A vibrant harvest of farm-fresh crimini mushrooms, crunchy tricolor bell peppers, sweet golden corn, and charred red onions over rich marinara and mozzarella.',
    price: 15.99,
    base: 'Classic Hand Tossed',
    sauce: 'San Marzano Marinara',
    cheese: 'Fresh Fior Di Latte Mozzarella',
    veggies: ['Crimini Sliced Mushrooms', 'Crisp Bell Peppers', 'Sweet Golden Corn', 'Caramelized Red Onions'],
    image: '/src/assets/images/pizza_farmhouse_veggie_1791884207868.jpg',
    badge: 'Popular',
    isVeg: true,
  };

  // Scroll Progress across the showcase container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // ─── ROTATION & SCALE TRANSFORMS ─────────────────────────────────────────
  // Controlled, elegant rotation range (-8° to +8°) mapped to scroll progress
  const pizzaRotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    shouldReduce ? [0, 0, 0] : [-8, 0, 8]
  );

  // Subtle, organic breathing scale
  const pizzaScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    shouldReduce ? [1, 1, 1] : [0.96, 1.04, 0.98]
  );

  // Smooth Crossfade between Pizza 1 and Pizza 2
  const pizza1Opacity = useTransform(scrollYProgress, [0.32, 0.52], [1, 0]);
  const pizza2Opacity = useTransform(scrollYProgress, [0.42, 0.62], [0, 1]);

  // Dynamic ambient hearth glow scale & intensity
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 1.05]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 0.65, 0.45]);

  // Transformation indicator opacity
  const activePizzaName = useTransform(
    scrollYProgress,
    [0, 0.45, 0.55, 1],
    [pizza1.name, pizza1.name, pizza2.name, pizza2.name]
  );

  // Handle direct cart addition
  const handleAddToCart = () => {
    addToCart({
      name: pizza2.name,
      isCustom: false,
      base: pizza2.base,
      sauce: pizza2.sauce,
      cheese: pizza2.cheese,
      veggies: pizza2.veggies,
      quantity: 1,
      unitPrice: pizza2.price,
      details: pizza2.tagline,
      image: pizza2.image,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2200);
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[240vh] sm:min-h-[280vh] bg-stone-950 text-stone-100"
      aria-label="Cinematic Pizza Scroll Showcase"
    >
      {/* ── STICKY VIEWPORT CONTAINER ───────────────────────────────────────── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-4 sm:py-6 select-none">

        {/* Ambient Dark Hearth Background with Volcanic Radial Glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 50%, rgba(180, 83, 9, 0.22) 0%, transparent 70%),
              radial-gradient(circle 420px at 15% 25%, rgba(217, 119, 6, 0.12) 0%, transparent 60%),
              radial-gradient(circle 520px at 85% 75%, rgba(234, 88, 12, 0.10) 0%, transparent 60%),
              #0c0a09
            `,
          }}
        />

        {/* ── 1. TOP HEADER ZONE: HEADLINE & SUBTITLE (ZERO OVERLAP) ─────────── */}
        <div className="relative z-30 max-w-4xl mx-auto w-full px-4 sm:px-6 text-center shrink-0">
          {/* Eyebrow Badge */}
          <motion.div
            initial={shouldReduce ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: ease.out }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-[11px] font-semibold text-amber-400 mb-2 uppercase tracking-wider shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>900°F Wood-Fired Masterpiece · Naturally Fermented 48h</span>
          </motion.div>

          {/* Main Headline — Dedicated clear space above pizza */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-display uppercase leading-tight">
            {HEADLINE_WORDS.map((word, idx) => (
              <motion.span
                key={idx}
                className="inline-block mr-2 sm:mr-3"
                initial={shouldReduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 * idx, ease: ease.out }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Supporting Subtitle */}
          <motion.p
            initial={shouldReduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto mt-1.5 leading-relaxed font-light hidden sm:block"
          >
            Artisan sourdough crust charred in stone oven hearths, layered with authentic San Marzano tomatoes and sweet whole-milk fior di latte.
          </motion.p>
        </div>

        {/* ── 2. CENTERPIECE ARENA: FLANKING GRID (DESKTOP) & NATURAL STACK (MOBILE) ── */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 my-auto flex-1 flex items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center w-full">

            {/* ── Left Column: Cards 1 & 3 (Desktop) ───────────────────────── */}
            <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
              {/* Card 1: The Foundation */}
              <motion.div
                initial={shouldReduce ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={shouldReduce ? {} : { scale: 1.02 }}
                className="bg-stone-900/95 backdrop-blur-md border border-stone-700/90 hover:border-amber-500/60 rounded-xl p-4 shadow-xl shadow-black/60 transition-all text-left"
              >
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>01. Sourdough Crust</span>
                </div>
                <h3 className="text-white font-bold text-sm sm:text-base tracking-tight">
                  48h Cold Fermentation
                </h3>
                <p className="text-stone-200 text-xs mt-1.5 leading-relaxed">
                  Naturally fermented sourdough dough. Airy interior crumb with signature charred leopard-crust blisters.
                </p>
              </motion.div>

              {/* Card 3: The Melt */}
              <motion.div
                initial={shouldReduce ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={shouldReduce ? {} : { scale: 1.02 }}
                className="bg-stone-900/95 backdrop-blur-md border border-stone-700/90 hover:border-amber-500/60 rounded-xl p-4 shadow-xl shadow-black/60 transition-all text-left"
              >
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>03. Artisan Melt</span>
                </div>
                <h3 className="text-white font-bold text-sm sm:text-base tracking-tight">
                  Fior Di Latte Mozzarella
                </h3>
                <p className="text-stone-200 text-xs mt-1.5 leading-relaxed">
                  Hand-torn whole milk mozzarella that melts at 900°F into golden, rich caramelized ribbons.
                </p>
              </motion.div>
            </div>

            {/* ── Center Column: Rotating Central Pizza Centerpiece ─────────── */}
            <div className="col-span-1 lg:col-span-6 flex flex-col items-center justify-center relative py-2">

              {/* Dynamic Hearth Glow behind Pizza */}
              <motion.div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[380px] md:w-[460px] h-[280px] sm:h-[380px] md:h-[460px] rounded-full pointer-events-none z-10"
                style={{
                  scale: glowScale,
                  opacity: glowOpacity,
                  background: 'radial-gradient(circle, rgba(234, 88, 12, 0.45) 0%, rgba(217, 119, 6, 0.22) 42%, transparent 70%)',
                  filter: 'blur(36px)',
                }}
              />

              {/* Decorative Outer Aperture Ring (Separate Slow Ambient Rotation) */}
              <motion.div
                aria-hidden="true"
                animate={shouldReduce ? undefined : { rotate: 360 }}
                transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-4 sm:-inset-6 rounded-full border border-amber-500/25 pointer-events-none z-10"
                style={{
                  background: 'radial-gradient(circle, transparent 65%, rgba(217, 119, 6, 0.08) 100%)',
                }}
              />
              <div
                aria-hidden="true"
                className="absolute -inset-8 sm:-inset-10 rounded-full border border-dashed border-stone-800/80 pointer-events-none z-10"
              />

              {/* ── THE CENTRAL ROTATING PIZZA IMAGE ───────────────────────── */}
              <motion.div
                className="relative z-15 w-52 h-52 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-[380px] lg:h-[380px] aspect-square rounded-full flex items-center justify-center shadow-2xl shadow-black/90"
                style={{
                  rotate: pizzaRotate,
                  scale: pizzaScale,
                  transformOrigin: '50% 50%',
                }}
              >
                {/* Pizza 1: Margherita Supreme */}
                <motion.div
                  className="absolute inset-0 rounded-full overflow-hidden"
                  style={{
                    opacity: pizza1Opacity,
                    maskImage: 'radial-gradient(circle, black 72%, transparent 98%)',
                    WebkitMaskImage: 'radial-gradient(circle, black 72%, transparent 98%)',
                  }}
                >
                  <img
                    src={pizza1.image}
                    alt={pizza1.name}
                    className="w-full h-full object-cover object-center rounded-full"
                    loading="eager"
                  />
                </motion.div>

                {/* Pizza 2: Farmhouse Garden Feast (Layered Crossfade) */}
                <motion.div
                  className="absolute inset-0 rounded-full overflow-hidden"
                  style={{
                    opacity: pizza2Opacity,
                    maskImage: 'radial-gradient(circle, black 72%, transparent 98%)',
                    WebkitMaskImage: 'radial-gradient(circle, black 72%, transparent 98%)',
                  }}
                >
                  <img
                    src={pizza2.image}
                    alt={pizza2.name}
                    className="w-full h-full object-cover object-center rounded-full"
                    loading="eager"
                  />
                </motion.div>

                {/* Ember glint overlay */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full pointer-events-none mix-blend-overlay"
                  style={{
                    background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.28) 0%, transparent 60%)',
                  }}
                />
              </motion.div>

              {/* Pizza Identity Badge directly under centerpiece */}
              <motion.div
                className="relative z-20 mt-4 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-stone-900/90 border border-stone-700/80 shadow-lg text-xs"
                initial={shouldReduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span className="text-white font-semibold font-display">
                  {pizza1.name}
                </span>
                <span className="text-stone-500">·</span>
                <span className="text-amber-400 font-mono font-bold">
                  ${pizza1.price.toFixed(2)}
                </span>
                <span className="text-stone-500 hidden sm:inline">·</span>
                <span className="text-emerald-400 font-medium text-[11px] hidden sm:flex items-center gap-1">
                  <Star className="w-3 h-3 fill-emerald-400" />
                  <span>4.9 / 5.0</span>
                </span>
              </motion.div>
            </div>

            {/* ── Right Column: Cards 2 & 4 (Desktop) ──────────────────────── */}
            <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
              {/* Card 2: The Hearth Sauce */}
              <motion.div
                initial={shouldReduce ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={shouldReduce ? {} : { scale: 1.02 }}
                className="bg-stone-900/95 backdrop-blur-md border border-stone-700/90 hover:border-amber-500/60 rounded-xl p-4 shadow-xl shadow-black/60 transition-all text-left"
              >
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>02. Hearth Marinara</span>
                </div>
                <h3 className="text-white font-bold text-sm sm:text-base tracking-tight">
                  San Marzano D.O.P.
                </h3>
                <p className="text-stone-200 text-xs mt-1.5 leading-relaxed">
                  Sun-ripened plum tomatoes simmered with cold-pressed extra virgin olive oil, sweet basil, and sea salt.
                </p>
              </motion.div>

              {/* Card 4: Farm Produce */}
              <motion.div
                initial={shouldReduce ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={shouldReduce ? {} : { scale: 1.02 }}
                className="bg-stone-900/95 backdrop-blur-md border border-stone-700/90 hover:border-amber-500/60 rounded-xl p-4 shadow-xl shadow-black/60 transition-all text-left"
              >
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                  <span>04. Farm-To-Oven Produce</span>
                </div>
                <h3 className="text-white font-bold text-sm sm:text-base tracking-tight">
                  Hand-Selected Harvest
                </h3>
                <p className="text-stone-200 text-xs mt-1.5 leading-relaxed">
                  Crimini mushrooms, tricolor sweet peppers, and sweet golden corn sliced fresh daily for peak crunch.
                </p>
              </motion.div>
            </div>

            {/* ── Mobile/Tablet Ingredient Cards (2x2 Grid Below Pizza) ───── */}
            <div className="grid grid-cols-2 lg:hidden gap-2.5 sm:gap-3 w-full pt-1">
              <div className="bg-stone-900/95 border border-stone-700/90 rounded-lg p-2.5 text-left">
                <span className="text-amber-400 text-[10px] font-bold uppercase block">01. Sourdough</span>
                <span className="text-white text-xs font-bold block mt-0.5">48h Ferment</span>
                <span className="text-stone-300 text-[11px] block mt-0.5 line-clamp-2">Airy leopard crust</span>
              </div>
              <div className="bg-stone-900/95 border border-stone-700/90 rounded-lg p-2.5 text-left">
                <span className="text-amber-400 text-[10px] font-bold uppercase block">02. Marinara</span>
                <span className="text-white text-xs font-bold block mt-0.5">San Marzano</span>
                <span className="text-stone-300 text-[11px] block mt-0.5 line-clamp-2">Sun-ripened plum tomatoes</span>
              </div>
              <div className="bg-stone-900/95 border border-stone-700/90 rounded-lg p-2.5 text-left">
                <span className="text-amber-400 text-[10px] font-bold uppercase block">03. Artisan Melt</span>
                <span className="text-white text-xs font-bold block mt-0.5">Fior Di Latte</span>
                <span className="text-stone-300 text-[11px] block mt-0.5 line-clamp-2">Golden caramelized melt</span>
              </div>
              <div className="bg-stone-900/95 border border-stone-700/90 rounded-lg p-2.5 text-left">
                <span className="text-amber-400 text-[10px] font-bold uppercase block">04. Fresh Harvest</span>
                <span className="text-white text-xs font-bold block mt-0.5">Farm Produce</span>
                <span className="text-stone-300 text-[11px] block mt-0.5 line-clamp-2">Sliced fresh daily</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── 3. BOTTOM ZONE: CTAS & PROOF BAR (PROPER SPACING) ─────────────── */}
        <div className="relative z-30 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-2 shrink-0 text-center space-y-3">
          {/* Main CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <motion.button
              onClick={onStartCustom}
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer"
              whileHover={shouldReduce ? {} : { scale: 1.03 }}
              whileTap={shouldReduce ? {} : { scale: 0.96 }}
            >
              <span>Build Custom Pizza</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>

            <motion.button
              onClick={onExploreMenu}
              className="px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold text-xs uppercase tracking-wider border border-stone-700 transition-colors flex items-center gap-2 cursor-pointer"
              whileHover={shouldReduce ? {} : { scale: 1.03 }}
              whileTap={shouldReduce ? {} : { scale: 0.96 }}
            >
              <span>Explore Chef Menu</span>
            </motion.button>

            <motion.button
              onClick={handleAddToCart}
              className="px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-semibold text-xs uppercase tracking-wider border border-amber-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              whileHover={shouldReduce ? {} : { scale: 1.03 }}
              whileTap={shouldReduce ? {} : { scale: 0.96 }}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">Added To Cart!</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Quick Add (${pizza1.price.toFixed(2)})</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Proof Bar with Clean Deliberate Spacing */}
          <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-stone-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>30-Min Hot Delivery</span>
            </div>
            <span aria-hidden="true" className="text-stone-700 hidden sm:inline">·</span>
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>900°F Stone Hearth Bake</span>
            </div>
            <span aria-hidden="true" className="text-stone-700 hidden sm:inline">·</span>
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>100% Verified Fresh Ingredients</span>
            </div>
            <span aria-hidden="true" className="text-stone-700 hidden sm:inline">·</span>
            <div className="flex items-center gap-1 text-stone-400 font-mono text-[11px]">
              <span>Scroll to rotate &amp; transform</span>
              <span className="animate-bounce text-amber-400">↓</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
