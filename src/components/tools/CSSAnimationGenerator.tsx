import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Copy, Wand2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface KeyframeValue {
  from: string;
  mid: string;
  to: string;
}

interface AnimationState {
  name: string;
  duration: number;
  delay: number;
  iteration: string;
  direction: string;
  fillMode: string;
  timingFunction: string;
  translateX: KeyframeValue;
  translateY: KeyframeValue;
  scale: KeyframeValue;
  color: KeyframeValue;
  opacity: KeyframeValue;
}

type KeyframeKeys = 'translateX' | 'translateY' | 'scale' | 'color' | 'opacity';
type ScalarKeys = 'name' | 'duration' | 'delay' | 'iteration' | 'direction' | 'fillMode' | 'timingFunction';

function isKeyframeKey(key: keyof AnimationState): key is KeyframeKeys {
  return ['translateX', 'translateY', 'scale', 'color', 'opacity'].includes(key as string);
}

function isScalarKey(key: keyof AnimationState): key is ScalarKeys {
  return ['name', 'duration', 'delay', 'iteration', 'direction', 'fillMode', 'timingFunction'].includes(key as string);
}

interface Preset {
  name: string;
  state: Partial<AnimationState>;
}

const PRESETS: Preset[] = [
  {
    name: "Fade In",
    state: {
      name: "fadeIn",
      duration: 1,
      opacity: { from: "0", mid: "0.5", to: "1" },
    },
  },
  {
    name: "Slide Right",
    state: {
      name: "slideRight",
      duration: 1,
      translateX: { from: "0px", mid: "100px", to: "0px" },
    },
  },
  {
    name: "Scale Up",
    state: {
      name: "scaleUp",
      duration: 1,
      scale: { from: "1", mid: "1.5", to: "1" },
    },
  },
  {
    name: "Bounce",
    state: {
      name: "bounce",
      duration: 0.8,
      timingFunction: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      translateY: { from: "0px", mid: "-20px", to: "0px" },
    },
  },
  {
    name: "Color Shift",
    state: {
      name: "colorShift",
      duration: 2,
      color: { from: "#2563eb", mid: "#ef4444", to: "#2563eb" },
    },
  },
];

const DEFAULT_STATE: AnimationState = {
  name: "customAnimation",
  duration: 1,
  delay: 0,
  iteration: "infinite",
  direction: "alternate",
  fillMode: "forwards",
  timingFunction: "ease-in-out",
  translateX: { from: "0px", mid: "0px", to: "0px" },
  translateY: { from: "0px", mid: "0px", to: "0px" },
  scale: { from: "1", mid: "1", to: "1" },
  color: { from: "#2563eb", mid: "#2563eb", to: "#2563eb" },
  opacity: { from: "1", mid: "1", to: "1" },
};

