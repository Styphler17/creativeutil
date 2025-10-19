import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PulseAnimationDemo = () => {
  const [pulseColor, setPulseColor] = useState("#2563eb");
  const [size, setSize] = useState(100);
  const [speed, setSpeed] = useState(2);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const cssCode = `@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.pulse-circle {
  width: ${size}px;
  height: ${size}px;
  background-color: ${pulseColor};
  border-radius: 50%;
  animation: pulse ${speed}s ease-in-out infinite;
}`;

  const copyCSS = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    toast({
      title: "CSS Copied!",
      description: "The animation CSS has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Pulse Animation Demo</h2>
        <p className="text-foreground">
          Create smooth pulsing animations with customizable parameters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pulse-color">Pulse Color</Label>
            <div className="flex gap-2">
              <Input
                id="pulse-color"
                type="color"
                value={pulseColor}
                onChange={(e) => setPulseColor(e.target.value)}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                value={pulseColor}
                onChange={(e) => setPulseColor(e.target.value)}
                placeholder="#2563eb"
                className="glass flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Size: {size}px</Label>
            <Slider
              value={[size]}
              onValueChange={(value) => setSize(value[0])}
              max={200}
              min={50}
              step={10}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Animation Speed: {speed}s</Label>
            <Slider
              value={[speed]}
              onValueChange={(value) => setSpeed(value[0])}
              max={5}
              min={0.5}
              step={0.5}
              className="w-full"
            />
            <p className="text-sm text-foreground">
              Lower values = faster animation
            </p>
          </div>

          <div className="glass rounded-xl p-6 space-y-2">
            <h4 className="font-semibold">Animation Properties</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Scale:</span>
                <span>1.0 → 1.1 → 1.0</span>
              </div>
              <div className="flex justify-between">
                <span>Opacity:</span>
                <span>1.0 → 0.8 → 1.0</span>
              </div>
              <div className="flex justify-between">
                <span>Easing:</span>
                <span>ease-in-out</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <Label>Live Preview</Label>
          <div className="glass rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
            <style>
              {`
                @keyframes pulseAnimation {
                  0%, 100% {
                    transform: scale(1);
                    opacity: 1;
                  }
                  50% {
                    transform: scale(1.1);
                    opacity: 0.8;
                  }
                }
              `}
            </style>
            <div
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: pulseColor,
                borderRadius: "50%",
                animation: `pulseAnimation ${speed}s ease-in-out infinite`,
              }}
            />
          </div>
          <p className="text-sm text-foreground text-center">
            Watch the smooth pulsing animation in action
          </p>
        </div>
      </div>

      {/* Generated CSS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Generated CSS</Label>
          <Button
            onClick={copyCSS}
            variant="outline"
            size="sm"
            className="glass"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy CSS
              </>
            )}
          </Button>
        </div>
        <pre className="glass rounded-xl p-6 overflow-x-auto">
          <code className="text-sm">{cssCode}</code>
        </pre>
      </div>
    </div>
  );
};
