import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Sparkles, ArrowRight, Clock, Flame, Award } from 'lucide-react';
import { staggerContainer, fadeUp, scaleFade, ease } from '../lib/animations.js';

interface HeroSectionProps {
  onStartCustom: () => void;
  onExploreMenu: () => void;
}

// Ambient floating particle data
const PARTICLES = [
  { top: '18%', left: '8%',  size: 6,  dur: '5.2s', delay: '0s',   opacity: 0.35 },
  { top: '72%', left: '12%', size: 4,  dur: '4.1s', delay: '0.8s', opacity: 0.25 },
  { top: '30%', left: '88%', size: 5,  dur: '6s',   delay: '1.2s', opacity: 0.30 },
  { top: '80%', left: '82%', size: 3,  dur: '4.8s', delay: '0.3s', opacity: 0.20 },
  { top: '55%', left: '5%',  size: 4,  dur: '5.5s', delay: '1.9s', opacity: 0.22 },
  { top: '10%', left: '60%', size: 3,  dur: '3.8s', delay: '0.6s', opacity: 0.18 },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartCustom, onExploreMenu }) => {
  const shouldReduce = useReducedMotion();
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <section className="relative bg-stone-900 text-stone-100 overflow-hidden">

      {/* ── Ambient radial glow backdrop ────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 65% 50%, rgba(120,53,15,0.32) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 92% 15%, rgba(217,119,6,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 30% 40% at 10% 85%, rgba(180,83,9,0.10) 0%, transparent 55%)
          `,
        }}
      />

      {/* ── Floating ambient particles ───────────────────────────────────── */}
      {!shouldReduce && PARTICLES.map((p, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="particle absolute rounded-full bg-amber-500 pointer-events-none gpu"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            '--dur': p.dur,
            '--delay': p.delay,
          } as React.CSSProperties}
        />
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* ── Left Column ───────────────────────────────────────────────── */}
          <motion.div
            className="lg:col-span-6 space-y-6"
            variants={staggerContainer(0.1, 0.05)}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-2 text-xs font-medium text-amber-400 uppercase tracking-widest"
            >
              <span>Naturally Fermented Dough</span>
              <span aria-hidden="true">·</span>
              <span>Wood-Fired Stone Oven</span>
              <span aria-hidden="true">·</span>
              <span>Real-Time Tracking</span>
            </motion.div>

            {/* H1 — with word-reveal stagger */}
            <motion.h1
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
              }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] text-balance"
            >
              {['Artisan Pizza,', 'Crafted Your Way.'].map((line, li) => (
                <motion.span
                  key={li}
                  className="block"
                  variants={{
                    hidden: { opacity: 0, y: 32, skewY: 2 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      skewY: 0,
                      transition: { duration: 0.6, ease: ease.out },
                    },
                  }}
                >
                  {line}
                </motion.span>
              ))}
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              className="text-stone-300 text-base sm:text-lg max-w-xl leading-relaxed"
            >
              Build your custom master pie across 5 distinct crust styles, 5 slow-simmered
              sauces, authentic cheeses, and garden-fresh vegetables — or select from our
              chef&apos;s wood-fired specialties.
            </motion.p>

            {/* CTA Row */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <motion.button
                onClick={onStartCustom}
                className="btn-amber-glow btn-press inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-md shadow-sm"
                whileHover={shouldReduce ? {} : { scale: 1.03 }}
                whileTap={shouldReduce ? {} : { scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <span>Build Custom Pizza</span>
                <motion.span
                  animate={shouldReduce ? {} : { x: [0, 3, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </motion.button>

              <motion.button
                onClick={onExploreMenu}
                className="btn-press inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-stone-200 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-md transition-colors"
                whileHover={shouldReduce ? {} : { scale: 1.02 }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                Explore Chef Menu
              </motion.button>
            </motion.div>

            {/* Proof Bar */}
            <motion.div
              variants={fadeUp}
              className="pt-6 border-t border-stone-800 flex items-center gap-6 text-xs text-stone-400"
            >
              {[
                { icon: <Clock className="w-4 h-4 text-amber-400" />, label: '30-Min Hot Delivery' },
                { icon: <Flame className="w-4 h-4 text-amber-400" />, label: '900°F Stone Hearth' },
                { icon: <Award className="w-4 h-4 text-amber-400" />, label: '100% Verified Ingredients' },
              ].map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span aria-hidden="true" className="text-stone-700">·</span>}
                  <motion.div
                    className="flex items-center gap-1.5"
                    whileHover={shouldReduce ? {} : { y: -1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </motion.div>
                </React.Fragment>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right Column: Hero Image ──────────────────────────────────── */}
          <motion.div
            className="lg:col-span-6"
            initial={shouldReduce ? false : { opacity: 0, scale: 0.92, rotate: -1.5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.75, ease: ease.out, delay: 0.2 }}
          >
            <motion.div
              className="relative rounded-xl overflow-hidden border border-stone-800 shadow-2xl bg-stone-950 aspect-[16/10] pizza-img-frame gpu"
              whileHover={shouldReduce ? {} : { scale: 1.015, rotate: 0.4 }}
              transition={{ type: 'spring', stiffness: 200, damping: 28 }}
              style={{
                boxShadow: '0 32px 80px -16px rgba(0,0,0,0.65), 0 0 40px rgba(180,83,9,0.25)',
              }}
            >
              {/* Shimmer while loading */}
              {!imgLoaded && (
                <div className="absolute inset-0 skeleton" aria-hidden="true" />
              )}

              <img
                src="/src/assets/images/pizza_hero_woodfired_1791884206805.jpg"
                alt="Artisanal hand-crafted pizza coming out of stone wood-fired oven"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
                loading="eager"
                onLoad={() => setImgLoaded(true)}
                style={{
                  opacity: imgLoaded ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                }}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />

              {/* Caption overlay */}
              <motion.div
                className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-stone-300 pointer-events-none"
                initial={shouldReduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <span className="font-medium text-white">Live Kitchen Oven Feed</span>
                <span className="font-mono tabular-nums text-amber-300">
                  San Marzano DOP &amp; Fior Di Latte
                </span>
              </motion.div>

              {/* Amber corner accent */}
              <div
                aria-hidden="true"
                className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at top right, rgba(217,119,6,0.28) 0%, transparent 70%)',
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
