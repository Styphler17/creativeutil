import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useTheme } from '@/contexts/ThemeContext';

export const BulkWatermarkCreator: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [watermarkText, setWatermarkText] = useState('Sample Watermark');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [position, setPosition] = useState('bottom-right');
  const [opacity, setOpacity] = useState([50]);
  const [fontSize, setFontSize] = useState([24]);
  const [rotation, setRotation] = useState([0]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [processedImages, setProcessedImages] = useState<{ file: File; url: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 50, y: 50 }); // percentage
  const [selectedResult, setSelectedResult] = useState<{ file: File; url: string } | null>(null);
  const [imageWatermarkSize, setImageWatermarkSize] = useState([20]); // percentage of image size
  const [textColor, setTextColor] = useState('#ffffff');
  const [outlineColor, setOutlineColor] = useState('#000000');
  const [outlineThickness, setOutlineThickness] = useState([2]);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [watermarkHistory, setWatermarkHistory] = useState<Array<{
    id: string;
    timestamp: number;
    settings: {
      watermarkText: string;
      watermarkImage: File | null;
      opacity: number[];
      fontSize: number[];
      rotation: number[];
      position: string;
      watermarkPosition: { x: number; y: number };
      imageWatermarkSize: number[];
      textColor: string;
      outlineColor: string;
      outlineThickness: number[];
      fontFamily: string;
    };
    results: { file: File; url: string }[];
  }>>([]);
  const { theme } = useTheme();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = (files: File[]) => {
    setImages(files);

    // Set the first image as preview
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setPreviewImage(null);
    }
  };

  const handleWatermarkImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setWatermarkImage(file);
    }
  };

  const handlePositionChange = (newPosition: string) => {
    setPosition(newPosition);
    // Set watermark position based on selected preset
    switch (newPosition) {
      case 'top-left':
        setWatermarkPosition({ x: 10, y: 10 });
        break;
      case 'top-right':
        setWatermarkPosition({ x: 90, y: 10 });
        break;
      case 'bottom-left':
        setWatermarkPosition({ x: 10, y: 90 });
        break;
      case 'bottom-right':
        setWatermarkPosition({ x: 90, y: 90 });
        break;
      case 'center':
        setWatermarkPosition({ x: 50, y: 50 });
        break;
      default:
        setWatermarkPosition({ x: 50, y: 50 });
    }
  };

  const handleProcess = async () => {
    if (images.length === 0 || (!watermarkText && !watermarkImage)) return;

    // Save current settings to history
    const currentSettings = {
      watermarkText,
      watermarkImage,
      opacity,
      fontSize,
      rotation,
      position,
      watermarkPosition,
      imageWatermarkSize,
      textColor,
      outlineColor,
      outlineThickness,
      fontFamily,
    };

    setIsProcessing(true);
    setProcessedImages([]);

    try {
      const processedFiles: { file: File; url: string }[] = [];

      for (const imageFile of images) {
        const processedImage = await applyWatermark(imageFile);
        const url = URL.createObjectURL(processedImage);
        processedFiles.push({ file: processedImage, url });
      }

      setProcessedImages(processedFiles);

      // Add to history
      const historyEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        settings: currentSettings,
        results: processedFiles,
      };
      setWatermarkHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Error processing images. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = () => {
    processedImages.forEach(({ file }, index) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(file);
      a.download = `watermarked_${images[index].name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const handleDownloadSingle = (file: File, originalName: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = `watermarked_${originalName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const applyWatermark = (imageFile: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Apply text watermark
        if (watermarkText) {
          ctx.save();
          ctx.globalAlpha = opacity[0] / 100;
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#000000';

          // Scale font size based on image dimensions for consistent appearance
          const baseSize = Math.min(canvas.width, canvas.height);
          const scaledFontSize = Math.max(12, (fontSize[0] / 400) * baseSize); // Scale relative to 400px base
          ctx.lineWidth = outlineThickness[0];
          ctx.font = `bold ${scaledFontSize}px ${fontFamily}`;
          ctx.fillStyle = textColor;
          ctx.strokeStyle = outlineColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const x = (canvas.width * watermarkPosition.x) / 100;
          const y = (canvas.height * watermarkPosition.y) / 100;

          // Apply rotation
          if (rotation[0] !== 0) {
            ctx.translate(x, y);
            ctx.rotate((rotation[0] * Math.PI) / 180);
            ctx.strokeText(watermarkText, 0, 0);
            ctx.fillText(watermarkText, 0, 0);
          } else {
            ctx.strokeText(watermarkText, x, y);
            ctx.fillText(watermarkText, x, y);
          }

          ctx.restore();
        }

        // Apply image watermark (if provided)
        if (watermarkImage) {
          const watermarkImg = new Image();
          watermarkImg.onload = () => {
            ctx.save();
            ctx.globalAlpha = opacity[0] / 100;

            let x = (canvas.width * watermarkPosition.x) / 100;
            let y = (canvas.height * watermarkPosition.y) / 100;
            let width = watermarkImg.width;
            let height = watermarkImg.height;

            // Scale watermark to user-defined size (percentage of image)
            const maxSize = Math.min(canvas.width, canvas.height) * (imageWatermarkSize[0] / 100);
            if (width > maxSize || height > maxSize) {
              const ratio = Math.min(maxSize / width, maxSize / height);
              width *= ratio;
              height *= ratio;
            }

            // Adjust for center positioning
            x -= width / 2;
            y -= height / 2;

            // Apply rotation
            if (rotation[0] !== 0) {
              ctx.translate(x + width / 2, y + height / 2);
              ctx.rotate((rotation[0] * Math.PI) / 180);
              ctx.drawImage(watermarkImg, -width / 2, -height / 2, width, height);
            } else {
              ctx.drawImage(watermarkImg, x, y, width, height);
            }

            ctx.restore();

            canvas.toBlob((blob) => {
              if (blob) {
                const processedFile = new File([blob], imageFile.name, { type: imageFile.type });
                resolve(processedFile);
              } else {
                reject(new Error('Failed to create blob'));
              }
            }, imageFile.type);
          };
          watermarkImg.src = URL.createObjectURL(watermarkImage);
        }

        // If no image watermark, finalize the text-only canvas
        if (!watermarkImage) {
          canvas.toBlob((blob) => {
            if (blob) {
              const processedFile = new File([blob], imageFile.name, { type: imageFile.type });
              resolve(processedFile);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, imageFile.type);
        }
      };
      img.src = URL.createObjectURL(imageFile);
    });
  };

  return (
    <div className={`p-6 space-y-8 rounded-lg glass border ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Bulk Watermark Creator</h2>
        <p className={`text-foreground ${theme === 'dark' ? 'text-gray-300' : ''}`}>
          Upload multiple images and apply text or logo watermarks with customizable positioning, opacity, and styling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className={`space-y-6 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Watermark Configuration</h3>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image-upload" className={`${theme === 'dark' ? 'text-white' : ''}`}>Upload Images</Label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver
                  ? 'border-primary bg-primary/10'
                  : theme === 'dark'
                    ? 'border-gray-600 hover:border-gray-500'
                    : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <div className={`text-2xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  📁
                </div>
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {isDragOver ? 'Drop images here' : 'Drag & drop images here'}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    or click to browse files
                  </p>
                </div>
              </div>
            </div>
            {images.length > 0 && (
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Selected {images.length} images</p>
            )}
          </div>

          {/* Watermark Type */}
          <div className="space-y-4">
            <h4 className={`text-md font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Watermark Type</h4>

            {/* Text Watermark */}
            <div className="space-y-2">
              <Label htmlFor="watermark-text" className={`${theme === 'dark' ? 'text-white' : ''}`}>Text Watermark</Label>
              <Input
                id="watermark-text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Enter watermark text"
                className="glass"
              />
            </div>

            {/* Image Watermark */}
            <div className="space-y-2">
              <Label htmlFor="watermark-image" className={`${theme === 'dark' ? 'text-white' : ''}`}>Image Watermark (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="watermark-image"
                  type="file"
                  accept="image/*"
                  onChange={handleWatermarkImageUpload}
                  className="glass flex-1"
                />
                {watermarkImage && (
                  <Button
                    onClick={() => setWatermarkImage(null)}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    Remove
                  </Button>
                )}
              </div>
              {watermarkImage && (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Selected: {watermarkImage.name}</p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="position-select" className={`${theme === 'dark' ? 'text-white' : ''}`}>Position</Label>
              <select
                id="position-select"
                value={position}
                onChange={(e) => handlePositionChange(e.target.value)}
                className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 glass ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                title="Select watermark position on image"
              >
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="center">Center</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Opacity: {opacity[0]}%</Label>
              <Slider
                value={opacity}
                onValueChange={setOpacity}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Font Size: {fontSize[0]}px</Label>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                max={72}
                min={12}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Rotation: {rotation[0]}°</Label>
              <Slider
                value={rotation}
                onValueChange={setRotation}
                max={180}
                min={-180}
                step={1}
                className="w-full"
              />
            </div>

            {/* Text Styling Controls */}
            {watermarkText && (
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className={`text-md font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Text Styling</h4>
                
                <div className="space-y-2">
                  <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Font Family</Label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 glass ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    title="Select font family for watermark text"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Text Color</Label>
                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-10 p-1"
                      title="Choose text color for watermark"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Outline Color</Label>
                    <Input
                      type="color"
                      value={outlineColor}
                      onChange={(e) => setOutlineColor(e.target.value)}
                      className="w-full h-10 p-1"
                      title="Choose outline color for watermark text"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Outline Thickness: {outlineThickness[0]}px</Label>
                  <Slider
                    value={outlineThickness}
                    onValueChange={setOutlineThickness}
                    max={10}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {watermarkImage && (
              <div className="space-y-2">
                <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Image Watermark Size: {imageWatermarkSize[0]}%</Label>
                <Slider
                  value={imageWatermarkSize}
                  onValueChange={setImageWatermarkSize}
                  max={50}
                  min={5}
                  step={1}
                  className="w-full"
                />
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Size relative to the main image (5-50%)
                </p>
              </div>
            )}
          </div>

          {/* Process Button */}
          <Button
            onClick={handleProcess}
            disabled={images.length === 0 || (!watermarkText && !watermarkImage) || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? 'Processing...' : 'Process Images'}
          </Button>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Live Preview</Label>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-foreground'}`}>
              Preview of your watermark on a sample image
            </p>
          </div>
          <div className={`rounded-2xl p-8 flex items-center justify-center min-h-[400px] ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <div className="relative">
              {/* Preview Image */}
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-w-full max-h-96 rounded-lg object-contain"
                  style={{ maxWidth: '400px', maxHeight: '300px' }}
                />
              ) : (
                <div className={`w-64 h-48 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}>
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Upload images to preview</span>
                </div>
              )}

              {/* Draggable Watermark Preview */}
              {(watermarkText || watermarkImage) && (
                <div
                  className={`absolute cursor-move select-none ${isDragging ? 'z-50' : 'z-10'}`}
                  style={{
                    left: `${watermarkPosition.x}%`,
                    top: `${watermarkPosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                    transformOrigin: 'center',
                  }}
                  onMouseDown={(e) => {
                    setIsDragging(true);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDragOffset({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }}
                  onMouseMove={(e) => {
                    if (!isDragging) return;
                    const container = e.currentTarget.parentElement;
                    if (!container) return;

                    const containerRect = container.getBoundingClientRect();
                    const watermarkRect = e.currentTarget.getBoundingClientRect();

                    const newLeft = e.clientX - containerRect.left - dragOffset.x;
                    const newTop = e.clientY - containerRect.top - dragOffset.y;

                    // Constrain watermark within image boundaries
                    const constrainedLeft = Math.max(0, Math.min(newLeft, containerRect.width - watermarkRect.width));
                    const constrainedTop = Math.max(0, Math.min(newTop, containerRect.height - watermarkRect.height));

                    const newXPercent = ((constrainedLeft + watermarkRect.width / 2) / containerRect.width) * 100;
                    const newYPercent = ((constrainedTop + watermarkRect.height / 2) / containerRect.height) * 100;

                    setWatermarkPosition({
                      x: Math.max(0, Math.min(100, newXPercent)),
                      y: Math.max(0, Math.min(100, newYPercent)),
                    });
                  }}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                >
                  {watermarkText && (
                    <div
                      className="font-bold pointer-events-none drop-shadow-lg"
                      style={{
                        fontSize: `${fontSize[0]}px`,
                        fontFamily: fontFamily,
                        color: textColor,
                        opacity: opacity[0] / 100,
                        transform: `rotate(${rotation[0]}deg)`,
                        textShadow: `${outlineThickness[0]}px ${outlineThickness[0]}px 0px ${outlineColor}`,
                        WebkitTextStroke: `${outlineThickness[0]}px ${outlineColor}`,
                      }}
                    >
                      {watermarkText}
                    </div>
                  )}
                  {watermarkImage && (
                    <img
                      src={URL.createObjectURL(watermarkImage)}
                      alt="Watermark preview"
                      className="object-contain pointer-events-none drop-shadow-lg"
                      style={{
                        opacity: opacity[0] / 100,
                        transform: `rotate(${rotation[0]}deg)`,
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))',
                        maxWidth: `${imageWatermarkSize[0] * 2}px`,
                        maxHeight: `${imageWatermarkSize[0] * 2}px`,
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Processed Images Results */}
          {processedImages.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className={`${theme === 'dark' ? 'text-white' : ''}`}>Processed Images ({processedImages.length})</Label>
                <Button onClick={handleDownloadAll} size="sm">
                  Download All
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {processedImages.map(({ file, url }, index) => (
                  <div key={index} className={`rounded-lg p-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <img
                      src={url}
                      alt={`Processed ${index + 1}`}
                      className="w-full h-24 object-cover rounded mb-2 cursor-pointer"
                      onClick={() => setSelectedResult({ file, url })}
                    />
                    <p className={`text-xs truncate mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {file.name}
                    </p>
                    <Button
                      onClick={() => handleDownloadSingle(file, images[index].name)}
                      size="sm"
                      className="w-full"
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result Preview Modal */}
          {selectedResult && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`relative max-w-4xl max-h-[90vh] rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Preview: {selectedResult.file.name}
                  </h3>
                  <Button
                    onClick={() => setSelectedResult(null)}
                    variant="ghost"
                    size="sm"
                  >
                    ✕
                  </Button>
                </div>
                <div className="flex justify-center">
                  <img
                    src={selectedResult.url}
                    alt="Full preview"
                    className="max-w-full max-h-[70vh] object-contain rounded"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    onClick={() => setSelectedResult(null)}
                    variant="outline"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => handleDownloadSingle(selectedResult.file, selectedResult.file.name)}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Watermark History */}
      {watermarkHistory.length > 0 && (
        <div className={`mt-8 p-6 rounded-lg glass border ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recent Watermarks</h3>
            <div className={`text-sm px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' : 'bg-yellow-100 text-yellow-800 border border-yellow-300'}`}>
              ⚠️ Session Only - Lost on refresh
            </div>
          </div>
          <div className="space-y-4">
            {watermarkHistory.map((entry) => (
              <div key={entry.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {entry.settings.watermarkText || 'Image Watermark'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        // Restore settings
                        setWatermarkText(entry.settings.watermarkText);
                        setWatermarkImage(entry.settings.watermarkImage);
                        setOpacity(entry.settings.opacity);
                        setFontSize(entry.settings.fontSize);
                        setRotation(entry.settings.rotation);
                        setPosition(entry.settings.position);
                        setWatermarkPosition(entry.settings.watermarkPosition);
                        setImageWatermarkSize(entry.settings.imageWatermarkSize);
                        setTextColor(entry.settings.textColor);
                        setOutlineColor(entry.settings.outlineColor);
                        setOutlineThickness(entry.settings.outlineThickness);
                        setFontFamily(entry.settings.fontFamily);
                        setProcessedImages(entry.results);
                      }}
                      size="sm"
                      variant="outline"
                    >
                      Restore Settings
                    </Button>
                    <Button
                      onClick={() => {
                        entry.results.forEach(({ file }, index) => {
                          const a = document.createElement('a');
                          a.href = URL.createObjectURL(file);
                          a.download = `watermarked_${index + 1}_${file.name}`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        });
                      }}
                      size="sm"
                    >
                      Download All
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {entry.results.slice(0, 8).map(({ url }, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`History ${index + 1}`}
                      className="w-full h-16 object-cover rounded cursor-pointer"
                      onClick={() => setSelectedResult(entry.results[index])}
                    />
                  ))}
                  {entry.results.length > 8 && (
                    <div className={`w-full h-16 rounded flex items-center justify-center text-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                      +{entry.results.length - 8} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
