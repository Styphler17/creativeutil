import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const IconFontGenerator: React.FC = () => {
  const [svgFiles, setSvgFiles] = useState<File[]>([]);
  const [fontName, setFontName] = useState("custom-icons");
  const [preview, setPreview] = useState<string[]>([]);
  const [cssCode, setCssCode] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const normaliseName = (name?: string, index?: number) => {
    if (!name) {
      return `icon-${(index ?? 0) + 1}`;
    }

    return name.replace(".svg", "").replace(/[^a-zA-Z0-9]/g, "-");
  };

  const processFiles = (files: File[]) => {
    setIsDragging(false);
    const svgFilesOnly = files.filter(file => file.type === "image/svg+xml");
    setSvgFiles(svgFilesOnly);

    if (svgFilesOnly.length === 0) {
      setPreview([]);
      return;
    }

    const previews: string[] = [];
    svgFilesOnly.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews[index] = e.target?.result as string;
        if (previews.filter(Boolean).length === svgFilesOnly.length) {
          setPreview([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files || []);
    processFiles(files);
  };

  const generateFont = () => {
    let css = `@font-face {
  font-family: '${fontName}';
  src: url('${fontName}.woff2') format('woff2'),
       url('${fontName}.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

.${fontName}-icon {
  font-family: '${fontName}';
  font-weight: normal;
  font-style: normal;
  display: inline-block;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`;

    svgFiles.forEach((file, index) => {
      const className = normaliseName(file.name, index);
      css += `
.${fontName}-${className}::before {
  content: "\\${(index + 1).toString(16).padStart(4, "0")}";
}
`;
    });

    setCssCode(css.trim());
  };

  const downloadFont = () => {
    alert("Font download feature coming soon!");
  };

  const downloadCss = () => {
    const blob = new Blob([cssCode], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fontName}.css`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasPreview = preview.length > 0;
  const hasCss = cssCode.length > 0;

  return (
    <div className="space-y-8">
      <header className="mx-auto max-w-3xl text-center space-y-3">
        <Badge variant="secondary" className="rounded-full px-4 py-1 uppercase tracking-wide">
          CreativeUtil Studio
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Icon Font Generator
        </h1>
        <p className="text-muted-foreground text-lg">
          Upload SVG assets, create a custom font-family, and export utility classes ready for your
          design system.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="glass">
          <CardHeader className="space-y-2">
            <CardTitle>Assets & Settings</CardTitle>
            <CardDescription>
              Organise your SVG icons and configure font metadata before exporting the stylesheet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3">
              <Label htmlFor="svg-upload">Upload SVG icons</Label>
              <Label
                htmlFor="svg-upload"
                onDragEnter={event => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={event => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={event => {
                  event.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={handleDrop}
                className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                  isDragging
                    ? "border-primary/60 bg-primary/5"
                    : "border-muted/50 bg-background/70 hover:border-primary/40 hover:bg-background/90"
                }`}
              >
                <Input
                  id="svg-upload"
                  type="file"
                  multiple
                  accept=".svg"
                  onChange={handleFileInputChange}
                  className="sr-only"
                />
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">Drag & drop SVG files here</p>
                  <p className="text-sm text-muted-foreground">…or click to browse from your device</p>
                </div>
                <Button variant="outline" size="sm" type="button">
                  Browse files
                </Button>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Each icon is automatically assigned a Unicode glyph and class name based on the file.
                </p>
              </Label>
              {svgFiles.length > 0 && (
                <Badge variant="outline" className="w-fit">
                  {svgFiles.length} file{svgFiles.length === 1 ? "" : "s"} ready
                </Badge>
              )}
            </div>

            <Separator />

            <div className="grid gap-3">
              <Label htmlFor="font-name">Font name</Label>
              <Input
                id="font-name"
                value={fontName}
                onChange={(event) => setFontName(event.target.value)}
                placeholder="e.g. creativeutil-icons"
                className="font-mono"
              />
              <p className="text-sm text-muted-foreground">
                This identifier is used for the `@font-face` declaration and generated class names.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
              <Button onClick={generateFont} disabled={svgFiles.length === 0} className="md:w-auto">
                Generate CSS Mapping
              </Button>
              {hasCss && (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={downloadFont} disabled>
                    Download Font Files
                  </Button>
                  <Button variant="secondary" onClick={downloadCss}>
                    Download CSS
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass">
            <CardHeader className="space-y-2">
              <CardTitle>Icon Preview</CardTitle>
              <CardDescription>
                Quickly review the glyphs and class names that will be available in your font.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasPreview ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {preview.map((svg, index) => (
                    <div
                      key={svgFiles[index]?.name ?? index}
                      className="glass rounded-xl p-4 space-y-3"
                    >
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted/50 text-foreground ring-1 ring-inset ring-muted"
                        dangerouslySetInnerHTML={{ __html: svg }}
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {svgFiles[index]?.name?.replace(".svg", "") ?? "Untitled icon"}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          .{fontName}-{normaliseName(svgFiles[index]?.name, index)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-muted-foreground/40 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                  Upload SVG files to generate a live preview of your icon set.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="space-y-2">
              <CardTitle>Generated CSS</CardTitle>
              <CardDescription>
                Copy the stylesheet into your project or download it for later use.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasCss ? (
                <Textarea
                  value={cssCode}
                  readOnly
                  className="h-64 font-mono text-sm leading-6"
                />
              ) : (
                <div className="rounded-xl border border-dashed border-muted-foreground/40 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                  Generate your font to see the corresponding CSS declarations here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
