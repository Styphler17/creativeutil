import { lazy } from 'react';
import { Palette, FileText, QrCode, Activity, Search, Monitor, Key, Table as TableIcon, Code, Type, Eye, Image as ImageIcon, Play, Wand2, Clock, Users, Sparkles, Scissors, Files, Scale, Video, Stamp, Music, GitBranch, Database, Share, Mail, Globe, CheckCircle } from "lucide-react";

// Color palette for tool backgrounds - automatically cycles through colors for new tools
const toolColors = [
  'bg-gradient-to-br from-blue-500 to-blue-600',
  'bg-gradient-to-br from-green-500 to-green-600',
  'bg-gradient-to-br from-purple-500 to-purple-600',
  'bg-gradient-to-br from-red-500 to-red-600',
  'bg-gradient-to-br from-yellow-500 to-yellow-600',
  'bg-gradient-to-br from-pink-500 to-pink-600',
  'bg-gradient-to-br from-indigo-500 to-indigo-600',
  'bg-gradient-to-br from-teal-500 to-teal-600',
  'bg-gradient-to-br from-orange-500 to-orange-600',
  'bg-gradient-to-br from-cyan-500 to-cyan-600',
  'bg-gradient-to-br from-lime-500 to-lime-600',
  'bg-gradient-to-br from-rose-500 to-rose-600',
  'bg-gradient-to-br from-emerald-500 to-emerald-600',
  'bg-gradient-to-br from-violet-500 to-violet-600',
  'bg-gradient-to-br from-amber-500 to-amber-600',
  'bg-gradient-to-br from-sky-500 to-sky-600',
  'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600',
  'bg-gradient-to-br from-slate-500 to-slate-600',
  'bg-gradient-to-br from-stone-500 to-stone-600',
  'bg-gradient-to-br from-neutral-500 to-neutral-600',
  'bg-gradient-to-br from-gray-500 to-gray-600',
  'bg-gradient-to-br from-zinc-500 to-zinc-600',
];

// Function to get color for a tool based on its index
const getToolColor = (index: number): string => {
  return toolColors[index % toolColors.length];
};

const generateCreatedAt = (index: number): string => {
  const baseYear = 2023;
  const monthOffset = index % 12;
  const yearOffset = Math.floor(index / 12);
  const day = 1 + (index % 3) * 10;
  const date = new Date(Date.UTC(baseYear + yearOffset, monthOffset, Math.min(day, 28)));
  return date.toISOString();
};

