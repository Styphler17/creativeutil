import { ComponentType } from 'react';

export interface ToolConfig {
  id: string;
  title: string;
  description: string;
  icon: ComponentType;
  color: string;
  component: ComponentType;
  category?: string;
  tags?: string[];
  createdAt?: string;
  isNew?: boolean;
}

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
}

/**
 * Generates a thumbnail image for a tool based on its configuration
 * Uses HTML5 Canvas to create in-browser thumbnails without server dependencies
 */
export class ThumbnailGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(options: ThumbnailOptions = {}) {
    const {
      width = 200,
      height = 150,
      backgroundColor = '#ffffff',
      textColor = '#000000',
      borderRadius = 8
    } = options;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;

    // Set default styles
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, width, height);

    // Add rounded corners
    this.roundRect(0, 0, width, height, borderRadius);
    this.ctx.clip();
  }

  private roundRect(x: number, y: number, width: number, height: number, radius: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  /**
   * Generates a thumbnail for icon-based tools (like generators)
   */
  generateIconThumbnail(tool: ToolConfig): string {
    const { ctx, canvas } = this;
    const { width, height } = canvas;

    // Clear canvas with tool's color background
    ctx.fillStyle = this.getColorFromClass(tool.color);
    ctx.fillRect(0, 0, width, height);

    // Add icon (simplified representation)
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Use emoji or simple shape based on tool type
    const iconEmoji = this.getIconEmoji(tool.id);
    ctx.fillText(iconEmoji, width / 2, height / 2);

    // Add tool title
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.fillText(tool.title, width / 2, height - 20);

    return canvas.toDataURL('image/png');
  }

  /**
   * Generates a thumbnail for UI preview tools
   */
  generateUIPreviewThumbnail(tool: ToolConfig): string {
    const { ctx, canvas } = this;
    const { width, height } = canvas;

    // Create a mock UI preview
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    // Add a border
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Add tool title
    ctx.fillStyle = '#495057';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(tool.title, width / 2, 30);

    // Add sample content based on tool type
    this.addSampleContent(tool);

    return canvas.toDataURL('image/png');
  }

  /**
   * Generates a thumbnail for color/output based tools
   */
  generateColorThumbnail(tool: ToolConfig): string {
    const { ctx, canvas } = this;
    const { width, height } = canvas;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, this.getColorFromClass(tool.color));
    gradient.addColorStop(0.5, '#ffffff');
    gradient.addColorStop(1, '#f8f9fa');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add tool title
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(tool.title, width / 2, height / 2);

    return canvas.toDataURL('image/png');
  }

  private addSampleContent(tool: ToolConfig) {
    const { ctx, canvas } = this;
    const { width, height } = canvas;

    let colors: string[];

    switch (tool.id) {
      case 'css-button':
        // Draw a sample button
        ctx.fillStyle = '#007bff';
        this.roundRect(width / 2 - 40, height / 2 - 15, 80, 30, 4);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText('Button', width / 2, height / 2 + 2);
        break;

      case 'color-palette':
        // Draw color swatches
        colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
        colors.forEach((color, index) => {
          ctx.fillStyle = color;
          ctx.fillRect(20 + index * 30, height / 2 - 20, 25, 40);
        });
        break;

      case 'qr-generator':
        // Draw a simple QR code pattern
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
            if ((i + j) % 2 === 0) {
              ctx.fillRect(width / 2 - 40 + i * 16, height / 2 - 40 + j * 16, 16, 16);
            }
          }
        }
        break;

      case 'font-preview':
        // Draw sample text
        ctx.fillStyle = '#000000';
        ctx.font = '18px Arial';
        ctx.fillText('Aa Bb Cc', width / 2, height / 2);
        break;

      default:
        // Generic content
        ctx.fillStyle = '#6c757d';
        ctx.font = '14px Arial';
        ctx.fillText('Tool Preview', width / 2, height / 2);
    }
  }

  private getColorFromClass(colorClass: string): string {
    const colorMap: { [key: string]: string } = {
      'bg-primary': '#3b82f6',
      'bg-secondary': '#6b7280',
      'bg-accent': '#f59e0b',
      'bg-green-500': '#10b981',
      'bg-red-500': '#ef4444',
      'bg-purple-500': '#8b5cf6',
      'bg-pink-500': '#ec4899',
      'bg-indigo-500': '#6366f1',
    };
    return colorMap[colorClass] || '#3b82f6';
  }

  private getIconEmoji(toolId: string): string {
    const emojiMap: { [key: string]: string } = {
      'css-button': '🔘',
      'markdown-preview': '📝',
      'qr-generator': '📱',
      'pulse-animation': '💓',
      'color-palette': '🎨',
      'favicon-generator': '🖼️',
      'font-preview': '🔤',
      'css-gradient': '🌈',
      'password-generator': '🔐',
      'html-table-builder': '📊',
      'json-formatter': '📋',
      'lorem-ipsum-generator': '📄',
      'contrast-checker': '👁️',
      'regex-builder-tester': '🔍',
      'image-compressor-optimizer': '🗜️',
      'code-diff-merge': '⚖️',
      'api-playground': '🚀',
      'css-animation-generator': '🎭',
      'responsive-layout-builder': '📱',
      'accessibility-checker': '♿',
    };
    return emojiMap[toolId] || '🛠️';
  }

  /**
   * Main method to generate thumbnail based on tool type
   */
  generateThumbnail(tool: ToolConfig): string {
    // Determine thumbnail type based on tool category or ID
    if (tool.id.includes('color') || tool.id.includes('palette') || tool.id.includes('gradient')) {
      return this.generateColorThumbnail(tool);
    } else if (tool.id.includes('button') || tool.id.includes('preview') || tool.id.includes('generator')) {
      return this.generateUIPreviewThumbnail(tool);
    } else {
      return this.generateIconThumbnail(tool);
    }
  }

  /**
   * Generates all thumbnails for an array of tools
   */
  static generateAllThumbnails(tools: ToolConfig[]): { [key: string]: string } {
    const generator = new ThumbnailGenerator();
    const thumbnails: { [key: string]: string } = {};

    tools.forEach(tool => {
      thumbnails[tool.id] = generator.generateThumbnail(tool);
    });

    return thumbnails;
  }
}

/**
 * Hook to generate thumbnails for tools
 */
export const useThumbnailGenerator = () => {
  const generateThumbnail = (tool: ToolConfig) => {
    const generator = new ThumbnailGenerator();
    return generator.generateThumbnail(tool);
  };

  const generateAllThumbnails = (tools: ToolConfig[]) => {
    return ThumbnailGenerator.generateAllThumbnails(tools);
  };

  return { generateThumbnail, generateAllThumbnails };
};
