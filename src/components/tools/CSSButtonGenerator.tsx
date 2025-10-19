import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Copy, Check, Eye, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolOutputs } from "@/contexts/ToolOutputsContext";
import { useTheme } from "@/contexts/ThemeContext";

export const CSSButtonGenerator = () => {
  const [buttonText, setButtonText] = useState("Click Me");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [hoverColor, setHoverColor] = useState("#1d4ed8");
  const [borderRadius, setBorderRadius] = useState(8);
  const [padding, setPadding] = useState(12);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { addOutput } = useToolOutputs();
  const { theme } = useTheme();

  // Run accessibility check on button colors
  const runAccessibilityCheck = () => {
    const checkContrast = (fgColor: string, bgColor: string): number => {
      const getLuminance = (color: string) => {
        const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
        const [r, g, b] = rgb.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };

      const l1 = getLuminance(fgColor);
      const l2 = getLuminance(bgColor);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };

    const contrastRatio = checkContrast("#ffffff", primaryColor);
    const issues = [];

    if (contrastRatio < 4.5) {
      issues.push({
        type: 'contrast',
        message: `Low contrast ratio: ${contrastRatio.toFixed(2)}:1 (needs 4.5:1)`,
        details: `White text on ${primaryColor}`,
      });
    }

    return issues;
  };

  // Load session data on mount and when session is loaded
  useEffect(() => {
    const handleLoadSession = (event: CustomEvent) => {
      const session = event.detail;
      if (session.toolId === 'css-button') {
        setButtonText(session.data.buttonText || "Click Me");
        setPrimaryColor(session.data.primaryColor || "#2563eb");
        setHoverColor(session.data.hoverColor || "#1d4ed8");
        setBorderRadius(session.data.borderRadius || 8);
        setPadding(session.data.padding || 12);
        toast({
          title: "Session Loaded!",
          description: "Button configuration restored.",
        });
      }
    };

    window.addEventListener('load-session', handleLoadSession as EventListener);
    return () => window.removeEventListener('load-session', handleLoadSession as EventListener);
  }, [toast]);

  const cssCode = `.custom-button {
  background-color: ${primaryColor};
  color: #ffffff;
  border: none;
  border-radius: ${borderRadius}px;
  padding: ${padding}px ${padding * 2}px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.custom-button:hover {
  background-color: ${hoverColor};
  transform: scale(1.05);
}`;

  const copyCSS = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    toast({
      title: "CSS Copied!",
      description: "The CSS code has been copied to your clipboard.",
    });

    // Save to outputs context
    addOutput({
      type: 'button',
      data: {
        css: cssCode,
        buttonText,
        primaryColor,
        hoverColor,
        borderRadius,
        padding,
      },
      toolId: 'css-button',
      toolName: 'CSS Button Generator',
    });

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-6 space-y-8 rounded-lg glass border ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>CSS Button Generator</h2>
        <p className={`text-foreground ${theme === 'dark' ? 'text-gray-300' : ''}`}>
          Create custom button styles with live preview and generated CSS code
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className={`space-y-6 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Button Configuration</h3>

          <div className="space-y-2">
            <Label htmlFor="button-text" className={`${theme === 'dark' ? 'text-white' : ''}`}>Button Text</Label>
            <Input
              id="button-text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="Enter button text"
              className="glass glass"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color" className={`${theme === 'dark' ? 'text-white' : ''}`}>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#2563eb"
                  className="glass flex-1 glass"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hover-color" className={`${theme === 'dark' ? 'text-white' : ''}`}>Hover Color</Label>
              <div className="flex gap-2">
                <Input
                  id="hover-color"
                  type="color"
                  value={hoverColor}
                  onChange={(e) => setHoverColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer"
                />
                <Input
                  value={hoverColor}
                  onChange={(e) => setHoverColor(e.target.value)}
                  placeholder="#1d4ed8"
                  className="glass flex-1 glass"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Border Radius: {borderRadius}px</Label>
            <Slider
              value={[borderRadius]}
              onValueChange={(value) => setBorderRadius(value[0])}
              max={50}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Padding: {padding}px</Label>
            <Slider
              value={[padding]}
              onValueChange={(value) => setPadding(value[0])}
              max={32}
              min={4}
              step={2}
              className="w-full"
            />
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Live Preview</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const issues = runAccessibilityCheck();
                  if (issues.length > 0) {
                    toast({
                      title: "Accessibility Issues Found",
                      description: issues[0].message,
                      variant: "destructive",
                    });
                  } else {
                    toast({
                      title: "Accessibility Check Passed",
                      description: "Button colors meet contrast requirements.",
                    });
                  }
                }}
                className={`glass ${theme === 'dark' ? 'text-white' : ''}`}
              >
                <Eye className="h-4 w-4 mr-2" />
                Check Accessibility
              </Button>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-foreground'}`}>
              Hover over the button to see the transition effect
            </p>
          </div>
          <div className={`rounded-2xl p-8 flex items-center justify-center min-h-[200px] ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <button
              style={{
                backgroundColor: primaryColor,
                color: "#ffffff",
                border: "none",
                borderRadius: `${borderRadius}px`,
                padding: `${padding}px ${padding * 2}px`,
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = hoverColor;
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = primaryColor;
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>

      {/* Generated CSS */}
      <div className={`space-y-4 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Generated CSS</Label>
          <Button
            onClick={copyCSS}
            variant="outline"
            size="sm"
            className={`glass ${theme === 'dark' ? 'text-white' : ''}`}
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
        <pre className={`rounded-xl p-6 overflow-x-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
          <code className={`text-sm ${theme === 'dark' ? 'text-white' : ''}`}>{cssCode}</code>
        </pre>
      </div>
    </div>
  );
};