const CSSButtonGenerator = lazy(() => import('@/components/tools/CSSButtonGenerator').then(m => ({ default: m.CSSButtonGenerator })));
const MarkdownPreview = lazy(() => import('@/components/tools/MarkdownPreview').then(m => ({ default: m.MarkdownPreview })));
const QRCodeGenerator = lazy(() => import('@/components/tools/QRCodeGenerator').then(m => ({ default: m.QRCodeGenerator })));
const PulseAnimationDemo = lazy(() => import('@/components/tools/PulseAnimationDemo').then(m => ({ default: m.PulseAnimationDemo })));
const ColorPaletteGenerator = lazy(() => import('@/components/tools/ColorPaletteGenerator').then(m => ({ default: m.ColorPaletteGenerator })));
const SVGIconCustomizer = lazy(() => import('@/components/tools/SVGIconCustomizer').then(m => ({ default: m.SVGIconCustomizer })));
const TextShadowGenerator = lazy(() => import('@/components/tools/TextShadowGenerator').then(m => ({ default: m.TextShadowGenerator })));
const CSSGradientMaker = lazy(() => import('@/components/tools/CSSGradientMaker').then(m => ({ default: m.CSSGradientMaker })));
const PasswordGenerator = lazy(() => import('@/components/tools/PasswordGenerator').then(m => ({ default: m.PasswordGenerator })));
const HTMLTableBuilder = lazy(() => import('@/components/tools/HTMLTableBuilder').then(m => ({ default: m.HTMLTableBuilder })));
const JSONFormatter = lazy(() => import('@/components/tools/JSONFormatter').then(m => ({ default: m.JSONFormatter })));
const LoremIpsumGenerator = lazy(() => import('@/components/tools/LoremIpsumGenerator').then(m => ({ default: m.LoremIpsumGenerator })));
const ContrastChecker = lazy(() => import('@/components/tools/ContrastChecker').then(m => ({ default: m.ContrastChecker })));
const RegexBuilderTester = lazy(() => import('@/components/tools/RegexBuilderTester').then(m => ({ default: m.RegexBuilderTester })));
const ImageCompressorOptimizer = lazy(() => import('@/components/tools/ImageCompressorOptimizer').then(m => ({ default: m.ImageCompressorOptimizer })));
const PdfFileConverter = lazy(() => import('@/components/tools/PdfFileConverter').then(m => ({ default: m.PdfFileConverter })));
const VisualTrim = lazy(() => import('@/components/tools/VisualTrim').then(m => ({ default: m.VisualTrim })));
const HtmlToMarkdownConverter = lazy(() => import('@/components/tools/HtmlToMarkdownConverter').then(m => ({ default: m.HtmlToMarkdownConverter })));
const BulkFileRenamer = lazy(() => import('@/components/tools/BulkFileRenamer').then(m => ({ default: m.BulkFileRenamer })));
const CsvEditorAnalyzer = lazy(() => import('@/components/tools/CsvEditorAnalyzer').then(m => ({ default: m.CsvEditorAnalyzer })));
const CodeDiffMergeTool = lazy(() => import('@/components/tools/CodeDiffMergeTool').then(m => ({ default: m.CodeDiffMergeTool })));
const ApiRequestPlayground = lazy(() => import('@/components/tools/ApiRequestPlayground').then(m => ({ default: m.ApiRequestPlayground })));
const CSSAnimationGenerator = lazy(() => import('@/components/tools/CSSAnimationGenerator').then(m => ({ default: m.CSSAnimationGenerator })));
const FaviconGenerator = lazy(() => import('@/components/tools/FaviconGenerator').then(m => ({ default: m.FaviconGenerator })));
const FontPreview = lazy(() => import('@/components/tools/FontPreview').then(m => ({ default: m.FontPreview })));
const ResponsiveLayoutBuilder = lazy(() => import('@/components/tools/ResponsiveLayoutBuilder').then(m => ({ default: m.ResponsiveLayoutBuilder })));
const AccessibilityChecker = lazy(() => import('@/components/tools/AccessibilityChecker').then(m => ({ default: m.AccessibilityChecker })));
const VideoGifMakerTrimmer = lazy(() => import('@/components/tools/VideoGifMakerTrimmer').then(m => ({ default: m.VideoGifMakerTrimmer })));
const BulkWatermarkCreator = lazy(() => import('@/components/tools/BulkWatermarkCreator').then(m => ({ default: m.BulkWatermarkCreator })));
const AudioCutterConverter = lazy(() => import('@/components/tools/AudioCutterConverter').then(m => ({ default: m.AudioCutterConverter })));
const JsonYamlXmlDiffMergeTool = lazy(() => import('@/components/tools/JsonYamlXmlDiffMergeTool').then(m => ({ default: m.JsonYamlXmlDiffMergeTool })));
const FakeDataGenerator = lazy(() => import('@/components/tools/FakeDataGenerator').then(m => ({ default: m.FakeDataGenerator })));
const FakeCsvGenerator = lazy(() => import('@/components/tools/FakeCsvGenerator').then(m => ({ default: m.FakeCsvGenerator })));
const SocialPreviewImageGenerator = lazy(() => import('@/components/tools/SocialPreviewImageGenerator').then(m => ({ default: m.SocialPreviewImageGenerator })));
const HtmlEmailTemplateBuilder = lazy(() => import('@/components/tools/HtmlEmailTemplateBuilder').then(m => ({ default: m.HtmlEmailTemplateBuilder })));
const DomainAvailabilityNameGenerator = lazy(() => import('@/components/tools/DomainAvailabilityNameGenerator').then(m => ({ default: m.DomainAvailabilityNameGenerator })));
const AccessibilityContrastGuidedFixer = lazy(() => import('@/components/tools/AccessibilityContrastGuidedFixer').then(m => ({ default: m.AccessibilityContrastGuidedFixer })));
const IconFontGenerator = lazy(() => import('@/components/tools/IconFontGenerator').then(m => ({ default: m.IconFontGenerator })));

