import { useState, useRef, useEffect, useCallback, useMemo, type CSSProperties } from "react";
import type { DragEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Copy,
  Check,
  Download,
  Image,
  Link2Off,
  Settings,
  Save,
  FolderOpen,
  Sun,
  Moon,
  FileText,
  Eye,
  AlertCircle,
  Accessibility,
  Hash,
  Type,
  Clock,
  Keyboard as KeyboardIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { marked } from "marked";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import html2canvas from "html2canvas";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import "highlight.js/styles/github-dark.css";
import "./markdown-preview.css";

type MarkdownTemplate = { name: string; content: string };
type MarkdownDraft = { id: string; name: string; content: string; createdAt: string };
type PreviewMode = "plain" | "github" | "notion";
type FontSize = "small" | "medium" | "large" | "xl";
type AutocompleteToken = "image" | "link" | "code" | "bold" | "italic";
type AutocompleteState = {
  show: boolean;
  items: AutocompleteToken[];
  position: { top: number; left: number };
};
type PanelGridStyle = CSSProperties & { "--editor"?: string; "--preview"?: string };

const AUTOCOMPLETE_ITEMS: AutocompleteToken[] = ["image", "link", "code", "bold", "italic"];

const PREVIEW_MODE_LABELS: Record<PreviewMode, string> = {
  plain: "Plain",
  github: "GitHub",
  notion: "Notion",
};

const FONT_SIZE_MAP: Record<FontSize, string> = {
  small: "0.875rem",
  medium: "1rem",
  large: "1.125rem",
  xl: "1.25rem",
};

const SHORTCUTS: Array<{ combo: string; description: string }> = [
  { combo: "Ctrl + B", description: "Bold" },
  { combo: "Ctrl + I", description: "Italic" },
  { combo: "Ctrl + K", description: "Insert link" },
  { combo: "Ctrl + S", description: "Save draft" },
  { combo: "!", description: "Autocomplete" },
  { combo: "Drag & Drop", description: "Add images" },
  { combo: "Export", description: "PDF / DOCX / JSON" },
  { combo: "Themes", description: "Light / Dark toggle" },
];

const defaultMarkdown = `# Welcome to Markdown Preview

This is a **live** markdown editor with instant preview.

## Features
- Real-time preview
- Code highlighting
- Lists and tables
- Links and images

### Code Example
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Lists
1. First item
2. Second item
3. Third item

- Bullet point
- Another point
  - Nested point

[Visit CreativeUtil](https://creativeutil.com)
`;

const templates: MarkdownTemplate[] = [
  {
    name: "Blog Post",
    content: `# My Blog Post

## Introduction

Welcome to my blog post about...

## Main Content

### Section 1
Content here...

### Section 2
More content...

## Conclusion

Thanks for reading!
`,
  },
  {
    name: "README",
    content: `# Project Name

A brief description of what this project does.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`javascript
import { example } from 'project';

example();
\`\`\`

## Contributing

Pull requests are welcome!

## License

MIT
`,
  },
  {
    name: "Meeting Notes",
    content: `# Meeting Notes - [Date]

## Attendees
- Person 1
- Person 2
- Person 3

## Agenda
1. Topic 1
2. Topic 2
3. Topic 3

## Discussion

### Topic 1
- Point 1
- Point 2

### Topic 2
- Point 1
- Point 2

## Action Items
- [ ] Task 1 - @Person1
- [ ] Task 2 - @Person2

## Next Meeting
[Date and time]
`,
  },
];
export const MarkdownPreview = () => {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [copied, setCopied] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [previewMode, setPreviewMode] = useState<PreviewMode>("plain");
  const [panelRatio, setPanelRatio] = useState(50);
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [customCSS, setCustomCSS] = useState("");
  const [drafts, setDrafts] = useLocalStorage<MarkdownDraft[]>("markdown-drafts", []);
  const [currentDraftName, setCurrentDraftName] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [brokenLinks, setBrokenLinks] = useState<string[]>([]);
  const [accessibilityIssues, setAccessibilityIssues] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [autocomplete, setAutocomplete] = useState<AutocompleteState>({
    show: false,
    items: AUTOCOMPLETE_ITEMS,
    position: { top: 0, left: 0 },
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const wordCount = useMemo(() => {
    if (!markdown.trim()) {
      return 0;
    }
    return markdown.trim().split(/\s+/).length;
  }, [markdown]);

  const lineCount = useMemo(() => markdown.split(/\r?\n/).length, [markdown]);
  const readingTime = Math.max(1, Math.round(wordCount / 200));
  const themeLabel = theme === "dark" ? "Dark" : "Light";

  const previewClass = useMemo(
    () =>
      cn(
        "prose max-w-none dark:prose-invert",
        `markdown-font-${fontSize}`,
        previewMode === "github" && "markdown-preview-github",
        previewMode === "notion" && "markdown-preview-notion",
        theme === "dark" && "dark",
      ),
    [fontSize, previewMode, theme],
  );

  const panelGridStyle = useMemo<PanelGridStyle>(
    () => ({
      "--editor": `minmax(0, ${panelRatio}%)`,
      "--preview": `minmax(0, ${100 - panelRatio}%)`,
    }),
    [panelRatio],
  );

  const closeAutocomplete = useCallback((): void => {
    setAutocomplete((prev) => ({ ...prev, show: false }));
  }, []);

  const checkLinks = useCallback(async (content: string): Promise<void> => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(content)) !== null) {
      const url = match[2];
      if (url.startsWith("http")) {
        links.push(url);
      }
    }

    if (links.length === 0) {
      setBrokenLinks([]);
      return;
    }

    const broken: string[] = [];

    await Promise.all(
      links.map(async (link) => {
        try {
          await fetch(link, { method: "HEAD", mode: "no-cors" });
        } catch {
          broken.push(link);
        }
      }),
    );

    setBrokenLinks(broken);
  }, []);

  const checkAccessibility = useCallback((content: string): void => {
    const issues: string[] = [];
    const lines = content.split("\n");

    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let imageMatch: RegExpExecArray | null;
    while ((imageMatch = imageRegex.exec(content)) !== null) {
      if (!imageMatch[1].trim()) {
        issues.push(`Image without alt text: ${imageMatch[2]}`);
      }
    }

    let lastHeadingLevel = 0;
    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        if (level > lastHeadingLevel + 1) {
          issues.push(`Skipped heading level: ${line.trim()}`);
        }
        lastHeadingLevel = level;
      }
    }

    setAccessibilityIssues(issues);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void checkLinks(markdown);
      checkAccessibility(markdown);
    }, 800);

    return () => window.clearTimeout(timer);
  }, [markdown, checkLinks, checkAccessibility]);

  const copyHTML = useCallback(async (): Promise<void> => {
    if (!previewRef.current) {
      return;
    }

    await navigator.clipboard.writeText(previewRef.current.innerHTML);
    setCopied(true);
    toast({
      title: "HTML copied",
      description: "The rendered HTML has been copied to your clipboard.",
    });

    window.setTimeout(() => setCopied(false), 2000);
  }, [toast]);

  const exportPDF = useCallback(async (): Promise<void> => {
    if (!previewRef.current) {
      return;
    }

    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, allowTaint: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("markdown-preview.pdf");
      toast({
        title: "PDF exported",
        description: "Your markdown has been exported as a PDF.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "We couldn't export the PDF. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const exportDocx = useCallback(async (): Promise<void> => {
    try {
      const parsed = await marked.parse(markdown);
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [new TextRun(parsed.replace(/<[^>]*>/g, ""))],
              }),
            ],
          },
        ],
      });

      const docxBlob = await Packer.toBlob(doc);
      saveAs(docxBlob, "markdown-preview.docx");

      toast({
        title: "DOCX exported",
        description: "Your markdown has been exported as a DOCX file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "We couldn't export the DOCX. Please try again.",
        variant: "destructive",
      });
    }
  }, [markdown, toast]);

  const exportJSON = useCallback((): void => {
    try {
      const tokens = marked.lexer(markdown, { gfm: true });
      const blob = new Blob([JSON.stringify(tokens, null, 2)], { type: "application/json" });
      saveAs(blob, "markdown-ast.json");

      toast({
        title: "JSON exported",
        description: "The Markdown tokens have been exported as JSON.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "We couldn't export the JSON. Please try again.",
        variant: "destructive",
      });
    }
  }, [markdown, toast]);

  const saveDraft = useCallback((): void => {
    const name = currentDraftName.trim();
    if (!name) {
      toast({
        title: "Draft name required",
        description: "Please provide a name before saving your draft.",
        variant: "destructive",
      });
      return;
    }

    const newDraft: MarkdownDraft = {
      id: Date.now().toString(),
      name,
      content: markdown,
      createdAt: new Date().toISOString(),
    };

    setDrafts([...drafts, newDraft]);
    setCurrentDraftName("");
    toast({
      title: "Draft saved",
      description: `Draft "${name}" has been saved.`,
    });
  }, [currentDraftName, markdown, drafts, setDrafts, toast]);

  const loadDraft = useCallback(
    (draft: MarkdownDraft): void => {
      setMarkdown(draft.content);
      setIsDraftsOpen(false);
      toast({
        title: "Draft loaded",
        description: `Draft "${draft.name}" has been loaded.`,
      });
    },
    [toast],
  );

  const deleteDraft = useCallback(
    (draftId: string): void => {
      const draftToDelete = drafts.find((draft) => draft.id === draftId);
      setDrafts(drafts.filter((draft) => draft.id !== draftId));
      toast({
        title: "Draft deleted",
        description: draftToDelete ? `Draft "${draftToDelete.name}" has been removed.` : "Draft has been removed.",
      });
    },
    [drafts, setDrafts, toast],
  );

  const loadTemplate = useCallback(
    (template: MarkdownTemplate): void => {
      setMarkdown(template.content);
      toast({
        title: "Template loaded",
        description: `Template "${template.name}" has been applied.`,
      });
    },
    [toast],
  );

  const insertFormatting = (before: string, after: string): void => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;
    const selectedText = currentValue.substring(start, end);
    const newValue =
      currentValue.substring(0, start) + before + selectedText + after + currentValue.substring(end);

    setMarkdown(newValue);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    });
  };

  const insertAutocomplete = (item: AutocompleteToken): void => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const cursorPos = textarea.selectionStart;
    const currentValue = textarea.value;
    let insertText = "";

    switch (item) {
      case "image":
        insertText = "![alt text](image-url)";
        break;
      case "link":
        insertText = "[link text](url)";
        break;
      case "code":
        insertText = "```\ncode here\n```";
        break;
      case "bold":
        insertText = "**bold text**";
        break;
      case "italic":
        insertText = "*italic text*";
        break;
    }

    const nextValue = currentValue.slice(0, cursorPos) + insertText + currentValue.slice(cursorPos);
    setMarkdown(nextValue);
    closeAutocomplete();

    window.requestAnimationFrame(() => {
      textarea.focus();
      const focusPosition = cursorPos + insertText.length;
      textarea.setSelectionRange(focusPosition, focusPosition);
    });
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      return;
    }

    const snippets = imageFiles.map((file) => {
      const url = URL.createObjectURL(file);
      const alt = file.name.replace(/\.[^/.]+$/, "");
      return `![${alt}](${url})`;
    });

    setMarkdown((prev) => `${prev.trimEnd()}\n\n${snippets.join("\n")}\n`);

    toast({
      title: "Images added",
      description: `${imageFiles.length} image${imageFiles.length > 1 ? "s" : ""} added to your markdown.`,
    });
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case "b":
          event.preventDefault();
          insertFormatting("**", "**");
          return;
        case "i":
          event.preventDefault();
          insertFormatting("*", "*");
          return;
        case "k":
          event.preventDefault();
          insertFormatting("[", "](url)");
          return;
        case "s":
          event.preventDefault();
          saveDraft();
          return;
      }
    }

    if (event.key === "!") {
      event.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      const rect = textarea.getBoundingClientRect();
      const computed = window.getComputedStyle(textarea);
      const lineHeight = parseFloat(computed.lineHeight || "20");
      const fontSize = parseFloat(computed.fontSize || "14");
      const paddingTop = parseFloat(computed.paddingTop || "0");
      const paddingLeft = parseFloat(computed.paddingLeft || "0");
      const cursorPos = textarea.selectionStart;
      const textUntilCursor = textarea.value.slice(0, cursorPos);
      const lines = textUntilCursor.split("\n");
      const rowIndex = lines.length - 1;
      const columnIndex = lines[rowIndex]?.length ?? 0;

      const top = rect.top + paddingTop + rowIndex * lineHeight - textarea.scrollTop + lineHeight;
      const left = rect.left + paddingLeft + columnIndex * (fontSize * 0.62);

      setAutocomplete({
        show: true,
        items: AUTOCOMPLETE_ITEMS,
        position: { top, left },
      });
    } else if (autocomplete.show && event.key === "Escape") {
      event.preventDefault();
      closeAutocomplete();
    }
  };

  const hasBrokenLinks = brokenLinks.length > 0;
  const hasAccessibilityIssues = accessibilityIssues.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl md:text-3xl">Enhanced Markdown Preview</CardTitle>
            <CardDescription>
              Advanced markdown editor with live preview, exports, and accessibility helpers.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={previewMode} onValueChange={(value) => setPreviewMode(value as PreviewMode)}>
              <SelectTrigger className="w-32">
                <Eye className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Preview mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plain">Plain</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="notion">Notion</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="border border-border/50"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open editor settings">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full space-y-6 sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Editor preferences</SheetTitle>
                  <SheetDescription>
                    Tune the writing experience, panel layout, templates, and custom styling.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                  <section className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Font size
                    </Label>
                    <Select value={fontSize} onValueChange={(value) => setFontSize(value as FontSize)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="xl">Extra large</SelectItem>
                      </SelectContent>
                    </Select>
                  </section>

                  <section className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Panel ratio ({panelRatio}% editor)
                    </Label>
                    <Slider
                      value={[panelRatio]}
                      onValueChange={(value) => setPanelRatio(value[0] ?? panelRatio)}
                      min={20}
                      max={80}
                      step={5}
                    />
                  </section>

                  <section className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Templates
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Load a starter layout to jump into writing faster.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      {templates.map((template) => (
                        <Button
                          key={template.name}
                          variant="ghost"
                          className="justify-start gap-2"
                          onClick={() => {
                            loadTemplate(template);
                            setIsSettingsOpen(false);
                          }}
                        >
                          <FileText className="h-4 w-4" />
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Custom CSS
                    </Label>
                    <Textarea
                      value={customCSS}
                      onChange={(event) => setCustomCSS(event.target.value)}
                      placeholder="Enter CSS overrides for the preview…"
                      className="h-32"
                    />
                    <p className="text-xs text-muted-foreground">
                      Styles are scoped to the preview on save and export.
                    </p>
                  </section>
                </div>
              </SheetContent>
            </Sheet>

            <Dialog open={isDraftsOpen} onOpenChange={setIsDraftsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Drafts ({drafts.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl space-y-6">
                <DialogHeader>
                  <DialogTitle>Manage drafts</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      placeholder="Draft name"
                      value={currentDraftName}
                      onChange={(event) => setCurrentDraftName(event.target.value)}
                      className="sm:max-w-xs"
                    />
                    <Button type="button" onClick={saveDraft} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save draft
                    </Button>
                  </div>

                  <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                    {drafts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        You haven't saved any drafts yet. Use the field above or press
                        <span className="font-semibold"> Ctrl + S</span>.
                      </p>
                    ) : (
                      drafts.map((draft) => (
                        <div
                          key={draft.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
                        >
                          <div>
                            <p className="font-medium text-foreground">{draft.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(draft.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="secondary" onClick={() => loadDraft(draft)}>
                              Load
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteDraft(draft.id)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="flex flex-wrap items-center gap-2 pt-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Export</span>
          <Button variant="outline" size="sm" onClick={exportPDF} className="gap-2">
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={exportDocx} className="gap-2">
            <Download className="h-4 w-4" />
            DOCX
          </Button>
          <Button variant="outline" size="sm" onClick={exportJSON} className="gap-2">
            <FileText className="h-4 w-4" />
            JSON
          </Button>
          <Button variant="outline" size="sm" onClick={copyHTML} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy HTML"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:[grid-template-columns:var(--editor)_var(--preview)]" style={panelGridStyle}>
        <Card className="h-full">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-xl">Markdown</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1 px-2.5 py-1 text-xs">
                  <Type className="h-3 w-3" />
                  {wordCount} words
                </Badge>
                <Badge variant="outline" className="gap-1 px-2.5 py-1 text-xs">
                  <Hash className="h-3 w-3" />
                  {lineCount} lines
                </Badge>
                <Badge variant="outline" className="gap-1 px-2.5 py-1 text-xs">
                  <Clock className="h-3 w-3" />
                  ~{readingTime} min
                </Badge>
              </div>
            </div>
            <CardDescription>
              Write markdown with live formatting, drag-and-drop image support, and keyboard shortcuts.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
              <Textarea
                ref={textareaRef}
                value={markdown}
                onChange={(event) => setMarkdown(event.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={closeAutocomplete}
                placeholder="Start typing your markdown… Press ! for autocomplete or drop images directly."
                className="min-h-[540px] resize-none font-mono leading-6 shadow-sm"
                style={{ fontSize: FONT_SIZE_MAP[fontSize] }}
              />

              {isDragging && (
                <div className="pointer-events-none absolute inset-0 z-10 rounded-lg border-2 border-dashed border-primary/50 bg-primary/10 backdrop-blur-sm">
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-primary">
                    <Image className="h-10 w-10" />
                    <p className="text-sm font-medium">Drop images to embed them instantly</p>
                  </div>
                </div>
              )}

              {autocomplete.show && (
                <div
                  className="fixed z-50 min-w-[200px] rounded-lg border border-border bg-popover/95 p-2 text-sm shadow-xl backdrop-blur"
                  style={{ top: autocomplete.position.top, left: autocomplete.position.left }}
                >
                  {autocomplete.items.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="flex w-full items-center justify-between gap-4 rounded-md px-3 py-2 text-left text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      onClick={() => insertAutocomplete(item)}
                    >
                      <span className="font-medium capitalize text-foreground">{item}</span>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">Snippet</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-xl">Preview</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1 px-2.5 py-1 text-xs">
                  <Eye className="h-3 w-3" />
                  {PREVIEW_MODE_LABELS[previewMode]}
                </Badge>
                <Badge variant="outline" className="gap-1 px-2.5 py-1 text-xs">
                  {theme === "dark" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                  {themeLabel}
                </Badge>
              </div>
            </div>
            <CardDescription>
              Rendered markdown with syntax highlighting. Custom CSS applies instantly.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Status</span>
              {!hasBrokenLinks && !hasAccessibilityIssues && (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                >
                  <Check className="h-3 w-3" />
                  Ready
                </Badge>
              )}
              {hasBrokenLinks && (
                <Badge
                  variant="outline"
                  className="gap-1 border-orange-200 text-orange-600 dark:border-orange-500/60 dark:text-orange-300"
                >
                  <Link2Off className="h-3 w-3" />
                  {brokenLinks.length} broken link{brokenLinks.length > 1 ? "s" : ""}
                </Badge>
              )}
              {hasAccessibilityIssues && (
                <Badge
                  variant="outline"
                  className="gap-1 border-red-200 text-red-600 dark:border-red-500/60 dark:text-red-300"
                >
                  <Accessibility className="h-3 w-3" />
                  {accessibilityIssues.length} issue{accessibilityIssues.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            <div
              ref={previewRef}
              id="markdown-preview"
              className={cn(
                "min-h-[540px] overflow-auto rounded-lg border border-border/60 bg-background/80 p-6 shadow-inner transition-colors",
                previewClass,
              )}
              style={{ fontSize: FONT_SIZE_MAP[fontSize] }}
            >
              <style>{customCSS}</style>
              <ReactMarkdown
                rehypePlugins={[rehypeHighlight]}
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children, ...props }) => (
                    <a
                      href={href}
                      {...props}
                      className={cn(
                        "font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-primary",
                        href && brokenLinks.includes(href) && "text-orange-600 underline decoration-orange-500",
                      )}
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>

      {hasAccessibilityIssues && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertCircle className="h-4 w-4" />
              Accessibility issues
            </CardTitle>
            <CardDescription className="text-destructive">
              Address these items to improve readability and compliance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-destructive">
              {accessibilityIssues.map((issue, index) => (
                <li key={`${issue}-${index}`} className="leading-relaxed">
                  {issue}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyboardIcon className="h-4 w-4" />
            Keyboard shortcuts & features
          </CardTitle>
          <CardDescription>Speed up editing with these handy commands.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
          {SHORTCUTS.map((item) => (
            <div key={item.combo}>
              <p className="font-semibold text-foreground">{item.combo}</p>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
