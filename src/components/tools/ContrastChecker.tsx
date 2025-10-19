import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Palette } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
};

const rgbToLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

const getContrastRatio = (fgHex: string, bgHex: string): number => {
  const fgRgb = hexToRgb(fgHex);
  const bgRgb = hexToRgb(bgHex);
  const fgL = rgbToLuminance(...fgRgb);
  const bgL = rgbToLuminance(...bgRgb);
  return (Math.max(fgL, bgL) + 0.05) / (Math.min(fgL, bgL) + 0.05);
};

const getWCAGStatus = (ratio: number): { aa: boolean; aaa: boolean; level: string } => {
  const aaNormal = ratio >= 4.5;
  const aaaNormal = ratio >= 7;
  const aaLarge = ratio >= 3;
  const aaaLarge = ratio >= 4.5;
  return {
    aa: aaNormal,
    aaa: aaaNormal,
    level: aaNormal ? (aaaNormal ? 'AAA (Normal)' : 'AA (Normal)') : (aaLarge ? 'AA (Large Text)' : 'Fail')
  };
};

const getTips = (ratio: number, fgHex: string, bgHex: string): string[] => {
  const tips = [];
  if (ratio < 4.5) {
    tips.push("Increase contrast by darkening the foreground or lightening the background.");
    tips.push("For better accessibility, aim for at least 4.5:1 for normal text (WCAG AA).");
  }
  if (ratio < 7) {
    tips.push("For AAA compliance, target 7:1 ratio.");
  }
  return tips;
};

export const ContrastChecker = () => {
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [ratio, setRatio] = useState(21);
  const [status, setStatus] = useState({ aa: true, aaa: true, level: 'AAA (Normal)' });
  const [tips, setTips] = useState<string[]>([]);
  const { theme } = useTheme();

  const calculateContrast = useCallback(() => {
    if (!fgColor || !bgColor) return;
    const r = getContrastRatio(fgColor, bgColor);
    setRatio(r);
    const s = getWCAGStatus(r);
    setStatus(s);
    setTips(getTips(r, fgColor, bgColor));
  }, [fgColor, bgColor]);

  useEffect(() => {
    if (fgColor && bgColor && fgColor.length === 7 && bgColor.length === 7) {
      calculateContrast();
    }
  }, [fgColor, bgColor, calculateContrast]);

  return (
    <div className={`p-6 space-y-8 rounded-lg glass border ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Contrast Checker</h2>
          <p className={`text-muted-foreground ${theme === 'dark' ? 'text-gray-300' : ''}`}>Check color contrast for accessibility compliance.</p>
        </div>
        <Button onClick={calculateContrast} size="sm" className={`${theme === 'dark' ? 'text-white' : ''}`}>
          <Eye className="h-4 w-4 mr-2" />
          Check Contrast
        </Button>
      </div>

      {/* Color Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`space-y-2 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Foreground Color</Label>
          <Input
            type="color"
            value={fgColor}
            onChange={(e) => setFgColor(e.target.value)}
            className="h-12 w-full"
          />
          <Input
            type="text"
            value={fgColor}
            onChange={(e) => setFgColor(e.target.value.toLowerCase().replace(/[^#a-f0-9]/g, ''))}
            placeholder="#000000"
            maxLength={7}
            className="w-full glass"
          />
        </div>
        <div className={`space-y-2 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Background Color</Label>
          <Input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="h-12 w-full"
          />
          <Input
            type="text"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value.toLowerCase().replace(/[^#a-f0-9]/g, ''))}
            placeholder="#ffffff"
            maxLength={7}
            className="w-full glass"
          />
        </div>
      </div>

      {/* Preview */}
      <Card className={`overflow-hidden glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
        <CardContent className="p-0 h-32 relative">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: bgColor }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center text-2xl font-bold"
            style={{ color: fgColor }}
          >
            Sample Text
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className={`space-y-4 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ratio.toFixed(2)}:1</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>Contrast Ratio</p>
          </div>
          <div>
            <p className={`text-lg font-semibold ${status.aa ? 'text-green-600' : 'text-red-600'}`}>
              {status.aa ? 'Pass' : 'Fail'}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>WCAG AA</p>
          </div>
          <div>
            <p className={`text-lg font-semibold ${status.aaa ? 'text-green-600' : 'text-red-600'}`}>
              {status.aaa ? 'Pass' : 'Fail'}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>WCAG AAA</p>
          </div>
        </div>

        {tips.length > 0 && (
          <Alert variant={status.aa ? "default" : "destructive"} className="glass">
            <Palette className="h-4 w-4" />
            <AlertDescription className={`ml-2 ${theme === 'dark' ? 'text-white' : ''}`}>
              <h4 className="font-semibold">Improvement Tips:</h4>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
