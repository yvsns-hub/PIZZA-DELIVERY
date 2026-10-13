import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Plus, Check, Flame } from 'lucide-react';
import { SpecialtyPizza } from '../types.js';
import { useCart } from '../context/CartContext.js';
import {
  staggerContainer,
  fadeUp,
  scaleFade,
  listItem,
  ease,
} from '../lib/animations.js';

interface SpecialtyMenuProps {
  pizzas: SpecialtyPizza[];
}

export const SpecialtyMenu: React.FC<SpecialtyMenuProps> = ({ pizzas }) => {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = React.useState<string | null>(null);
  const shouldReduce = useReducedMotion();

  const handleAdd = (pizza: SpecialtyPizza) => {
    addToCart({
      name: pizza.name,
      isCustom: false,
      base: pizza.base,
      sauce: pizza.sauce,
      cheese: pizza.cheese,
      veggies: pizza.veggies,
      quantity: 1,
      unitPrice: pizza.price,
      details: pizza.tagline,
      image: pizza.image,
    });
    setJustAdded(pizza.id);
    setTimeout(() => setJustAdded(null), 1800);
  };

  return (
    <section id="specialty-menu" className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header ───────────────────────────────────────────── */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-stone-200"
          initial={shouldReduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: ease.out }}
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
              <motion.span
                animate={shouldReduce ? {} : { rotate: [0, 10, -5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
              >
                <Flame className="w-4 h-4" />
              </motion.span>
              <span>Wood-Fired Specialties</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900">
              Chef&apos;s Signature Selections
            </h2>
          </div>
          <p className="text-sm text-stone-600 mt-2 md:mt-0 max-w-md">
            Classic and gourmet formulas baked in our 900°F stone hearth. Every crust is
            fermented 48 hours for signature blistered edges.
          </p>
        </motion.div>

        {/* ── Product Grid ─────────────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer(0.1, 0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {pizzas.map((pizza) => {
            const isAdded = justAdded === pizza.id;

            return (
              <motion.div
                key={pizza.id}
                variants={shouldReduce ? {} : scaleFade}
                className="card-lift group flex flex-col bg-stone-50/60 rounded-xl border border-stone-200/80 overflow-hidden hover:border-stone-300"
                whileHover={shouldReduce ? {} : { boxShadow: '0 20px 48px -12px rgba(0,0,0,0.15)' }}
              >
                {/* Product Image */}
                <div className="relative aspect-[4/3] w-full bg-stone-200 overflow-hidden pizza-img-frame">
                  <img
                    src={pizza.image}
                    alt={pizza.name}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 text-[11px] font-semibold text-stone-900 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-sm shadow-xs">
                    {pizza.badge}
                  </div>

                  {/* Hover overlay shimmer */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-stone-900/30 to-transparent pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors duration-200">
                        {pizza.name}
                      </h3>
                      <span className="font-mono tabular-nums text-base font-bold text-stone-900">
                        ${pizza.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {pizza.description}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
                      <span>{pizza.base}</span>
                      <span aria-hidden="true">·</span>
                      <span>{pizza.cheese}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-800 font-medium">Stone Hearth</span>
                    </div>
                  </div>

                  {/* Buy CTA */}
                  <div className="pt-2">
                    <motion.button
                      onClick={() => handleAdd(pizza)}
                      className={`w-full py-2.5 px-4 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                        isAdded
                          ? 'bg-emerald-700 text-white'
                          : 'bg-stone-900 hover:bg-stone-800 text-white shadow-xs'
                      }`}
                      whileTap={shouldReduce ? {} : { scale: 0.96 }}
                      layout
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {isAdded ? (
                          <motion.span
                            key="added"
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.25, ease: ease.out }}
                          >
                            <span className="check-bounce inline-flex">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                            <span>Added to Bag</span>
                          </motion.span>
                        ) : (
                          <motion.span
                            key="add"
                            className="flex items-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Bag</span>
                            <span className="opacity-75 font-mono tabular-nums">
                              (${pizza.price.toFixed(2)})
                            </span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
