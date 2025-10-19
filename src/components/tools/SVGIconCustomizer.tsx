import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Copy, Palette, Maximize2, Minimize2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Sample SVG icons (using simple paths for common icons)
const icons = [
  { id: "home", name: "Home", path: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "user", name: "User", path: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { id: "settings", name: "Settings", path: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  { id: "search", name: "Search", path: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { id: "heart", name: "Heart", path: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { id: "star", name: "Star", path: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
  { id: "mail", name: "Mail", path: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { id: "phone", name: "Phone", path: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
  { id: "clock", name: "Clock", path: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "calendar", name: "Calendar", path: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
];

export const SVGIconCustomizer = () => {
  const [selectedIcon, setSelectedIcon] = useState(icons[0]);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(24);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [copied, setCopied] = useState(false);
  const [customSVG, setCustomSVG] = useState<string | null>(null);
  const [customSVGName, setCustomSVGName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCustomSVG(content);
        setCustomSVGName(file.name.replace('.svg', ''));
        setSelectedIcon({ id: 'custom', name: file.name.replace('.svg', ''), path: '' });
      };
      reader.readAsText(file);
    }
  };

  const generateSVG = () => {
    if (customSVG) {
      // Parse and modify custom SVG
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(customSVG, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      // Update attributes
      svgElement.setAttribute('width', size.toString());
      svgElement.setAttribute('height', size.toString());

      // Update stroke and fill if they exist
      const paths = svgElement.querySelectorAll('path, circle, rect, polygon, line, polyline');
      paths.forEach((path) => {
        if (path.hasAttribute('stroke')) {
          path.setAttribute('stroke', color);
        }
        if (path.hasAttribute('stroke-width')) {
          path.setAttribute('stroke-width', strokeWidth.toString());
        }
      });

      return new XMLSerializer().serializeToString(svgElement);
    } else {
      const viewBox = `0 0 24 24`;
      const svgPath = selectedIcon.path;
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="${svgPath}"/></svg>`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateSVG());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 glass rounded-3xl">
      <h2 className="text-3xl font-bold mb-2">SVG Icon Generator</h2>
      <p className="text-muted-foreground">
        Select an icon and customize its appearance with real-time preview.
      </p>

      {/* File Upload */}
      <div className="flex items-center gap-4 mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg"
          onChange={handleFileUpload}
          className="hidden"
          aria-label="Upload SVG file"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="glass"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload SVG File
        </Button>
        {customSVG && (
          <Badge variant="secondary" className="px-3 py-1">
            {customSVGName}
          </Badge>
        )}
      </div>

      {/* Icon Gallery */}
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
        {icons.map((icon) => (
          <Button
            key={icon.id}
            variant="ghost"
            size="sm"
            className={`h-12 w-12 p-0 rounded-lg ${
              selectedIcon.id === icon.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => {
              setSelectedIcon(icon);
              setCustomSVG(null);
              setCustomSVGName("");
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d={icon.path} />
            </svg>
            <span className="sr-only">{icon.name}</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="relative">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 p-0 border-2 rounded-lg"
              />
              <Badge className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                {color}
              </Badge>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Size (px)</label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[size]}
                onValueChange={(value) => setSize(value[0])}
                min={12}
                max={64}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium min-w-[3rem] text-center">
                {size}px
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Stroke Width
            </label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[strokeWidth]}
                onValueChange={(value) => setStrokeWidth(value[0])}
                min={1}
                max={4}
                step={0.5}
                className="flex-1"
              />
              <span className="text-sm font-medium min-w-[3rem] text-center">
                {strokeWidth}
              </span>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Preview</h3>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setSize(24)}>
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSize(16)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-center p-8 border-2 border-dashed border-muted rounded-lg bg-background/50 min-h-[200px] items-center">
            <div
              dangerouslySetInnerHTML={{ __html: generateSVG() }}
              className="drop-shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">SVG Code</h3>
        <div className="relative">
          <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto font-mono border">
            {generateSVG()}
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
