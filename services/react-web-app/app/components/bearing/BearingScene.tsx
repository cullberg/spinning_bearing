import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import VibrationChart from "./VibrationChart";

interface BearingSceneProps {
  rpm: number;
  direction: "cw" | "ccw";
  isPlaying: boolean;
  /** Radial load in kN (applied downward) */
  loadForce?: number;
  /** Show bearing housing around outer ring */
  showHousing?: boolean;
  /** Grease fill level 0-1+ (>0.8 starts leaking, >1 overflows) */
  greaseLevel?: number;
  /** Pump handle position 0-1 (animated externally) */
  pumpStroke?: number;
  /** Bearing damage type */
  damage?: "none" | "outer-spall" | "inner-spall" | "ball-defect";
}

export default function BearingScene({ rpm, direction, isPlaying, loadForce = 0, showHousing = false, greaseLevel = 0, pumpStroke = 0, damage = "none" }: BearingSceneProps) {
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

  // Load path: shaft → inner ring → balls at bottom → outer ring → housing.
  // Outer ring receives reaction force at bottom, causing slight ovalization.
  const ovalFactor = loadForce * 0.8; // milder than if squeezed externally
  const outerR = 47;
  const outerR2 = 41;
  // Outer ring expands horizontally, compresses vertically under bottom load
  const outerRx = outerR + ovalFactor * 0.5;
  const outerRy = outerR - ovalFactor * 0.5;
  const outerRx2 = outerR2 + ovalFactor * 0.4;
  const outerRy2 = outerR2 - ovalFactor * 0.4;

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
  // Leak drips state: drops that have overflowed and fall below housing
  const leakDropsRef = useRef<{ x: number; y: number; vy: number; size: number; opacity: number }[]>([]);
  const [leakDrops, setLeakDrops] = useState<{ x: number; y: number; size: number; opacity: number }[]>([]);

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

      // Grease particles based on fill level
      const amount = Math.min(greaseLevel, 1);
      if (amount <= 0) {
        setGreasePositions([]);
      } else {
        const visibleCount = Math.floor(GREASE_COUNT * amount);
        const sign = direction === "cw" ? 1 : -1;
        const particles = greaseParticlesRef.current;
        const positions = [];
        for (let i = 0; i < visibleCount; i++) {
          const p = particles[i];
          if (isPlaying) {
            p.angle += sign * (rpm / 60) * Math.PI * 2 * 0.35 * p.speed * delta;
          }
          const wobble = Math.sin(p.angle * 3 + i) * 1.5;
          const r = p.r + wobble;
          positions.push({
            x: 50 + Math.cos(p.angle) * r,
            y: 50 + Math.sin(p.angle) * r,
            size: p.size * (0.8 + amount * 0.4),
            opacity: p.opacity * Math.min(amount * 1.5, 1),
          });
        }
        setGreasePositions(positions);
      }

      // Leak drips — when overfilled, grease drops fall below housing
      const drops = leakDropsRef.current;
      if (isPlaying && greaseLevel > 0.8 && showHousing) {
        // Spawn new drips occasionally
        if (Math.random() < (greaseLevel - 0.8) * 0.3) {
          drops.push({
            x: 30 + Math.random() * 40,
            y: 108,
            vy: 2 + Math.random() * 3,
            size: 1.0 + Math.random() * 1.5 * Math.min(greaseLevel - 0.8, 0.5) * 4,
            opacity: 0.7 + Math.random() * 0.3,
          });
        }
      }
      // Animate existing drips (only when playing)
      if (isPlaying) {
        for (let i = drops.length - 1; i >= 0; i--) {
          drops[i].y += drops[i].vy * delta * 20;
          drops[i].opacity -= delta * 0.3;
          if (drops[i].opacity <= 0 || drops[i].y > 160) {
            drops.splice(i, 1);
          }
        }
      }
      setLeakDrops(drops.map(d => ({ x: d.x, y: d.y, size: d.size, opacity: d.opacity })));
    },
    [isPlaying, rpm, direction, greaseLevel, showHousing, deflectY],
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

  // 6205 bearing geometry
  const BALL_DIAMETER = 7.938; // mm
  const PITCH_DIAMETER = 38.5; // mm
  const CONTACT_ANGLE = 0; // degrees (deep groove)
  const bdPd = BALL_DIAMETER / PITCH_DIAMETER; // ≈ 0.2062
  const cosAlpha = Math.cos((CONTACT_ANGLE * Math.PI) / 180);

  // Characteristic defect frequencies (multiples of shaft frequency)
  const shaftFreq = rpm / 60; // Hz
  const bpfo = (BALL_COUNT / 2) * shaftFreq * (1 - bdPd * cosAlpha);
  const bpfi = (BALL_COUNT / 2) * shaftFreq * (1 + bdPd * cosAlpha);
  const bsf = (PITCH_DIAMETER / (2 * BALL_DIAMETER)) * shaftFreq * (1 - (bdPd * cosAlpha) ** 2);
  const ftf = (shaftFreq / 2) * (1 - bdPd * cosAlpha);

  // Per-ball deformation — loaded zone is at 6 o'clock (bottom), ~4 to 8.
  // In SVG coords: sin(a) = +1 at 6 o'clock (bottom), 0 at 3/9, -1 at 12.
  // sin(a) > 0.3 covers roughly 4 o'clock to 8 o'clock.
  const ballShapes = useMemo(() => {
    return ballPositions.map((b, i) => {
      const bottomProximity = Math.sin(b.a); // +1 at bottom (6), -1 at top (12)
      const loadZone = Math.max(0, bottomProximity); // 0..1, only bottom half
      const inLoadZone = loadZone > 0.3 && loadForce > 0;
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
          {/* Housing — deflects slightly under reaction load from outer ring */}
          {showHousing && (() => {
            const sag = deflectY * 1.2; // bottom sags from reaction force
            const outerPath = `
              M -8,-8
              L 108,-8
              L 108,${108 + sag}
              Q 50,${108 + sag * 1.3} -8,${108 + sag}
              Z
            `;
            const innerPath = `
              M -2,-2
              L 102,-2
              L 102,${102 + sag * 0.7}
              Q 50,${102 + sag * 1.0} -2,${102 + sag * 0.7}
              Z
            `;
            return (
              <g>
                <path d={outerPath} fill="#1e2a3a" stroke="#3a4f6a" strokeWidth="2" />
                <path d={innerPath} fill="#162030" stroke="#2a3f5a" strokeWidth="1" />
                {/* Mounting bolt holes — top fixed, bottom follows sag */}
                <circle cx="6" cy="6" r="3" fill="#0e1620" stroke="#3a4f6a" strokeWidth="0.8" />
                <circle cx="94" cy="6" r="3" fill="#0e1620" stroke="#3a4f6a" strokeWidth="0.8" />
                <circle cx="6" cy={94 + sag * 0.8} r="3" fill="#0e1620" stroke="#3a4f6a" strokeWidth="0.8" />
                <circle cx="94" cy={94 + sag * 0.8} r="3" fill="#0e1620" stroke="#3a4f6a" strokeWidth="0.8" />
              </g>
            );
          })()}

          {/* Outer ring — ovalizes slightly from bottom reaction force */}
          <g>
            <ellipse cx="50" cy="50" rx={outerRx} ry={outerRy} fill={showHousing ? "#1a2840" : "none"} stroke="#5f7c9f" strokeWidth="4" />
            <ellipse cx="50" cy="50" rx={outerRx2} ry={outerRy2} fill={showHousing ? "#0f1825" : "none"} stroke="#9db6cb" strokeWidth="6" />
            {/* Outer race spall — fixed at ~4 o'clock on the raceway */}
            {damage === "outer-spall" && (
              <g>
                {/* Spall crater on inner surface of outer ring */}
                <ellipse cx="82" cy="68" rx="5" ry="2.5" fill="#1a1a2a" stroke="#ff4444" strokeWidth="0.6" opacity="0.9" />
                <ellipse cx="82" cy="68" rx="3.5" ry="1.5" fill="#2a0a0a" />
                {/* Rough edges */}
                <path d="M 78,67 Q 79,65.5 80.5,66.5 Q 82,65 83.5,66.5 Q 85,65.5 86,67" fill="none" stroke="#ff6666" strokeWidth="0.5" opacity="0.7" />
                {/* Debris particles */}
                <circle cx="79" cy="63" r="0.6" fill="#888" opacity="0.5" />
                <circle cx="84" cy="64" r="0.4" fill="#888" opacity="0.4" />
                <circle cx="81" cy="62" r="0.5" fill="#999" opacity="0.4" />
                {/* Label */}
                <text x="88" y="63" fill="#ff4444" fontSize="3" fontFamily="monospace" fontWeight="bold">SPALL</text>
              </g>
            )}
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
              <g key={b.i}>
                <ellipse
                  cx={b.x}
                  cy={b.y}
                  rx={b.rx}
                  ry={b.ry}
                  fill={b.inLoadZone ? "#ffd6d6" : "#f4fbff"}
                  stroke={b.inLoadZone ? "#e07070" : "#8ea8c5"}
                  strokeWidth="0.8"
                />
                {/* Ball defect — show pit on first ball */}
                {damage === "ball-defect" && b.i === 0 && (
                  <g>
                    <ellipse cx={b.x + 1} cy={b.y - 0.5} rx="1.8" ry="1.2" fill="#2a0a0a" stroke="#ff4444" strokeWidth="0.4" />
                    <ellipse cx={b.x + 1} cy={b.y - 0.5} rx="1" ry="0.6" fill="#1a0505" />
                  </g>
                )}
              </g>
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

          {/* Grease nipple + hand pump — on housing */}
          {showHousing && (
            <g>
              {/* Nipple fitting on housing */}
              <rect x="95" y="-2" width="5" height="8" rx="1.5" fill="#5a5a6a" stroke="#7a7a8a" strokeWidth="0.6" />
              <circle cx="97.5" cy="-2" r="2" fill="#6a6a7a" stroke="#8a8a9a" strokeWidth="0.5" />
              {/* Hose from nipple to pump */}
              <path d="M 100,2 Q 112,2 114,10 Q 116,18 114,22" fill="none" stroke="#444" strokeWidth="1.8" strokeLinecap="round" />
              {/* Pump body (cylinder) */}
              <rect x="108" y="22" width="12" height="30" rx="2" fill="#3a3a4a" stroke="#5a5a6a" strokeWidth="0.8" />
              {/* Grease level inside pump — decreases as you pump */}
              <rect x="109.5" y={23 + (1 - Math.max(0, 1 - greaseLevel)) * 28} width="9" height={Math.max(0, 1 - greaseLevel) * 28} rx="1" fill="#c4a832" opacity="0.6" />
              {/* Pump handle bar */}
              <rect x="106" y={22 - 12 + pumpStroke * 12} width="16" height="3" rx="1" fill="#6a6a7a" stroke="#8a8a9a" strokeWidth="0.5" />
              {/* Handle grip */}
              <rect x="110" y={22 - 16 + pumpStroke * 12} width="8" height="5" rx="1.5" fill="#888" stroke="#aaa" strokeWidth="0.4" />
              {/* Pump rod */}
              <rect x="113" y={22 - 12 + pumpStroke * 12} width="2" height={12 - pumpStroke * 10} fill="#777" />
              {/* Grease flow from nipple when recently pumped */}
              {greaseLevel > 0 && pumpStroke > 0.3 && (
                <>
                  <circle cx="97.5" cy="3" r="1.2" fill="#c4a832" opacity="0.8" />
                  <circle cx="96" cy="6" r="0.9" fill="#c4a832" opacity="0.6" />
                  <circle cx="99" cy="6" r="0.9" fill="#c4a832" opacity="0.6" />
                </>
              )}
            </g>
          )}

          {/* Leak drips — grease overflow falling below housing */}
          {leakDrops.length > 0 && (
            <g>
              {leakDrops.map((d, i) => (
                <ellipse
                  key={i}
                  cx={d.x}
                  cy={d.y}
                  rx={d.size * 0.8}
                  ry={d.size * 1.3}
                  fill="#c4a832"
                  opacity={d.opacity}
                />
              ))}
              {/* Puddle below housing if heavily overfilled */}
              {greaseLevel > 1.0 && (
                <ellipse cx="50" cy={116} rx={8 + (greaseLevel - 1) * 20} ry={1.5 + (greaseLevel - 1) * 2} fill="#c4a832" opacity="0.5" />
              )}
            </g>
          )}

          {/* Inner ring — attached to shaft, gets full deflection */}
          <g transform={`translate(0, ${deflectY})`}>
            <g
              style={{
                transformOrigin: "50px 50px",
                animation: isPlaying ? `bearingSpin ${cageDuration} linear infinite` : "none",
                animationDirection: spinDirection,
              }}
            >
              <circle cx="50" cy="50" r="27" fill="none" stroke="#d7e8f8" strokeWidth="6" />
              <circle cx="50" cy="23" r="1.8" fill="#ff4fd8" />
              {/* Inner race spall — rotates with inner ring */}
              {damage === "inner-spall" && (
                <g>
                  <ellipse cx="67" cy="30" rx="4" ry="2" fill="#1a1a2a" stroke="#ff4444" strokeWidth="0.5" opacity="0.9" />
                  <ellipse cx="67" cy="30" rx="2.5" ry="1.2" fill="#2a0a0a" />
                  <path d="M 64,29.2 Q 65,27.8 66.5,28.8 Q 68,27.5 69.5,29" fill="none" stroke="#ff6666" strokeWidth="0.4" opacity="0.7" />
                  <text x="64" y="27" fill="#ff4444" fontSize="2.5" fontFamily="monospace" fontWeight="bold">SPALL</text>
                </g>
              )}
            </g>
          </g>

          {/* Center dot — follows inner ring */}
          <circle cx="50" cy={50 + deflectY} r="2" fill="#7fe3ff" />

          {/* Force arrow — applied to inner ring via shaft (points down at center) */}
          {loadForce > 0 && (
            <g>
              <line x1="50" y1={50 - 25} x2="50" y2={50 - 25 - loadForce * 8} stroke="#ff4444" strokeWidth="2.5" />
              <polygon points={`46,${50 - 25} 54,${50 - 25} 50,${50 - 18}`} fill="#ff4444" />
              <text x="56" y={50 - 25 - loadForce * 4} fill="#ff6666" fontSize="4.5" fontWeight="bold" fontFamily="monospace">
                {loadForce.toFixed(1)} kN ↓
              </text>
            </g>
          )}

          {/* Accelerometer sensor on housing/outer ring */}
          {(() => {
            // When housing is shown, mount sensor on top of housing; otherwise on outer ring
            const sensorY = showHousing ? -14 : 14;
            const sensorX = 80;
            const cablePath = showHousing
              ? `M ${sensorX + 12},${sensorY + 3.5} Q ${sensorX + 18},${sensorY + 3} ${sensorX + 22},${sensorY} Q ${sensorX + 28},${sensorY - 3} ${sensorX + 35},${sensorY - 3}`
              : `M 92,17.5 Q 98,17.5 102,15 Q 108,12 115,12`;
            const connX = showHousing ? sensorX + 33.5 : 113.5;
            const connY = showHousing ? sensorY - 5 : 10;
            const studY1 = sensorY + 7;
            const studY2 = showHousing ? sensorY + 11 : sensorY + 11;
            return (
              <g>
                {/* Sensor body */}
                <rect x={sensorX} y={sensorY} width="12" height="8" rx="1.5" fill="#2a3a50" stroke="#4a90d9" strokeWidth="0.8" />
                {/* Sensor label */}
                <text x={sensorX + 6} y={sensorY + 5.5} fill="#4a90d9" fontSize="3.8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">ACC</text>
                {/* LED indicator */}
                <circle cx={sensorX + 10} cy={sensorY + 1.8} r="0.9" fill={isPlaying && rpm > 0 ? "#22d3ee" : "#1a2a3a"} opacity={isPlaying && rpm > 0 ? 0.9 : 0.4}>
                  {isPlaying && rpm > 0 && (
                    <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.5s" repeatCount="indefinite" />
                  )}
                </circle>
                {/* Mounting stud */}
                <line x1={sensorX + 6} y1={studY1} x2={sensorX + 6} y2={studY2} stroke="#4a6a8a" strokeWidth="1.8" strokeLinecap="round" />
                {/* Cable */}
                <path d={cablePath} fill="none" stroke="#2a5a8a" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
                <path d={cablePath} fill="none" stroke="#22d3ee" strokeWidth="1" opacity={isPlaying && rpm > 0 ? 0.6 : 0} />
                {/* Animated signal pulses */}
                {isPlaying && rpm > 0 && (
                  <>
                    <circle r="1.8" fill="#22d3ee" opacity="0.8">
                      <animateMotion dur="1s" repeatCount="indefinite" path={cablePath} />
                    </circle>
                    <circle r="1.2" fill="#22d3ee" opacity="0.5">
                      <animateMotion dur="1s" repeatCount="indefinite" begin="0.33s" path={cablePath} />
                    </circle>
                    <circle r="0.8" fill="#22d3ee" opacity="0.3">
                      <animateMotion dur="1s" repeatCount="indefinite" begin="0.66s" path={cablePath} />
                    </circle>
                  </>
                )}
                {/* Connector */}
                <rect x={connX} y={connY} width="3" height="4" rx="0.8" fill="#2a4a6a" stroke="#4a90d9" strokeWidth="0.5" />
              </g>
            );
          })()}
        </svg>
        {/* Bearing parameters overlay */}
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-3 py-2 text-[11px] font-mono text-gray-300 leading-relaxed select-none">
          <div className="text-gray-400 font-semibold mb-1 text-[10px] tracking-wider uppercase">6205 — {BALL_COUNT} balls · Ø{BALL_DIAMETER} mm · PCD {PITCH_DIAMETER} mm</div>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
            <span className="text-gray-500">Shaft</span><span>{shaftFreq.toFixed(2)} Hz ({rpm.toFixed(0)} RPM)</span>
            <span className="text-blue-400">BPFO</span><span>{bpfo.toFixed(2)} Hz</span>
            <span className="text-red-400">BPFI</span><span>{bpfi.toFixed(2)} Hz</span>
            <span className="text-yellow-400">BSF</span><span>{bsf.toFixed(2)} Hz</span>
            <span className="text-green-400">FTF</span><span>{ftf.toFixed(2)} Hz</span>
          </div>
        </div>
        {/* Vibration charts — right side */}
        <div className="absolute top-0 right-1 bottom-0 w-[620px] max-w-[52%] flex flex-col justify-center opacity-95">
          {/* Sensor connection indicator */}
          <div className="flex items-center gap-1.5 mb-1.5 px-1">
            <div className={`w-2 h-2 rounded-full ${isPlaying && rpm > 0 ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.7)]" : "bg-gray-600"}`} />
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
              {isPlaying && rpm > 0 ? "Accelerometer — Live" : "Accelerometer — Idle"}
            </span>
          </div>
          <VibrationChart rpm={rpm} isPlaying={isPlaying} loadForce={loadForce} greaseLevel={greaseLevel} damage={damage} />
        </div>
      </div>
    </div>
  );
}