const WebsiteTechStackInspector = lazy(() => import('@/components/tools/WebsiteTechStackInspector').then(m => ({ default: m.WebsiteTechStackInspector })));
const ResponsiveEmailSignatureGenerator = lazy(() => import('@/components/tools/ResponsiveEmailSignatureGenerator').then(m => ({ default: m.ResponsiveEmailSignatureGenerator })));



interface BaseToolConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  component: React.LazyExoticComponent<React.ComponentType>;
  category?: string;
  tags?: string[];
}

export interface ToolConfig extends BaseToolConfig {
  createdAt: string;
  isNew?: boolean;
}

const baseTools: BaseToolConfig[] = [
  {
    id: "css-button",
    title: "CSS Button Generator",
    description: "Create custom button styles with live preview",
    icon: Palette,
    color: getToolColor(0),
    component: CSSButtonGenerator,
    category: "CSS Tools",
  },
  {
    id: "markdown-preview",
    title: "Markdown Preview Generator",
    description: "Write Markdown and see instant HTML preview",
    icon: FileText,
    color: getToolColor(1),
    component: MarkdownPreview,
    category: "Development Tools",
  },
  {
    id: "qr-generator",
    title: "QR Code Generator",
    description: "Generate QR codes from any text or URL",
    icon: QrCode,
    color: getToolColor(2),
    component: QRCodeGenerator,
    category: "Design Tools",
  },
  {
    id: "pulse-animation",
    title: "Pulse Animation Generator",
    description: "Create smooth CSS pulse animations",
    icon: Activity,
    color: getToolColor(3),
    component: PulseAnimationDemo,
    category: "CSS Tools",
  },
  {
    id: "color-palette",
    title: "Color Palette Generator",
    description: "Generate harmonious palettes with WCAG analysis",
    icon: Palette,
    color: getToolColor(4),
    component: ColorPaletteGenerator,
    category: "Design Tools",
  },
  {
    id: "svg-customizer",
    title: "SVG Icon Generator",
    description: "Customize SVG icons with color, size, and stroke controls",
    icon: Palette,
    color: getToolColor(5),
    component: SVGIconCustomizer,
    category: "Design Tools",
  },
  {
    id: "text-shadow",
    title: "Text Shadow Generator",
    description: "Create stunning text shadows with precise control over color, angle, blur, and distance",
    icon: Palette,
    color: getToolColor(6),
    component: TextShadowGenerator,
    category: "CSS Tools",
  },
  {
    id: "css-gradient",
    title: "CSS Gradient Generator",
    description: "Create beautiful linear and radial gradients with multiple color stops and precise control",
    icon: Palette,
    color: getToolColor(7),
    component: CSSGradientMaker,
    category: "CSS Tools",
  },
  {
    id: "password-generator",
    title: "Password Generator",
    description: "Generate secure passwords with custom length and character options, and test strength",
    icon: Key,
    color: getToolColor(8),
    component: PasswordGenerator,
    category: "Development Tools",
  },
  {
    id: "html-table-builder",
    title: "HTML Table Builder",
    description: "Build tables with easy controls and export HTML code",
    icon: TableIcon,
    color: getToolColor(9),
    component: HTMLTableBuilder,
    category: "Development Tools",
  },
  {
    id: "json-formatter",
    title: "JSON Formatter & Validator",
    description: "Beautify, validate, and visualize JSON with tree view",
    icon: Code,
    color: getToolColor(10),
    component: JSONFormatter,
    category: "Development Tools",
  },
  {
    id: "lorem-ipsum-generator",
    title: "Lorem Ipsum Content Generator",
    description: "Generate placeholder text for design and development",
    icon: Type,
    color: getToolColor(11),
    component: LoremIpsumGenerator,
    category: "Design Tools",
  },
  {
    id: "contrast-checker",
    title: "Contrast Checker",
    description: "Check color contrast for accessibility compliance",
    icon: Eye,
    color: getToolColor(12),
    component: ContrastChecker,
    category: "Design Tools",
  },
  {
    id: "regex-builder-tester",
    title: "Regular Expression Builder & Tester",
    description: "Visually build and test regex patterns with instant feedback",
    icon: Code,
    color: getToolColor(13),
    component: RegexBuilderTester,
    category: "Development Tools",
  },
  {
    id: "image-compressor-optimizer",
    title: "Image Compressor & Optimizer",
    description: "Compress and optimize images with drag-and-drop and adjustable quality",
    icon: ImageIcon,
    color: getToolColor(14),
    component: ImageCompressorOptimizer,
    category: "Design Tools",
  },
  {
    id: "code-diff-merge",
    title: "Code Diff & Merge Tool",
    description: "Compare, merge, and download code snippets with syntax highlighting",
    icon: Code,
    color: getToolColor(15),
    component: CodeDiffMergeTool,
    category: "Development Tools",
  },
  {
    id: "api-playground",
    title: "API Request & Response Playground",
    description: "Build, send, and test HTTP requests with instant response preview.",
    icon: Play,
    color: getToolColor(16),
    component: ApiRequestPlayground,
    category: "Development Tools",
  },
  {
    id: "css-animation-generator",
    title: "CSS Animation Generator",
    description: "Build custom keyframe animations with live preview, presets, and CSS export.",
    icon: Wand2,
    color: getToolColor(17),
    component: CSSAnimationGenerator,
    category: "CSS Tools",
  },
  {
    id: "favicon-generator",
    title: "Favicon Generator",
    description: "Create custom favicons from images or text with various sizes and backgrounds.",
    icon: ImageIcon,
    color: getToolColor(18),
    component: FaviconGenerator,
    category: "Design Tools",
  },
  {
    id: "font-preview",
    title: "Font Preview",
    description: "Preview Google Fonts with customizable properties, compare fonts, and generate CSS code with accessibility checks.",
    icon: Type,
    color: getToolColor(19),
    component: FontPreview,
    category: "Design Tools",
  },
  {
    id: "responsive-layout-builder",
    title: "Responsive Layout Builder",
    description: "Build responsive layouts with CSS Grid and Flexbox. Preview on different devices.",
    icon: Monitor,
    color: getToolColor(20),
    component: ResponsiveLayoutBuilder,
    category: "CSS Tools",
  },
  {
    id: "accessibility-checker",
    title: "Accessibility Checker",
    description: "Check HTML code or live websites for accessibility issues like contrast, alt text, and structure.",
    icon: Eye,
    color: getToolColor(21),
    component: AccessibilityChecker,
    category: "Development Tools",
  },
  {
    id: "pdf-file-converter",
    title: "PDF File Converter",
    description: "Convert PDFs to DOCX, XLSX, PPTX, TXT, HTML, or images — all locally with no API costs.",
    icon: FileText,
    color: getToolColor(22),
    component: PdfFileConverter,
    category: "Conversion Tools",
  },
  {
    id: "visualtrim",
    title: "VisualTrim – Smart Compressor",
    description: "Compress images and remove backgrounds instantly with on-device AI processing.",
    icon: Scissors,
    color: getToolColor(23),
    component: VisualTrim,
    category: "Design Tools",
  },
  {
    id: "html-to-markdown",
    title: "HTML to Markdown Converter",
    description: "Paste HTML and instantly convert to clean Markdown with live preview.",
    icon: Code,
    color: getToolColor(24),
    component: HtmlToMarkdownConverter,
    category: "Conversion Tools",
  },
  {
    id: "bulk-file-renamer",
    title: "Bulk File Renamer",
    description: "Batch rename files with prefixes, suffixes, sequencing, and exportable logs.",
    icon: Files,
    color: getToolColor(25),
    component: BulkFileRenamer,
    category: "Development Tools",
  },
  {
    id: "csv-editor-analyzer",
    title: "Online CSV Editor & Analyzer",
    description: "Edit, filter, sort, chart, and export CSV datasets entirely in your browser.",
    icon: TableIcon,
    color: getToolColor(26),
    component: CsvEditorAnalyzer,
    category: "Conversion Tools",
  },
  {
    id: "fake-csv-generator",
    title: "Fake CSV Generator",
    description: "Define columns, pick data types, and generate thousands of rows of realistic mock CSV data.",
    icon: TableIcon,
    color: getToolColor(37),
    component: FakeCsvGenerator,
    category: "Conversion Tools",
  },
  {
    id: "video-gif-maker-trimmer",
    title: "Video GIF Maker & Trimmer",
    description: "Upload a video, select trim/crop area, and convert to animated GIF in-browser with text overlay options and frame rate adjustment.",
    icon: Video,
    color: getToolColor(27),
    component: VideoGifMakerTrimmer,
    category: "Conversion Tools",
  },
  {
    id: "bulk-watermark-creator",
    title: "Bulk Watermark Creator",
    description: "Upload multiple images and a text or logo watermark with controls for size, position, opacity, font, and rotation.",
    icon: Stamp,
    color: getToolColor(28),
    component: BulkWatermarkCreator,
    category: "Design Tools",
  },
  {
    id: "audio-cutter-converter",
    title: "Audio Cutter & Converter",
    description: "Upload audio files, visually select start/end, convert between common formats with waveform display.",
    icon: Music,
    color: getToolColor(29),
    component: AudioCutterConverter,
    category: "Conversion Tools",
  },
  {
    id: "json-yaml-xml-diff-merge",
    title: "JSON/YAML/XML Diff & Merge Tool",
    description: "Paste/upload two files, view differences with syntax highlighting, merge or resolve, and download.",
    icon: GitBranch,
    color: getToolColor(30),
    component: JsonYamlXmlDiffMergeTool,
    category: "Development Tools",
  },
  {
    id: "fake-data-generator",
    title: "Fake Data Generator (Mock Data)",
    description: "Generate lists of mock data: names, emails, numbers, dates, addresses. Output as CSV, JSON, SQL, or Table.",
    icon: Database,
    color: getToolColor(31),
    component: FakeDataGenerator,
    category: "Development Tools",
  },
  {
    id: "social-preview-image-generator",
    title: "Social Preview Image Generator",
    description: "Input website, logo, or text for instant Facebook/Twitter preview images with aspect ratio export.",
    icon: Share,
    color: getToolColor(32),
    component: SocialPreviewImageGenerator,
    category: "Design Tools",
  },
  {
    id: "html-email-template-builder",
    title: "HTML Email Template Builder",
    description: "Drag-drop content blocks, live preview (desktop/mobile), and clean HTML code export.",
    icon: Mail,
    color: getToolColor(33),
    component: HtmlEmailTemplateBuilder,
    category: "Design Tools",
  },
  {
    id: "responsive-email-signature-generator",
    title: "Responsive Email Signature Generator",
    description: "Design adaptive email signatures with branding, social buttons, disclaimers, and exportable HTML.",
    icon: Mail,
    color: getToolColor(34),
    component: ResponsiveEmailSignatureGenerator,
    category: "Design Tools",
  },
  {
    id: "domain-availability-name-generator",
    title: "Brand Name & Palette Generator",
    description: "Enter keywords to generate memorable brand names with accessible color pairings ready for identity design.",
    icon: Globe,
    color: getToolColor(34),
    component: DomainAvailabilityNameGenerator,
    category: "Design Tools",
  },
  {
    id: "accessibility-contrast-guided-fixer",
    title: "Accessibility Contrast Guided Fixer",
    description: "Paste/upload palette, get WCAG contrast checks, pass/fail feedback, and color alternatives with downloadable report.",
    icon: CheckCircle,
    color: getToolColor(35),
    component: AccessibilityContrastGuidedFixer,
    category: "CSS Tools",
  },
  {
    id: "icon-font-generator",
    title: "Icon Font Generator",
    description: "Upload SVGs, bundle as webfont, auto generate CSS/demo, and export with preview and customizable classes.",
    icon: Type,
    color: getToolColor(36),
    component: IconFontGenerator,
    category: "Design Tools",
  },
  {
    id: "website-tech-stack-inspector",
    title: "Website Tech Stack Inspector",
    description: "Analyze a website's technology stack including frameworks, CMS, servers, and analytics tools.",
    icon: Monitor,
    color: getToolColor(37),
    component: WebsiteTechStackInspector,
    category: "Development Tools",
  },

];

