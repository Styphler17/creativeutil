import type { ComponentType } from "react";
import { Palette, FileText, QrCode, Activity } from "lucide-react";

export interface FeaturedTool {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: ComponentType<{ className?: string }>;
}

export const featuredTools: FeaturedTool[] = [
  {
    id: "css-button",
    title: "CSS Button Generator",
    description: "Create custom button styles with live preview",
    icon: Palette,
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
  },
  {
    id: "markdown-preview",
    title: "Markdown Preview Generator",
    description: "Write Markdown and see instant HTML preview",
    icon: FileText,
    color: "bg-gradient-to-br from-green-500 to-green-600",
  },
  {
    id: "qr-generator",
    title: "QR Code Generator",
    description: "Generate QR codes from any text or URL",
    icon: QrCode,
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
  },
  {
    id: "pulse-animation",
    title: "Pulse Animation Generator",
    description: "Create smooth CSS pulse animations",
    icon: Activity,
    color: "bg-gradient-to-br from-red-500 to-red-600",
  },
];
