import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";

export const QRCodeGenerator = () => {
  const [text, setText] = useState("https://creativeutil.example.com");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { theme } = useTheme();

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = "qrcode.png";
          link.click();
          URL.revokeObjectURL(downloadUrl);
          toast({
            title: "QR Code Downloaded!",
            description: "Your QR code has been saved as PNG.",
          });
        }
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "The link has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-6 space-y-8 rounded-lg glass border ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>QR Code Generator</h2>
        <p className={`text-foreground ${theme === 'dark' ? 'text-gray-300' : ''}`}>
          Generate QR codes instantly from any text or URL
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Controls */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="qr-text" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Text or URL</Label>
            <Input
              id="qr-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text or URL to encode"
              className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700 text-white' : 'bg-white/50 border-gray-200'}`}
            />
            <p className={`text-sm text-foreground ${theme === 'dark' ? 'text-gray-300' : ''}`}>
              Enter any text, URL, or data you want to encode
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={copyLink}
              variant="outline"
              className={`glass w-full ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>

            <Button
              onClick={downloadQR}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </Button>
          </div>

          <div className={`glass rounded-xl p-6 space-y-2 ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
            <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Usage Tips</h4>
            <ul className={`text-sm text-muted-foreground space-y-1 ${theme === 'dark' ? 'text-gray-300' : ''}`}>
              <li>* Works with URLs, text, phone numbers</li>
              <li>* Perfect for sharing links offline</li>
              <li>* High-quality PNG download</li>
              <li>* Instant QR code generation</li>
            </ul>
          </div>
        </div>

        {/* QR Code Preview */}
        <div className="space-y-4">
          <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>QR Code Preview</Label>
          <div
            ref={qrRef}
            className={`glass rounded-2xl p-8 flex items-center justify-center min-h-[300px] ${theme === 'dark' ? 'border-2 border-gray-700' : 'border-2 border-gray-200'}`}
          >
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <QRCodeSVG value={text || " "} size={256} level="H" />
            </div>
          </div>
          <p className={`text-sm text-muted-foreground text-center ${theme === 'dark' ? 'text-gray-300' : ''}`}>
            Scan this QR code with your mobile device
          </p>
        </div>
      </div>
    </div>
  );
};
