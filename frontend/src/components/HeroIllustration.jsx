export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 420 420" style={{ overflow: 'visible' }} role="img" aria-label="Deux stocks d'opticiens qui s'échangent">
      <defs>
        <radialGradient id="heroBlobViolet" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="heroBlobTeal" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#107f72" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#107f72" stopOpacity="0" />
        </radialGradient>
        <filter id="heroBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="30" />
        </filter>
        <filter id="heroCardShadow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#14171c" floodOpacity="0.18" />
        </filter>
        <linearGradient id="heroCardStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#107f72" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* Halos flous en arrière-plan, façon "aurora" */}
      <circle cx="140" cy="160" r="150" fill="url(#heroBlobViolet)" filter="url(#heroBlur)" />
      <circle cx="290" cy="270" r="150" fill="url(#heroBlobTeal)" filter="url(#heroBlur)" />

      {/* Carte "verre dépoli" flottante, légèrement inclinée */}
      <g transform="rotate(-6 210 210)">
        <rect
          x="110" y="110" width="200" height="200" rx="32"
          fill="#fdfcfb" fillOpacity="0.72"
          stroke="url(#heroCardStroke)" strokeWidth="1.5"
          filter="url(#heroCardShadow)"
        />
        <g transform="translate(210 210)">
          <circle cx="-30" cy="0" r="28" fill="none" stroke="#14171c" strokeWidth="5" strokeLinecap="round" />
          <circle cx="30" cy="0" r="28" fill="none" stroke="#14171c" strokeWidth="5" strokeLinecap="round" />
          <circle cx="-30" cy="0" r="28" fill="#7c3aed" fillOpacity="0.08" />
          <circle cx="30" cy="0" r="28" fill="#107f72" fillOpacity="0.08" />
          <path d="M -2 0 H 2" stroke="#14171c" strokeWidth="5" strokeLinecap="round" />
          <path d="M -58 -5 C -70 -10, -71 6, -60 8" fill="none" stroke="#14171c" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 58 -5 C 70 -10, 71 6, 60 8" fill="none" stroke="#14171c" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* Badge "échange" flottant, ancré sur le coin de la carte */}
      <g transform="translate(302 138)" filter="url(#heroCardShadow)">
        <circle r="26" fill="#14171c" />
        <path d="M -10 -4 H 8 M 8 -4 L 3 -9 M 8 -4 L 3 1" stroke="#fdfcfb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M 10 5 H -8 M -8 5 L -3 10 M -8 5 L -3 0" stroke="#fdfcfb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      <circle cx="96" cy="330" r="5" fill="#7c3aed" fillOpacity="0.6" />
      <circle cx="336" cy="330" r="4" fill="#107f72" fillOpacity="0.45" />
      <circle cx="86" cy="96" r="3.5" fill="#7c3aed" fillOpacity="0.3" />
    </svg>
  )
}
