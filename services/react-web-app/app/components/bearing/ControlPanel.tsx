import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

interface ControlPanelProps {
  rpm: number;
  setRpm: (rpm: number) => void;
  direction: "cw" | "ccw";
  setDirection: (dir: "cw" | "ccw") => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onReset: () => void;
  /** Radial load in kN */
  loadForce: number;
  setLoadForce: (force: number) => void;
  /** Show bearing housing */
  showHousing: boolean;
  setShowHousing: (show: boolean) => void;
  /** Grease fill level 0-1+ */
  greaseLevel: number;
  /** Pump one stroke of grease */
  onPump: () => void;
  /** Bearing damage type */
  damage: "none" | "outer-spall" | "inner-spall" | "ball-defect";
  setDamage: (d: "none" | "outer-spall" | "inner-spall" | "ball-defect") => void;
}

export default function ControlPanel({
  rpm,
  setRpm,
  direction,
  setDirection,
  isPlaying,
  setIsPlaying,
  onReset,
  loadForce,
  setLoadForce,
  showHousing,
  setShowHousing,
  greaseLevel,
  onPump,
  damage,
  setDamage,
}: ControlPanelProps) {
  // Friction coefficient: 1.0 = dry, 0.1 = well-lubricated
  const friction = greaseLevel >= 0.3 ? 0.1 : greaseLevel <= 0 ? 1.0 : 1.0 - (greaseLevel / 0.3) * 0.9;

  return (
    <Card className="w-72">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-base">
          Controls
          <Badge variant="outline" className="font-mono text-xs">
            6205
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Speed */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Speed</span>
            <span className="font-mono font-medium">{rpm.toFixed(1)} RPM</span>
          </div>
          <Slider
            value={[rpm]}
            onValueChange={([v]) => setRpm(v)}
            min={0}
            max={20}
            step={0.1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>20</span>
          </div>
        </div>

        <Separator />

        {/* Direction */}
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Direction</span>
          <div className="flex gap-2">
            <Button
              variant={direction === "cw" ? "default" : "outline"}
              size="sm"
              onClick={() => setDirection("cw")}
              className="flex-1"
            >
              ↻ CW
            </Button>
            <Button
              variant={direction === "ccw" ? "default" : "outline"}
              size="sm"
              onClick={() => setDirection("ccw")}
              className="flex-1"
            >
              ↺ CCW
            </Button>
          </div>
        </div>

        <Separator />

        {/* Radial Load */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Radial Load</span>
            <span className="font-mono font-medium">{loadForce.toFixed(1)} kN</span>
          </div>
          <Slider
            value={[loadForce]}
            onValueChange={([v]) => setLoadForce(v)}
            min={0}
            max={5}
            step={0.1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>5 kN</span>
          </div>
          {loadForce > 0 && (
            <div className="text-xs text-muted-foreground">
              Deflection:{" "}
              <span className="font-mono text-foreground">
                {(loadForce * 13).toFixed(1)} µm
              </span>
              <span className="ml-1">(exaggerated in view)</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Playback */}
        <div className="flex gap-2">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex-1"
            variant={isPlaying ? "secondary" : "default"}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </Button>
          <Button variant="outline" onClick={onReset}>
            Reset
          </Button>
        </div>

        <Separator />

        {/* Housing */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Housing</span>
          <Button
            variant={showHousing ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHousing(!showHousing)}
          >
            {showHousing ? "Visible" : "Hidden"}
          </Button>
        </div>

        {/* Grease — hand pump */}
        <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Grease Pump</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onPump}
                className="active:scale-95 transition-transform"
              >
                🛢️ Pump
              </Button>
            </div>
            {/* Fill level bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fill level</span>
                <span className="font-mono">{Math.round(greaseLevel * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    greaseLevel > 1 ? "bg-red-500" : greaseLevel > 0.8 ? "bg-yellow-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(greaseLevel * 100, 100)}%` }}
                />
              </div>
              {greaseLevel > 0.8 && greaseLevel <= 1 && (
                <p className="text-xs text-yellow-500">⚠ Near capacity</p>
              )}
              {greaseLevel > 1 && (
                <p className="text-xs text-red-500">💧 Overfilled — grease leaking!</p>
              )}
            </div>
          </div>

        {/* Friction indicator — always visible */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Friction</span>
            <span className={`font-mono font-medium ${
              friction > 0.7 ? "text-red-500" : friction > 0.3 ? "text-yellow-500" : "text-emerald-500"
            }`}>{(friction * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                friction > 0.7 ? "bg-red-500" : friction > 0.3 ? "bg-yellow-500" : "bg-emerald-500"
              }`}
              style={{ width: `${friction * 100}%` }}
            />
          </div>
          {friction > 0.7 && (
            <p className="text-xs text-red-500">🔥 High friction — lubricate bearing!</p>
          )}
          {friction > 0.3 && friction <= 0.7 && (
            <p className="text-xs text-yellow-500">⚠ Friction rising — re-lubricate soon</p>
          )}
        </div>

        <Separator />

        {/* Damage simulation */}
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Defect Simulation</span>
          <div className="grid grid-cols-2 gap-1.5">
            <Button
              variant={damage === "none" ? "default" : "outline"}
              size="sm"
              onClick={() => setDamage("none")}
              className="text-xs"
            >
              ✓ Healthy
            </Button>
            <Button
              variant={damage === "outer-spall" ? "destructive" : "outline"}
              size="sm"
              onClick={() => setDamage("outer-spall")}
              className="text-xs"
            >
              Outer Spall
            </Button>
            <Button
              variant={damage === "inner-spall" ? "destructive" : "outline"}
              size="sm"
              onClick={() => setDamage("inner-spall")}
              className="text-xs"
            >
              Inner Spall
            </Button>
            <Button
              variant={damage === "ball-defect" ? "destructive" : "outline"}
              size="sm"
              onClick={() => setDamage("ball-defect")}
              className="text-xs"
            >
              Ball Defect
            </Button>
          </div>
          {damage !== "none" && (
            <p className="text-xs text-red-500">
              ⚠ {damage === "outer-spall" ? "Outer race spall — raised BPFO" : damage === "inner-spall" ? "Inner race spall — raised BPFI" : "Ball surface defect — raised BSF"}
            </p>
          )}
        </div>

        <Separator />

        {/* Status */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={isPlaying ? "default" : "secondary"}>
              {isPlaying ? "Running" : "Stopped"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bearing</span>
            <span className="font-mono">25 × 52 × 15</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Balls</span>
            <span className="font-mono">9 × ⌀7.94</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
