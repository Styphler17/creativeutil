
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, Image, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";

export const FaviconGenerator = () => {
  const [image, setImage] = useState<string | null>(null);
  const [size, setSize] = useState(32);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [text, setText] = useState("TZ");
  const [showText, setShowText] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { theme } = useTheme();

  const generateFavicon = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    // Clear with background color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    if (image) {
      // Draw uploaded image
      const img = new window.Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = image;
      });
      ctx.drawImage(img, 0, 0, size, size);
    }

    if (showText) {
      // Draw text
      drawTextOverlay();
    }
  };

  const drawTextOverlay = () => {
    const canvas = canvasRef.current;
    if (!canvas || !showText) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000';
    ctx.font = `${Math.floor(size / 3)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      text,
      size / 2,
      size / 2
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadFavicon = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "favicon.ico";
    link.href = canvas.toDataURL("image/png");
    link.click();

    toast({
      title: "Favicon Downloaded!",
      description: "Your favicon has been saved as favicon.ico (PNG format)",
    });
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "favicon.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    toast({
      title: "PNG Downloaded!",
      description: "Your favicon has been saved as PNG",
    });
  };

  return (
    <div className={`p-6 space-y-8 rounded-lg glass border ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
      <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Favicon Generator</h2>
      <p className={`text-muted-foreground ${theme === 'dark' ? 'text-gray-300' : ''}`}>
        Create custom favicons from images or text with various sizes and backgrounds.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className={`space-y-6 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Settings</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="size" className={theme === 'dark' ? 'text-gray-300' : ''}>Size (px)</Label>
              <Input
                id="size"
                type="number"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                min={16}
                max={512}
                className={`w-full glass ${theme === 'dark' ? 'text-white' : ''}`}
                placeholder="32"
                title="Favicon size in pixels"
                aria-label="Favicon size in pixels"
              />
            </div>

            <div>
              <Label htmlFor="bgColor" className={theme === 'dark' ? 'text-gray-300' : ''}>Background Color</Label>
              <Input
                id="bgColor"
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className={`w-full h-10 glass ${theme === 'dark' ? 'text-white' : ''}`}
                title="Choose background color"
                aria-label="Background color picker"
              />
            </div>

            <div className="space-y-2">
              <Label className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                <input
                  type="checkbox"
                  checked={showText}
                  onChange={(e) => setShowText(e.target.checked)}
                  className="mr-2"
                />
                Show Text Overlay
              </Label>
              {showText && (
                <Input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text (e.g., TZ)"
                  maxLength={4}
                  className={`w-full glass ${theme === 'dark' ? 'text-white' : ''}`}
                  title="Text to overlay on favicon"
                  aria-label="Favicon text overlay"
                />
              )}
            </div>

            <div>
              <Label htmlFor="imageUpload" className={theme === 'dark' ? 'text-gray-300' : ''}>Upload Image</Label>
              <Input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={`w-full glass ${theme === 'dark' ? 'text-white' : ''}`}
                title="Upload an image file for favicon generation"
                aria-label="Upload image for favicon"
              />
            </div>

            <Button onClick={() => generateFavicon()} className={`w-full glass ${theme === 'dark' ? 'text-white' : ''}`}>
              <Image className="mr-2 h-4 w-4" />
              Generate Favicon
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className={`space-y-4 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Preview</h3>
          <div className="flex flex-col items-center space-y-4">
            <canvas
              ref={canvasRef}
              className={`border-2 border-dashed rounded-lg shadow-lg ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
            />
            <div className="flex gap-2">
              <Button onClick={downloadFavicon} variant="outline" size="sm" className={`glass ${theme === 'dark' ? 'text-white' : ''}`}>
                <Download className="mr-2 h-4 w-4" />
                Download ICO
              </Button>
              <Button onClick={downloadPng} variant="outline" size="sm" className={`glass ${theme === 'dark' ? 'text-white' : ''}`}>
                <Download className="mr-2 h-4 w-4" />
                Download PNG
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