const NEW_TOOL_COUNT = 7;
const NEW_TOOL_THRESHOLD = Math.max(0, baseTools.length - NEW_TOOL_COUNT);

export const tools: ToolConfig[] = baseTools.map((tool, index) => {
  const createdAt = generateCreatedAt(index);
  const isNew = index >= NEW_TOOL_THRESHOLD;

  return {
    ...tool,
    createdAt,
    ...(isNew ? { isNew: true } : {}),
  };
});

export const toolComponents = {
  'css-button': CSSButtonGenerator,
  'markdown-preview': MarkdownPreview,
  'qr-generator': QRCodeGenerator,
  'pulse-animation': PulseAnimationDemo,
  'color-palette': ColorPaletteGenerator,
  'svg-customizer': SVGIconCustomizer,
  'text-shadow': TextShadowGenerator,
  'css-gradient': CSSGradientMaker,
  'password-generator': PasswordGenerator,
  'html-table-builder': HTMLTableBuilder,
  'json-formatter': JSONFormatter,
  'lorem-ipsum-generator': LoremIpsumGenerator,
  'contrast-checker': ContrastChecker,
  'regex-builder-tester': RegexBuilderTester,
  'image-compressor-optimizer': ImageCompressorOptimizer,
  'code-diff-merge': CodeDiffMergeTool,
  'api-playground': ApiRequestPlayground,
  'css-animation-generator': CSSAnimationGenerator,
  'favicon-generator': FaviconGenerator,
  'font-preview': FontPreview,
  'responsive-layout-builder': ResponsiveLayoutBuilder,
  'accessibility-checker': AccessibilityChecker,
  'pdf-file-converter': PdfFileConverter,
  'visualtrim': VisualTrim,
  'html-to-markdown': HtmlToMarkdownConverter,
  'bulk-file-renamer': BulkFileRenamer,
  'csv-editor-analyzer': CsvEditorAnalyzer,
  'video-gif-maker-trimmer': VideoGifMakerTrimmer,
  'bulk-watermark-creator': BulkWatermarkCreator,
  'audio-cutter-converter': AudioCutterConverter,
  'json-yaml-xml-diff-merge': JsonYamlXmlDiffMergeTool,
  'fake-data-generator': FakeDataGenerator,
  'fake-csv-generator': FakeCsvGenerator,
  'social-preview-image-generator': SocialPreviewImageGenerator,
  'html-email-template-builder': HtmlEmailTemplateBuilder,
  'responsive-email-signature-generator': ResponsiveEmailSignatureGenerator,
  'domain-availability-name-generator': DomainAvailabilityNameGenerator,
  'accessibility-contrast-guided-fixer': AccessibilityContrastGuidedFixer,
  'icon-font-generator': IconFontGenerator,
  'website-tech-stack-inspector': WebsiteTechStackInspector,

} as const;