export const CSSAnimationGenerator = () => {
  const [animation, setAnimation] = useState<AnimationState>(DEFAULT_STATE);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [generatedCSS, setGeneratedCSS] = useState("");
  const [previewStyle, setPreviewStyle] = useState({});
  const { theme } = useTheme();

  const [styleId] = useState(`css-animation-preview-${Math.random().toString(36).substr(2, 9)}`);

  const updateKeyframe = (property: KeyframeKeys, key: "from" | "mid" | "to", value: string) => {
    setAnimation((prev) => ({
      ...prev,
      [property]: { ...prev[property], [key]: value },
    }));
  };

  const updateProperty = (property: keyof Omit<AnimationState, "translateX" | "translateY" | "scale" | "color" | "opacity">, value: string | number) => {
    setAnimation((prev) => ({ ...prev, [property]: value }));
  };

  const applyPreset = (presetName: string) => {
    if (presetName === "none") {
      setSelectedPreset("");
      return;
    }
    const preset = PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setAnimation(() => {
        const newState = { ...DEFAULT_STATE };
        if (preset.state.name) newState.name = preset.state.name;
        if (preset.state.duration !== undefined) newState.duration = preset.state.duration;
        if (preset.state.delay !== undefined) newState.delay = preset.state.delay;
        if (preset.state.iteration) newState.iteration = preset.state.iteration;
        if (preset.state.direction) newState.direction = preset.state.direction;
        if (preset.state.fillMode) newState.fillMode = preset.state.fillMode;
        if (preset.state.timingFunction) newState.timingFunction = preset.state.timingFunction;
        if (preset.state.translateX) newState.translateX = preset.state.translateX;
        if (preset.state.translateY) newState.translateY = preset.state.translateY;
        if (preset.state.scale) newState.scale = preset.state.scale;
        if (preset.state.color) newState.color = preset.state.color;
        if (preset.state.opacity) newState.opacity = preset.state.opacity;
        return newState;
      });
      setSelectedPreset(presetName);
    }
  };

  const generateCSS = useCallback(() => {
    const keyframeName = animation.name || "customAnimation";
    const keyframes = `
@keyframes ${keyframeName} {
  0% {
    transform: translateX(${animation.translateX.from}) translateY(${animation.translateY.from}) scale(${animation.scale.from});
    color: ${animation.color.from};
    opacity: ${animation.opacity.from};
  }
  50% {
    transform: translateX(${animation.translateX.mid}) translateY(${animation.translateY.mid}) scale(${animation.scale.mid});
    color: ${animation.color.mid};
    opacity: ${animation.opacity.mid};
  }
  100% {
    transform: translateX(${animation.translateX.to}) translateY(${animation.translateY.to}) scale(${animation.scale.to});
    color: ${animation.color.to};
    opacity: ${animation.opacity.to};
  }
}
`;

    const animationDecl = `.animated {
  animation: ${keyframeName} ${animation.duration}s ${animation.delay}s ${animation.iteration} ${animation.direction} ${animation.fillMode} ${animation.timingFunction};
}`;

    const fullCSS = keyframes + animationDecl;
    setGeneratedCSS(fullCSS);

    // Inject keyframes for preview
    let style = document.getElementById(styleId) as HTMLStyleElement;
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.textContent = keyframes;

    setPreviewStyle({
      animation: `${keyframeName} ${animation.duration}s ${animation.delay}s ${animation.iteration} ${animation.direction} ${animation.fillMode} ${animation.timingFunction}`,
    });
  }, [animation, styleId]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedCSS);
  };

  useEffect(() => {
    generateCSS();
  }, [generateCSS]);

  useEffect(() => {
    return () => {
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
    };
  }, [styleId]);

  return (
    <div className={`p-6 space-y-8 rounded-lg glass border ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>CSS Animation Generator</h2>
          <p className={`text-muted-foreground ${theme === 'dark' ? 'text-gray-300' : ''}`}>Build custom keyframe animations with live preview and export.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className={`glass col-span-2 ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <CardContent className="p-4 space-y-4">
            <Label className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Presets</Label>
            <Select value={selectedPreset} onValueChange={applyPreset}>
              <SelectTrigger className="glass">
                <SelectValue placeholder="Select a preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {PRESETS.map((preset) => (
                  <SelectItem key={preset.name} value={preset.name}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-4">
              <div>
                <Label className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Animation Name</Label>
                <Input
                  value={animation.name}
                  onChange={(e) => updateProperty("name", e.target.value)}
                  placeholder="e.g., myAnimation"
                  className="glass"
                />
              </div>

              <div className="space-y-2">
                <Label className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Duration (s)</Label>
                <Slider
                  value={[animation.duration]}
                  onValueChange={(v) => updateProperty("duration", v[0])}
                  min={0.1}
                  max={5}
                  step={0.1}
                />
                <Input
                  type="number"
                  value={animation.duration}
                  onChange={(e) => updateProperty("duration", parseFloat(e.target.value))}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="glass"
                />
              </div>

              <div className="space-y-2">
                <Label className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Delay (s)</Label>
                <Slider
                  value={[animation.delay]}
                  onValueChange={(v) => updateProperty("delay", v[0])}
                  min={0}
                  max={2}
                  step={0.1}
                />
                <Input
                  type="number"
                  value={animation.delay}
                  onChange={(e) => updateProperty("delay", parseFloat(e.target.value))}
                  min={0}
                  max={2}
                  step={0.1}
                  className="glass"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Select value={animation.iteration} onValueChange={(v) => updateProperty("iteration", v)}>
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Iteration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="infinite">Infinite</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={animation.direction} onValueChange={(v) => updateProperty("direction", v)}>
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="alternate">Alternate</SelectItem>
                    <SelectItem value="reverse">Reverse</SelectItem>
                    <SelectItem value="alternate-reverse">Alternate Reverse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Select value={animation.fillMode} onValueChange={(v) => updateProperty("fillMode", v)}>
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Fill Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="forwards">Forwards</SelectItem>
                    <SelectItem value="backwards">Backwards</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={animation.timingFunction} onValueChange={(v) => updateProperty("timingFunction", v)}>
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Timing Function" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ease">Ease</SelectItem>
                    <SelectItem value="ease-in">Ease In</SelectItem>
                    <SelectItem value="ease-out">Ease Out</SelectItem>
                    <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="cubic-bezier(0.68, -0.55, 0.265, 1.55)">Bounce</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Keyframes</Label>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className={`${theme === 'dark' ? 'text-gray-300' : ''}`}>0%</div>
                  <div className={`${theme === 'dark' ? 'text-gray-300' : ''}`}>50%</div>
                  <div className={`${theme === 'dark' ? 'text-gray-300' : ''}`}>100%</div>
                </div>
                <div className="space-y-2">
                  <div>
                    <Label className={`text-xs ${theme === 'dark' ? 'text-gray-300' : ''}`}>Translate X (px)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        value={animation.translateX.from}
                        onChange={(e) => updateKeyframe("translateX", "from", e.target.value)}
                        placeholder="0"
                        size={3}
                        className="glass"
                      />
                      <Input
                        value={animation.translateX.mid}
                        onChange={(e) => updateKeyframe("translateX", "mid", e.target.value)}
                        placeholder="0"
                        size={3}
                        className="glass"
                      />
                      <Input
                        value={animation.translateX.to}
                        onChange={(e) => updateKeyframe("translateX", "to", e.target.value)}
                        placeholder="0"
                        size={3}
                        className="glass"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className={`text-xs ${theme === 'dark' ? 'text-gray-300' : ''}`}>Translate Y (px)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        value={animation.translateY.from}
                        onChange={(e) => updateKeyframe("translateY", "from", e.target.value)}
                        placeholder="0"
                        size={3}
                        className="glass"
                      />
                      <Input
                        value={animation.translateY.mid}
                        onChange={(e) => updateKeyframe("translateY", "mid", e.target.value)}
                        placeholder="0"
                        size={3}
                        className="glass"
                      />
                      <Input
                        value={animation.translateY.to}
                        onChange={(e) => updateKeyframe("translateY", "to", e.target.value)}
                        placeholder="0"
                        size={3}
                        className="glass"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className={`text-xs ${theme === 'dark' ? 'text-gray-300' : ''}`}>Scale</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        value={animation.scale.from}
                        onChange={(e) => updateKeyframe("scale", "from", e.target.value)}
                        placeholder="1"
                        min={0}
                        max={2}
                        step={0.1}
                        size={3}
                        className="glass"
                      />
                      <Input
                        type="number"
                        value={animation.scale.mid}
                        onChange={(e) => updateKeyframe("scale", "mid", e.target.value)}
                        placeholder="1"
                        min={0}
                        max={2}
                        step={0.1}
                        size={3}
                        className="glass"
                      />
                      <Input
                        type="number"
                        value={animation.scale.to}
                        onChange={(e) => updateKeyframe("scale", "to", e.target.value)}
                        placeholder="1"
                        min={0}
                        max={2}
                        step={0.1}
                        size={3}
                        className="glass"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className={`text-xs ${theme === 'dark' ? 'text-gray-300' : ''}`}>Color (hex)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="color"
                        value={animation.color.from}
                        onChange={(e) => updateKeyframe("color", "from", e.target.value)}
                        className="h-10 w-full cursor-pointer"
                      />
                      <Input
                        type="color"
                        value={animation.color.mid}
                        onChange={(e) => updateKeyframe("color", "mid", e.target.value)}
                        className="h-10 w-full cursor-pointer"
                      />
                      <Input
                        type="color"
                        value={animation.color.to}
                        onChange={(e) => updateKeyframe("color", "to", e.target.value)}
                        className="h-10 w-full cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className={`text-xs ${theme === 'dark' ? 'text-gray-300' : ''}`}>Opacity</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        value={animation.opacity.from}
                        onChange={(e) => updateKeyframe("opacity", "from", e.target.value)}
                        placeholder="1"
                        min={0}
                        max={1}
                        step={0.1}
                        size={3}
                        className="glass"
                      />
                      <Input
                        type="number"
                        value={animation.opacity.mid}
                        onChange={(e) => updateKeyframe("opacity", "mid", e.target.value)}
                        placeholder="1"
                        min={0}
                        max={1}
                        step={0.1}
                        size={3}
                        className="glass"
                      />
                      <Input
                        type="number"
                        value={animation.opacity.to}
                        onChange={(e) => updateKeyframe("opacity", "to", e.target.value)}
                        placeholder="1"
                        min={0}
                        max={1}
                        step={0.1}
                        size={3}
                        className="glass"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <CardContent className="p-4 space-y-4">
            <Label className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Live Preview</Label>
            <div className={`flex justify-center items-center h-64 bg-muted rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <div
                className="w-24 h-24 bg-primary rounded-lg flex items-center justify-center text-white font-bold animated"
                style={previewStyle}
              >
                Box
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export */}
      {generatedCSS && (
        <Card className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <CardContent className="p-4 space-y-4">
            <Label className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Generated CSS</Label>
            <pre className={`bg-muted p-4 rounded-lg font-mono text-sm overflow-auto max-h-48 whitespace-pre-wrap ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>
              {generatedCSS}
            </pre>
            <Button onClick={copyToClipboard} className={`w-full glass ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
