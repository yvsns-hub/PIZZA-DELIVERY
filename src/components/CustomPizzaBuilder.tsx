import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Check, Plus, Minus, Info, AlertTriangle, Sparkles, ChefHat, Flame, Award } from 'lucide-react';
import { Ingredient } from '../types.js';
import { useCart } from '../context/CartContext.js';
import { staggerContainer, scaleFade, tabContent, ease } from '../lib/animations.js';
import { RealisticPizzaPreview } from './pizza-builder/RealisticPizzaPreview.js';

interface CustomPizzaBuilderProps {
  bases: Ingredient[];
  sauces: Ingredient[];
  cheeses: Ingredient[];
  veggies: Ingredient[];
  onOrderSuccess?: () => void;
}

const TABS = [
  { id: 'base' as const,   label: '1. Crust' },
  { id: 'sauce' as const,  label: '2. Sauce' },
  { id: 'cheese' as const, label: '3. Cheese' },
  { id: 'veggies' as const, label: '4. Veggies' },
];

export const CustomPizzaBuilder: React.FC<CustomPizzaBuilderProps> = ({
  bases,
  sauces,
  cheeses,
  veggies,
}) => {
  const { addToCart } = useCart();
  const shouldReduce = useReducedMotion();

  const [selectedBase, setSelectedBase] = useState<string>(bases[0]?.name || 'Classic Hand Tossed');
  const [selectedSauce, setSelectedSauce] = useState<string>(sauces[0]?.name || 'San Marzano Marinara');
  const [selectedCheese, setSelectedCheese] = useState<string>(cheeses[0]?.name || 'Fresh Fior Di Latte Mozzarella');
  const [selectedVeggies, setSelectedVeggies] = useState<string[]>(['Crimini Sliced Mushrooms', 'Crisp Bell Peppers']);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'base' | 'sauce' | 'cheese' | 'veggies'>('base');

  const toggleVeggie = (vegName: string) => {
    setSelectedVeggies((prev) =>
      prev.includes(vegName) ? prev.filter((v) => v !== vegName) : [...prev, vegName]
    );
  };

  const baseObj = useMemo(() => bases.find((b) => b.name === selectedBase), [bases, selectedBase]);
  const sauceObj = useMemo(() => sauces.find((s) => s.name === selectedSauce), [sauces, selectedSauce]);
  const cheeseObj = useMemo(() => cheeses.find((c) => c.name === selectedCheese), [cheeses, selectedCheese]);
  const veggieObjs = useMemo(() => veggies.filter((v) => selectedVeggies.includes(v.name)), [veggies, selectedVeggies]);

  const unitPrice = useMemo(() => {
    const baseP = baseObj?.price || 0;
    const sauceP = sauceObj?.price || 0;
    const cheeseP = cheeseObj?.price || 0;
    const vegP = veggieObjs.reduce((sum, v) => sum + v.price, 0);
    return Math.round((baseP + sauceP + cheeseP + vegP) * 100) / 100;
  }, [baseObj, sauceObj, cheeseObj, veggieObjs]);

  const totalPrice = useMemo(() => Math.round(unitPrice * quantity * 100) / 100, [unitPrice, quantity]);

  const handleAddToCart = () => {
    addToCart({
      name: 'Custom Artisan Pizza',
      isCustom: true,
      base: selectedBase,
      sauce: selectedSauce,
      cheese: selectedCheese,
      veggies: selectedVeggies,
      quantity,
      unitPrice,
      details: `Crust: ${selectedBase} · Sauce: ${selectedSauce} · Cheese: ${selectedCheese} · Toppings: ${
        selectedVeggies.length > 0 ? selectedVeggies.join(', ') : 'None'
      }`,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <section id="custom-builder" className="py-12 bg-stone-100/70 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          className="max-w-2xl mb-8"
          initial={shouldReduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: ease.out }}
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
            <ChefHat className="w-4 h-4 text-amber-700" />
            <span>Interactive Custom Builder</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-display">
            Design Your Signature Masterpiece
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Choose from 5 distinct crust styles, 5 artisanal sauces, farm cheeses, and freshly chopped vegetables with live photorealistic preview.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Left Column: Realistic Visual Pizza Canvas & Live Pricing ─── */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">

            {/* Visual Pizza Display Card with Warm Neutral Background */}
            <motion.div
              className="bg-stone-50/90 p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-md shadow-stone-900/5 flex flex-col items-center relative overflow-hidden"
              initial={shouldReduce ? false : { opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: ease.out }}
            >
              {/* Header Label on Preview */}
              <div className="w-full flex items-center justify-between pb-3 border-b border-stone-200/80 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
                  </span>
                  <span className="text-[11px] font-bold font-mono tracking-widest text-stone-700 uppercase">
                    YOUR CUSTOM PIZZA
                  </span>
                </div>
                <span className="text-[11px] font-medium text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                  Live Visualizer
                </span>
              </div>

              {/* ── REALISTIC LAYERED PIZZA PREVIEW ────────────────────────── */}
              <RealisticPizzaPreview
                selectedBase={selectedBase}
                selectedSauce={selectedSauce}
                selectedCheese={selectedCheese}
                selectedVeggies={selectedVeggies}
              />

              {/* Live Combination Readout with Animated Transitions */}
              <motion.div
                className="mt-3 w-full bg-white/90 p-3 rounded-xl border border-stone-200/80 text-center space-y-0.5 shadow-xs"
                key={`${selectedBase}-${selectedSauce}-${selectedCheese}-${selectedVeggies.length}`}
                initial={shouldReduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Configured Masterpiece
                </div>
                <div className="text-sm font-bold text-stone-900">
                  {selectedBase} · {selectedSauce}
                </div>
                <div className="text-xs text-stone-600">
                  {selectedCheese}
                  <span className="text-stone-400 mx-1">·</span>
                  <span className="text-amber-800 font-medium">
                    {selectedVeggies.length > 0 ? `${selectedVeggies.length} Fresh Topping${selectedVeggies.length > 1 ? 's' : ''}` : 'No Toppings Selected'}
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Live Pricing Summary with Animated Updates */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <span className="text-sm font-semibold text-stone-900">Configured Price Summary</span>
                <span className="text-xs text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded">Real-Time Verification</span>
              </div>

              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between items-center">
                  <span className="text-stone-700">Crust: <strong className="text-stone-900 font-medium">{selectedBase}</strong></span>
                  <span className="font-mono tabular-nums font-semibold text-stone-900">${baseObj?.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-700">Sauce: <strong className="text-stone-900 font-medium">{selectedSauce}</strong></span>
                  <span className="font-mono tabular-nums font-semibold text-stone-900">${sauceObj?.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-700">Cheese: <strong className="text-stone-900 font-medium">{selectedCheese}</strong></span>
                  <span className="font-mono tabular-nums font-semibold text-stone-900">${cheeseObj?.price.toFixed(2)}</span>
                </div>
                <AnimatePresence initial={false}>
                  {veggieObjs.map((v) => (
                    <motion.div
                      key={v.id}
                      className="flex justify-between items-center text-stone-500 pl-2 border-l-2 border-amber-400"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span>+ {v.name}</span>
                      <span className="font-mono tabular-nums text-stone-800">${v.price.toFixed(2)}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Quantity Stepper & Price Calculation */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-4">
                <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-stone-50">
                  <motion.button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                    whileTap={shouldReduce ? {} : { scale: 0.88 }}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.span
                    key={quantity}
                    className="px-3 font-mono tabular-nums text-sm font-semibold text-stone-900"
                    initial={shouldReduce ? false : { scale: 1.25, color: '#b45309' }}
                    animate={{ scale: 1, color: '#1c1917' }}
                    transition={{ duration: 0.25 }}
                  >
                    {quantity}
                  </motion.span>
                  <motion.button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                    whileTap={shouldReduce ? {} : { scale: 0.88 }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </motion.button>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-stone-500 block">Total Price</span>
                  <motion.span
                    key={totalPrice}
                    className="text-xl font-bold font-mono tabular-nums text-amber-800 block"
                    initial={shouldReduce ? false : { scale: 1.15, color: '#d97706' }}
                    animate={{ scale: 1, color: '#92400e' }}
                    transition={{ duration: 0.25 }}
                  >
                    ${totalPrice.toFixed(2)}
                  </motion.span>
                </div>
              </div>

              {/* Add to Bag CTA Button with Feedback */}
              <motion.button
                onClick={handleAddToCart}
                className="btn-amber-glow w-full py-3.5 px-4 text-sm font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                whileHover={shouldReduce ? {} : { scale: 1.02 }}
                whileTap={shouldReduce ? {} : { scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              >
                <span>Add Custom Pizza to Bag</span>
                <span className="font-mono tabular-nums font-semibold text-xs opacity-90">(${totalPrice.toFixed(2)})</span>
              </motion.button>

              <AnimatePresence>
                {addedToast && (
                  <motion.div
                    className="text-center text-xs font-semibold text-emerald-800 bg-emerald-50 py-2 rounded-lg border border-emerald-300"
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: ease.out }}
                  >
                    ✓ Custom pizza added to bag successfully!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Right Column: Step Customization Tabs ─────────────────────── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Tab Navigation with Animated Spring Indicator */}
            <div className="flex items-center gap-1 p-1 bg-stone-200/90 rounded-xl">
              {TABS.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap relative cursor-pointer ${
                    activeTab === tab.id ? 'text-stone-900' : 'text-stone-600 hover:text-stone-900'
                  }`}
                  whileTap={shouldReduce ? {} : { scale: 0.96 }}
                >
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="builder-tab-bg"
                      className="absolute inset-0 bg-white shadow-xs rounded-lg"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Tab Content with Smooth Transitions */}
            <AnimatePresence mode="wait" initial={false}>
              {/* TAB 1: BASES / CRUSTS */}
              {activeTab === 'base' && (
                <motion.div
                  key="base"
                  variants={shouldReduce ? {} : tabContent}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-stone-900 font-display">Step 1: Choose Your Pizza Crust</h3>
                      <p className="text-xs text-stone-500">5 Hand-Crafted Oven Varieties</p>
                    </div>
                    <span className="text-xs text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Step 1 of 4
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {bases.map((base, idx) => {
                      const isSelected = selectedBase === base.name;
                      return (
                        <motion.button
                          key={base.id}
                          type="button"
                          onClick={() => setSelectedBase(base.name)}
                          className={`ingredient-card relative p-4 text-left rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'selected border-amber-600 bg-amber-50/70 ring-2 ring-amber-600/30'
                              : 'border-stone-200 hover:border-amber-400/80 bg-white hover:bg-stone-50/50'
                          }`}
                          initial={shouldReduce ? false : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04, duration: 0.25 }}
                          whileHover={shouldReduce ? {} : { y: -2, boxShadow: '0 8px 18px -4px rgba(0,0,0,0.08)' }}
                          whileTap={shouldReduce ? {} : { scale: 0.97 }}
                        >
                          <div className="flex items-center justify-between mb-1.5 pr-5">
                            <span className="text-sm font-semibold text-stone-900">{base.name}</span>
                            <span className="text-xs font-mono tabular-nums font-bold text-amber-800">+${base.price.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{base.description}</p>
                          <div className="mt-2.5 text-[11px] text-stone-400">
                            {base.stock <= base.threshold ? (
                              <span className="text-amber-700 font-medium low-stock-pulse">Limited stock ({base.stock} left)</span>
                            ) : (
                              <span className="text-stone-500">Wood-Fired Prepared</span>
                            )}
                          </div>
                          {isSelected && (
                            <motion.div
                              className="absolute top-3.5 right-3.5 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center shadow-xs"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            >
                              <Check className="w-3 h-3 text-white stroke-[3]" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <motion.button
                      onClick={() => setActiveTab('sauce')}
                      className="px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      whileHover={shouldReduce ? {} : { scale: 1.03 }}
                      whileTap={shouldReduce ? {} : { scale: 0.97 }}
                    >
                      <span>Next: Choose Sauce</span>
                      <span>→</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: SAUCES */}
              {activeTab === 'sauce' && (
                <motion.div
                  key="sauce"
                  variants={shouldReduce ? {} : tabContent}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-stone-900 font-display">Step 2: Choose Your Sauce Layer</h3>
                      <p className="text-xs text-stone-500">5 Simmered Specialty Sauces</p>
                    </div>
                    <span className="text-xs text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Step 2 of 4
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {sauces.map((sauce, idx) => {
                      const isSelected = selectedSauce === sauce.name;
                      return (
                        <motion.button
                          key={sauce.id}
                          type="button"
                          onClick={() => setSelectedSauce(sauce.name)}
                          className={`ingredient-card relative p-4 text-left rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'selected border-amber-600 bg-amber-50/70 ring-2 ring-amber-600/30'
                              : 'border-stone-200 hover:border-amber-400/80 bg-white hover:bg-stone-50/50'
                          }`}
                          initial={shouldReduce ? false : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04, duration: 0.25 }}
                          whileHover={shouldReduce ? {} : { y: -2, boxShadow: '0 8px 18px -4px rgba(0,0,0,0.08)' }}
                          whileTap={shouldReduce ? {} : { scale: 0.97 }}
                        >
                          <div className="flex items-center justify-between mb-1.5 pr-5">
                            <span className="text-sm font-semibold text-stone-900">{sauce.name}</span>
                            <span className="text-xs font-mono tabular-nums font-bold text-amber-800">+${sauce.price.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{sauce.description}</p>
                          {isSelected && (
                            <motion.div
                              className="absolute top-3.5 right-3.5 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center shadow-xs"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            >
                              <Check className="w-3 h-3 text-white stroke-[3]" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      onClick={() => setActiveTab('base')}
                      className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                    >
                      ← Back to Crust
                    </button>
                    <motion.button
                      onClick={() => setActiveTab('cheese')}
                      className="px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      whileHover={shouldReduce ? {} : { scale: 1.03 }}
                      whileTap={shouldReduce ? {} : { scale: 0.97 }}
                    >
                      <span>Next: Choose Cheese</span>
                      <span>→</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: CHEESE */}
              {activeTab === 'cheese' && (
                <motion.div
                  key="cheese"
                  variants={shouldReduce ? {} : tabContent}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-stone-900 font-display">Step 3: Select Cheese Melt Type</h3>
                      <p className="text-xs text-stone-500">Pick One Artisan Melt Blend</p>
                    </div>
                    <span className="text-xs text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Step 3 of 4
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {cheeses.map((cheese, idx) => {
                      const isSelected = selectedCheese === cheese.name;
                      return (
                        <motion.button
                          key={cheese.id}
                          type="button"
                          onClick={() => setSelectedCheese(cheese.name)}
                          className={`ingredient-card relative p-4 text-left rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'selected border-amber-600 bg-amber-50/70 ring-2 ring-amber-600/30'
                              : 'border-stone-200 hover:border-amber-400/80 bg-white hover:bg-stone-50/50'
                          }`}
                          initial={shouldReduce ? false : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04, duration: 0.25 }}
                          whileHover={shouldReduce ? {} : { y: -2, boxShadow: '0 8px 18px -4px rgba(0,0,0,0.08)' }}
                          whileTap={shouldReduce ? {} : { scale: 0.97 }}
                        >
                          <div className="flex items-center justify-between mb-1.5 pr-5">
                            <span className="text-sm font-semibold text-stone-900">{cheese.name}</span>
                            <span className="text-xs font-mono tabular-nums font-bold text-amber-800">+${cheese.price.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{cheese.description}</p>
                          {isSelected && (
                            <motion.div
                              className="absolute top-3.5 right-3.5 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center shadow-xs"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            >
                              <Check className="w-3 h-3 text-white stroke-[3]" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      onClick={() => setActiveTab('sauce')}
                      className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                    >
                      ← Back to Sauce
                    </button>
                    <motion.button
                      onClick={() => setActiveTab('veggies')}
                      className="px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      whileHover={shouldReduce ? {} : { scale: 1.03 }}
                      whileTap={shouldReduce ? {} : { scale: 0.97 }}
                    >
                      <span>Next: Choose Veggies</span>
                      <span>→</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: VEGGIES */}
              {activeTab === 'veggies' && (
                <motion.div
                  key="veggies"
                  variants={shouldReduce ? {} : tabContent}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-stone-900 font-display">Step 4: Select Fresh Vegetable Toppings</h3>
                      <p className="text-xs text-stone-500">Pick any combination — watch toppings animate onto the pizza</p>
                    </div>
                    <motion.span
                      key={selectedVeggies.length}
                      className="text-xs font-mono tabular-nums font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200"
                      initial={shouldReduce ? false : { scale: 1.25 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      {selectedVeggies.length} selected
                    </motion.span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {veggies.map((veg, idx) => {
                      const isSelected = selectedVeggies.includes(veg.name);
                      const isLowStock = veg.stock <= veg.threshold;
                      return (
                        <motion.button
                          key={veg.id}
                          type="button"
                          onClick={() => toggleVeggie(veg.name)}
                          className={`ingredient-card relative p-3.5 text-left rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'selected border-amber-600 bg-amber-50/70 ring-2 ring-amber-600/30'
                              : 'border-stone-200 hover:border-amber-400/80 bg-white hover:bg-stone-50/50'
                          }`}
                          initial={shouldReduce ? false : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03, duration: 0.25 }}
                          whileHover={shouldReduce ? {} : { y: -2, boxShadow: '0 6px 14px -3px rgba(0,0,0,0.08)' }}
                          whileTap={shouldReduce ? {} : { scale: 0.95 }}
                        >
                          <div className="flex items-start justify-between gap-1 mb-2">
                            <span className="text-xs font-semibold text-stone-900 leading-snug">{veg.name}</span>
                            <motion.span
                              className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-amber-600 text-white' : 'border border-stone-300 bg-stone-50'
                              }`}
                              animate={isSelected ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <AnimatePresence>
                                {isSelected && (
                                  <motion.span
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </motion.span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
                            <span className="font-mono tabular-nums text-stone-700 font-medium">+${veg.price.toFixed(2)}</span>
                            {isLowStock && <span className="text-amber-700 font-medium low-stock-pulse">Low stock</span>}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="pt-3 flex justify-between items-center">
                    <button
                      onClick={() => setActiveTab('cheese')}
                      className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                    >
                      ← Back to Cheese
                    </button>
                    <motion.button
                      onClick={handleAddToCart}
                      className="px-5 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      whileHover={shouldReduce ? {} : { scale: 1.04 }}
                      whileTap={shouldReduce ? {} : { scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                    >
                      <span>Complete &amp; Add to Bag</span>
                      <span>→</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
