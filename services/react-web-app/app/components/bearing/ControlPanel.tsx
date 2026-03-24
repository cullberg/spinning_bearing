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
}

export default function ControlPanel({
  rpm,
  setRpm,
  direction,
  setDirection,
  isPlaying,
  setIsPlaying,
  onReset,
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
