import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";

export const TextShadowGenerator = () => {
  const [text, setText] = useState("Text Shadow Generator");
  const [textColor, setTextColor] = useState("#000000");
  const [shadowColor, setShadowColor] = useState("#000000");
  const [angle, setAngle] = useState(45);
  const [blur, setBlur] = useState(4);
  const [distance, setDistance] = useState(2);
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const generateShadow = () => {
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;
    return `${x}px ${y}px ${blur}px ${shadowColor}`;
  };

  const cssCode = `color: ${textColor};
text-shadow: ${generateShadow()};`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-6 space-y-8 rounded-lg glass border ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
      <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Text Shadow Generator</h2>
      <p className={`text-muted-foreground ${theme === 'dark' ? 'text-gray-300' : ''}`}>
        Create stunning text shadows with precise control over color, angle,
        blur, and distance.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className={`space-y-4 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Text</label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="glass glass"
              placeholder="Enter your text"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Text Color</label>
            <div className="relative">
              <Input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-10 p-0 border-2 rounded-lg"
              />
              <Badge className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                {textColor}
              </Badge>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Shadow Color
            </label>
            <div className="relative">
              <Input
                type="color"
                value={shadowColor}
                onChange={(e) => setShadowColor(e.target.value)}
                className="w-full h-10 p-0 border-2 rounded-lg"
              />
              <Badge className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                {shadowColor}
              </Badge>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Angle (degrees)
            </label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[angle]}
                onValueChange={(value) => setAngle(value[0])}
                min={0}
                max={360}
                step={1}
                className="flex-1"
              />
              <span className={`text-sm font-medium min-w-[4rem] text-center ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                {angle}°
              </span>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Blur Radius (px)
            </label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[blur]}
                onValueChange={(value) => setBlur(value[0])}
                min={0}
                max={50}
                step={1}
                className="flex-1"
              />
              <span className={`text-sm font-medium min-w-[4rem] text-center ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                {blur}px
              </span>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Distance (px)
            </label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[distance]}
                onValueChange={(value) => setDistance(value[0])}
                min={0}
                max={50}
                step={1}
                className="flex-1"
              />
              <span className={`text-sm font-medium min-w-[4rem] text-center ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                {distance}px
              </span>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Live Preview</h3>
            <Badge variant="outline" className={`text-xs ${theme === 'dark' ? 'border-gray-600 text-gray-300' : ''}`}>
              {generateShadow()}
            </Badge>
          </div>
          <div className={`flex justify-center items-center p-8 border-2 border-dashed rounded-lg min-h-[200px] ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-muted bg-background/50'}`}>
            <div
              className="text-3xl font-bold text-center drop-shadow-lg"
              style={{
                textShadow: generateShadow(),
                color: textColor,
              }}
            >
              {text || "Your Text Here"}
            </div>
          </div>
        </div>
      </div>

      {/* Output */}
      <div className={`space-y-4 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>CSS Code</h3>
        <div className="relative">
          <pre className={`p-4 rounded-lg text-sm overflow-x-auto font-mono border ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-muted/50'}`}>
            {cssCode}
          </pre>
          <Button
            onClick={handleCopy}
            className="absolute top-2 right-2"
            size="sm"
            variant={copied ? "default" : "outline"}
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "Copied!" : "Copy Code"}
          </Button>
        </div>
      </div>
    </div>
  );
};