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
}: ControlPanelProps) {
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

        {/* Grease — hand pump, only with housing */}
        {showHousing && (
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
        )}

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
