import { useMemo, useRef, useState, useEffect, useCallback } from "react";

interface BearingSceneProps {
  rpm: number;
  direction: "cw" | "ccw";
  isPlaying: boolean;
  /** Radial load in kN (applied downward) */
  loadForce?: number;
  /** Show bearing housing around outer ring */
  showHousing?: boolean;
}

export default function BearingScene({ rpm, direction, isPlaying, loadForce = 0, showHousing = false }: BearingSceneProps) {
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

  // Exaggerated visual deflection in SVG units, but clamped so the inner
  // assembly never exceeds the outer ring. The inner race clearance in SVG
  // units is roughly outerR2 - ball orbit radius (41 - 35 = 6), so cap at ~3.
  const maxDeflect = 3;
  const deflectY = Math.min(loadForce * 1.5, maxDeflect);

  // Outer ring ovalization: under radial load the race becomes slightly elliptical
  // — compressed vertically, expanded horizontally (exaggerated for visibility)
  const ovalFactor = loadForce * 1.2; // SVG units of distortion per kN
  const outerR = 47;
  const outerR2 = 41;
  const outerRx = outerR + ovalFactor;
  const outerRy = outerR - ovalFactor;
  const outerRx2 = outerR2 + ovalFactor * 0.8;
  const outerRy2 = outerR2 - ovalFactor * 0.8;

  const BALL_COUNT = 9;
  const BALL_ORBIT_R = 35;

  // JS-animated cage angle so balls orbit independently of CSS rotation
  const cageAngleRef = useRef(0);
  const lastTimeRef = useRef(0);
  const [ballPositions, setBallPositions] = useState(() =>
    Array.from({ length: BALL_COUNT }, (_, i) => {
      const a = (i / BALL_COUNT) * Math.PI * 2;
      return { x: 50 + Math.cos(a) * BALL_ORBIT_R, y: 50 + Math.sin(a) * BALL_ORBIT_R, a };
    }),
  );

  const animateBalls = useCallback(
    (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlaying && rpm > 0) {
        const sign = direction === "cw" ? 1 : -1;
        // Cage speed ≈ 40% of shaft speed
        const cageW = sign * (rpm / 60) * Math.PI * 2 * 0.4;
        cageAngleRef.current += cageW * delta;

        setBallPositions(
          Array.from({ length: BALL_COUNT }, (_, i) => {
            const a = (i / BALL_COUNT) * Math.PI * 2 + cageAngleRef.current;
            return {
              x: 50 + Math.cos(a) * BALL_ORBIT_R,
              y: 50 + Math.sin(a) * BALL_ORBIT_R,
              a,
            };
          }),
        );
      }
    },
    [isPlaying, rpm, direction],
  );

  useEffect(() => {
    let frameId: number;
    const loop = (time: number) => {
      animateBalls(time);
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [animateBalls]);

  // Per-ball deformation based on CURRENT screen position, fixed at 12 & 6 o'clock
  const ballShapes = useMemo(() => {
    return ballPositions.map((b, i) => {
      // sin(a): ±1 at top/bottom (12 & 6), 0 at sides (3 & 9)
      const loadZone = Math.abs(Math.sin(b.a));
      const inLoadZone = loadZone > 0.5 && loadForce > 0;
      const squish = loadZone * loadForce * 0.12;
      const rx = 4.2 + squish * 1.5;
      const ry = Math.max(1.5, 4.2 - squish * 3);
      return { x: b.x, y: b.y, rx, ry, inLoadZone, i };
    });
  }, [ballPositions, loadForce]);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "radial-gradient(circle at 50% 45%, #111936 0%, #0b1026 50%, #080b1b 100%)" }}>
      <style>{`
        @keyframes bearingSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div className="absolute inset-0 grid place-items-center">
        <svg viewBox="-10 -50 120 160" className="w-[min(70vh,70vw)] h-[min(70vh,70vw)] max-w-[640px] max-h-[640px]">
          {/* Housing — solid block surrounding bearing, deflects under load */}
          {showHousing && (
            <g transform={`translate(0, ${deflectY * 0.8})`}>
              <rect x="-8" y="-8" width="116" height={116 + deflectY * 1.2} rx="6" fill="#1e2a3a" stroke="#3a4f6a" strokeWidth="2" />
              <rect x="-2" y="-2" width="104" height={104 + deflectY * 1.0} rx="3" fill="#162030" stroke="#2a3f5a" strokeWidth="1" />
              {/* Mounting bolt holes */}
              <circle cx="6" cy="6" r="3" fill="#0e1620" stroke="#3a4f6a" strokeWidth="0.8" />
              <circle cx="94" cy="6" r="3" fill="#0e1620" stroke="#3a4f6a" strokeWidth="0.8" />
              <circle cx="6" cy={94 + deflectY * 1.2} r="3" fill="#0e1620" stroke="#3a4f6a" strokeWidth="0.8" />
              <circle cx="94" cy={94 + deflectY * 1.2} r="3" fill="#0e1620" stroke="#3a4f6a" strokeWidth="0.8" />
            </g>
          )}

          {/* Outer ring — ovalizes under radial load, shifts with housing */}
          <g transform={showHousing ? `translate(0, ${deflectY * 0.8})` : undefined}>
            <ellipse cx="50" cy="50" rx={outerRx} ry={outerRy} fill={showHousing ? "#1a2840" : "none"} stroke="#5f7c9f" strokeWidth="4" />
            <ellipse cx="50" cy="50" rx={outerRx2} ry={outerRy2} fill={showHousing ? "#0f1825" : "none"} stroke="#9db6cb" strokeWidth="6" />
          </g>

          {/* Cage ring — rotates with CSS */}
          <g transform={`translate(0, ${deflectY})`}>
            <g
              style={{
                transformOrigin: "50px 50px",
                animation: isPlaying ? `bearingSpin ${ringDuration} linear infinite` : "none",
                animationDirection: spinDirection,
              }}
            >
              <circle cx="50" cy="50" r="33" fill="none" stroke="#c9a24a" strokeWidth="2.2" />
            </g>
          </g>

          {/* Rolling elements — JS-animated orbit, deformation fixed at 12 & 6 o'clock */}
          <g transform={`translate(0, ${deflectY})`}>
            {ballShapes.map((b) => (
              <ellipse
                key={b.i}
                cx={b.x}
                cy={b.y}
                rx={b.rx}
                ry={b.ry}
                fill={b.inLoadZone ? "#ffd6d6" : "#f4fbff"}
                stroke={b.inLoadZone ? "#e07070" : "#8ea8c5"}
                strokeWidth="0.8"
              />
            ))}
          </g>

          {/* Inner ring — shifts with deflection */}
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

          {/* Center dot — follows inner ring */}
          <circle cx="50" cy={50 + deflectY} r="2" fill="#7fe3ff" />

          {/* Force arrow — points at housing when visible, otherwise at bearing */}
          {loadForce > 0 && (
            <g>
              {showHousing ? (
                <>
                  <line x1="50" y1={-12 + deflectY * 0.8} x2="50" y2={-12 - loadForce * 8 + deflectY * 0.8} stroke="#ff4444" strokeWidth="2.5" />
                  <polygon points={`46,${-12 + deflectY * 0.8} 54,${-12 + deflectY * 0.8} 50,${-5 + deflectY * 0.8}`} fill="#ff4444" />
                  <text x="56" y={-12 - loadForce * 4 + deflectY * 0.8} fill="#ff6666" fontSize="4.5" fontWeight="bold" fontFamily="monospace">
                    {loadForce.toFixed(1)} kN ↓
                  </text>
                </>
              ) : (
                <>
                  <line x1="50" y1="-4" x2="50" y2={-4 - loadForce * 8} stroke="#ff4444" strokeWidth="2.5" />
                  <polygon points={`46,-4 54,-4 50,4`} fill="#ff4444" />
                  <text x="56" y={-4 - loadForce * 4} fill="#ff6666" fontSize="4.5" fontWeight="bold" fontFamily="monospace">
                    {loadForce.toFixed(1)} kN ↓
                  </text>
                </>
              )}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
