import React from 'react';

// Photorealistic, appetizing SVG/graphic components for toppings
// Each topping has realistic shading, depth, highlights, and food textures.

export const MushroomSlice: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 40 40" className={`w-8 h-8 filter drop-shadow-[0_3px_3px_rgba(0,0,0,0.65)] ${className}`}>
    <defs>
      <linearGradient id="shroomCap" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8d6e63" />
        <stop offset="50%" stopColor="#6d4c41" />
        <stop offset="100%" stopColor="#4e342e" />
      </linearGradient>
      <linearGradient id="shroomGills" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3e2723" />
        <stop offset="100%" stopColor="#271c19" />
      </linearGradient>
      <linearGradient id="shroomStem" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#d7ccc8" />
        <stop offset="50%" stopColor="#efebe9" />
        <stop offset="100%" stopColor="#bcaaa4" />
      </linearGradient>
    </defs>
    {/* Cap */}
    <path
      d="M6 22 C6 11, 14 5, 20 5 C26 5, 34 11, 34 22 C34 24, 32 25, 29 24 C26 23, 23 23, 20 23 C17 23, 14 23, 11 24 C8 25, 6 24, 6 22 Z"
      fill="url(#shroomCap)"
    />
    {/* Gills fringe underneath cap */}
    <path
      d="M10 22 C13 21, 16 20.5, 20 20.5 C24 20.5, 27 21, 30 22 C29 23.5, 26 24.5, 20 24.5 C14 24.5, 11 23.5, 10 22 Z"
      fill="url(#shroomGills)"
    />
    {/* Stem */}
    <path
      d="M17 21 L16 35 C16 36.5, 24 36.5, 24 35 L23 21 Z"
      fill="url(#shroomStem)"
    />
    {/* Sauteed browned edges and toasted spots */}
    <ellipse cx="20" cy="10" rx="4" ry="2" fill="#3e2723" opacity="0.45" />
    <ellipse cx="14" cy="14" rx="2" ry="1.5" fill="#3e2723" opacity="0.35" />
    <ellipse cx="27" cy="15" rx="2.5" ry="1.5" fill="#3e2723" opacity="0.4" />
  </svg>
);

export const BellPepperPiece: React.FC<{ color?: 'green' | 'red' | 'yellow'; className?: string }> = ({
  color = 'green',
  className = '',
}) => {
  const gradientMap = {
    green: { start: '#2e7d32', mid: '#43a047', end: '#1b5e20', skin: '#81c784' },
    red: { start: '#c62828', mid: '#e53935', end: '#b71c1c', skin: '#ef5350' },
    yellow: { start: '#f9a825', mid: '#fbc02d', end: '#f57f17', skin: '#fff176' },
  }[color];

  return (
    <svg viewBox="0 0 44 26" className={`w-9 h-6 filter drop-shadow-[0_3px_3px_rgba(0,0,0,0.65)] ${className}`}>
      <defs>
        <linearGradient id={`pepperGrad_${color}`} x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={gradientMap.start} />
          <stop offset="50%" stopColor={gradientMap.mid} />
          <stop offset="100%" stopColor={gradientMap.end} />
        </linearGradient>
      </defs>
      {/* Curved slice */}
      <path
        d="M5 21 C12 6, 32 6, 39 19 C37 23, 31 16, 22 14 C13 12, 7 17, 5 21 Z"
        fill={`url(#pepperGrad_${color})`}
      />
      {/* Inner crisp flesh highlight */}
      <path
        d="M8 18 C14 9, 30 9, 36 17"
        stroke={gradientMap.skin}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* Roasted char tip */}
      <circle cx="38" cy="18" r="1.5" fill="#212121" opacity="0.5" />
      <circle cx="6" cy="20" r="1.2" fill="#212121" opacity="0.5" />
    </svg>
  );
};

