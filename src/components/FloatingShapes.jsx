import { useMemo } from "react";

// Floating pastel organic blobs + drifting words for the ambient background.
export default function FloatingShapes({ words = [], density = "normal", className = "" }) {
  const blobs = useMemo(
    () => [
      { c: "var(--lavender)", s: 380, top: "8%", left: "-6%", anim: "float-slow", dur: 18, op: 0.5, shape: "blob-a" },
      { c: "var(--coral)", s: 300, top: "55%", left: "78%", anim: "float-slower", dur: 22, op: 0.45, shape: "blob-b" },
      { c: "var(--sky)", s: 260, top: "70%", left: "5%", anim: "float-slow", dur: 20, op: 0.4, shape: "blob-c" },
      { c: "var(--butter)", s: 220, top: "20%", left: "82%", anim: "drift", dur: 9, op: 0.4, shape: "blob-d" },
      { c: "var(--sage)", s: 180, top: "38%", left: "44%", anim: "float-slower", dur: 26, op: 0.3, shape: "blob-a" },
    ],
    []
  );

  const wordEls = useMemo(
    () =>
      words.map((w, i) => ({
        text: w,
        top: `${10 + ((i * 17) % 70)}%`,
        left: `${8 + ((i * 29) % 80)}%`,
        dur: 9 + (i % 5) * 2,
        delay: i * 1.3,
      })),
    [words]
  );

  const showBlobs = density === "light" ? blobs.slice(0, 3) : blobs;

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {showBlobs.map((b, i) => (
        <div
          key={i}
          className={`absolute blur-2xl animate-${b.anim} ${b.shape}`}
          style={{
            width: b.s,
            height: b.s,
            top: b.top,
            left: b.left,
            background: `hsl(${b.c})`,
            opacity: b.op,
            animationDuration: `${b.dur}s`,
          }}
        />
      ))}
      {wordEls.map((w, i) => (
        <span
          key={i}
          className="absolute hidden sm:block font-mono text-sm font-semibold tracking-widest text-charcoal/25"
          style={{
            top: w.top,
            left: w.left,
            animation: `word-float ${w.dur}s ease-in-out ${w.delay}s infinite`,
          }}
        >
          {w.text}
        </span>
      ))}
    </div>
  );
}
