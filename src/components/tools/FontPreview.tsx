import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Type, RefreshCw, Download, Heart, Palette, Eye, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolOutputs } from "@/contexts/ToolOutputsContext";
import { useTheme } from "@/contexts/ThemeContext";

const googleFonts = [
  { name: "Roboto", weights: [100, 300, 400, 500, 700, 900] },
  { name: "Open Sans", weights: [300, 400, 500, 600, 700, 800] },
  { name: "Lato", weights: [100, 300, 400, 700, 900] },
  { name: "Montserrat", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: "Poppins", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: "Source Sans Pro", weights: [200, 300, 400, 600, 700, 900] },
  { name: "Nunito", weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { name: "Oswald", weights: [200, 300, 400, 500, 600, 700] },
  { name: "Merriweather", weights: [300, 400, 700, 900] },
  { name: "Playfair Display", weights: [400, 500, 600, 700, 800, 900] },
];

export const FontPreview = () => {
  const [selectedFont, setSelectedFont] = useState("Roboto");
  const [fontSize, setFontSize] = useState(24);
  const [fontWeight, setFontWeight] = useState("400");
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog");
  const [color, setColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [comparisonFonts, setComparisonFonts] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<{font: string, settings: FontSettings}[]>([]);
  const [recentSettings, setRecentSettings] = useState<{font: string, settings: FontSettings}[]>([]);
  const { theme } = useTheme();

  interface FontSettings {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
    letterSpacing: number;
    color: string;
    backgroundColor: string;
  }
  const [activeTab, setActiveTab] = useState("single");
  const { toast } = useToast();
  const { addOutput, getOutputsByType } = useToolOutputs();

  const selectedFontData = useMemo(() => googleFonts.find(f => f.name === selectedFont), [selectedFont]);
  const availableWeights = useMemo(
    () => (selectedFontData ? selectedFontData.weights : [400]),
    [selectedFontData],
  );

  // Load saved settings on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('fontPreview_favorites');
    const savedRecent = localStorage.getItem('fontPreview_recent');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    if (savedRecent) {
      setRecentSettings(JSON.parse(savedRecent));
    }
  }, []);

  useEffect(() => {
    if (!availableWeights.includes(Number(fontWeight))) {
      setFontWeight(availableWeights[0]?.toString() ?? "400");
    }
  }, [availableWeights, fontWeight]);

  // Save recent settings
  const lastPersistedSettings = useRef<string>("");
  useEffect(() => {
    const settings: FontSettings = {
      fontSize,
      fontWeight,
      lineHeight,
      letterSpacing,
      color,
      backgroundColor,
    };
    const payload = JSON.stringify({ font: selectedFont, settings });
    if (payload === lastPersistedSettings.current) {
      return;
    }
    lastPersistedSettings.current = payload;
    setRecentSettings(prev => {
      const withoutCurrent = prev.filter(r => r.font !== selectedFont);
      const updated = [{ font: selectedFont, settings }, ...withoutCurrent].slice(0, 5);
      localStorage.setItem("fontPreview_recent", JSON.stringify(updated));
      return updated;
    });
  }, [selectedFont, fontSize, fontWeight, lineHeight, letterSpacing, color, backgroundColor, setRecentSettings]);

  const fontUrl = `https://fonts.googleapis.com/css2?family=${selectedFont.replace(/\s+/g, '+')}:wght@${fontWeight}&display=swap`;

  const cssCode = `@import url('${fontUrl}');

.font-preview {
  font-family: '${selectedFont}', sans-serif;
  font-size: ${fontSize}px;
  font-weight: ${fontWeight};
  line-height: ${lineHeight};
  letter-spacing: ${letterSpacing}px;
  color: ${color};
  background-color: ${backgroundColor};
}`;

  // Accessibility check
  const getContrastRatio = (color1: string, color2: string) => {
    // Simple contrast calculation
    const getLuminance = (hex: string) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      const rsRGB = r / 255;
      const gsRGB = g / 255;
      const bsRGB = b / 255;
      const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
      const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
      const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
      return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
    };
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const contrastRatio = getContrastRatio(color, backgroundColor);
  const isAccessible = contrastRatio >= 4.5;

  const handleCopy = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: `${type} Copied!`,
      description: `${type} has been copied to clipboard.`,
    });
  };

  const handleDownload = () => {
    const blob = new Blob([cssCode], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFont.toLowerCase().replace(/\s+/g, '-')}-styles.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "CSS Downloaded!",
      description: "Font styles have been downloaded as a CSS file.",
    });
  };

  const handleFavorite = () => {
    const settings: FontSettings = {
      fontSize, fontWeight, lineHeight, letterSpacing, color, backgroundColor
    };
    const newFavorites = [...favorites.filter(f => f.font !== selectedFont), { font: selectedFont, settings }];
    setFavorites(newFavorites);
    localStorage.setItem('fontPreview_favorites', JSON.stringify(newFavorites));
    toast({
      title: "Added to Favorites!",
      description: `${selectedFont} settings have been saved.`,
    });
  };

  const loadSettings = (settings: FontSettings) => {
    setFontSize(settings.fontSize);
    setFontWeight(settings.fontWeight);
    setLineHeight(settings.lineHeight);
    setLetterSpacing(settings.letterSpacing);
    setColor(settings.color);
    setBackgroundColor(settings.backgroundColor);
  };

  const handleRefresh = () => {
    // Force reload the font by updating the URL with a timestamp
    const link = document.querySelector(`link[href*="${selectedFont.replace(/\s+/g, '+')}"]`);
    if (link) {
      const href = link.getAttribute('href');
      if (href) {
        link.setAttribute('href', href + (href.includes('?') ? '&' : '?') + 't=' + Date.now());
      }
    }
    toast({
      title: "Font Refreshed!",
      description: "Font has been reloaded from Google Fonts.",
    });
  };

  const sampleStyles = [
    { name: "Heading 1", style: { fontSize: 32, fontWeight: '700', lineHeight: 1.2 } },
    { name: "Heading 2", style: { fontSize: 24, fontWeight: '600', lineHeight: 1.3 } },
    { name: "Body Text", style: { fontSize: 16, fontWeight: '400', lineHeight: 1.6 } },
    { name: "Button", style: { fontSize: 14, fontWeight: '500', lineHeight: 1.4 } },
    { name: "Caption", style: { fontSize: 12, fontWeight: '400', lineHeight: 1.5 } },
  ];

  return (
    <div className={`p-6 space-y-8 rounded-lg glass border ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Font Preview</h2>
        <p className={`text-foreground ${theme === 'dark' ? 'text-gray-300' : ''}`}>
          Preview Google Fonts with customizable properties and generate CSS code.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button onClick={handleFavorite} variant="outline" size="sm" className={`${theme === 'dark' ? 'text-white' : ''}`}>
          <Heart className="h-4 w-4 mr-2" />
          Save Favorite
        </Button>
        <Button onClick={handleDownload} variant="outline" size="sm" className={`${theme === 'dark' ? 'text-white' : ''}`}>
          <Download className="h-4 w-4 mr-2" />
          Download CSS
        </Button>
        {favorites.length > 0 && (
          <Select onValueChange={(value) => {
            const fav = favorites.find(f => f.font === value);
            if (fav) {
              setSelectedFont(fav.font);
              loadSettings(fav.settings);
            }
          }}>
            <SelectTrigger className="w-40 glass">
              <SelectValue placeholder="Load Favorite" />
            </SelectTrigger>
            <SelectContent>
              {favorites.map((fav) => (
                <SelectItem key={fav.font} value={fav.font}>
                  {fav.font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full grid-cols-3 ${theme === 'dark' ? 'bg-gray-800' : ''}`}>
          <TabsTrigger value="single">Single Font</TabsTrigger>
          <TabsTrigger value="compare">Compare Fonts</TabsTrigger>
          <TabsTrigger value="styles">Sample Styles</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <Card className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
              <CardHeader>
                <CardTitle className={`${theme === 'dark' ? 'text-white' : ''}`}>Font Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
            <div>
              <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Font Family</Label>
              <Select value={selectedFont} onValueChange={setSelectedFont}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {googleFonts.map((fontObj) => (
                    <SelectItem key={fontObj.name} value={fontObj.name}>
                      {fontObj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Font Size (px)</Label>
              <Input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                min={8}
                max={100}
                className="glass"
              />
            </div>

            <div>
              <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Font Weight</Label>
              <Select value={fontWeight} onValueChange={setFontWeight}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableWeights.map((weight) => {
                    const weightName = weight === 400 ? "Regular" : weight < 500 ? "Light" : weight > 700 ? "Bold" : "Medium";
                    return (
                      <SelectItem key={weight} value={weight.toString()}>
                        {weightName} ({weight})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Line Height</Label>
              <Input
                type="number"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                step={0.1}
                min={0.5}
                max={3}
                className="glass"
              />
            </div>

            <div>
              <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Letter Spacing (px)</Label>
              <Input
                type="number"
                value={letterSpacing}
                onChange={(e) => setLetterSpacing(Number(e.target.value))}
                step={0.1}
                min={-5}
                max={10}
                className="glass"
              />
            </div>

                <div>
                  <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#000000"
                      className="flex-1 glass"
                    />
                    <Button
                      onClick={() => {
                        const palettes = getOutputsByType('palette');
                        if (palettes && palettes.length > 0) {
                          const latestPalette = palettes[0];
                          if (latestPalette.data.colors && Array.isArray(latestPalette.data.colors)) {
                            setColor(latestPalette.data.colors[0]);
                          }
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className={`px-2 ${theme === 'dark' ? 'text-white' : ''}`}
                    >
                      <Palette className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1 glass"
                    />
                    <Button
                      onClick={() => {
                        const palettes = getOutputsByType('palette');
                        if (palettes && palettes.length > 0) {
                          const latestPalette = palettes[0];
                          if (latestPalette.data.colors && Array.isArray(latestPalette.data.colors)) {
                            setBackgroundColor(latestPalette.data.colors[1] || latestPalette.data.colors[0]);
                          }
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className={`px-2 ${theme === 'dark' ? 'text-white' : ''}`}
                    >
                      <Palette className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Preview Text</Label>
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text to preview..."
                    rows={3}
                    className="glass"
                  />
                </div>

                {/* Accessibility Indicator */}
                <div className={`flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-muted/50'}`}>
                  {isAccessible ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : ''}`}>
                      Contrast Ratio: {contrastRatio.toFixed(2)}:1
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                      {isAccessible ? "✓ Meets WCAG AA standards" : "⚠ Consider improving contrast"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={`${theme === 'dark' ? 'text-white' : ''}`}>Live Preview</CardTitle>
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    className={`glass ${theme === 'dark' ? 'text-white' : ''}`}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Font
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={`min-h-[200px] p-4 border-2 border-dashed rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-muted'}`}
                  style={{
                    fontFamily: `'${selectedFont}', sans-serif`,
                    fontSize: `${fontSize}px`,
                    fontWeight: fontWeight,
                    lineHeight: lineHeight,
                    letterSpacing: `${letterSpacing}px`,
                    color: color,
                    backgroundColor: backgroundColor,
                  }}
                >
                  {text}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compare" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[selectedFont, ...comparisonFonts].map((font, index) => (
              <Card key={font} className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : ''}`}>{font}</CardTitle>
                  {index > 0 && (
                    <Button
                      onClick={() => setComparisonFonts(comparisonFonts.filter(f => f !== font))}
                      variant="ghost"
                      size="sm"
                      className={`absolute top-2 right-2 ${theme === 'dark' ? 'text-white' : ''}`}
                    >
                      ×
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div
                    className={`min-h-[150px] p-3 border-2 border-dashed rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-muted'}`}
                    style={{
                      fontFamily: `'${font}', sans-serif`,
                      fontSize: `${fontSize}px`,
                      fontWeight: fontWeight,
                      lineHeight: lineHeight,
                      letterSpacing: `${letterSpacing}px`,
                      color: color,
                      backgroundColor: backgroundColor,
                    }}
                  >
                    {text}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {comparisonFonts.length < 2 && (
            <div className="text-center">
              <Select onValueChange={(value) => {
                if (!comparisonFonts.includes(value) && value !== selectedFont) {
                  setComparisonFonts([...comparisonFonts, value]);
                }
              }}>
                <SelectTrigger className="w-64 mx-auto glass">
                  <SelectValue placeholder="Add font to compare" />
                </SelectTrigger>
                <SelectContent>
                  {googleFonts.filter(f => !comparisonFonts.includes(f.name) && f.name !== selectedFont).map((fontObj) => (
                    <SelectItem key={fontObj.name} value={fontObj.name}>
                      {fontObj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </TabsContent>

        <TabsContent value="styles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleStyles.map((sample) => (
              <Card key={sample.name} className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : ''}`}>{sample.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`p-4 border-2 border-dashed rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-muted'}`}
                    style={{
                      fontFamily: `'${selectedFont}', sans-serif`,
                      fontSize: `${sample.style.fontSize}px`,
                      fontWeight: sample.style.fontWeight,
                      lineHeight: sample.style.lineHeight,
                      letterSpacing: `${letterSpacing}px`,
                      color: color,
                      backgroundColor: backgroundColor,
                    }}
                  >
                    {text}
                  </div>
                  <div className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                    Size: {sample.style.fontSize}px | Weight: {sample.style.fontWeight} | Line Height: {sample.style.lineHeight}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* CSS Output */}
      <Card className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
        <CardHeader>
          <CardTitle className={`${theme === 'dark' ? 'text-white' : ''}`}>CSS Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className={`p-4 rounded-lg text-sm overflow-x-auto font-mono border ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-muted/50'}`}>
              {cssCode}
            </pre>
            <Button
              onClick={() => handleCopy(cssCode, "CSS")}
              className="absolute top-2 right-2"
              size="sm"
              variant="outline"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy CSS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Font Link */}
      <Card className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
        <CardHeader>
          <CardTitle className={`${theme === 'dark' ? 'text-white' : ''}`}>HTML Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className={`p-4 rounded-lg text-sm overflow-x-auto font-mono border ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-muted/50'}`}>
              {`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontUrl}" rel="stylesheet">`}
            </pre>
            <Button
              onClick={() => handleCopy(`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontUrl}" rel="stylesheet">`, "HTML")}
              className="absolute top-2 right-2"
              size="sm"
              variant="outline"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy HTML
            </Button>
          </div>
          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
            Note: Only the selected font weight is loaded. For better performance, load only the weights you need.
          </p>
        </CardContent>
      </Card>

      {/* Recent Settings */}
      {recentSettings.length > 0 && (
        <Card className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <CardHeader>
            <CardTitle className={`${theme === 'dark' ? 'text-white' : ''}`}>Recent Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentSettings.slice(0, 5).map((setting, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`cursor-pointer hover:bg-primary hover:text-primary-foreground ${theme === 'dark' ? 'text-white' : ''}`}
                  onClick={() => {
                    setSelectedFont(setting.font);
                    loadSettings(setting.settings);
                  }}
                >
                  {setting.font}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
