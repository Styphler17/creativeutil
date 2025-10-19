import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Clipboard, FileUp, RefreshCcw } from "lucide-react";
import TurndownService from "turndown";
import { saveAs } from "file-saver";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

export const HtmlToMarkdownConverter = () => {
  const [htmlInput, setHtmlInput] = useState<string>("");
  const [markdown, setMarkdown] = useState<string>("");
  const [error, setError] = useState<string>("");

  const hasInput = htmlInput.trim().length > 0;

  const convert = () => {
    setError("");
    try {
      const result = turndown.turndown(htmlInput || "<div></div>");
      setMarkdown(result.trim());
    } catch (err) {
      console.error(err);
      setError("Conversion failed. Ensure your HTML is well-formed.");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".html") && !file.name.toLowerCase().endsWith(".htm")) {
      setError("Please upload an .html file.");
      return;
    }
    try {
      const content = await file.text();
      setHtmlInput(content);
      setMarkdown("");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to read the HTML file.");
    }
  };

  const copyMarkdown = async () => {
    if (!markdown.trim()) return;
    await navigator.clipboard.writeText(markdown);
  };

  const downloadMarkdown = () => {
    if (!markdown.trim()) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    saveAs(blob, "creativeutil-converted.md");
  };

  const previewHtml = useMemo(() => {
    try {
      return { __html: htmlInput };
    } catch {
      return { __html: "" };
    }
  }, [htmlInput]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">HTML Input</h2>
              <p className="text-sm text-muted-foreground">Paste HTML or upload an .html file — conversion happens entirely in the browser.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <label className="cursor-pointer flex items-center gap-2">
                  <FileUp className="w-4 h-4" />
                  Upload HTML
                  <input type="file" accept=".html,.htm,text/html" hidden onChange={handleFileUpload} />
                </label>
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setHtmlInput(""); setMarkdown(""); setError(""); }}>
                <RefreshCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="html-input">HTML</Label>
            <Textarea
              id="html-input"
              placeholder="<section>\n  <h1>Hello CreativeUtil</h1>\n</section>"
              value={htmlInput}
              onChange={(event) => setHtmlInput(event.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
          </div>
          <Button onClick={convert} disabled={!hasInput}>
            Convert to Markdown
          </Button>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6 space-y-3">
            <h3 className="text-lg font-semibold">Markdown Output</h3>
            <Textarea value={markdown} readOnly rows={12} placeholder="Converted Markdown will appear here." className="font-mono text-sm" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyMarkdown} disabled={!markdown.trim()} className="flex items-center gap-2">
                <Clipboard className="w-4 h-4" />
                Copy Markdown
              </Button>
              <Button onClick={downloadMarkdown} disabled={!markdown.trim()} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download .md
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <h3 className="text-lg font-semibold">Live HTML Preview</h3>
            <div className="rounded-lg border bg-muted/40 p-4 text-sm prose prose-sm max-w-none dark:prose-invert min-h-[220px]" dangerouslySetInnerHTML={previewHtml} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HtmlToMarkdownConverter;
