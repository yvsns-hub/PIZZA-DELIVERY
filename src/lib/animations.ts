/**
 * Shared Motion animation variants & transition presets
 * Single source of truth — imported by every dashboard and view component.
 */

// ── Core Easings ──────────────────────────────────────────────────────────────
export const ease = {
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  outSoft: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOut: [0.45, 0, 0.55, 1] as [number, number, number, number],
  spring: { type: 'spring', stiffness: 350, damping: 30 } as const,
  springGentle: { type: 'spring', stiffness: 220, damping: 24 } as const,
  springBouncy: { type: 'spring', stiffness: 420, damping: 22 } as const,
  springCrisp: { type: 'spring', stiffness: 500, damping: 28 } as const,
};

// ── Transition Presets ────────────────────────────────────────────────────────
export const transition = {
  fast: { duration: 0.18, ease: ease.out },
  base: { duration: 0.32, ease: ease.out },
  slow: { duration: 0.55, ease: ease.out },
  spring: ease.spring,
  springGentle: ease.springGentle,
  springCrisp: ease.springCrisp,
};

// ── Reusable Variants ─────────────────────────────────────────────────────────

/** Page transition — subtle opacity and vertical movement */
export const pageTransition = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: ease.out },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: ease.inOut },
  },
};

/** Fade + slide up — standard section entrance */
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: ease.out },
  },
};

/** Fade in only */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: ease.out } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: ease.inOut } },
};

/** Scale + fade — for cards, images, modals */
export const scaleFade = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: ease.out },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: ease.inOut },
  },
};

/** Slide in from right — cart drawer */
export const slideInRight = {
  hidden: { x: '100%', opacity: 0.5 },
  visible: { x: 0, opacity: 1, transition: ease.spring },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.25, ease: ease.inOut } },
};

/** Slide in from left */
export const slideInLeft = {
  hidden: { x: '-100%', opacity: 0.5 },
  visible: { x: 0, opacity: 1, transition: ease.spring },
  exit: { x: '-100%', opacity: 0, transition: { duration: 0.25, ease: ease.inOut } },
};

/** Modal appear — scale from 0.94 */
export const modalScale = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: ease.springGentle,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 8,
    transition: { duration: 0.2, ease: ease.inOut },
  },
};

/** Backdrop fade */
export const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/** Stagger container for children */
export const staggerContainer = (stagger = 0.06, delayChildren = 0.04) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** List item — fast fade-up for order rows & table items */
export const listItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: ease.out } },
  exit: {
    opacity: 0,
    x: 20,
    height: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    overflow: 'hidden',
    transition: { duration: 0.22, ease: ease.out },
  },
};

/** Tab content — cross-fade when switching tabs */
export const tabContent = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: ease.out } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

/** Notification banner — smooth drop down & collapse */
export const notificationBanner = {
  hidden: { opacity: 0, y: -12, height: 0, marginTop: 0, marginBottom: 0 },
  visible: {
    opacity: 1,
    y: 0,
    height: 'auto',
    transition: { duration: 0.28, ease: ease.out },
  },
  exit: {
    opacity: 0,
    y: -8,
    height: 0,
    marginTop: 0,
    marginBottom: 0,
    overflow: 'hidden',
    transition: { duration: 0.22, ease: ease.inOut },
  },
};

/** Pulse ring — for active order step */
export const pulseRing = {
  animate: {
    scale: [1, 1.4, 1],
    opacity: [0.6, 0, 0.6],
    transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
  },
};

/** Interactive button press preset */
export const buttonPress = {
  hover: { scale: 1.02 },
  tap: { scale: 0.96 },
  transition: { duration: 0.15 },
};
