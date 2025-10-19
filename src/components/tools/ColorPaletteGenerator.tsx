import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Lock, Unlock, Palette, X, Save, Share, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolOutputs } from "@/contexts/ToolOutputsContext";
import { useTheme } from "@/contexts/ThemeContext";

export const ColorPaletteGenerator = () => {
  const [palette, setPalette] = useState<string[]>([
    "#2563eb",
    "#fbbf24",
    "#f5f5dc",
    "#007bff",
    "#ffd700"
  ]); // Initial brand-inspired palette
  const [locks, setLocks] = useState<boolean[]>([false, false, false, false, false]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [randomMode, setRandomMode] = useState(true);
  const [format, setFormat] = useState<'hex' | 'rgb' | 'rgba' | 'hsl'>('hex');
  const [alpha, setAlpha] = useState(1.0);
  const [openPopoverIndex, setOpenPopoverIndex] = useState<number | null>(null);
  const [savedStates, setSavedStates] = useState<Record<string, unknown>[]>([]);
  const { toast } = useToast();
  const { addOutput } = useToolOutputs();
  const { theme } = useTheme();

  // Load saved states from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('colorPaletteStates');
    if (saved) {
      setSavedStates(JSON.parse(saved));
    }
  }, []);

  // Save states to localStorage whenever savedStates changes
  useEffect(() => {
    localStorage.setItem('colorPaletteStates', JSON.stringify(savedStates));
  }, [savedStates]);

  const generateRandomHex = (): string => {
    // Generate varied random hex (mix light/dark for better contrast potential)
    const h = Math.random();
    const s = 0.5 + Math.random() * 0.4; // 50-90%
    const rand = Math.random();
    const l = rand > 0.5 ? 0.7 + Math.random() * 0.2 : 0.2 + Math.random() * 0.3; // Light 70-90%, Dark 20-50%
    const [r, g, b] = hslToRgb(h, s, l);
    return rgbToHex(r, g, b);
  };

  // Remove hslToHex as no longer needed (generateRandomHex now returns hex directly)

  const hexToRgbNumbers = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [0, 0, 0];
    return [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    ];
  };

  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h, s, l];
  };

  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    const hp = h * 6;
    if (0 <= hp && hp < 1) { r = c; g = x; }
    else if (1 <= hp && hp < 2) { r = x; g = c; }
    else if (2 <= hp && hp < 3) { g = c; b = x; }
    else if (3 <= hp && hp < 4) { g = x; b = c; }
    else if (4 <= hp && hp < 5) { r = x; b = c; }
    else { r = c; b = x; }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return [r / 255, g / 255, b / 255];
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const generateRandomPalette = (numColors: number = 5): string[] => {
    const newPalette: string[] = [];
    // Generate extreme high and low luminance for strong contrasts
    const highL = [];
    const lowL = [];
    for (let i = 0; i < 3; i++) { // 3 high
      highL.push(0.85 + Math.random() * 0.1); // 85-95%
    }
    for (let i = 0; i < 2; i++) { // 2 low
      lowL.push(0.05 + Math.random() * 0.1); // 5-15%
    }
    // Strict interleave: high, low, high, low, high for guaranteed high-low adjacent
    const lSequence = [highL[0], lowL[0], highL[1], lowL[1], highL[2]];
    for (let i = 0; i < numColors; i++) {
      const h = Math.random();
      const s = 0.6 + Math.random() * 0.3; // 60-90% for vibrancy
      const l = lSequence[i];
      const [r, g, b] = hslToRgb(h, s, l);
      newPalette.push(rgbToHex(r, g, b));
    }
    return newPalette;
  };

  const generateHarmoniousPalette = (baseColor: string, numColors: number = 5): string[] => {
    let h, s, l;
    if (randomMode) {
      // Random base for variety
      h = Math.random();
      s = 0.4 + Math.random() * 0.5; // 40-90%
      l = 0.5; // Neutral base
    } else {
      [h, s, l] = rgbToHsl(...hexToRgbNumbers(baseColor));
    }
    const newPalette: string[] = [];
    // Generate extreme high and low luminance for strong contrasts
    const highL = [];
    const lowL = [];
    for (let i = 0; i < 3; i++) { // 3 high
      highL.push(0.85 + Math.random() * 0.1); // 85-95%
    }
    for (let i = 0; i < 2; i++) { // 2 low
      lowL.push(0.05 + Math.random() * 0.1); // 5-15%
    }
    // Strict interleave: high, low, high, low, high for guaranteed high-low adjacent
    const lSequence = [highL[0], lowL[0], highL[1], lowL[1], highL[2]];
    for (let i = 0; i < numColors; i++) {
      const hueOffset = (Math.random() - 0.5) * 0.1; // ±18 degrees random
      const shiftedH = (h + i * 0.083 + hueOffset) % 1;
      let variedS = s * (0.8 + Math.random() * 0.4);
      variedS = Math.max(0.3, Math.min(0.9, variedS)); // Clamp saturation
      const variedL = lSequence[i];
      const [r, g, b] = hslToRgb(shiftedH, variedS, variedL);
      newPalette.push(rgbToHex(r, g, b));
    }
    return newPalette;
  };

  const regeneratePalette = () => {
    let newPalette: string[];
    if (randomMode) {
      newPalette = generateRandomPalette();
    } else {
      const baseColor = palette[0] || generateRandomHex();
      newPalette = generateHarmoniousPalette(baseColor);
    }
    setPalette(newPalette);
    // Check average contrast
    let totalContrast = 0;
    for (let i = 0; i < newPalette.length - 1; i++) {
      totalContrast += calculateContrast(newPalette[i], newPalette[i + 1]);
    }
    const avgContrast = totalContrast / (newPalette.length - 1);
    if (avgContrast < 4.5) {
      toast({
        title: "Palette Regenerated!",
        description: randomMode ? "New random colors generated. Average contrast low – try harmonious mode." : "New harmonious colors generated.",
        variant: avgContrast < 4.5 ? "destructive" : "default",
      });
    } else {
      toast({
        title: "Palette Regenerated!",
        description: randomMode ? "New random colors generated with good contrasts." : "New harmonious colors generated with good contrasts.",
      });
    }
  };

  const toggleLock = (index: number) => {
    const newLocks = [...locks];
    newLocks[index] = !newLocks[index];
    setLocks(newLocks);
  };

  const regenerateUnlocked = () => {
    const newPalette = [...palette];
    let newColors: string[];
    if (randomMode) {
      newColors = generateRandomPalette();
    } else {
      const baseColor = palette[0] || generateRandomHex();
      newColors = generateHarmoniousPalette(baseColor);
    }
    // Map to unlocked positions while preserving interleave diversity
    let newIndex = 0;
    for (let i = 0; i < newPalette.length; i++) {
      if (!locks[i]) {
        newPalette[i] = newColors[newIndex % newColors.length];
        newIndex++;
      }
    }
    setPalette(newPalette);
    toast({
      title: "Unlocked Colors Regenerated!",
      description: "Only unlocked colors updated with varied luminance for better contrasts.",
    });
  };

  const updateColor = (index: number, newColor: string) => {
    const parsedHex = parseColorToHex(newColor, format);
    const newPalette = [...palette];
    newPalette[index] = parsedHex;
    setPalette(newPalette);
    // Unlock on manual change
    const newLocks = [...locks];
    newLocks[index] = false;
    setLocks(newLocks);
    toast({
      title: "Color Updated!",
      description: "Manual color change applied.",
    });
  };

  const formatColorFromHex = (hex: string, fmt: 'hex' | 'rgb' | 'rgba' | 'hsl', alphaVal?: number): string => {
    if (fmt === 'hex') return hex;
    const [r, g, b] = hexToRgbNumbers(hex);
    const rr = Math.round(r * 255);
    const gg = Math.round(g * 255);
    const bb = Math.round(b * 255);
    if (fmt === 'rgb') return `rgb(${rr}, ${gg}, ${bb})`;
    if (fmt === 'rgba') return `rgba(${rr}, ${gg}, ${bb}, ${alphaVal || 1})`;
    // HSL
    const [h, s, l] = rgbToHsl(r, g, b);
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const parseColorToHex = (input: string, currentFormat: 'hex' | 'rgb' | 'rgba' | 'hsl'): string => {
    input = input.trim().toLowerCase();
    if (currentFormat === 'hex' || input.startsWith('#')) {
      if (/^#[0-9a-f]{6}$/i.test(input)) return input.toUpperCase();
      return palette[0] || '#000000'; // Fallback
    }
    if (currentFormat === 'rgb' || input.startsWith('rgb(')) {
      const match = input.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        const r = parseInt(match[1]) / 255;
        const g = parseInt(match[2]) / 255;
        const b = parseInt(match[3]) / 255;
        return rgbToHex(r, g, b);
      }
    }
    if (currentFormat === 'rgba' || input.startsWith('rgba(')) {
      const match = input.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (match) {
        const r = parseInt(match[1]) / 255;
        const g = parseInt(match[2]) / 255;
        const b = parseInt(match[3]) / 255;
        return rgbToHex(r, g, b); // Ignore alpha for internal
      }
    }
    if (currentFormat === 'hsl' || input.startsWith('hsl(')) {
      const match = input.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
      if (match) {
        const hh = parseInt(match[1]) / 360;
        const ss = parseInt(match[2]) / 100;
        const ll = parseInt(match[3]) / 100;
        const [r, g, b] = hslToRgb(hh, ss, ll);
        return rgbToHex(r, g, b);
      }
    }
    toast({ title: "Invalid Format!", description: "Could not parse color. Using current.", variant: "destructive" });
    return palette[0] || '#000000';
  };

  const displayRgb = (hex: string): string => {
    return formatColorFromHex(hex, 'rgb');
  };

  const getRelativeLuminance = (r: number, g: number, b: number): number => {
    const rs = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gs = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bs = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    return rs * 0.2126 + gs * 0.7152 + bs * 0.0722;
  };

  const calculateContrast = (color1: string, color2: string): number => {
    const [r1, g1, b1] = hexToRgbNumbers(color1);
    const [r2, g2, b2] = hexToRgbNumbers(color2);
    const l1 = getRelativeLuminance(r1, g1, b1);
    const l2 = getRelativeLuminance(r2, g2, b2);
    const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return parseFloat(contrast.toFixed(2));
  };

  const copyColor = (color: string, index: number) => {
    const formatted = formatColorFromHex(color, format, format === 'rgba' ? alpha : undefined);
    navigator.clipboard.writeText(formatted);
    setCopiedIndex(index);
    // Add visual feedback with border flash
    const element = document.querySelector(`[data-color-index="${index}"]`);
    if (element) {
      element.classList.add('border-4', 'border-green-500');
      setTimeout(() => {
        element.classList.remove('border-4', 'border-green-500');
      }, 300);
    }
    toast({
      title: "Color Copied!",
      description: `${formatted} copied to clipboard.`,
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const saveCurrentState = () => {
    const state = {
      palette,
      locks,
      randomMode,
      format,
      alpha,
    };
    setSavedStates(prev => [...prev, state]);
    toast({
      title: "Palette Saved!",
      description: "Current palette state saved locally.",
    });
  };

  const loadState = (index: number) => {
    const state = savedStates[index];
    if (state) {
      setPalette(state.palette as string[]);
      setLocks(state.locks as boolean[]);
      setRandomMode(state.randomMode as boolean);
      setFormat(state.format as 'hex' | 'rgb' | 'rgba' | 'hsl');
      setAlpha(state.alpha as number);
      toast({
        title: "Palette Loaded!",
        description: "Saved palette state restored.",
      });
    }
  };

  const sharePalette = () => {
    const state = {
      palette,
      locks,
      randomMode,
      format,
      alpha,
    };
    const encoded = btoa(JSON.stringify(state));
    const url = `${window.location.origin}/tools/color-palette-generator?state=${encoded}`;

    if (navigator.share) {
      navigator.share({
        title: 'Color Palette',
        text: 'Check out this color palette I created!',
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Share Link Copied!",
        description: "Palette share link copied to clipboard.",
      });
    }
  };

  const exportPalette = () => {
    const css = palette.map((color, index) => `--color-${index + 1}: ${color};`).join('\n');
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'palette.css';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Palette Exported!",
      description: "CSS variables exported as palette.css",
    });
  };

  const copyPalette = () => {
    const formatted = palette.map((color, index) => `--color-${index + 1}: ${formatColorFromHex(color, format, format === 'rgba' ? alpha : undefined)};`).join('\n');
    navigator.clipboard.writeText(formatted);
    toast({
      title: "Palette Copied!",
      description: "Full palette copied to clipboard.",
    });
  };

  // Add palette to shared outputs
  const addToSharedOutputs = () => {
    addOutput({
      type: 'palette',
      data: { palette, format, alpha },
    });
    toast({
      title: "Palette Shared!",
      description: "Palette added to shared outputs for use in other tools.",
    });
  };

  const openTunePopover = (index: number) => {
    setOpenPopoverIndex(index);
  };

  const closeTunePopover = () => {
    setOpenPopoverIndex(null);
  };

  const getContrastLevel = (ratio: number): string => {
    if (ratio >= 7) return "AAA";
    if (ratio >= 4.5) return "AA";
    return "Fail";
  };

  const getTextColor = (hex: string): string => {
    const [r, g, b] = hexToRgbNumbers(hex);
    const luminance = getRelativeLuminance(r, g, b);
    return luminance > 0.5 ? "#000000" : "#ffffff"; // Dark text on light bg, light on dark
  };

  const getBadgeBg = (hex: string): string => {
    const textColor = getTextColor(hex);
    return textColor === "#000000" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
  };

  return (
    <div className={`p-6 space-y-8 rounded-lg glass border ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Color Palette Generator</h2>
        <p className={`text-foreground ${theme === 'dark' ? 'text-gray-300' : ''}`}>
          Generate harmonious color palettes with lockable colors, copy codes, and WCAG contrast analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className={`space-y-6 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <div className="space-y-2">
            <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Palette Controls</Label>
            <div className="flex flex-wrap gap-2">
              <Button onClick={regeneratePalette} variant="outline" className={`glass ${theme === 'dark' ? 'text-white' : ''}`}>
                <Palette className="mr-2 h-4 w-4" />
                Generate New Palette
              </Button>
              <Button onClick={regenerateUnlocked} variant="outline" className={`glass ${theme === 'dark' ? 'text-white' : ''}`}>
                Regenerate Unlocked
              </Button>
              <Button onClick={saveCurrentState} variant="outline" className={`glass ${theme === 'dark' ? 'text-white' : ''}`}>
                <Save className="mr-2 h-4 w-4" />
                Save State
              </Button>
              <Button onClick={sharePalette} variant="outline" className={`glass ${theme === 'dark' ? 'text-white' : ''}`}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button onClick={exportPalette} variant="outline" className={`glass ${theme === 'dark' ? 'text-white' : ''}`}>
                <Download className="mr-2 h-4 w-4" />
                Export CSS
              </Button>
              <Button onClick={copyPalette} variant="outline" className={`glass ${theme === 'dark' ? 'text-white' : ''}`}>
                <Copy className="mr-2 h-4 w-4" />
                Copy All
              </Button>
              <Button onClick={addToSharedOutputs} variant="outline" className={`glass ${theme === 'dark' ? 'text-white' : ''}`}>
                <Palette className="mr-2 h-4 w-4" />
                Share Palette
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="random-mode"
                checked={randomMode}
                onCheckedChange={setRandomMode}
              />
              <Label htmlFor="random-mode" className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${theme === 'dark' ? 'text-white' : ''}`}>
                Random Mode
              </Label>
            </div>
            <div className="space-y-2">
              <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Color Format</Label>
              <Select value={format} onValueChange={(value) => setFormat(value as 'hex' | 'rgb' | 'rgba' | 'hsl')}>
                <SelectTrigger className="w-full glass">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hex">Hex (#RRGGBB)</SelectItem>
                  <SelectItem value="rgb">RGB (rgb(r,g,b))</SelectItem>
                  <SelectItem value="rgba">RGBA (rgba(r,g,b,a))</SelectItem>
                  <SelectItem value="hsl">HSL (hsl(h,s%,l%))</SelectItem>
                </SelectContent>
              </Select>
              {format === 'rgba' && (
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: getTextColor(palette[openPopoverIndex]) }}>Alpha</Label>
                  <Slider
                    value={[alpha]}
                    onValueChange={(value) => setAlpha(value[0])}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-foreground'}`}>{alpha.toFixed(2)}</p>
                </div>
              )}
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-foreground'}`}>
              Lock colors to keep them fixed during regeneration. Use manual inputs to tune colors in selected format.
            </p>
            {savedStates.length > 0 && (
              <div className="space-y-2">
                <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Saved States</Label>
                <div className="flex flex-wrap gap-2">
                  {savedStates.map((state, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => loadState(index)}
                      className={`glass ${theme === 'dark' ? 'text-white' : ''}`}
                    >
                      State {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Palette Preview */}
        <div className="space-y-6">
          <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Live Palette Preview</Label>
          <div className="flex flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-1 h-48 md:h-64 rounded-lg overflow-hidden">
            {palette.map((color, index) => {
              const textColor = getTextColor(color);
              const badgeBg = getBadgeBg(color);
              return (
                <div
                  key={index}
                  className="flex-1 relative cursor-pointer min-h-0"
                  style={{ backgroundColor: color }}
                  onClick={() => openTunePopover(index)}
                  data-color-index={index}
                >
                  {/* Lock Overlay */}
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      id={`lock-${index}`}
                      checked={locks[index]}
                      onCheckedChange={() => toggleLock(index)}
                      className="border-2"
                      style={{ borderColor: textColor }}
                    />
                  </div>
                  {/* Copy Overlay */}
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyColor(color, index);
                      }}
                      className="h-6 w-6 p-0 rounded-full"
                      style={{ backgroundColor: badgeBg }}
                    >
                      {copiedIndex === index ? <Check className="h-3 w-3" style={{ color: textColor }} /> : <Copy className="h-3 w-3" style={{ color: textColor }} />}
                    </Button>
                  </div>
                  {/* Formatted Overlay */}
                  <div className="absolute bottom-2 right-2 z-10 p-1 rounded bg-black/20 md:bg-transparent">
                    <p className="text-xs font-mono" style={{ color: textColor }}>
                      {formatColorFromHex(color, format, format === 'rgba' ? alpha : undefined)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tune Popover */}
          <Popover open={openPopoverIndex !== null} onOpenChange={closeTunePopover}>
            <PopoverTrigger asChild>
              {/* Trigger is handled by onClick on swatches */}
            </PopoverTrigger>
            <PopoverContent className={`w-80 p-4 glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`} side="bottom" align="center">
              {openPopoverIndex !== null && (
                <>
                  <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold" style={{ color: getTextColor(palette[openPopoverIndex]) }}>
                          Edit Color {openPopoverIndex + 1}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={closeTunePopover}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div 
                            className="p-1 rounded border-2 flex items-center justify-center"
                            style={{ 
                              borderColor: getTextColor(palette[openPopoverIndex]), 
                              backgroundColor: getBadgeBg(palette[openPopoverIndex]) 
                            }}
                          >
                            <Input
                              type="color"
                              value={palette[openPopoverIndex]}
                              onChange={(e) => updateColor(openPopoverIndex, e.target.value)}
                              className="h-8 w-8 cursor-pointer border-none"
                              style={{ 
                                backgroundColor: 'transparent',
                                border: 'none',
                                outline: 'none'
                              }}
                            />
                          </div>
                          <Input
                            type="text"
                            value={formatColorFromHex(palette[openPopoverIndex], format, format === 'rgba' ? alpha : undefined)}
                            onChange={(e) => updateColor(openPopoverIndex, e.target.value)}
                            className="flex-1 text-xs h-8 glass focus:outline-none focus:ring-2 focus:ring-offset-0 glass"
                            style={{ 
                              color: getTextColor(palette[openPopoverIndex]), 
                              borderColor: getTextColor(palette[openPopoverIndex]),
                              backgroundColor: getBadgeBg(palette[openPopoverIndex]) 
                            }}
                            placeholder={format === 'hex' ? "#RRGGBB" : format === 'rgb' ? "rgb(255,0,0)" : format === 'rgba' ? "rgba(255,0,0,1)" : "hsl(0,100%,50%)"}
                          />
                        </div>
                        {format === 'rgba' && (
                          <div className="space-y-1">
                            <Label className="text-xs" style={{ color: getTextColor(palette[openPopoverIndex]) }}>Alpha</Label>
                            <Slider
                              value={[alpha]}
                              onValueChange={(value) => setAlpha(value[0])}
                              max={1}
                              step={0.1}
                              className="w-full"
                            />
                            <p className="text-xs" style={{ color: getTextColor(palette[openPopoverIndex]) }}>{alpha.toFixed(2)}</p>
                          </div>
                        )}
                        <Badge 
                          variant="secondary" 
                          className="w-full justify-center" 
                          style={{ 
                            color: getTextColor(palette[openPopoverIndex]), 
                            backgroundColor: getBadgeBg(palette[openPopoverIndex]) 
                          }}
                        >
                          {formatColorFromHex(palette[openPopoverIndex], format, format === 'rgba' ? alpha : undefined)}
                        </Badge>
                      </div>
                  </div>
                </>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Contrast Analysis */}
      <div className={`space-y-4 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
        <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>WCAG Contrast Scores (Adjacent Pairs)</Label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {palette.slice(0, -1).map((color, index) => {
            const nextColor = palette[index + 1];
            const contrast = calculateContrast(color, nextColor);
            const level = getContrastLevel(contrast);
            return (
              <Badge key={index} variant={level === "Fail" ? "destructive" : "default"} className="text-xs">
                {contrast}:1 ({level})
              </Badge>
            );
          })}
        </div>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-foreground'}`}>
          AA: ≥4.5:1 for normal text, AAA: ≥7:1. Adjust colors for better accessibility.
        </p>
      </div>
    </div>
  );
};
