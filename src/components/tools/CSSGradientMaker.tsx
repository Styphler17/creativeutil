import { useMemo, useRef, useState } from "react";
import { Copy, Plus, RotateCw, Shuffle, ArrowLeftRight } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

type GradientType = "linear" | "radial" | "conic" | "repeating-linear";

interface ColorStop {
  color: string;
  position: number;
}

interface Preset {
  name: string;
  gradientType: GradientType;
  angle?: number;
  radialShape?: "circle" | "ellipse";
  radialSize?: "closest-side" | "closest-corner" | "farthest-side" | "farthest-corner";
  radialPosition?: { x: number; y: number };
  conicPosition?: { x: number; y: number };
  stops: ColorStop[];
}

const gradientPresets: Preset[] = [
  {
    name: "Sunset Drift",
    gradientType: "linear",
    angle: 135,
    stops: [
      { color: "#ff6b6b", position: 0 },
      { color: "#f6d365", position: 50 },
      { color: "#4ecdc4", position: 100 },
    ],
  },
  {
    name: "Aurora",
    gradientType: "radial",
    radialShape: "ellipse",
    radialSize: "farthest-corner",
    radialPosition: { x: 50, y: 45 },
    stops: [
      { color: "#2f80ed", position: 0 },
      { color: "#9b51e0", position: 45 },
      { color: "#f2994a", position: 85 },
      { color: "#f2c94c", position: 100 },
    ],
  },
  {
    name: "Candy Stripe",
    gradientType: "repeating-linear",
    angle: 60,
    stops: [
      { color: "#ff4d6d", position: 0 },
      { color: "#ff4d6d", position: 10 },
      { color: "#ffe066", position: 10 },
      { color: "#ffe066", position: 20 },
    ],
  },
  {
    name: "Glass Cone",
    gradientType: "conic",
    angle: 0,
    conicPosition: { x: 50, y: 50 },
    stops: [
      { color: "#56ccf2", position: 0 },
      { color: "#bb6bd9", position: 40 },
      { color: "#f2994a", position: 70 },
      { color: "#56ccf2", position: 100 },
    ],
  },
];

const clampPosition = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const randomHex = () => `#${Math.floor(Math.random() * 0xffffff)
  .toString(16)
  .padStart(6, "0")}`;

