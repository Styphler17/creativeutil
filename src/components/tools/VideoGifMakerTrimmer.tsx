import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import GIF from 'gif.js';
import { Progress } from "@/components/ui/progress";

export const VideoGifMakerTrimmer: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10);
  const [frameRate, setFrameRate] = useState(15);
  const [textOverlay, setTextOverlay] = useState('');
  const [textPosition, setTextPosition] = useState<'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'>('bottom-left');
  const [textSize, setTextSize] = useState(24);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textStrokeColor, setTextStrokeColor] = useState('#000000');
  const [textX, setTextX] = useState(50);
  const [textY, setTextY] = useState(50);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textOpacity, setTextOpacity] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [previewCanvas, setPreviewCanvas] = useState<string | null>(null);
  const [showTextPreview, setShowTextPreview] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkImageSize, setWatermarkImageSize] = useState(20); // percentage
  const [watermarkRotation, setWatermarkRotation] = useState(0);
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const { theme } = useTheme();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setPreviewCanvas(null);
      setShowTextPreview(false);
    }
  };

  const handleWatermarkImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setWatermarkImage(file);
      setPreviewCanvas(null);
      setShowTextPreview(false);
    }
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
      file.type.startsWith('video/')
    );

    if (files.length > 0) {
      setVideoFile(files[0]);
      const url = URL.createObjectURL(files[0]);
      setVideoUrl(url);
      setPreviewCanvas(null);
      setShowTextPreview(false);
    }
  };

  const generateTextPreview = useCallback(async () => {
    if (!videoFile || !videoUrl || (!textOverlay.trim() && !watermarkImage)) return;

    try {
      const video = document.createElement('video');
      video.src = videoUrl;
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Seek to middle of trim range for preview
      const previewTime = (trimStart + trimEnd) / 2;
      video.currentTime = Math.min(previewTime, video.duration);
      await new Promise((resolve) => {
        video.onseeked = resolve;
      });

      ctx.drawImage(video, 0, 0);

      // Add text overlay
      if (textOverlay.trim()) {
        ctx.font = `${textSize}px ${fontFamily}`;
        ctx.globalAlpha = textOpacity;
        ctx.fillStyle = textColor;
        ctx.strokeStyle = textStrokeColor;
        ctx.lineWidth = 2;

        const textMetrics = ctx.measureText(textOverlay);
        const textWidth = textMetrics.width;
        const textHeight = textSize;

        let x, y;
        if (isDragging) {
          x = (textX / 100) * canvas.width;
          y = (textY / 100) * canvas.height;
        } else {
          switch (textPosition) {
            case 'top-left':
              x = 10;
              y = textHeight + 10;
              break;
            case 'top-center':
              x = (canvas.width - textWidth) / 2;
              y = textHeight + 10;
              break;
            case 'top-right':
              x = canvas.width - textWidth - 10;
              y = textHeight + 10;
              break;
            case 'bottom-left':
              x = 10;
              y = canvas.height - 10;
              break;
            case 'bottom-center':
              x = (canvas.width - textWidth) / 2;
              y = canvas.height - 10;
              break;
            case 'bottom-right':
              x = canvas.width - textWidth - 10;
              y = canvas.height - 10;
              break;
            default:
              x = 10;
              y = canvas.height - 10;
          }
        }

        ctx.strokeText(textOverlay, x, y);
        ctx.fillText(textOverlay, x, y);
      }

      // Add image watermark
      if (watermarkImage) {
        const watermarkImg = new Image();
        watermarkImg.onload = () => {
          ctx.save();
          ctx.globalAlpha = watermarkOpacity / 100;

          let x = (textX / 100) * canvas.width;
          let y = (textY / 100) * canvas.height;
          let width = watermarkImg.width;
          let height = watermarkImg.height;

          // Scale watermark to user-defined size (percentage of video)
          const maxSize = Math.min(canvas.width, canvas.height) * (watermarkImageSize / 100);
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width *= ratio;
            height *= ratio;
          }

          // Adjust for center positioning
          x -= width / 2;
          y -= height / 2;

          // Apply rotation
          if (watermarkRotation !== 0) {
            ctx.translate(x + width / 2, y + height / 2);
            ctx.rotate((watermarkRotation * Math.PI) / 180);
            ctx.drawImage(watermarkImg, -width / 2, -height / 2, width, height);
          } else {
            ctx.drawImage(watermarkImg, x, y, width, height);
          }

          ctx.restore();

          const previewUrl = canvas.toDataURL('image/png');
          setPreviewCanvas(previewUrl);
          setShowTextPreview(true);
        };
        watermarkImg.src = URL.createObjectURL(watermarkImage);
      } else {
        ctx.globalAlpha = 1;
        const previewUrl = canvas.toDataURL('image/png');
        setPreviewCanvas(previewUrl);
        setShowTextPreview(true);
      }
    } catch (error) {
      console.error('Preview generation failed:', error);
    }
  }, [
    videoFile,
    videoUrl,
    textOverlay,
    trimStart,
    trimEnd,
    textSize,
    fontFamily,
    textOpacity,
    textColor,
    textStrokeColor,
    textPosition,
    textX,
    textY,
    isDragging,
    watermarkImage,
    watermarkImageSize,
    watermarkRotation,
    watermarkOpacity,
  ]);

  // Auto-update preview when text overlay settings change
  useEffect(() => {
    if (videoFile && (textOverlay.trim() || watermarkImage)) {
      const timeoutId = window.setTimeout(() => {
        generateTextPreview();
      }, 300);

      return () => window.clearTimeout(timeoutId);
    }
  }, [videoFile, textOverlay, watermarkImage, generateTextPreview]);

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!showTextPreview || !isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDraggingText(true);
    setDragStartPos({ x, y });
    setTextX(x);
    setTextY(y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isDraggingText || !showTextPreview || !isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setTextX(x);
    setTextY(y);
  };

  const handleMouseUp = () => {
    setIsDraggingText(false);
  };

  const handleConvert = async () => {
    if (!videoFile || !videoUrl) return;

    setIsConverting(true);
    setConversionProgress(0);
    setGifUrl(null);
    try {
      // Create a video element to get duration
      const video = document.createElement('video');
      video.src = videoUrl;
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      const duration = video.duration;
      const startTime = Math.min(trimStart, duration);
      const endTime = Math.min(trimEnd, duration);

      if (startTime >= endTime) {
        alert('Trim end time must be greater than trim start time.');
        return;
      }

      // Create canvas for frame extraction
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      video.currentTime = startTime;
      await new Promise((resolve) => {
        video.onseeked = resolve;
      });

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const frames: ImageData[] = [];
      const frameInterval = 1 / frameRate;
      let currentTime = startTime;

      // Extract frames
      while (currentTime < endTime) {
        video.currentTime = currentTime;
        await new Promise((resolve) => {
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            frames.push(imageData);
            resolve(void 0);
          };
        });
        currentTime += frameInterval;
      }

      // Create GIF using gif.js
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: canvas.width,
        height: canvas.height,
        workerScript: '/gif.worker.js',
      });

      gif.on('finished', function(blob) {
        const url = URL.createObjectURL(blob);
        setGifUrl(url);
        setIsConverting(false);
        setConversionProgress(100);
      });

      gif.on('progress', function(p) {
        setConversionProgress(Math.round(p * 100));
      });

    // Load watermark image if present (once, before processing frames)
    let watermarkImg = null;
    if (watermarkImage) {
      watermarkImg = new Image();
      await new Promise((resolve, reject) => {
        watermarkImg.onload = resolve;
        watermarkImg.onerror = reject;
        watermarkImg.src = URL.createObjectURL(watermarkImage);
      });
    }

    frames.forEach((frame) => {
      const frameCanvas = document.createElement('canvas');
      const frameCtx = frameCanvas.getContext('2d', { willReadFrequently: true });
      if (frameCtx) {
        frameCanvas.width = canvas.width;
        frameCanvas.height = canvas.height;
        frameCtx.putImageData(frame, 0, 0);

        // Add text overlay if specified
        if (textOverlay.trim()) {
          frameCtx.font = `${textSize}px ${fontFamily}`;
          frameCtx.globalAlpha = textOpacity;
          frameCtx.fillStyle = textColor;
          frameCtx.strokeStyle = textStrokeColor;
          frameCtx.lineWidth = 2;

          const textMetrics = frameCtx.measureText(textOverlay);
          const textWidth = textMetrics.width;
          const textHeight = textSize;

          // Use custom position if dragging is enabled, otherwise use preset positions
          let x, y;
          if (isDragging) {
            x = (textX / 100) * canvas.width;
            y = (textY / 100) * canvas.height;
          } else {
            // Position text based on selected position
            switch (textPosition) {
              case 'top-left':
                x = 10;
                y = textHeight + 10;
                break;
              case 'top-center':
                x = (canvas.width - textWidth) / 2;
                y = textHeight + 10;
                break;
              case 'top-right':
                x = canvas.width - textWidth - 10;
                y = textHeight + 10;
                break;
              case 'bottom-left':
                x = 10;
                y = canvas.height - 10;
                break;
              case 'bottom-center':
                x = (canvas.width - textWidth) / 2;
                y = canvas.height - 10;
                break;
              case 'bottom-right':
                x = canvas.width - textWidth - 10;
                y = canvas.height - 10;
                break;
              default:
                x = 10;
                y = canvas.height - 10;
            }
          }

          frameCtx.strokeText(textOverlay, x, y);
          frameCtx.fillText(textOverlay, x, y);
          frameCtx.globalAlpha = 1; // Reset alpha
        }

        // Add image watermark if enabled
        if (watermarkImage && watermarkImg) {
          frameCtx.save();
          frameCtx.globalAlpha = watermarkOpacity / 100;

          let x = (textX / 100) * canvas.width;
          let y = (textY / 100) * canvas.height;
          let width = watermarkImg.width;
          let height = watermarkImg.height;

          // Scale watermark to user-defined size (percentage of video)
          const maxSize = Math.min(canvas.width, canvas.height) * (watermarkImageSize / 100);
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width *= ratio;
            height *= ratio;
          }

          // Adjust for center positioning
          x -= width / 2;
          y -= height / 2;

          // Apply rotation
          if (watermarkRotation !== 0) {
            frameCtx.translate(x + width / 2, y + height / 2);
            frameCtx.rotate((watermarkRotation * Math.PI) / 180);
            frameCtx.drawImage(watermarkImg, -width / 2, -height / 2, width, height);
          } else {
            frameCtx.drawImage(watermarkImg, x, y, width, height);
          }

          frameCtx.restore();
        }

        frameCtx.globalAlpha = 1;

        gif.addFrame(frameCanvas, { delay: (1000 / frameRate) });
      }
    });

    gif.render();

    } catch (error) {
      console.error('Conversion failed:', error);
      alert('Failed to convert video to GIF. Please try again.');
      setIsConverting(false);
    }
  };

  return (
    <div className={`p-6 space-y-8 rounded-lg glass border ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Video GIF Maker & Trimmer</h2>
        <p className={`text-foreground ${theme === 'dark' ? 'text-gray-300' : ''}`}>
          Transform your videos into animated GIFs with precision trimming, customizable text overlays, and image watermarks. Perfect for creating engaging content for social media, tutorials, or presentations.
        </p>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="space-y-4">
              <label htmlFor="video-upload" className={`block text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Upload Video</label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
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
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <div className={`text-2xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    📹
                  </div>
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {isDragOver ? 'Drop video here' : 'Drag & drop video here'}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      or click to browse files
                    </p>
                  </div>
                </div>
              </div>
              {videoFile && (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Selected: {videoFile.name}</p>
              )}
            </div>

            {/* Trim Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="trim-start" className={`block font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Trim Start (seconds)</label>
                <input
                  id="trim-start"
                  type="number"
                  value={trimStart}
                  onChange={(e) => setTrimStart(Number(e.target.value))}
                  className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 glass ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="trim-end" className={`block font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Trim End (seconds)</label>
                <input
                  id="trim-end"
                  type="number"
                  value={trimEnd}
                  onChange={(e) => setTrimEnd(Number(e.target.value))}
                  className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 glass ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
            </div>

            {/* Frame Rate */}
            <div className="space-y-2">
              <label htmlFor="frame-rate" className={`block font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Frame Rate (FPS)</label>
              <input
                id="frame-rate"
                type="number"
                value={frameRate}
                onChange={(e) => setFrameRate(Number(e.target.value))}
                min="1"
                max="60"
                className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 glass ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>

              {/* Text Overlay */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="text-overlay" className={`block font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Text Overlay (optional)</label>
                <input
                  id="text-overlay"
                  type="text"
                  value={textOverlay}
                  onChange={(e) => {
                    setTextOverlay(e.target.value);
                  }}
                  placeholder="Enter text to overlay on GIF"
                  className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 glass ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                />
              </div>

              {/* Image Watermark */}
              <div className="space-y-2">
                <label htmlFor="image-watermark" className={`block font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Image Watermark (optional)</label>
                <div className="flex gap-2">
                  <input
                    id="image-watermark"
                    type="file"
                    accept="image/*"
                    onChange={handleWatermarkImageUpload}
                    className={`flex-1 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 glass ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  {watermarkImage && (
                    <button
                      onClick={() => {
                        setWatermarkImage(null);
                        setPreviewCanvas(null);
                        setShowTextPreview(false);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        theme === 'dark'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {watermarkImage && (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Selected: {watermarkImage.name}</p>
                )}
              </div>

              {/* Preview Button - Now optional, preview updates automatically */}
              {(textOverlay.trim() || watermarkImage) && videoFile && (
                <div className="space-y-2">
                  <button
                    onClick={generateTextPreview}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {showTextPreview ? 'Update Preview' : 'Preview Overlay'}
                  </button>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Preview updates automatically as you change settings
                  </p>
                </div>
              )}

              {/* Text Position */}
              <div className="space-y-2">
                <label htmlFor="text-position" className={`block font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Text Position</label>
                <select
                  id="text-position"
                  value={textPosition}
                  onChange={(e) => {
                    setTextPosition(e.target.value as typeof textPosition);
                  }}
                  className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 glass ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-center">Top Center</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-center">Bottom Center</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>

              {/* Text Size */}
              <div className="space-y-2">
                <label htmlFor="text-size" className={`block font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Text Size</label>
                <input
                  id="text-size"
                  type="number"
                  value={textSize}
                  onChange={(e) => {
                    setTextSize(Number(e.target.value));
                  }}
                  min="12"
                  max="72"
                  className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 glass ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              {/* Font Family */}
              <div className="space-y-2">
                <label htmlFor="font-family" className={`block font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Font Family</label>
                <select
                  id="font-family"
                  value={fontFamily}
                  onChange={(e) => {
                    setFontFamily(e.target.value);
                  }}
                  className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 glass ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Impact">Impact</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                </select>
              </div>

              {/* Text Opacity */}
              <div className="space-y-2">
                <label htmlFor="text-opacity" className={`block font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Text Opacity</label>
                <input
                  id="text-opacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={textOpacity}
                  onChange={(e) => {
                    setTextOpacity(Number(e.target.value));
                  }}
                  className="w-full"
                />
                <div className="flex justify-between text-sm">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>0%</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{Math.round(textOpacity * 100)}%</span>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>100%</span>
                </div>
              </div>

              {/* Custom Position Toggle */}
              <div className="space-y-2">
                <label htmlFor="custom-positioning" className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <input
                    id="custom-positioning"
                    type="checkbox"
                    checked={isDragging}
                    onChange={(e) => {
                      setIsDragging(e.target.checked);
                    }}
                    className="rounded"
                  />
                  <span className="font-medium">Enable Custom Positioning</span>
                </label>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  When enabled, use the sliders below to position text anywhere on the video
                </p>
              </div>

              {/* Custom Position Controls */}
              {isDragging && (
                <div className="space-y-4 p-4 rounded-lg border-2 border-dashed">
                  <div className="space-y-2">
                    <label htmlFor="horizontal-position" className={`block font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Horizontal Position</label>
                    <input
                      id="horizontal-position"
                      type="range"
                      min="0"
                      max="100"
                      value={textX}
                      onChange={(e) => {
                        setTextX(Number(e.target.value));
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Left</span>
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{textX.toFixed(1)}%</span>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Right</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="vertical-position" className={`block font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Vertical Position</label>
                    <input
                      id="vertical-position"
                      type="range"
                      min="0"
                      max="100"
                      value={textY}
                      onChange={(e) => {
                        setTextY(Number(e.target.value));
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Top</span>
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{textY.toFixed(1)}%</span>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Bottom</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Text Color */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="text-color" className={`block font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Text Color</label>
                  <input
                    id="text-color"
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                    }}
                    className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="stroke-color" className={`block font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Stroke Color</label>
                  <input
                    id="stroke-color"
                    type="color"
                    value={textStrokeColor}
                    onChange={(e) => {
                      setTextStrokeColor(e.target.value);
                    }}
                    className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                  />
                </div>
              </div>

              {/* Image Watermark Settings */}
              {watermarkImage && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className={`text-md font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Image Watermark Settings</h4>

                  <div className="space-y-2">
                    <label htmlFor="image-size" className={`block font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Image Size: {watermarkImageSize}%</label>
                    <input
                      id="image-size"
                      type="range"
                      min="5"
                      max="50"
                      step="1"
                      value={watermarkImageSize}
                      onChange={(e) => {
                        setWatermarkImageSize(Number(e.target.value));
                      }}
                      className="w-full"
                    />
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Size relative to the video frame (5-50%)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="image-rotation" className={`block font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Image Rotation: {watermarkRotation}°</label>
                    <input
                      id="image-rotation"
                      type="range"
                      min="-180"
                      max="180"
                      step="1"
                      value={watermarkRotation}
                      onChange={(e) => {
                        setWatermarkRotation(Number(e.target.value));
                      }}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="image-opacity" className={`block font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Image Opacity</label>
                    <input
                      id="image-opacity"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={watermarkOpacity}
                      onChange={(e) => {
                        setWatermarkOpacity(Number(e.target.value));
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>0%</span>
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{watermarkOpacity}%</span>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>100%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {isConverting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Converting...</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{conversionProgress}%</span>
                </div>
                <Progress value={conversionProgress} className="w-full" />
              </div>
            )}

            {/* Convert Button */}
            <button
              onClick={handleConvert}
              disabled={!videoFile || isConverting}
              className={`w-full py-4 font-bold rounded-xl transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isConverting ? 'Converting...' : 'Convert to GIF'}
            </button>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className={`block text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Preview</label>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-foreground'}`}>
                Video preview and GIF output will appear here
              </p>
            </div>
            <div className={`rounded-2xl p-8 flex items-center justify-center min-h-[400px] ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
              {gifUrl ? (
                <div className="w-full space-y-4">
                  <img
                    src={gifUrl}
                    alt="Generated GIF"
                    className="w-full max-h-[300px] rounded-lg object-contain"
                    style={{ maxWidth: '100%' }}
                  />
                  <div className="text-center space-y-2">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Generated GIF Preview
                    </p>
                    <button
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = gifUrl;
                        a.download = `${videoFile?.name.replace(/\.[^/.]+$/, '')}_trimmed.gif`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        theme === 'dark'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      Download GIF
                    </button>
                  </div>
                </div>
              ) : previewCanvas && showTextPreview ? (
                <div className="w-full space-y-4">
                  <div className="relative">
                    <img
                      src={previewCanvas}
                      alt="Text Preview"
                      className={`w-full max-h-[300px] rounded-lg object-contain ${isDragging ? 'cursor-move' : ''}`}
                      style={{ maxWidth: '100%' }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      draggable={false}
                    />
                    {isDragging && (
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        Click and drag text to reposition
                      </div>
                    )}
                  </div>
                  <div className="text-center space-y-2">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Text Overlay Preview (Middle of trim range)
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {isDragging ? 'Click and drag on the image to reposition text' : 'This shows how your text will appear on the video'}
                    </p>
                  </div>
                </div>
              ) : videoUrl ? (
                <div className="w-full space-y-4">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full max-h-[300px] rounded-lg"
                    style={{ maxWidth: '100%' }}
                  />
                  <div className="text-center">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Preview: {videoFile?.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className={`text-6xl ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                    🎬
                  </div>
                  <div>
                    <p className={`text-xl font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Upload a video to preview
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Select a video file to get started
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};
