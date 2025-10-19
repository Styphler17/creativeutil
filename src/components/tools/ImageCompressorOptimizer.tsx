import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Image as ImageIcon, Upload, AlertCircle, Trash2 } from "lucide-react";
import JSZip from "jszip";
import { useTheme } from "@/contexts/ThemeContext";

interface CompressedResult {
  file: File;
  url: string;
  size: number;
  name: string;
  diffUrl?: string | null;
  format: string;
  quality?: number;
  note?: string;
  sizeDelta?: number;
}

interface ImageFile {
  file: File;
  url: string;
  size: number;
  name: string;
  diffUrl?: string | null;
  compressed?: CompressedResult;
}

type OutputFormat = 'auto' | 'jpeg' | 'png' | 'webp' | 'svg' | 'avif' | 'bmp';
type RasterFormat = 'jpeg' | 'png' | 'webp' | 'avif' | 'bmp';

export const ImageCompressorOptimizer = () => {
  const [originals, setOriginals] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('auto');
  const [smartOptimize, setSmartOptimize] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState("");
  const { theme } = useTheme();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    setError("");
    const validFiles = files.filter(f => (f.type.startsWith('image/') || f.name.toLowerCase().endsWith('.svg')) && !originals.some(o => o.name === f.name));
    if (validFiles.length === 0) {
      setError("No new valid image files (JPG, PNG, WebP, AVIF, BMP, SVG).");
      return;
    }
    if (originals.length + validFiles.length > 20) {
      setError("Maximum 20 files total.");
      return;
    }
    const totalSize = originals.reduce((sum, o) => sum + o.size, 0) + validFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > 1024 * 1024 * 1024) {
      setError("Total file size exceeds 1GB limit.");
      return;
    }
    const newOriginals = validFiles.map(f => {
      if (f.size > 100 * 1024 * 1024) {
        setError(`File ${f.name} exceeds 100MB individual limit.`);
        return null;
      }
      const url = URL.createObjectURL(f);
      return { file: f, url, size: f.size, name: f.name };
    }).filter((item): item is ImageFile => item !== null);
    setOriginals(prev => [...prev, ...newOriginals]);
  };

  const compressAll = async () => {
    setIsCompressing(true);
    setError("");
    const updatedOriginals = [...originals];

    const canvasToBlob = (canvas: HTMLCanvasElement, mimeType: string, qualityValue?: number) =>
      new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error(`Failed to encode image as ${mimeType}. This format may not be supported in this browser.`));
          }
        }, mimeType, qualityValue);
      });

    const getAutoFormats = (file: ImageFile): RasterFormat[] => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "png") return ["avif", "webp", "png", "jpeg", "bmp"];
      if (ext === "webp") return ["webp", "avif", "jpeg", "png", "bmp"];
      if (ext === "jpg" || ext === "jpeg") return ["avif", "jpeg", "webp", "png", "bmp"];
      if (ext === "avif") return ["avif", "webp", "jpeg", "png", "bmp"];
      if (ext === "bmp") return ["webp", "jpeg", "png", "bmp"];
      return ["avif", "webp", "jpeg", "png", "bmp"];
    };

    const rasterFormatMeta: Record<RasterFormat, { mime: string; extension: string; label: string }> = {
      jpeg: { mime: "image/jpeg", extension: "jpg", label: "JPEG" },
      png: { mime: "image/png", extension: "png", label: "PNG" },
      webp: { mime: "image/webp", extension: "webp", label: "WebP" },
      avif: { mime: "image/avif", extension: "avif", label: "AVIF" },
      bmp: { mime: "image/bmp", extension: "bmp", label: "BMP" },
    };

    for (let i = 0; i < updatedOriginals.length; i++) {
      const orig = updatedOriginals[i];
      if (orig.compressed) continue;

      try {
        const isSvgInput = orig.name.toLowerCase().endsWith(".svg") || orig.file.type === "image/svg+xml";

        if (isSvgInput) {
          // SVG minification
          const text = await orig.file.text();
          const minified = text
            .replace(/<!--.*?-->/gs, "")
            .replace(/\s{2,}/g, " ")
            .replace(/\s*(<|>|=|\{|\}|;|,|\(|\))\s*/g, "$1")
            .trim();
          const blob = new Blob([minified], { type: "image/svg+xml" });
          const sizeDelta = orig.size - blob.size;

          if (outputFormat !== "auto" && outputFormat !== "svg") {
            throw new Error("Raster output formats are not supported for SVG sources.");
          }

          const newName = orig.name.includes(".") ? orig.name.replace(/\.[^/.]+$/, ".min.svg") : `${orig.name}.min.svg`;
          const url = URL.createObjectURL(blob);
          updatedOriginals[i].compressed = {
            file: new File([blob], newName, { type: "image/svg+xml" }),
            url,
            size: blob.size,
            name: newName,
            diffUrl: null,
            format: "SVG",
            quality: undefined,
            note: sizeDelta <= 0 ? "Minimal gains - SVG may already be optimized." : undefined,
            sizeDelta,
          };
          continue;
        }

        if (outputFormat === "svg") {
          throw new Error("SVG output is only available for SVG uploads.");
        }

        const img = new Image();
        img.decoding = "async";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = orig.url;
        });

        const canvasWidth = img.width;
        const canvasHeight = img.height;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context not available");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

        const allowedFormats: RasterFormat[] = ["jpeg", "png", "webp", "avif", "bmp"];
        const enforceFormat = outputFormat !== "auto";
        const requestedFormat = enforceFormat ? (outputFormat as RasterFormat) : null;
        const formatsToTry: RasterFormat[] =
          enforceFormat && requestedFormat && allowedFormats.includes(requestedFormat)
            ? [requestedFormat]
            : Array.from(
                new Set(getAutoFormats(orig).filter((format) => allowedFormats.includes(format)))
              );

        const candidates: { blob: Blob; meta: { mime: string; extension: string; label: string }; qualityUsed?: number }[] = [];
        let formatFailureMessage: string | null = null;
        for (const format of formatsToTry) {
          const meta = rasterFormatMeta[format];
          const initialQuality =
            format === "png" || format === "bmp" ? 1 : Math.min(quality / 100, 0.95);
          let bestBlob: Blob;
          let bestQuality = initialQuality;

          try {
            bestBlob = await canvasToBlob(canvas, meta.mime, initialQuality);
          } catch (err) {
            if (enforceFormat && requestedFormat === format) {
              formatFailureMessage = `${meta.label} encoding is not supported in this browser.`;
              break;
            }
            continue;
          }

          if (smartOptimize && (format === "jpeg" || format === "webp" || format === "avif")) {
            let currentQuality = initialQuality;
            let attempts = 0;
            while (bestBlob.size >= orig.size && currentQuality > 0.15 && attempts < 6) {
              currentQuality = Math.max(0.15, currentQuality - Math.max(0.05, initialQuality * 0.35));
              try {
                const candidateBlob = await canvasToBlob(canvas, meta.mime, currentQuality);
                if (candidateBlob.size <= bestBlob.size) {
                  bestBlob = candidateBlob;
                  bestQuality = currentQuality;
                }
              } catch {
                break;
              }
              attempts += 1;
            }
          }

          candidates.push({
            blob: bestBlob,
            meta,
            qualityUsed: format === "png" || format === "bmp" ? undefined : bestQuality,
          });
        }

        if (formatFailureMessage) {
          throw new Error(formatFailureMessage);
        }

        if (candidates.length === 0) {
          throw new Error("No valid output formats available.");
        }

        const bestCandidate = candidates.reduce((smallest, candidate) =>
          candidate.blob.size < smallest.blob.size ? candidate : smallest
        );
        const sizeDelta = orig.size - bestCandidate.blob.size;
        const originalExtRaw = orig.name.split(".").pop()?.toLowerCase();
        const normaliseExt = (ext?: string) => {
          if (!ext) return ext;
          return ext === "jpeg" ? "jpg" : ext;
        };
        const originalExt = normaliseExt(originalExtRaw);
        const candidateExt = normaliseExt(bestCandidate.meta.extension);
        const formatChanged = originalExt !== candidateExt;

        if (!enforceFormat && sizeDelta <= 0 && !formatChanged) {
          updatedOriginals[i].compressed = {
            file: orig.file,
            url: orig.url,
            size: orig.size,
            name: orig.name,
            diffUrl: null,
            format: "Original",
            quality: undefined,
            note: sizeDelta < 0 ? "Auto mode kept your original to avoid a size increase." : "Already optimized - original file retained.",
            sizeDelta: 0,
          };
          continue;
        }

        const baseName = orig.name.replace(/\.[^/.]+$/, "");
        const newName = `${baseName}_optimized.${bestCandidate.meta.extension}`;
        const compressedFile = new File([bestCandidate.blob], newName, { type: bestCandidate.meta.mime });
        const compressedUrl = URL.createObjectURL(bestCandidate.blob);

        let diffUrl: string | null = null;
        if (compressedFile.type !== "image/svg+xml") {
          const diffCanvas = document.createElement("canvas");
          const diffCtx = diffCanvas.getContext("2d");
          if (diffCtx) {
            diffCanvas.width = canvasWidth;
            diffCanvas.height = canvasHeight;
            diffCtx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            const originalData = diffCtx.getImageData(0, 0, diffCanvas.width, diffCanvas.height);
            diffCtx.clearRect(0, 0, diffCanvas.width, diffCanvas.height);
            await new Promise<void>((resolve, reject) => {
              const preview = new Image();
              preview.onload = () => {
                diffCtx.drawImage(preview, 0, 0, canvasWidth, canvasHeight);
                resolve();
              };
              preview.onerror = () => reject(new Error("Failed to render compressed preview"));
              preview.src = compressedUrl;
            });
            const compressedData = diffCtx.getImageData(0, 0, diffCanvas.width, diffCanvas.height);
            for (let j = 0; j < originalData.data.length; j += 4) {
              const diffValue =
                Math.abs(originalData.data[j] - compressedData.data[j]) +
                Math.abs(originalData.data[j + 1] - compressedData.data[j + 1]) +
                Math.abs(originalData.data[j + 2] - compressedData.data[j + 2]);
              if (diffValue > 45) {
                compressedData.data[j] = 236;
                compressedData.data[j + 1] = 0;
                compressedData.data[j + 2] = 255;
                compressedData.data[j + 3] = 200;
              }
            }
            diffCtx.putImageData(compressedData, 0, 0);
            diffUrl = diffCanvas.toDataURL("image/png");
          }
        }

        const noteMessages: string[] = [];
        if (sizeDelta < 0) {
          noteMessages.push(`Heads up: output is ${(Math.abs(sizeDelta) / 1024).toFixed(1)} KB larger than the original. Try lowering quality or choose Auto.`);
        } else if (sizeDelta === 0) {
          noteMessages.push("No visible size change - try a lower quality or alternate format.");
        }
        updatedOriginals[i].compressed = {
          file: compressedFile,
          url: compressedUrl,
          size: compressedFile.size,
          name: compressedFile.name,
          diffUrl,
          format: bestCandidate.meta.label,
          quality: bestCandidate.qualityUsed ? Math.round(bestCandidate.qualityUsed * 100) : undefined,
          note: noteMessages.length > 0 ? noteMessages.join(" ") : undefined,
          sizeDelta,
        };
      } catch (err) {
        setError(`Error processing ${orig.name}: ${(err as Error).message}`);
      }
    }

    setOriginals(updatedOriginals);
    setIsCompressing(false);
  };

  const downloadCompressed = (compressed: CompressedResult) => {
    const a = document.createElement('a');
    a.href = compressed.url;
    a.download = compressed.file.name;
    a.click();
  };

  const downloadAllAsZip = async () => {
    const compressedFiles = originals.filter(o => o.compressed).map(o => o.compressed!);
    if (compressedFiles.length === 0) return;

    const zip = new JSZip();
    for (const compressed of compressedFiles) {
      zip.file(compressed.file.name, compressed.file);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = 'compressed-images.zip';
    a.click();
    URL.revokeObjectURL(zipUrl);
  };

  const removeImage = (name: string) => {
    const toRemove = originals.find(o => o.name === name);
    if (toRemove) {
      URL.revokeObjectURL(toRemove.url);
      if (toRemove.compressed) URL.revokeObjectURL(toRemove.compressed.url);
    }
    setOriginals(prev => prev.filter(o => o.name !== name));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const hasFiles = originals.length > 0;

  return (
    <div className={`p-6 space-y-8 rounded-lg glass border ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'} md:p-8`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Image Compressor & Optimizer</h2>
          <p className={`text-muted-foreground ${theme === 'dark' ? 'text-gray-300' : ''}`}>Compress and convert image formats with drag-and-drop and adjustable settings.</p>
        </div>
      </div>

      {/* Processing Controls */}
      <div className={`space-y-4 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
        <Tabs defaultValue="compression" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compression">Compression</TabsTrigger>
            <TabsTrigger value="converter">Converter</TabsTrigger>
          </TabsList>
          <TabsContent value="compression" className="mt-4">
            <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Compression Quality (applies to all)</Label>
            <Slider
              value={[quality]}
              onValueChange={(value) => setQuality(value[0])}
              min={10}
              max={100}
              step={5}
              className="w-full"
            />
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
              Quality: {quality}% (acts as a ceiling when Smart Optimization is enabled)
            </p>
          </TabsContent>
          <TabsContent value="converter" className="mt-4">
            <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Output Format (applies to all)</Label>
            <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as OutputFormat)}>
              <SelectTrigger className="w-full glass">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (smallest)</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
                <SelectItem value="avif">AVIF (beta)</SelectItem>
                <SelectItem value="bmp">BMP</SelectItem>
                <SelectItem value="svg">SVG (minified, SVG inputs only)</SelectItem>
              </SelectContent>
            </Select>
          </TabsContent>
        </Tabs>

        <div className={`flex items-start justify-between gap-4 rounded-md border px-4 py-3 ${theme === 'dark' ? 'border-gray-700/80 bg-gray-900/40' : 'border-gray-200 bg-gray-50/80'}`}>
          <div>
            <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Smart Optimization</Label>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
              Automatically lower quality or switch formats when needed to avoid larger files.
            </p>
          </div>
          <Switch
            checked={smartOptimize}
            onCheckedChange={(checked) => setSmartOptimize(checked)}
            aria-label="Toggle smart optimization"
          />
        </div>

        <Button
          onClick={compressAll}
          size="lg"
          disabled={isCompressing || !hasFiles || originals.every(o => o.compressed)}
          variant="outline"
          className={`w-full glass ${theme === 'dark' ? 'text-white' : ''}`}
        >
          {isCompressing
            ? 'Processing...'
            : !hasFiles
            ? 'Process All (0 files)'
            : originals.every(o => o.compressed)
            ? 'All Processed'
            : `Process All (${originals.length} files)`}
        </Button>
      </div>

      {/* Upload Area */}
      <Card className={`border-2 border-dashed p-8 text-center ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'border-muted-foreground/50'}`}>
        <CardContent className="pt-6">
          <Upload className={`mx-auto h-12 w-12 mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Drop images here or click to browse (up to 20 files, 1GB total)</h3>
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>Supports JPG, PNG, WebP, AVIF, BMP, SVG (individual max 100MB)</p>
          <input type="file" onChange={handleFileSelect} accept="image/*,.svg" multiple className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Button 
              variant="outline" 
              className={`glass ${theme === 'dark' ? 'text-primary border-primary' : 'text-primary'}`}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Select Images
            </Button>
          </label>
          <div
            className={`mt-4 min-h-[200px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${theme === 'dark' ? 'border-gray-600 hover:border-primary/50' : 'border-muted-foreground/30 hover:border-primary/50'}`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {originals.length === 0 ? (
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>Drag & drop or click to upload</p>
            ) : (
              <div className="text-center">
                <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Uploaded: {originals.length} file(s)</p>
                <ul className={`text-xs max-w-xs space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  {originals.map(o => <li key={o.name} className="truncate">{o.name}</li>)}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasFiles && (
        <>
          {isCompressing && (
            <Progress value={50} className="w-full" />
          )}

          {/* Images List */}
          <div className="space-y-6">
            {originals.map((orig) => {
              const compressed = orig.compressed;
              const sizeDelta = compressed ? (typeof compressed.sizeDelta === "number" ? compressed.sizeDelta : orig.size - compressed.size) : 0;
              const savingsPercent = orig.size > 0 ? (sizeDelta / orig.size) * 100 : 0;
              const keptOriginal = compressed?.format === "Original";

              return (
                <Card key={orig.name} className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{orig.name}</h4>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeImage(orig.name)} className={`${theme === 'dark' ? 'text-white' : ''}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Original</h5>
                      <img src={orig.url} alt={orig.name} className="max-h-48 mx-auto object-contain" />
                      <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>{formatSize(orig.size)}</p>
                    </div>
                    {compressed ? (
                      <>
                        <div className="text-center space-y-2">
                          <h5 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Optimized</h5>
                          <img src={compressed.url} alt="Optimized preview" className="max-h-48 mx-auto object-contain" />
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                            {formatSize(compressed.size)} | {compressed.format}
                            {typeof compressed.quality === "number" ? ` | ${compressed.quality}% quality` : ""}
                          </p>
                          {sizeDelta > 0 ? (
                            <p className="text-sm font-semibold text-green-600">
                              Saved {savingsPercent.toFixed(1)}% ({formatSize(sizeDelta)})
                            </p>
                          ) : sizeDelta === 0 ? (
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                                No size change
                              </p>
                            ) : (
                              <p className="text-sm font-semibold text-red-600">
                                +{formatSize(Math.abs(sizeDelta))} ({Math.abs(savingsPercent).toFixed(1)}%)
                              </p>
                            )}
                          {compressed.note && (
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>{compressed.note}</p>
                          )}
                        </div>
                        <div className="text-center space-y-2">
                            <h5 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Difference</h5>
                            {compressed.diffUrl ? (
                              <>
                                <img src={compressed.diffUrl} alt="Difference" className="max-h-48 mx-auto border" />
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>Magenta glow marks the pixel-level differences</p>
                              </>
                            ) : (
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                                {keptOriginal ? "Diff not needed - original retained." : "Diff preview not generated for this format."}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col justify-center space-y-2">
                            <Button onClick={() => downloadCompressed(compressed)} variant="outline" className={`glass ${theme === 'dark' ? 'text-white' : ''}`}>
                              <Download className="h-4 w-4 mr-2" />
                              Download {compressed.format} ({formatSize(compressed.size)})
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className={`col-span-2 text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                          Click "Compress All" to optimize
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Download All ZIP */}
          {originals.some(o => o.compressed) && (
            <div className="text-center">
              <Button onClick={downloadAllAsZip} size="lg" variant="outline" className={`glass ${theme === 'dark' ? 'text-white' : ''}`}>
                <Download className="h-4 w-4 mr-2" />
                Download All as ZIP ({originals.filter(o => o.compressed).length} files)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
