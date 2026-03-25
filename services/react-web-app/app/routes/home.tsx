import type { Route } from "./+types/home";
import { useState, useEffect } from "react";
import ControlPanel from "~/components/bearing/ControlPanel";
import { Badge } from "~/components/ui/badge";
import BearingScene from "~/components/bearing/BearingScene";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bearing Spin Lab — 6205" },
    { name: "description", content: "Interactive 3D visualization of a 6205 ball bearing" },
  ];
}

export default function Home() {
  const [rpm, setRpm] = useState(0.1);
  const [direction, setDirection] = useState<"cw" | "ccw">("cw");
  const [isPlaying, setIsPlaying] = useState(true);
  const [loadForce, setLoadForce] = useState(1.0);
  const [showHousing, setShowHousing] = useState(false);
  const [greaseLevel, setGreaseLevel] = useState(0);
  const [pumpStroke, setPumpStroke] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleReset = () => {
    setIsPlaying(true);
    setRpm(0.1);
    setDirection("cw");
    setLoadForce(0);
    setShowHousing(false);
    setGreaseLevel(0);
    setPumpStroke(0);
  };

  const handlePump = () => {
    setGreaseLevel((prev) => prev + 0.15);
    // Animate pump stroke: push down then spring back
    setPumpStroke(1);
    setTimeout(() => setPumpStroke(0.5), 100);
    setTimeout(() => setPumpStroke(0), 250);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">Bearing Spin Lab</h1>
          <Badge variant="outline" className="font-mono">6205</Badge>
        </div>
        <span className="text-sm text-muted-foreground font-mono">25 × 52 × 15 mm</span>
      </header>

      {/* Main */}
      <div className="flex-1 flex min-h-0">
        {/* 3D viewport */}
        <div className="flex-1 bg-[#12121f]">
          {isClient ? (
            <BearingScene rpm={rpm} direction={direction} isPlaying={isPlaying} loadForce={loadForce} showHousing={showHousing} greaseLevel={greaseLevel} pumpStroke={pumpStroke} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Loading 3D scene…
            </div>
          )}
        </div>

        {/* Sidebar controls */}
        <div className="p-4 border-l shrink-0 overflow-y-auto">
          <ControlPanel
            rpm={rpm}
            setRpm={setRpm}
            direction={direction}
            setDirection={setDirection}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            onReset={handleReset}
            loadForce={loadForce}
            setLoadForce={setLoadForce}
            showHousing={showHousing}
            setShowHousing={setShowHousing}
            greaseLevel={greaseLevel}
            onPump={handlePump}
          />
        </div>
      </div>
    </div>
  );
}
