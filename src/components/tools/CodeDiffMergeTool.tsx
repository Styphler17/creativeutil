import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, Code, Upload, FileText } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "text", label: "Plain Text" },
] as const;

interface DiffLine {
  line: number;
  left: string;
  right: string;
  type: 'unchanged' | 'added' | 'removed' | 'changed';
}

export const CodeDiffMergeTool = () => {
  const [leftCode, setLeftCode] = useState(`const greet = (name) => {
  return "Hello, " + name;
};`);
  const [rightCode, setRightCode] = useState(`const greet = (name) => {
  return \`Hello, \${name}!\`;
};`);
  const [language, setLanguage] = useState("javascript");
  const [mergedCode, setMergedCode] = useState("");
  const [hunkChoices, setHunkChoices] = useState<{ [key: string]: "left" | "right" }>({});
  const { theme } = useTheme();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: "left" | "right") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (side === "left") setLeftCode(content);
        else setRightCode(content);
      };
      reader.readAsText(file);
    }
  };

  const generateDiff = () => {
    const leftLines = leftCode.split("\n");
    const rightLines = rightCode.split("\n");
    const maxLen = Math.max(leftLines.length, rightLines.length);
    const diffLines: DiffLine[] = [];
    for (let i = 0; i < maxLen; i++) {
      const left = leftLines[i] || "";
      const right = rightLines[i] || "";
      let type: 'unchanged' | 'added' | 'removed' | 'changed' = 'unchanged';
      if (left === "" && right !== "") type = 'added';
      else if (right === "" && left !== "") type = 'removed';
      else if (left !== right) type = 'changed';
      diffLines.push({ line: i + 1, left, right, type });
    }
    return diffLines;
  };

  const mergeCode = () => {
    const choice = hunkChoices["hunk1"] || "left";
    setMergedCode(choice === "left" ? leftCode : rightCode);
  };

  const downloadMerged = () => {
    const blob = new Blob([mergedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `merged.${language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateHunkChoice = (hunkId: string, choice: "left" | "right") => {
    setHunkChoices((prev) => ({ ...prev, [hunkId]: choice }));
  };

  return (
    <div className={`p-6 space-y-8 rounded-lg glass border ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Code Diff & Merge Tool</h2>
          <p className={`text-muted-foreground ${theme === 'dark' ? 'text-gray-300' : ''}`}>Compare, merge, and download code snippets with syntax highlighting.</p>
        </div>
      </div>

      {/* Input Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Code */}
        <Card className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Label className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>Left Code (Original)</Label>
              <Input type="file" onChange={(e) => handleFileUpload(e, "left")} accept=".js,.py,.html,.css,.json,.txt" className="hidden" id="left-upload" />
              <label htmlFor="left-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" className={`glass ${theme === 'dark' ? 'text-white' : ''}`}>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              </label>
            </div>
            <Textarea
              value={leftCode}
              onChange={(e) => setLeftCode(e.target.value)}
              placeholder="Paste your left code here..."
              className="min-h-[200px] font-mono text-sm glass"
              rows={10}
            />
          </CardContent>
        </Card>

        {/* Right Code */}
        <Card className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Label className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>Right Code (Modified)</Label>
              <Input type="file" onChange={(e) => handleFileUpload(e, "right")} accept=".js,.py,.html,.css,.json,.txt" className="hidden" id="right-upload" />
              <label htmlFor="right-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" className={`glass ${theme === 'dark' ? 'text-white' : ''}`}>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              </label>
            </div>
            <Textarea
              value={rightCode}
              onChange={(e) => setRightCode(e.target.value)}
              placeholder="Paste your right code here..."
              className="min-h-[200px] font-mono text-sm glass"
              rows={10}
            />
          </CardContent>
        </Card>
      </div>

      {/* Language Select */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Label className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>Language for Highlighting</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Diff Viewer */}
      {(leftCode || rightCode) && (
        <Card className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <CardContent className="p-4">
            <Label className={`font-medium mb-4 block ${theme === 'dark' ? 'text-white' : ''}`}>Side-by-Side Diff</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>Original</h4>
                <pre className={`p-4 rounded-lg font-mono text-sm overflow-auto max-h-96 ${theme === 'dark' ? 'bg-gray-800' : 'bg-muted'}`}>
                  {leftCode.split("\n").map((line, i) => (
                    <div key={i} className="whitespace-pre">{line}</div>
                  ))}
                </pre>
              </div>
              <div>
                <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>Modified</h4>
                <pre className={`p-4 rounded-lg font-mono text-sm overflow-auto max-h-96 ${theme === 'dark' ? 'bg-gray-800' : 'bg-muted'}`}>
                  {rightCode.split("\n").map((line, i) => (
                    <div key={i} className="whitespace-pre">{line}</div>
                  ))}
                </pre>
              </div>
            </div>
            <div className="mt-4">
              <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>Line-by-Line Changes</h4>
              <div className="space-y-1">
                {generateDiff().map(({ line, left, right, type }) => (
                  <div key={line} className={`p-2 rounded text-sm ${theme === 'dark' ? 
                    type === 'added' ? 'bg-green-900/50 text-green-300' : 
                    type === 'removed' ? 'bg-red-900/50 text-red-300' : 
                    type === 'changed' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-gray-800/50 text-gray-300' 
                    : 
                    type === 'added' ? 'bg-green-100 text-green-800' : 
                    type === 'removed' ? 'bg-red-100 text-red-800' : 
                    type === 'changed' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    Line {line}: {left !== right ? `${left} → ${right}` : left}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Merge Controls */}
      {(leftCode && rightCode) && (
        <div className={`space-y-4 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <Label className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>Merge Changes</Label>
          {/* Placeholder for hunk checkboxes - in full impl, parse diff hunks */}
          <div className="flex gap-4">
            <Button onClick={() => { updateHunkChoice("hunk1", "left"); mergeCode(); }} variant="outline" className={`glass ${theme === 'dark' ? 'text-white' : ''}`}>
              Accept Left (Original)
            </Button>
            <Button onClick={() => { updateHunkChoice("hunk1", "right"); mergeCode(); }} variant="outline" className={`glass ${theme === 'dark' ? 'text-white' : ''}`}>
              Accept Right (Modified)
            </Button>
            <Button onClick={mergeCode} variant="default" className="glass bg-green-500 hover:bg-green-600 text-black">
              Preview Merge
            </Button>
          </div>
        </div>
      )}

      {/* Preview Merged */}
      {mergedCode && (
        <Card className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <CardContent className="p-4 space-y-4">
            <Label className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>Merged Code Preview</Label>
            <Textarea
              value={mergedCode}
              readOnly
              className="min-h-[200px] font-mono text-sm glass"
              rows={10}
            />
            <Button onClick={downloadMerged} className={`glass ${theme === 'dark' ? 'text-white' : ''}`}>
              <Download className="h-4 w-4 mr-2" />
              Download Merged File
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
