import { useMemo, useRef, useEffect, useState, useCallback } from "react";

interface VibrationChartProps {
  rpm: number;
  isPlaying: boolean;
  loadForce: number;
  greaseLevel: number;
  damage: "none" | "outer-spall" | "inner-spall" | "ball-defect";
}

// 6205 bearing geometry constants
const BALL_COUNT = 9;
const BALL_DIAMETER = 7.938;
const PITCH_DIAMETER = 38.5;
const BD_PD = BALL_DIAMETER / PITCH_DIAMETER;

// Frequency multipliers (relative to shaft frequency)
const BPFO_MULT = (BALL_COUNT / 2) * (1 - BD_PD);
const BPFI_MULT = (BALL_COUNT / 2) * (1 + BD_PD);
const BSF_MULT = (PITCH_DIAMETER / (2 * BALL_DIAMETER)) * (1 - BD_PD ** 2);
const FTF_MULT = 0.5 * (1 - BD_PD);

const W = 700;
const H_WAVE = 240;
const H_FFT = 280;
const MARGIN = { left: 40, right: 14, top: 10, bottom: 20 };
const PLOT_W = W - MARGIN.left - MARGIN.right;

export default function VibrationChart({ rpm, isPlaying, loadForce, greaseLevel, damage }: VibrationChartProps) {
  const shaftFreq = rpm / 60;
  const timeRef = useRef(0);
  const lastTsRef = useRef(0);
  const [tick, setTick] = useState(0);

  // Animate the waveform
  useEffect(() => {
    let frameId: number;
    const loop = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      if (isPlaying && rpm > 0) {
        timeRef.current += dt;
      }
      setTick((t) => t + 1);
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, rpm]);

  // Component amplitudes — influenced by load, grease, and damage
  const amps = useMemo(() => {
    const base = Math.min(loadForce * 0.6, 1.0);
    // Baseline amplitudes
    let bpfoAmp = base * 0.9 + 0.1;
    let bpfiAmp = base * 0.7 + 0.05;
    let bsfAmp = base * 0.4 + 0.05;
    let ftfAmp = base * 0.2 + 0.03;
    const shaftAmp = 0.3 + base * 0.2;
    let noiseLevel = greaseLevel < 0.3 ? 0.15 * (1 - greaseLevel / 0.3) : 0.02;

    // Friction multiplier — dry bearings vibrate more across all frequencies
    const frictionMult = greaseLevel < 0.3 ? 1.0 + (1 - greaseLevel / 0.3) * 0.6 : 1.0;
    bpfoAmp *= frictionMult;
    bpfiAmp *= frictionMult;
    bsfAmp *= frictionMult;
    ftfAmp *= frictionMult;

    // Damage effects — dramatically raise the affected frequency + harmonics + noise
    if (damage === "outer-spall") {
      bpfoAmp = Math.min(bpfoAmp * 3.5, 1.0);
      noiseLevel += 0.08;
    } else if (damage === "inner-spall") {
      bpfiAmp = Math.min(bpfiAmp * 3.5, 1.0);
      noiseLevel += 0.06;
    } else if (damage === "ball-defect") {
      bsfAmp = Math.min(bsfAmp * 4.0, 1.0);
      ftfAmp = Math.min(ftfAmp * 2.0, 0.6);
      noiseLevel += 0.05;
    }

    return { bpfoAmp, bpfiAmp, bsfAmp, ftfAmp, shaftAmp, noiseLevel };
  }, [loadForce, greaseLevel, damage]);

  // Seed noise so it's deterministic per render (no flicker)
  const noiseRef = useRef<number[]>([]);
  if (noiseRef.current.length === 0) {
    noiseRef.current = Array.from({ length: 512 }, () => (Math.random() - 0.5) * 2);
  }

  // Generate time-domain waveform
  const waveformPath = useMemo(() => {
    if (shaftFreq <= 0) return "";
    const t0 = timeRef.current;
    const duration = 3 / shaftFreq; // show ~3 shaft revolutions
    const N = 256;
    const pts: string[] = [];
    for (let i = 0; i < N; i++) {
      const t = t0 + (i / (N - 1)) * duration;
      const tau = Math.PI * 2;
      let y = 0;
      y += amps.shaftAmp * Math.sin(tau * shaftFreq * t);
      y += amps.bpfoAmp * Math.sin(tau * shaftFreq * BPFO_MULT * t) * 0.6;
      y += amps.bpfiAmp * Math.sin(tau * shaftFreq * BPFI_MULT * t) * 0.5;
      y += amps.bsfAmp * Math.sin(tau * shaftFreq * BSF_MULT * t) * 0.4;
      y += amps.ftfAmp * Math.sin(tau * shaftFreq * FTF_MULT * t) * 0.3;
      // Add harmonics for realism
      y += amps.bpfoAmp * 0.3 * Math.sin(tau * shaftFreq * BPFO_MULT * 2 * t);
      y += amps.bpfiAmp * 0.2 * Math.sin(tau * shaftFreq * BPFI_MULT * 2 * t);
      // Damage impulse bursts — periodic sharp impacts
      if (damage === "outer-spall") {
        const phase = (shaftFreq * BPFO_MULT * t) % 1;
        if (phase < 0.08) y += amps.bpfoAmp * 1.5 * Math.exp(-phase * 40) * Math.sin(tau * shaftFreq * 12 * t);
      } else if (damage === "inner-spall") {
        const phase = (shaftFreq * BPFI_MULT * t) % 1;
        if (phase < 0.08) y += amps.bpfiAmp * 1.5 * Math.exp(-phase * 40) * Math.sin(tau * shaftFreq * 14 * t);
      } else if (damage === "ball-defect") {
        const phase = (shaftFreq * BSF_MULT * t) % 1;
        if (phase < 0.1) y += amps.bsfAmp * 1.8 * Math.exp(-phase * 30) * Math.sin(tau * shaftFreq * 10 * t);
      }
      // Broadband noise
      y += amps.noiseLevel * noiseRef.current[i % noiseRef.current.length];

      const maxAmp = amps.shaftAmp + amps.bpfoAmp * 0.6 + amps.bpfiAmp * 0.5 + amps.bsfAmp * 0.4 + amps.ftfAmp * 0.3 + amps.bpfoAmp * 0.3 + amps.bpfiAmp * 0.2 + amps.noiseLevel + 0.1;
      const norm = y / maxAmp;
      const plotH = H_WAVE - MARGIN.top - MARGIN.bottom;
      const px = MARGIN.left + (i / (N - 1)) * PLOT_W;
      const py = MARGIN.top + plotH / 2 - norm * plotH * 0.45;
      pts.push(`${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return pts.join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shaftFreq, amps, tick]);

  // FFT spectrum — show known peaks directly (cleaner than real FFT)
  const fftData = useMemo(() => {
    if (shaftFreq <= 0) return { peaks: [], maxFreq: 10, yTicks: [] };

    const maxFreq = Math.max(shaftFreq * BPFI_MULT * 2.5, 10);
    const peaks = [
      { freq: shaftFreq, amp: amps.shaftAmp, label: "1×", color: "#9ca3af" },
      { freq: shaftFreq * FTF_MULT, amp: amps.ftfAmp, label: "FTF", color: "#4ade80" },
      { freq: shaftFreq * BSF_MULT, amp: amps.bsfAmp, label: "BSF", color: "#facc15" },
      { freq: shaftFreq * BPFO_MULT, amp: amps.bpfoAmp, label: "BPFO", color: "#60a5fa" },
      { freq: shaftFreq * BPFI_MULT, amp: amps.bpfiAmp, label: "BPFI", color: "#f87171" },
      // Harmonics
      { freq: shaftFreq * 2, amp: amps.shaftAmp * 0.3, label: "2×", color: "#6b7280" },
      { freq: shaftFreq * BPFO_MULT * 2, amp: amps.bpfoAmp * 0.3, label: "2×BPFO", color: "#3b82f6" },
      { freq: shaftFreq * BPFI_MULT * 2, amp: amps.bpfiAmp * 0.2, label: "2×BPFI", color: "#ef4444" },
      // 3rd harmonics for damaged components
      ...(damage === "outer-spall" ? [
        { freq: shaftFreq * BPFO_MULT * 3, amp: amps.bpfoAmp * 0.2, label: "3×BPFO", color: "#3b82f6" },
        // Sidebands around BPFO (±1× shaft)
        { freq: shaftFreq * BPFO_MULT - shaftFreq, amp: amps.bpfoAmp * 0.25, label: "", color: "#60a5fa" },
        { freq: shaftFreq * BPFO_MULT + shaftFreq, amp: amps.bpfoAmp * 0.25, label: "", color: "#60a5fa" },
      ] : []),
      ...(damage === "inner-spall" ? [
        { freq: shaftFreq * BPFI_MULT * 3, amp: amps.bpfiAmp * 0.15, label: "3×BPFI", color: "#ef4444" },
        // Sidebands around BPFI (±1× shaft)
        { freq: shaftFreq * BPFI_MULT - shaftFreq, amp: amps.bpfiAmp * 0.3, label: "", color: "#f87171" },
        { freq: shaftFreq * BPFI_MULT + shaftFreq, amp: amps.bpfiAmp * 0.3, label: "", color: "#f87171" },
      ] : []),
      ...(damage === "ball-defect" ? [
        { freq: shaftFreq * BSF_MULT * 2, amp: amps.bsfAmp * 0.5, label: "2×BSF", color: "#facc15" },
        { freq: shaftFreq * BSF_MULT * 3, amp: amps.bsfAmp * 0.25, label: "3×BSF", color: "#facc15" },
        // Cage modulation sidebands
        { freq: shaftFreq * BSF_MULT - shaftFreq * FTF_MULT, amp: amps.bsfAmp * 0.2, label: "", color: "#facc15" },
        { freq: shaftFreq * BSF_MULT + shaftFreq * FTF_MULT, amp: amps.bsfAmp * 0.2, label: "", color: "#facc15" },
      ] : []),
    ].filter((p) => p.freq > 0 && p.freq < maxFreq);

    return { peaks, maxFreq, yTicks: [] };
  }, [shaftFreq, amps]);

  // Noise floor for FFT
  const noiseFloorPath = useMemo(() => {
    if (shaftFreq <= 0) return "";
    const plotH = H_FFT - MARGIN.top - MARGIN.bottom;
    const N = 200;
    const pts: string[] = [];
    for (let i = 0; i < N; i++) {
      const px = MARGIN.left + (i / (N - 1)) * PLOT_W;
      const noise = amps.noiseLevel * (0.5 + 0.5 * Math.abs(noiseRef.current[(i * 2) % noiseRef.current.length]));
      const py = MARGIN.top + plotH - noise * plotH * 0.8;
      pts.push(`${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [shaftFreq, amps]);

  // Frequency axis ticks
  const freqTicks = useMemo(() => {
    if (fftData.maxFreq <= 0) return [];
    const step = fftData.maxFreq < 20 ? 2 : fftData.maxFreq < 50 ? 5 : fftData.maxFreq < 200 ? 20 : 50;
    const ticks: number[] = [];
    for (let f = 0; f <= fftData.maxFreq; f += step) {
      ticks.push(f);
    }
    return ticks;
  }, [fftData.maxFreq]);

  const plotHWave = H_WAVE - MARGIN.top - MARGIN.bottom;
  const plotHFft = H_FFT - MARGIN.top - MARGIN.bottom;

  return (
    <div className="flex flex-col gap-1.5 w-full select-none">
      {/* Time-domain waveform */}
      <div>
        <div className="text-[9px] font-mono text-gray-500 uppercase tracking-wider mb-0.5 px-0.5">Vibration Signal</div>
        <div className="bg-[#0c0f1a] rounded border border-gray-800/60 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H_WAVE}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          {/* Grid */}
          <line x1={MARGIN.left} y1={MARGIN.top + plotHWave / 2} x2={W - MARGIN.right} y2={MARGIN.top + plotHWave / 2} stroke="#1e2940" strokeWidth="0.5" />
          <line x1={MARGIN.left} y1={MARGIN.top} x2={MARGIN.left} y2={MARGIN.top + plotHWave} stroke="#1e2940" strokeWidth="0.5" />
          {/* Label */}
          <text x={4} y={MARGIN.top + plotHWave / 2} fill="#6b7280" fontSize="8" dominantBaseline="middle" fontFamily="monospace">Accel</text>
          <text x={W - MARGIN.right} y={H_WAVE - 3} fill="#6b7280" fontSize="7" textAnchor="end" fontFamily="monospace">Time</text>
          {/* Waveform */}
          {waveformPath && rpm > 0 && (
            <path d={waveformPath} fill="none" stroke="#22d3ee" strokeWidth="1.2" opacity="0.9" />
          )}
          {rpm <= 0 && (
            <text x={W / 2} y={H_WAVE / 2} fill="#4b5563" fontSize="10" textAnchor="middle" fontFamily="monospace">No signal — set RPM &gt; 0</text>
          )}
        </svg>
        </div>
      </div>

      {/* FFT Spectrum */}
      <div>
        <div className="text-[9px] font-mono text-gray-500 uppercase tracking-wider mb-0.5 px-0.5">FFT Spectrum</div>
        <div className="bg-[#0c0f1a] rounded border border-gray-800/60 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H_FFT}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          {/* Grid */}
          <line x1={MARGIN.left} y1={MARGIN.top + plotHFft} x2={W - MARGIN.right} y2={MARGIN.top + plotHFft} stroke="#1e2940" strokeWidth="0.5" />
          <line x1={MARGIN.left} y1={MARGIN.top} x2={MARGIN.left} y2={MARGIN.top + plotHFft} stroke="#1e2940" strokeWidth="0.5" />
          {/* Vertical grid lines */}
          {freqTicks.map((f) => {
            const x = MARGIN.left + (f / fftData.maxFreq) * PLOT_W;
            return (
              <g key={f}>
                <line x1={x} y1={MARGIN.top} x2={x} y2={MARGIN.top + plotHFft} stroke="#1a2235" strokeWidth="0.5" />
                <text x={x} y={H_FFT - 3} fill="#4b5563" fontSize="7" textAnchor="middle" fontFamily="monospace">{f}</text>
              </g>
            );
          })}
          {/* Y label */}
          <text x={4} y={MARGIN.top + plotHFft / 2} fill="#6b7280" fontSize="8" dominantBaseline="middle" fontFamily="monospace">|FFT|</text>
          <text x={W / 2} y={H_FFT - 3} fill="#6b7280" fontSize="7" textAnchor="middle" fontFamily="monospace">Frequency (Hz)</text>
          {/* Noise floor */}
          {noiseFloorPath && (
            <path d={noiseFloorPath} fill="none" stroke="#374151" strokeWidth="0.8" opacity="0.6" />
          )}
          {/* Spectral peaks */}
          {fftData.peaks.map((p, i) => {
            const x = MARGIN.left + (p.freq / fftData.maxFreq) * PLOT_W;
            const barH = p.amp * plotHFft * 0.85;
            const y = MARGIN.top + plotHFft - barH;
            return (
              <g key={i}>
                <line x1={x} y1={MARGIN.top + plotHFft} x2={x} y2={y} stroke={p.color} strokeWidth="2" opacity="0.85" />
                {/* Peak dot */}
                <circle cx={x} cy={y} r="2" fill={p.color} opacity="0.9" />
                {/* Label — only for primary peaks */}
                {!p.label.startsWith("2×") && (
                  <text x={x} y={y - 4} fill={p.color} fontSize="6.5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">{p.label}</text>
                )}
              </g>
            );
          })}
          {rpm <= 0 && (
            <text x={W / 2} y={H_FFT / 2} fill="#4b5563" fontSize="10" textAnchor="middle" fontFamily="monospace">No signal</text>
          )}
        </svg>
        </div>
      </div>
    </div>
  );
}
