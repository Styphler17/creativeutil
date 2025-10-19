import React, { useMemo, useState } from "react";

import { ArrowLeftRight, Copy, Download, Loader2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FileFormat = "json" | "yaml" | "xml";

interface DiffResult {
  summary: string;
  lines: string[];
}

const editorPlaceholder = (format: FileFormat, side: "left" | "right") => {
  switch (format) {
    case "json":
      return `{ "example${side === "left" ? "Left" : "Right"}": true }`;
    case "yaml":
      return `example${side === "left" ? "Left" : "Right"}: true`;
    case "xml":
    default:
      return `<example${side === "left" ? "Left" : "Right"}>true</example${side === "left" ? "Left" : "Right"}>`;
  }
};

export const JsonYamlXmlDiffMergeTool: React.FC = () => {
  const { toast } = useToast();

  const [leftContent, setLeftContent] = useState("");
  const [rightContent, setRightContent] = useState("");
  const [format, setFormat] = useState<FileFormat>("json");
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [mergedOutput, setMergedOutput] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  const leftLines = useMemo(() => leftContent.split("\n").length, [leftContent]);
  const rightLines = useMemo(() => rightContent.split("\n").length, [rightContent]);

  const handleCompare = () => {
    if (!leftContent.trim() || !rightContent.trim()) {
      toast({
        title: "Provide both files",
        description: "Paste or upload content into both editors before comparing.",
        variant: "destructive",
      });
      return;
    }

    setIsComparing(true);

    setTimeout(() => {
      setDiffResult({
        summary: "Diff preview is coming soon.",
        lines: ["Differences will be shown here once full diff logic is implemented."],
      });
      setIsComparing(false);
    }, 400);
  };

  const handleMerge = () => {
    if (!leftContent.trim() || !rightContent.trim()) {
      toast({
        title: "Provide both files",
        description: "Paste or upload content into both editors before merging.",
        variant: "destructive",
      });
      return;
    }

    setIsMerging(true);

    setTimeout(() => {
      setMergedOutput(
        `--- ${format.toUpperCase()} merge preview ---\n\nLeft version:\n${leftContent}\n\nRight version:\n${rightContent}\n\n(Merge logic coming soon.)`,
      );
      setIsMerging(false);
    }, 400);
  };

  const handleCopy = async (target: "left" | "right" | "merged") => {
    const content = target === "left" ? leftContent : target === "right" ? rightContent : mergedOutput;
    if (!content) return;

    await navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: target === "merged" ? "Merged preview copied." : `Copied ${target} file.`,
    });
  };

  const handleDownload = (target: "left" | "right" | "merged") => {
    const content = target === "left" ? leftContent : target === "right" ? rightContent : mergedOutput;
    if (!content) return;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${target}-file.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-3xl text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">JSON / YAML / XML Diff & Merge</h1>
        <p className="text-lg text-muted-foreground">
          Inspect changes across structured files, preview differences, and prepare merge-ready content.
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>File format</CardTitle>
          <CardDescription>
            Select the file type you&apos;re comparing so the placeholder and actions stay relevant.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label className="text-sm font-semibold text-muted-foreground">Format</Label>
            <p className="text-xs text-muted-foreground">
              Switching formats clears the diff preview but preserves your content.
            </p>
          </div>
          <Select
            value={format}
            onValueChange={value => {
              setFormat(value as FileFormat);
              setDiffResult(null);
              setMergedOutput("");
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Choose format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="yaml">YAML</SelectItem>
              <SelectItem value="xml">XML</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {(["left", "right"] as const).map(side => (
          <Card key={side} className="glass">
            <CardHeader>
              <CardTitle>{side === "left" ? "Left file" : "Right file"}</CardTitle>
              <CardDescription>
                Paste or import your {format.toUpperCase()} content. {side === "left" ? "Baseline" : "Updated"} version.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{format.toUpperCase()} content</span>
                <span>{side === "left" ? leftLines : rightLines} lines</span>
              </div>
              <Textarea
                value={side === "left" ? leftContent : rightContent}
                onChange={event => (side === "left" ? setLeftContent(event.target.value) : setRightContent(event.target.value))}
                placeholder={`Paste ${format.toUpperCase()} here, e.g. ${editorPlaceholder(format, side)}`}
                className="min-h-[22rem] font-mono text-sm"
              />
            </CardContent>
            <CardFooter className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopy(side)}
                disabled={side === "left" ? !leftContent : !rightContent}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDownload(side)}
                disabled={side === "left" ? !leftContent : !rightContent}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Compare & merge</CardTitle>
          <CardDescription>
            Run a comparison to inspect differences, then generate a merge preview to refine manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button type="button" onClick={handleCompare} disabled={isComparing} className="flex items-center gap-2">
            {isComparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeftRight className="h-4 w-4" />}
            Compare files
          </Button>
          <Button type="button" variant="outline" onClick={handleMerge} disabled={isMerging} className="flex items-center gap-2">
            {isMerging ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Merge preview
          </Button>
        </CardContent>
        {(diffResult || mergedOutput) && (
          <CardFooter className="flex flex-col gap-4">
            {diffResult && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Diff summary {diffResult.summary ? `— ${diffResult.summary}` : ""}
                </h3>
                <pre className="rounded-lg border border-border bg-card/70 p-4 text-xs text-muted-foreground">
                  {diffResult.lines.join("\n")}
                </pre>
              </div>
            )}

            {mergedOutput && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground">Merge preview</h3>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => handleCopy("merged")}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleDownload("merged")}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
                <Textarea value={mergedOutput} readOnly className="min-h-[12rem] font-mono text-xs" />
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
};
