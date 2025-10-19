import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toggle } from "@/components/ui/toggle";
import { Copy, Code, ChevronRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface JSONTreeProps {
  data: unknown;
  level?: number;
}

const JSONTree = ({ data, level = 0 }: JSONTreeProps) => {
  const { theme } = useTheme();
  if (data === null || data === undefined) {
    return <span className="text-muted-foreground">null</span>;
  }

  if (typeof data === "string") {
    return <span className={`p-6 space-y-8 rounded-lg glass border ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>"{data}"</span>;
  }

  if (typeof data === "number") {
    return <span className={`font-mono ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{data}</span>;
  }

  if (typeof data === "boolean") {
    return <span className={`font-mono ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>{String(data)}</span>;
  }

  if (Array.isArray(data)) {
    return (
      <div className="ml-4">
        <span className={`font-mono ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>[</span>
        <div className="ml-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-start">
              <span className={`font-mono mr-2 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>{index}:</span>
              <JSONTree data={item} level={level + 1} />
            </div>
          ))}
        </div>
        <span className={`font-mono ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>]</span>
      </div>
    );
  }

  if (typeof data === "object" && data !== null) {
    const entries = Object.entries(data as Record<string, unknown>);
    return (
      <div className="ml-4">
        <span className={`font-mono ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>&#123;</span>
        <div className="ml-4">
          {entries.map((entry, index) => {
            const key = entry[0];
            const value = entry[1];
            return (
              <div key={key || index} className="flex items-start">
                <span className={`font-mono mr-2 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>"{key}":</span>
                <JSONTree data={value} level={level + 1} />
              </div>
            );
          })}
        </div>
        <span className={`font-mono ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>&#125;</span>
      </div>
    );
  }

  return <span className="text-muted-foreground">unsupported</span>;
};

export const JSONFormatter = () => {
  const [inputJson, setInputJson] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [parsedJson, setParsedJson] = useState<unknown>(null);
  const [error, setError] = useState("");
  const [showTree, setShowTree] = useState(false);
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputJson(value);
    if (value.trim() === "") {
      setFormattedJson("");
      setParsedJson(null);
      setError("");
      return;
    }
    try {
      const parsed = JSON.parse(value);
      const beautified = JSON.stringify(parsed, null, 2);
      setFormattedJson(beautified);
      setParsedJson(parsed);
      setError("");
    } catch (err) {
      setError((err as Error).message);
      setFormattedJson("");
      setParsedJson(null);
    }
  };

  const copyFormatted = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-6 max-w-6xl space-y-6 rounded-3xl ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>JSON Formatter & Validator</h2>
          <p className={`text-muted-foreground ${theme === 'dark' ? 'text-gray-300' : ''}`}>Beautify, validate, and visualize JSON with tree view.</p>
        </div>
        <Toggle pressed={showTree} onPressedChange={setShowTree} aria-label="Toggle tree view" className={`${theme === 'dark' ? 'text-white' : ''}`}>
          <ChevronRight className="h-4 w-4 mr-2" />
          Tree View
        </Toggle>
      </div>

      {/* Input */}
      <div className={`space-y-2 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
        <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Paste your JSON</Label>
        <Textarea
          value={inputJson}
          onChange={handleInputChange}
          placeholder='{"name": "CreativeUtil", "version": 1.0}'
          className="min-h-[150px] font-mono text-sm glass"
        />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <Code className="h-4 w-4" />
          <AlertDescription className="ml-2">Syntax Error: {error}</AlertDescription>
        </Alert>
      )}

      {/* Output */}
      {!error && inputJson && (
        <div className={`space-y-2 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Formatted JSON</Label>
          <div className="relative">
            <Textarea
              value={formattedJson}
              readOnly
              className={`min-h-[150px] font-mono text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-muted/50'}`}
              placeholder="Formatted JSON will appear here..."
            />
            <Button
              onClick={copyFormatted}
              className="absolute right-2 top-2 h-8 w-8 p-0"
              size="sm"
              variant={copied ? "default" : "outline"}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {copied && <p className="text-sm text-green-600">Copied to clipboard!</p>}
        </div>
      )}

      {/* Tree View */}
      {showTree && !error && parsedJson && (
        <div className={`space-y-2 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>JSON Tree View</Label>
          <div className={`border rounded-lg p-4 max-h-96 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-background/50'}`}>
            <JSONTree data={parsedJson} />
          </div>
        </div>
      )}
    </div>
  );
};