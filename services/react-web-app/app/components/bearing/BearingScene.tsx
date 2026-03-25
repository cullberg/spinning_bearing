import { useMemo } from "react";

interface BearingSceneProps {
  rpm: number;
  direction: "cw" | "ccw";
  isPlaying: boolean;
  /** Radial load in kN (applied downward) */
  loadForce?: number;
}

export default function BearingScene({ rpm, direction, isPlaying, loadForce = 0 }: BearingSceneProps) {
  const ringDuration = useMemo(() => {
    if (!isPlaying || rpm <= 0) return "0s";
    const r = Math.max(0.1, rpm);
    return `${60 / r}s`;
  }, [isPlaying, rpm]);

  const cageDuration = useMemo(() => {
    if (!isPlaying || rpm <= 0) return "0s";
    const r = Math.max(0.1, rpm * 0.4);
    return `${60 / r}s`;
  }, [isPlaying, rpm]);

  const spinDirection = direction === "cw" ? "normal" : "reverse";

  // Exaggerated visual deflection in SVG units (bearing viewBox is 100×100)
  // At 1 kN this shifts ~6 SVG units — clearly visible against the 47-radius outer ring
  const deflectY = loadForce * 6;

  const balls = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2;
    const x = 50 + Math.cos(a) * 35;
    const y = 50 + Math.sin(a) * 35;
    return { x, y, i };
  });

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "radial-gradient(circle at 50% 45%, #111936 0%, #0b1026 50%, #080b1b 100%)" }}>
      <style>{`
        @keyframes bearingSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div className="absolute inset-0 grid place-items-center">
        <svg viewBox="-10 -50 120 160" className="w-[min(70vh,70vw)] h-[min(70vh,70vw)] max-w-[640px] max-h-[640px]">
          <circle cx="50" cy="50" r="47" fill="none" stroke="#5f7c9f" strokeWidth="4" />
          <circle cx="50" cy="50" r="41" fill="none" stroke="#9db6cb" strokeWidth="6" />

          <g transform={`translate(0, ${deflectY})`}>
            <g
              style={{
                transformOrigin: "50px 50px",
                animation: isPlaying ? `bearingSpin ${ringDuration} linear infinite` : "none",
                animationDirection: spinDirection,
              }}
            >
              <circle cx="50" cy="50" r="33" fill="none" stroke="#c9a24a" strokeWidth="2.2" />
              {balls.map((b) => (
                <circle key={b.i} cx={b.x} cy={b.y} r="4.2" fill="#f4fbff" stroke="#8ea8c5" strokeWidth="0.8" />
              ))}
            </g>
          </g>

          <g transform={`translate(0, ${deflectY * 0.5})`}>
            <g
              style={{
                transformOrigin: "50px 50px",
                animation: isPlaying ? `bearingSpin ${cageDuration} linear infinite` : "none",
                animationDirection: spinDirection,
              }}
            >
              <circle cx="50" cy="50" r="27" fill="none" stroke="#d7e8f8" strokeWidth="6" />
              <circle cx="50" cy="23" r="1.8" fill="#ff4fd8" />
            </g>
          </g>

          <circle cx="50" cy={50 + deflectY} r="2" fill="#7fe3ff" />

          {/* Force arrow — shown when radial load is applied */}
          {loadForce > 0 && (
            <g>
              <line x1="50" y1="-4" x2="50" y2={-4 - loadForce * 8} stroke="#ff4444" strokeWidth="2.5" />
              <polygon points={`46,-4 54,-4 50,4`} fill="#ff4444" />
              <text x="56" y={-4 - loadForce * 4} fill="#ff6666" fontSize="4.5" fontWeight="bold" fontFamily="monospace">
                {loadForce.toFixed(1)} kN ↓
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