export const OnionRing: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 42 32" className={`w-9 h-7 filter drop-shadow-[0_3px_3px_rgba(0,0,0,0.65)] ${className}`}>
    <defs>
      <linearGradient id="onionSkin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#880e4f" />
        <stop offset="40%" stopColor="#ad1457" />
        <stop offset="100%" stopColor="#6a1b9a" />
      </linearGradient>
      <linearGradient id="onionFlesh" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f8bbd0" />
        <stop offset="50%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f48fb1" />
      </linearGradient>
    </defs>
    {/* Outer skin curve */}
    <path
      d="M4 26 C9 8, 33 8, 38 24 C35 24, 30 14, 21 14 C12 14, 7 24, 4 26 Z"
      fill="url(#onionSkin)"
    />
    {/* Inner translucent ring */}
    <path
      d="M7 23 C11 11, 31 11, 35 21"
      stroke="url(#onionFlesh)"
      strokeWidth="2.2"
      fill="none"
      strokeLinecap="round"
      opacity="0.9"
    />
    {/* Caramelized golden tip */}
    <circle cx="5" cy="25" r="1.2" fill="#4a148c" />
    <circle cx="37" cy="23" r="1.4" fill="#3e2723" opacity="0.7" />
  </svg>
);

export const BlackOliveSlice: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 28 28" className={`w-6 h-6 filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)] ${className}`}>
    <defs>
      <radialGradient id="oliveGrad" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#424242" />
        <stop offset="60%" stopColor="#212121" />
        <stop offset="100%" stopColor="#111111" />
      </radialGradient>
    </defs>
    {/* Outer olive ring */}
    <circle cx="14" cy="14" r="12" fill="url(#oliveGrad)" />
    {/* Hollow pit center */}
    <circle cx="14" cy="14" r="5.5" fill="#271c19" />
    {/* Juicy sheen highlight */}
    <ellipse cx="10" cy="9" rx="3.5" ry="1.8" fill="#ffffff" opacity="0.35" transform="rotate(-30 10 9)" />
  </svg>
);

export const JalapenoSlice: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 32 32" className={`w-7 h-7 filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.65)] ${className}`}>
    <defs>
      <radialGradient id="jalapenoGrad" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#388e3c" />
        <stop offset="60%" stopColor="#2e7d32" />
        <stop offset="100%" stopColor="#1b5e20" />
      </radialGradient>
    </defs>
    {/* Outer ribbed ring */}
    <circle cx="16" cy="16" r="14" fill="url(#jalapenoGrad)" />
    {/* Inner cavity */}
    <circle cx="16" cy="16" r="6" fill="#1b5e20" opacity="0.9" />
    {/* Seeds */}
    <circle cx="14" cy="14" r="1.4" fill="#fff9c4" />
    <circle cx="18" cy="15" r="1.3" fill="#fff9c4" />
    <circle cx="15" cy="18" r="1.3" fill="#fff59d" />
    {/* Ring highlight */}
    <path d="M7 11 C10 6, 22 6, 25 11" stroke="#81c784" strokeWidth="1.6" fill="none" opacity="0.65" />
  </svg>
);

export const CornCluster: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 32 26" className={`w-7 h-5 filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)] ${className}`}>
    <defs>
      <linearGradient id="cornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff59d" />
        <stop offset="50%" stopColor="#fbc02d" />
        <stop offset="100%" stopColor="#f57f17" />
      </linearGradient>
    </defs>
    {/* Kernel 1 */}
    <ellipse cx="9" cy="13" rx="5" ry="6" fill="url(#cornGrad)" transform="rotate(-15 9 13)" />
    <ellipse cx="8" cy="11" rx="2" ry="1.2" fill="#fff" opacity="0.6" />
    {/* Kernel 2 */}
    <ellipse cx="17" cy="11" rx="5.5" ry="6.5" fill="url(#cornGrad)" transform="rotate(10 17 11)" />
    <ellipse cx="16" cy="9" rx="2.2" ry="1.4" fill="#fff" opacity="0.6" />
    {/* Kernel 3 */}
    <ellipse cx="23" cy="16" rx="4.5" ry="5.5" fill="url(#cornGrad)" transform="rotate(-20 23 16)" />
    {/* Charred speck */}
    <circle cx="17" cy="14" r="1" fill="#4e342e" opacity="0.75" />
  </svg>
);

