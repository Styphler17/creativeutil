import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, Scissors, Sparkles, Download, AlertCircle } from "lucide-react";
import { removeBackground } from "@imgly/background-removal";

interface VisualAsset {
  originalFile: File;
  originalUrl: string;
  compressedUrl?: string;
  compressedSize?: number;
  bgRemovedUrl?: string;
  bgRemovedSize?: number;
}

export const VisualTrim = () => {
  const [asset, setAsset] = useState<VisualAsset | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [info, setInfo] = useState<string>("");
  const [isDragActive, setIsDragActive] = useState<boolean>(false);

  const handleFile = (file?: File) => {
    resetState();
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Upload a JPG, PNG, or SVG image.");
      return;
    }
    const url = URL.createObjectURL(file);
    setAsset({
      originalFile: file,
      originalUrl: url,
    });
  };

  const resetState = () => {
    if (asset?.originalUrl) URL.revokeObjectURL(asset.originalUrl);
    if (asset?.compressedUrl) URL.revokeObjectURL(asset.compressedUrl);
    if (asset?.bgRemovedUrl) URL.revokeObjectURL(asset.bgRemovedUrl);
    setAsset(null);
    setError("");
    setInfo("");
    setProgress(0);
    setIsProcessing(false);
  };

  const compressImage = async () => {
    if (!asset) return;
    setIsProcessing(true);
    setProgress(10);
    setError("");
    setInfo("");
    try {
      const img = await loadImage(asset.originalFile);
      setProgress(40);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      if (!context) {
        throw new Error("Canvas context unavailable.");
      }
      context.drawImage(img, 0, 0);
      const mimeType = asset.originalFile.type === "image/png" ? "image/png" : "image/jpeg";
      const blob = await canvasToBlob(canvas, mimeType, quality / 100);
      const compressedUrl = URL.createObjectURL(blob);
      setAsset((prev) =>
        prev
          ? {
              ...prev,
              compressedUrl,
              compressedSize: blob.size,
            }
          : prev
      );
      setInfo("Compression complete. Download your optimized image below.");
      setProgress(100);
    } catch (err) {
      console.error(err);
      setError("Failed to compress the image. Try a different file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const removeBackgroundHandler = async () => {
    if (!asset) return;
    setIsProcessing(true);
    setProgress(10);
    setError("");
    setInfo("");
    try {
      const output = await removeBackground(asset.originalFile, {
        debug: false,
        progress: (key: string, current: number, total: number) => setProgress(Math.round(10 + (current / total) * 70)),
      });
      setProgress(80);
      // Compress the background removed image
      const img = await loadImageFromBlob(output);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      if (!context) {
        throw new Error("Canvas context unavailable.");
      }
      context.drawImage(img, 0, 0);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      let hasTransparency = false;
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] < 255) {
          hasTransparency = true;
          break;
        }
      }
      const mimeType = hasTransparency ? "image/png" : "image/jpeg";
      const compressedBlob = await canvasToBlob(canvas, mimeType, hasTransparency ? undefined : quality / 100);
      const bgRemovedUrl = URL.createObjectURL(compressedBlob);
      setAsset((prev) =>
        prev
          ? {
              ...prev,
              bgRemovedUrl,
              bgRemovedSize: compressedBlob.size,
            }
          : prev
      );
      setInfo("Background removed and compressed — download the optimized cutout below.");
      setProgress(100);
    } catch (err) {
      console.error(err);
      setError("Background removal failed. Try a different image with clearer subject separation.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadBlobUrl = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith("image/"));
    if (imageFile) {
      handleFile(imageFile);
    } else {
      setError("Please drop a valid image file (JPG, PNG, or SVG).");
    }
  };

  return (
    <div className={`space-y-6 p-4 md:p-8 rounded-xl bg-white/50 dark:bg-gray-900/50`}>
      <div
        className={`relative ${isDragActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Card className={`border-2 border-dashed transition-colors ${isDragActive ? 'border-primary bg-primary/5' : ''}`}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Upload className="w-8 h-8 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">
                  {isDragActive ? "Drop your image here" : "Upload image"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? "Release to upload"
                    : "Drag and drop an image or click to browse — works entirely in the browser — no API costs or server uploads."
                  }
                </p>
              </div>
            </div>
            <Input
              id="file-upload"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="cursor-pointer"
            />
            {asset && (
              <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-1">
                <p><strong>Name:</strong> {asset.originalFile.name}</p>
                <p><strong>Size:</strong> {formatSize(asset.originalFile.size)}</p>
                <p><strong>Type:</strong> {asset.originalFile.type || "Unknown"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Compression quality</Label>
              <Slider value={[quality]} onValueChange={(value) => setQuality(value[0])} min={30} max={100} step={5} />
              <p className="text-sm text-muted-foreground">Quality: {quality}% — lower values shrink file size with more compression.</p>
            </div>
            <div className="space-y-3">
              <Label>Background remover</Label>
              <p className="text-sm text-muted-foreground">One click to produce a transparent PNG cutout powered by on-device AI.</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={compressImage} disabled={!asset || isProcessing} variant="outline" className="flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  Compress Image
                </Button>
                <Button onClick={removeBackgroundHandler} disabled={!asset || isProcessing} className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Remove Background
                </Button>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">Processing... larger images can take a few seconds.</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {info && !error && (
            <Alert>
              <AlertDescription>{info}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {asset && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="!bg-gray-900/50 !border-gray-700 dark:!bg-gray-900/50 dark:!border-gray-700">
            <CardContent className="p-6 space-y-3">
              <h3 className="text-lg font-semibold">Original</h3>
              <img src={asset.originalUrl} alt="Original" className="rounded-lg border object-contain max-h-80 w-full" />
              <p className="text-sm text-muted-foreground">Size: {formatSize(asset.originalFile.size)}</p>
            </CardContent>
          </Card>

          <Card className="!bg-gray-900/50 !border-gray-700 dark:!bg-gray-900/50 dark:!border-gray-700">
            <CardContent className="p-6 space-y-3">
              <h3 className="text-lg font-semibold">Optimized outputs</h3>
              <div className="space-y-4">
                {asset.compressedUrl ? (
                  <div className="space-y-2">
                    <img src={asset.compressedUrl} alt="Compressed" className="rounded-lg border object-contain max-h-72 w-full bg-muted" />
                    <div className="flex justify-between items-center text-sm">
                      <p>Size: {formatSize(asset.compressedSize ?? 0)}</p>
                      <Button variant="outline" size="sm" onClick={() => downloadBlobUrl(asset.compressedUrl!, withSuffix(asset.originalFile.name, "compressed"))}>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Compress the image to see the optimized preview.</p>
                )}

                {asset.bgRemovedUrl ? (
                  <div className="space-y-2">
                    <img
                      src={asset.bgRemovedUrl}
                      alt="Background removed"
                      className="rounded-lg border object-contain max-h-72 w-full bg-[linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.05)_75%),linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.05)_75%)] dark:bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.05)_75%),linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.05)_75%)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]"
                    />
                    <div className="flex justify-between items-center text-sm">
                      <p>Size: {formatSize(asset.bgRemovedSize ?? 0)}</p>
                      <Button variant="outline" size="sm" onClick={() => downloadBlobUrl(asset.bgRemovedUrl!, withSuffix(asset.originalFile.name, "bg-removed", "png"))}>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Remove the background to preview the transparent cutout.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const formatSize = (bytes?: number) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const withSuffix = (name: string, suffix: string, forcedExt?: string) => {
  const base = name.replace(/\.[^/.]+$/, "");
  const ext = forcedExt ?? name.split(".").pop();
  return `${base}-${suffix}.${ext ?? "png"}`;
};

const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
};

const loadImageFromBlob = (blob: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image from blob"));
    };
    img.src = url;
  });
};

const canvasToBlob = (canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas conversion failed"));
    }, mimeType, quality);
  });
};

export default VisualTrim;