export const CSSGradientMaker = () => {
  const { toast } = useToast();
  const { theme } = useTheme();

  const [gradientType, setGradientType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(135);
  const [radialShape, setRadialShape] = useState<"circle" | "ellipse">("circle");
  const [radialSize, setRadialSize] = useState<"closest-side" | "closest-corner" | "farthest-side" | "farthest-corner">(
    "farthest-corner",
  );
  const [radialPosition, setRadialPosition] = useState({ x: 50, y: 50 });
  const [conicPosition, setConicPosition] = useState({ x: 50, y: 50 });
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { color: "#ff6b6b", position: 0 },
    { color: "#4ecdc4", position: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  const gradientBarRef = useRef<HTMLDivElement>(null);

  const sortedStops = useMemo(
    () => [...colorStops].sort((a, b) => a.position - b.position),
    [colorStops],
  );

  const gradientString = useMemo(() => {
    const stops = sortedStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ");

    if (gradientType === "linear") {
      return `linear-gradient(${angle}deg, ${stops})`;
    }

    if (gradientType === "repeating-linear") {
      return `repeating-linear-gradient(${angle}deg, ${stops})`;
    }

    if (gradientType === "radial") {
      const radialParts = [radialShape, radialSize].filter(Boolean).join(" ");
      return `radial-gradient(${radialParts} at ${radialPosition.x}% ${radialPosition.y}%, ${stops})`;
    }

    // conic
    return `conic-gradient(from ${angle}deg at ${conicPosition.x}% ${conicPosition.y}%, ${stops})`;
  }, [sortedStops, gradientType, angle, radialShape, radialSize, radialPosition, conicPosition]);

  const cssCode = `background-image: ${gradientString};
background: ${gradientString};`;

  const updateStops = (updater: (prev: ColorStop[]) => ColorStop[]) => {
    setColorStops((prev) => {
      const next = updater(prev).map((stop) => ({
        color: stop.color,
        position: clampPosition(stop.position),
      }));
      return next.sort((a, b) => a.position - b.position);
    });
  };

  const addStopAt = (position = 50) => {
    updateStops((prev) => [...prev, { color: randomHex(), position }]);
  };

  const handleGradientBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!gradientBarRef.current) return;
    const rect = gradientBarRef.current.getBoundingClientRect();
    const position = clampPosition(((event.clientX - rect.left) / rect.width) * 100);
    addStopAt(position);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
      setCopied(true);
      toast({ title: "Gradient copied", description: "CSS gradient code copied to your clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Your browser blocked clipboard access.",
        variant: "destructive",
      });
    }
  };

  const applyPreset = (preset: Preset) => {
    setGradientType(preset.gradientType);
    setAngle(preset.angle ?? (preset.gradientType === "linear" ? 135 : 0));
    setRadialShape(preset.radialShape ?? "circle");
    setRadialSize(preset.radialSize ?? "farthest-corner");
    setRadialPosition(preset.radialPosition ?? { x: 50, y: 50 });
    setConicPosition(preset.conicPosition ?? { x: 50, y: 50 });
    updateStops(() => preset.stops.map((stop) => ({ ...stop })));
  };

  const resetDefaults = () => {
    setGradientType("linear");
    setAngle(135);
    setRadialShape("circle");
    setRadialSize("farthest-corner");
    setRadialPosition({ x: 50, y: 50 });
    setConicPosition({ x: 50, y: 50 });
    updateStops(() => [
      { color: "#ff6b6b", position: 0 },
      { color: "#4ecdc4", position: 100 },
    ]);
  };

  const randomiseColors = () => {
    updateStops((prev) => prev.map((stop) => ({ ...stop, color: randomHex() })));
  };

  const reverseStops = () => {
    updateStops((prev) => prev.map((stop) => ({ ...stop, position: 100 - stop.position })).reverse());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CSS Gradient Generator</CardTitle>
          <CardDescription>
            Design polished gradients with unlimited color stops, fine-grained angle control, and instant CSS export.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 lg:grid-cols-[minmax(0,370px)_1fr]">
          <div className="space-y-6">
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Presets</h3>
                <Badge variant="outline">Quick start</Badge>
              </div>
                  <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                    {gradientPresets.map((preset) => {
                      const presetGradient = `linear-gradient(90deg, ${preset.stops
                        .map((s) => `${s.color} ${s.position}%`)
                        .join(", ")})`;
                      return (
                    <Button
                      key={preset.name}
                      type="button"
                      variant="outline"
                      className="w-full items-center justify-start gap-3"
                      onClick={() => applyPreset(preset)}
                    >
                      <span
                        className="h-4 w-4 flex-shrink-0 rounded-full border border-border/60 shadow-inner"
                        style={{ background: presetGradient }}
                      />
                      {preset.name}
                    </Button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-2">
                <LabelWithHint label="Gradient type" hint="Switch between linear, radial, conic, and repeating gradients." />
                <Select value={gradientType} onValueChange={(value) => setGradientType(value as GradientType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="repeating-linear">Repeating linear</SelectItem>
                    <SelectItem value="radial">Radial</SelectItem>
                    <SelectItem value="conic">Conic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(gradientType === "linear" || gradientType === "repeating-linear" || gradientType === "conic") && (
                <div className="space-y-2">
                  <LabelWithHint label="Angle" hint="Rotate the gradient to match your layout." />
                  <div className="flex items-center gap-3">
                    <Slider value={[angle]} min={0} max={360} step={1} onValueChange={(value) => setAngle(value[0])} />
                    <Input
                      value={angle}
                      onChange={(event) => setAngle(clampPosition(Number(event.target.value) || 0))}
                      className="w-20 text-center"
                      type="number"
                      min={0}
                      max={360}
                    />
                  </div>
                </div>
              )}

              {gradientType === "radial" && (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <LabelWithHint label="Shape" hint="Circle keeps proportions. Ellipse stretches to fit." />
                      <Select value={radialShape} onValueChange={(value) => setRadialShape(value as "circle" | "ellipse")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="circle">Circle</SelectItem>
                          <SelectItem value="ellipse">Ellipse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <LabelWithHint label="Size" hint="Define how far the gradient reaches." />
                      <Select value={radialSize} onValueChange={(value) => setRadialSize(value as typeof radialSize)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="closest-side">Closest side</SelectItem>
                          <SelectItem value="closest-corner">Closest corner</SelectItem>
                          <SelectItem value="farthest-side">Farthest side</SelectItem>
                          <SelectItem value="farthest-corner">Farthest corner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <LabelWithHint label="Center position" hint="Reposition the focal point." />
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="w-12 text-xs text-muted-foreground">X axis</span>
                        <Slider
                          value={[radialPosition.x]}
                          onValueChange={(value) => setRadialPosition((prev) => ({ ...prev, x: value[0] }))}
                          min={0}
                          max={100}
                        />
                        <Input
                          value={radialPosition.x}
                          onChange={(event) =>
                            setRadialPosition((prev) => ({
                              ...prev,
                              x: clampPosition(Number(event.target.value) || 0),
                            }))
                          }
                          className="w-16 text-center"
                          type="number"
                          min={0}
                          max={100}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-12 text-xs text-muted-foreground">Y axis</span>
                        <Slider
                          value={[radialPosition.y]}
                          onValueChange={(value) => setRadialPosition((prev) => ({ ...prev, y: value[0] }))}
                          min={0}
                          max={100}
                        />
                        <Input
                          value={radialPosition.y}
                          onChange={(event) =>
                            setRadialPosition((prev) => ({
                              ...prev,
                              y: clampPosition(Number(event.target.value) || 0),
                            }))
                          }
                          className="w-16 text-center"
                          type="number"
                          min={0}
                          max={100}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {gradientType === "conic" && (
                <div className="space-y-2">
                  <LabelWithHint label="Pivot point" hint="Set the center for the conic gradient sweep." />
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-12 text-xs text-muted-foreground">X axis</span>
                      <Slider
                        value={[conicPosition.x]}
                        onValueChange={(value) => setConicPosition((prev) => ({ ...prev, x: value[0] }))}
                        min={0}
                        max={100}
                      />
                      <Input
                        value={conicPosition.x}
                        onChange={(event) =>
                          setConicPosition((prev) => ({
                            ...prev,
                            x: clampPosition(Number(event.target.value) || 0),
                          }))
                        }
                        className="w-16 text-center"
                        type="number"
                        min={0}
                        max={100}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-12 text-xs text-muted-foreground">Y axis</span>
                      <Slider
                        value={[conicPosition.y]}
                        onValueChange={(value) => setConicPosition((prev) => ({ ...prev, y: value[0] }))}
                        min={0}
                        max={100}
                      />
                      <Input
                        value={conicPosition.y}
                        onChange={(event) =>
                          setConicPosition((prev) => ({
                            ...prev,
                            y: clampPosition(Number(event.target.value) || 0),
                          }))
                        }
                        className="w-16 text-center"
                        type="number"
                        min={0}
                        max={100}
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <LabelWithHint label="Color stops" hint="Add, drag, or edit each stop to fine tune the blend." />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => addStopAt()} className="w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Add stop
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={randomiseColors} className="w-full sm:w-auto">
                      <Shuffle className="mr-2 h-4 w-4" />
                      Randomise
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={reverseStops} className="w-full sm:w-auto">
                      <ArrowLeftRight className="mr-2 h-4 w-4" />
                      Reverse
                    </Button>
                  </div>
                </div>

              <div className="space-y-3 max-h-[22rem] overflow-y-auto pr-1">
                {sortedStops.map((stop, index) => (
                  <div
                    key={`${stop.color}-${index}`}
                    className="grid gap-3 rounded-lg border border-border/60 bg-muted/40 p-3 sm:grid-cols-2 md:grid-cols-[auto,1fr,auto] md:items-center"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <Input
                        type="color"
                        value={stop.color}
                        onChange={(event) =>
                          updateStops((prev) =>
                            prev.map((current, idx) =>
                              idx === index ? { ...current, color: event.target.value } : current,
                            ),
                          )
                        }
                        className="h-9 w-12 cursor-pointer border"
                      />
                      <Input
                        value={stop.color}
                        onChange={(event) =>
                          updateStops((prev) =>
                            prev.map((current, idx) =>
                              idx === index
                                ? { ...current, color: event.target.value.startsWith("#") ? event.target.value : `#${event.target.value}` }
                                : current,
                            ),
                          )
                        }
                        className="w-full font-mono text-sm uppercase sm:w-28"
                      />
                    </div>
                    <div className="flex flex-col gap-3 sm:col-span-2 md:col-span-1 md:flex-row md:items-center">
                      <Slider
                        value={[stop.position]}
                        onValueChange={(value) =>
                          updateStops((prev) =>
                            prev.map((current, idx) =>
                              idx === index ? { ...current, position: value[0] } : current,
                            ),
                          )
                        }
                        min={0}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <Input
                        value={stop.position}
                        type="number"
                        min={0}
                        max={100}
                        onChange={(event) =>
                          updateStops((prev) =>
                            prev.map((current, idx) =>
                              idx === index
                                ? { ...current, position: clampPosition(Number(event.target.value) || 0) }
                                : current,
                            ),
                          )
                        }
                        className="w-full text-center sm:w-20"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                      <Badge variant="outline" className="text-xs">
                        {stop.position}%
                      </Badge>
                      {sortedStops.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateStops((prev) => prev.filter((_, idx) => idx !== index))
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <Button type="button" variant="outline" className="w-full" onClick={resetDefaults}>
                <RotateCw className="mr-2 h-4 w-4" />
                Reset to defaults
              </Button>
              <p className="text-xs text-muted-foreground">
                Tip: click the preview gradient to drop a new color stop exactly where you need it.
              </p>
            </section>
          </div>

          <div className="space-y-6">
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Live preview</h3>
                  <p className="text-sm text-muted-foreground">Click anywhere on the bar to add a stop.</p>
                </div>
                <Badge variant="outline">{sortedStops.length} stops</Badge>
              </div>
              <div
                ref={gradientBarRef}
                onClick={handleGradientBarClick}
                className="relative h-16 w-full cursor-crosshair overflow-hidden rounded-2xl border border-border/60 shadow-inner"
                style={{ backgroundImage: gradientString }}
              >
                {sortedStops.map((stop, index) => (
                  <span
                    key={`marker-${index}`}
                    className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-white shadow-md outline outline-1 outline-black/10"
                    style={{
                      left: `${stop.position}%`,
                      marginLeft: -12,
                      backgroundColor: stop.color,
                    }}
                    onClick={(event) => event.stopPropagation()}
                  />
                ))}
              </div>

              <div
                className="flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-border/60 md:h-72"
                style={{ backgroundImage: gradientString }}
              >
                <div className="rounded-xl bg-background/70 px-6 py-4 text-center shadow-lg backdrop-blur-md">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Gradient</p>
                  <p className="text-base font-semibold text-foreground">
                    {gradientType.replace("-", " ")} &middot; {sortedStops.length} stops
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">CSS output</h3>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCopy}
                  variant={copied ? "default" : "outline"}
                  className="w-full sm:w-auto"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "Copied" : "Copy CSS"}
                </Button>
              </div>
              <Textarea
                value={cssCode}
                readOnly
                className="min-h-[180px] font-mono text-xs leading-6"
              />
            </section>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tips</CardTitle>
          <CardDescription>Quick ways to keep gradients sharp and accessible.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Keep high-contrast colors at opposing stops for better readability behind text.</p>
          <p>• Use the repeating option to craft stripes, hatches, or subtle texture backdrops.</p>
          <p>• Convert the CSS to `background-image` in styled components or Tailwind using arbitrary values.</p>
        </CardContent>
      </Card>
    </div>
  );
};

const LabelWithHint = ({ label, hint }: { label: string; hint?: string }) => (
  <div>
    <p className="text-sm font-medium text-foreground">{label}</p>
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export default CSSGradientMaker;