export const BasilLeaf: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 42 36" className={`w-9 h-8 filter drop-shadow-[0_3px_4px_rgba(0,0,0,0.65)] ${className}`}>
    <defs>
      <linearGradient id="basilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#43a047" />
        <stop offset="45%" stopColor="#2e7d32" />
        <stop offset="100%" stopColor="#1b5e20" />
      </linearGradient>
    </defs>
    {/* Leaf teardrop curve */}
    <path
      d="M6 30 C5 18, 14 6, 36 6 C36 22, 26 33, 6 30 Z"
      fill="url(#basilGrad)"
    />
    {/* Central leaf vein */}
    <path
      d="M9 28 C16 22, 25 15, 34 8"
      stroke="#66bb6a"
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
      opacity="0.8"
    />
    {/* Side veins */}
    <path d="M16 23 C20 20, 24 21, 27 24" stroke="#66bb6a" strokeWidth="0.8" fill="none" opacity="0.6" />
    <path d="M21 18 C24 14, 27 15, 30 17" stroke="#66bb6a" strokeWidth="0.8" fill="none" opacity="0.6" />
    {/* Olive oil sheen */}
    <ellipse cx="22" cy="13" rx="5" ry="2.2" fill="#fff" opacity="0.3" transform="rotate(-25 22 13)" />
  </svg>
);

export const CherryTomatoHalf: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 34 34" className={`w-7 h-7 filter drop-shadow-[0_3px_3px_rgba(0,0,0,0.65)] ${className}`}>
    <defs>
      <radialGradient id="tomatoSkin" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#ef5350" />
        <stop offset="70%" stopColor="#d32f2f" />
        <stop offset="100%" stopColor="#b71c1c" />
      </radialGradient>
      <radialGradient id="tomatoFlesh" cx="45%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#ff7043" />
        <stop offset="100%" stopColor="#c62828" />
      </radialGradient>
    </defs>
    {/* Round base */}
    <circle cx="17" cy="17" r="15" fill="url(#tomatoSkin)" />
    {/* Cavities */}
    <ellipse cx="13" cy="14" rx="5" ry="4" fill="url(#tomatoFlesh)" />
    <ellipse cx="21" cy="19" rx="5" ry="4" fill="url(#tomatoFlesh)" />
    {/* Seeds in jelly */}
    <ellipse cx="13" cy="14" rx="2" ry="1.2" fill="#fff59d" />
    <ellipse cx="21" cy="19" rx="2" ry="1.2" fill="#fff59d" />
    {/* Blistered skin highlight */}
    <ellipse cx="14" cy="8" rx="4" ry="1.6" fill="#fff" opacity="0.4" transform="rotate(-15 14 8)" />
    <circle cx="27" cy="13" r="1.5" fill="#3e2723" opacity="0.6" />
  </svg>
);

export const GarlicConfitClove: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 32 36" className={`w-7 h-8 filter drop-shadow-[0_3px_3px_rgba(0,0,0,0.65)] ${className}`}>
    <defs>
      <linearGradient id="garlicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff8e1" />
        <stop offset="45%" stopColor="#ffe082" />
        <stop offset="85%" stopColor="#ffb300" />
        <stop offset="100%" stopColor="#8d6e63" />
      </linearGradient>
    </defs>
    {/* Tear-shaped roasted clove */}
    <path
      d="M16 4 C24 12, 28 22, 24 30 C20 34, 12 34, 8 30 C4 22, 8 12, 16 4 Z"
      fill="url(#garlicGrad)"
    />
    {/* Caramelized ridge */}
    <path d="M16 6 C18 14, 18 24, 15 31" stroke="#d7ccc8" strokeWidth="1" fill="none" opacity="0.6" />
    {/* Char point */}
    <circle cx="21" cy="27" r="1.8" fill="#4e342e" opacity="0.75" />
    {/* Translucent oil glaze */}
    <ellipse cx="14" cy="16" rx="3.5" ry="5" fill="#fff" opacity="0.45" transform="rotate(-10 14 16)" />
  </svg>
);
