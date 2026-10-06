// RhetoGym logo — a speech bubble carrying a soundwave. Dynamic, modern, speech-connected.
// Variants: <Logo /> wordmark, <LogoMark /> icon only.

export function LogoMark({ className = "", size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      role="img"
      aria-label="RhetoGym"
    >
      <defs>
        <linearGradient id="rg-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--sky-deep))" />
          <stop offset="1" stopColor="hsl(var(--lavender-deep))" />
        </linearGradient>
      </defs>
      {/* speech bubble */}
      <path
        d="M8 6h24a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H16l-7 6v-6H8a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4Z"
        fill="url(#rg-grad)"
      />
      {/* soundwave */}
      <g fill="hsl(var(--cream))">
        <rect x="13" y="16" width="2.6" height="8" rx="1.3" />
        <rect x="18.7" y="12" width="2.6" height="12" rx="1.3" />
        <rect x="24.4" y="14" width="2.6" height="8" rx="1.3" />
      </g>
    </svg>
  );
}

export default function Logo({ className = "", iconSize = 32, showWord = true }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={iconSize} className="shrink-0" />
      {showWord && (
        <span className="font-display text-2xl font-semibold tracking-tight text-charcoal leading-none">
          RHETO<span className="text-gradient">GYM</span>
        </span>
      )}
    </span>
  );
}
