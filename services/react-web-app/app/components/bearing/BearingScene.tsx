import { useMemo } from "react";

interface BearingSceneProps {
  rpm: number;
  direction: "cw" | "ccw";
  isPlaying: boolean;
}

export default function BearingScene({ rpm, direction, isPlaying }: BearingSceneProps) {
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
        <svg viewBox="0 0 100 100" className="w-[min(70vh,70vw)] h-[min(70vh,70vw)] max-w-[640px] max-h-[640px]">
          <circle cx="50" cy="50" r="47" fill="none" stroke="#5f7c9f" strokeWidth="4" />
          <circle cx="50" cy="50" r="41" fill="none" stroke="#9db6cb" strokeWidth="6" />

          <g
            style={{
              transformOrigin: "50% 50%",
              animation: isPlaying ? `bearingSpin ${ringDuration} linear infinite` : "none",
              animationDirection: spinDirection,
            }}
          >
            <circle cx="50" cy="50" r="33" fill="none" stroke="#c9a24a" strokeWidth="2.2" />
            {balls.map((b) => (
              <circle key={b.i} cx={b.x} cy={b.y} r="4.2" fill="#f4fbff" stroke="#8ea8c5" strokeWidth="0.8" />
            ))}
          </g>

          <g
            style={{
              transformOrigin: "50% 50%",
              animation: isPlaying ? `bearingSpin ${cageDuration} linear infinite` : "none",
              animationDirection: spinDirection,
            }}
          >
            <circle cx="50" cy="50" r="27" fill="none" stroke="#d7e8f8" strokeWidth="6" />
            <circle cx="50" cy="23" r="1.8" fill="#ff4fd8" />
          </g>

          <circle cx="50" cy="50" r="2" fill="#7fe3ff" />
        </svg>
      </div>
    </div>
  );
}
