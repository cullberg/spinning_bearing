import { useMemo, useRef, useState, useEffect, useCallback } from "react";

interface BearingSceneProps {
  rpm: number;
  direction: "cw" | "ccw";
  isPlaying: boolean;
  /** Radial load in kN (applied downward) */
  loadForce?: number;
  /** Show bearing housing around outer ring */
  showHousing?: boolean;
  /** Apply grease via nipple (requires housing) */
  greaseActive?: boolean;
}

export default function BearingScene({ rpm, direction, isPlaying, loadForce = 0, showHousing = false, greaseActive = false }: BearingSceneProps) {
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

  // Grease particles — orbit the ball track at varying radii
  const GREASE_COUNT = 24;
  const GREASE_ORBIT_MIN = 30;
  const GREASE_ORBIT_MAX = 40;
  const greaseParticlesRef = useRef(
    Array.from({ length: GREASE_COUNT }, (_, i) => ({
      angle: (i / GREASE_COUNT) * Math.PI * 2,
      r: GREASE_ORBIT_MIN + Math.random() * (GREASE_ORBIT_MAX - GREASE_ORBIT_MIN),
      size: 1.2 + Math.random() * 1.8,
      speed: 0.7 + Math.random() * 0.6,
      opacity: 0.4 + Math.random() * 0.4,
    })),
  );
  const [greasePositions, setGreasePositions] = useState<{ x: number; y: number; size: number; opacity: number }[]>([]);
  const greaseAmountRef = useRef(0);

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

      // Grease amount ramp
      if (greaseActive && showHousing) {
        greaseAmountRef.current = Math.min(greaseAmountRef.current + 0.02, 1);
      } else {
        greaseAmountRef.current = Math.max(greaseAmountRef.current - 0.01, 0);
      }

      // Grease particle positions
      const amount = greaseAmountRef.current;
      if (amount <= 0) {
        setGreasePositions([]);
      } else {
        const visibleCount = Math.floor(GREASE_COUNT * amount);
        const sign = direction === "cw" ? 1 : -1;
        const particles = greaseParticlesRef.current;
        const positions = [];
        for (let i = 0; i < visibleCount; i++) {
          const p = particles[i];
          p.angle += sign * (rpm / 60) * Math.PI * 2 * 0.35 * p.speed * delta;
          const wobble = Math.sin(p.angle * 3 + i) * 1.5;
          const r = p.r + wobble;
          positions.push({
            x: 50 + Math.cos(p.angle) * r,
            y: 50 + Math.sin(p.angle) * r,
            size: p.size,
            opacity: p.opacity * amount,
          });
        }
        setGreasePositions(positions);
      }
    },
    [isPlaying, rpm, direction, greaseActive, showHousing],
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
          {/* Housing — bends under load with curved sides */}
          {showHousing && (() => {
            const bow = deflectY * 2.5; // how much the sides bow outward
            const sag = deflectY * 1.5; // how much the bottom sags down
            // Outer housing path: top is flat, sides bow out, bottom sags
            const outerPath = `
              M -8,-8
              L 108,-8
              C ${108 + bow * 0.3},${40 + sag * 0.3} ${108 + bow * 0.3},${60 + sag * 0.5} 108,${108 + sag}
              Q 50,${108 + sag * 1.4} -8,${108 + sag}
              C ${-8 - bow * 0.3},${60 + sag * 0.5} ${-8 - bow * 0.3},${40 + sag * 0.3} -8,-8
              Z
            `;
            // Inner housing path
            const innerPath = `
              M -2,-2
              L 102,-2
              C ${102 + bow * 0.2},${38 + sag * 0.2} ${102 + bow * 0.2},${62 + sag * 0.4} 102,${102 + sag * 0.8}
              Q 50,${102 + sag * 1.2} -2,${102 + sag * 0.8}
              C ${-2 - bow * 0.2},${62 + sag * 0.4} ${-2 - bow * 0.2},${38 + sag * 0.2} -2,-2
              Z
            `;
            return (
              <g>
                <path d={outerPath} fill="#1e2a3a" stroke="#3a4f6a" strokeWidth="2" />
                <path d={innerPath} fill="#162030" stroke="#2a3f5a" strokeWidth="1" />
                {/* Mounting bolt holes — top stays fixed, bottom follows sag */}
                <circle cx="6" cy="6" r="3" fill="#0e1620" stroke="#3a4f6a" strokeWidth="0.8" />
                <circle cx="94" cy="6" r="3" fill="#0e1620" stroke="#3a4f6a" strokeWidth="0.8" />
                <circle cx="6" cy={94 + sag * 0.9} r="3" fill="#0e1620" stroke="#3a4f6a" strokeWidth="0.8" />
                <circle cx="94" cy={94 + sag * 0.9} r="3" fill="#0e1620" stroke="#3a4f6a" strokeWidth="0.8" />
              </g>
            );
          })()}

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

          {/* Grease particles — flow around the ball track */}
          {greasePositions.length > 0 && (
            <g transform={`translate(0, ${deflectY})`}>
              {greasePositions.map((g, i) => (
                <circle
                  key={i}
                  cx={g.x}
                  cy={g.y}
                  r={g.size}
                  fill="#c4a832"
                  opacity={g.opacity}
                />
              ))}
            </g>
          )}

          {/* Grease nipple — on top of housing */}
          {showHousing && (
            <g>
              {/* Nipple body */}
              <rect x="93" y="-4" width="8" height="12" rx="2" fill={greaseActive ? "#8b7a2a" : "#4a4a5a"} stroke="#6a6a7a" strokeWidth="0.8" />
              {/* Nipple tip */}
              <circle cx="97" cy="-4" r="2.5" fill={greaseActive ? "#c4a832" : "#5a5a6a"} stroke="#7a7a8a" strokeWidth="0.6" />
              {/* Grease flow indicator */}
              {greaseActive && (
                <>
                  <circle cx="97" cy="2" r="1.2" fill="#c4a832" opacity="0.8" />
                  <circle cx="95" cy="5" r="0.8" fill="#c4a832" opacity="0.6" />
                  <circle cx="99" cy="5" r="0.8" fill="#c4a832" opacity="0.6" />
                </>
              )}
            </g>
          )}

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
                  <line x1="50" y1={-12} x2="50" y2={-12 - loadForce * 8} stroke="#ff4444" strokeWidth="2.5" />
                  <polygon points={`46,-12 54,-12 50,-5`} fill="#ff4444" />
                  <text x="56" y={-12 - loadForce * 4} fill="#ff6666" fontSize="4.5" fontWeight="bold" fontFamily="monospace">
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
