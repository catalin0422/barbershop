export function BarbershopLogo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer ring */}
      <circle cx="50" cy="50" r="48" fill="#0a0a0a" stroke="#d4af37" strokeWidth="2" />
      {/* Inner ring */}
      <circle cx="50" cy="50" r="40" fill="none" stroke="#d4af37" strokeWidth="0.8" strokeDasharray="2 3" />

      {/* Curved top text: BARBERSHOP */}
      <path id="topArc" d="M 12,50 A 38,38 0 0,1 88,50" fill="none" />
      <text fontSize="11" fontFamily="'Bebas Neue', sans-serif" fontWeight="700" letterSpacing="3" fill="#d4af37">
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">
          BARBERSHOP
        </textPath>
      </text>

      {/* Curved bottom text: EST 2025 */}
      <path id="botArc" d="M 18,55 A 34,34 0 0,0 82,55" fill="none" />
      <text fontSize="9.5" fontFamily="'Bebas Neue', sans-serif" fontWeight="700" letterSpacing="4" fill="#d4af37">
        <textPath href="#botArc" startOffset="50%" textAnchor="middle">
          EST · 2025
        </textPath>
      </text>

      {/* Center: scissors icon drawn as SVG paths */}
      {/* Blade 1 */}
      <line x1="38" y1="38" x2="62" y2="62" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="62" y1="38" x2="38" y2="62" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Circles at ends (handles) */}
      <circle cx="36" cy="36" r="5" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="64" cy="36" r="5" fill="none" stroke="white" strokeWidth="2" />
      {/* Center dot */}
      <circle cx="50" cy="50" r="2.5" fill="#d4af37" />

      {/* Small decorative diamonds */}
      <polygon points="50,14 51.5,16 50,18 48.5,16" fill="#d4af37" />
      <polygon points="50,82 51.5,84 50,86 48.5,84" fill="#d4af37" />
    </svg>
  );
}
