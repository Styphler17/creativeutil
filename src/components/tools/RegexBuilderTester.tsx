import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Copy, Code, AlertCircle, CheckCircle } from "lucide-react";

const commonPatterns = [
  { value: "email", label: "Email", regex: "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b" },
  { value: "phone", label: "Phone (US)", regex: "\\(\\d{3}\\) \\d{3}-\\d{4}" },
  { value: "url", label: "URL", regex: "https?://[\\w/%.\\-?=&]+" },
  { value: "date", label: "Date (MM/DD/YYYY)", regex: "\\d{2}/\\d{2}/\\d{4}" },
];

const regexElements = [
  { symbol: "\\d", description: "Digit (0-9)" },
  { symbol: "\\w", description: "Word character (a-z, A-Z, 0-9, _)" },
  { symbol: "\\s", description: "Whitespace" },
  { symbol: ".", description: "Any character except newline" },
  { symbol: "*", description: "Zero or more" },
  { symbol: "+", description: "One or more" },
  { symbol: "?", description: "Zero or one" },
  { symbol: "\\^", description: "Start of string" },
  { symbol: "\\$", description: "End of string" },
  { symbol: "\\(", description: "Capture group start" },
];

export const RegexBuilderTester = () => {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState("Sample text for testing regex patterns.\nEmail: user@example.com\nPhone: (123) 456-7890");
  const [error, setError] = useState("");
  const [matches, setMatches] = useState<{ match: string; groups: string[]; index: number }[]>([]);
  const [explanation, setExplanation] = useState("");

  const updatePattern = (value: string) => {
    setPattern(value);
    try {
      const regex = new RegExp(value, flags);
      setError("");
      const matchResults = [];
      let match;
      while ((match = regex.exec(testText)) !== null) {
        matchResults.push({
          match: match[0],
          groups: match.slice(1),
          index: match.index,
        });
      }
      setMatches(matchResults);
      setExplanation(`Found ${matchResults.length} match(es). Flags: ${flags}`);
    } catch (err) {
      setError((err as Error).message);
      setMatches([]);
      setExplanation("");
    }
  };

  const loadCommonPattern = (selected: string) => {
    const common = commonPatterns.find(p => p.value === selected);
    if (common) {
      setPattern(common.regex);
      updatePattern(common.regex);
    }
  };

  const copyRegex = (lang: string) => {
    let exportStr = "";
    if (lang === "js") {
      exportStr = `const regex = /${pattern}/${flags};`;
    } else if (lang === "python") {
      exportStr = `import re
pattern = r'${pattern}'
regex = re.compile(pattern, re.${flags.toLowerCase()})`;
    }
    navigator.clipboard.writeText(exportStr);
  };

  const renderMatches = () => {
    if (error || matches.length === 0) return <p className="text-muted-foreground">No matches or error.</p>;
    return (
      <div className="border rounded-lg p-4 bg-muted/50 max-h-64 overflow-y-auto font-mono text-sm">
        {matches.map((m, i) => (
          <div key={i} className="mb-2">
            <Badge variant="secondary" className="mr-2">Match {i + 1}</Badge>
            <span className="bg-yellow-200 px-1 rounded">{m.match}</span> at position {m.index}
            {m.groups.length > 0 && (
              <div className="ml-4 mt-1 space-y-1">
                {m.groups.map((g, j) => g && <span key={j} className="text-xs text-gray-600">Group {j + 1}: <Badge variant="outline" className="px-2">{g}</Badge></span>)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl space-y-6 glass rounded-3xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">Regular Expression Builder & Tester</h2>
          <p className="text-muted-foreground">Visually build and test regex patterns with instant feedback.</p>
        </div>
      </div>

      {/* Builder Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Common Patterns</Label>
            <Select onValueChange={loadCommonPattern}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a common pattern" />
              </SelectTrigger>
              <SelectContent>
                {commonPatterns.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Custom Regex Pattern</Label>
            <Input
              value={pattern}
              onChange={(e) => updatePattern(e.target.value)}
              placeholder="e.g., \\d{3}-\\d{3}-\\d{4}"
              className="font-mono"
            />
            <div className="flex flex-wrap gap-1">
              <TooltipProvider>
                {regexElements.map((el, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="cursor-pointer text-xs"
                        onClick={() => updatePattern(pattern + el.symbol)}
                      >
                        {el.symbol}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>{el.description}</TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Flags</Label>
            <div className="flex gap-2">
              {['g', 'i', 'm', 's', 'u', 'y'].map(flag => (
                <Button
                  key={flag}
                  variant={flags.includes(flag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFlags(prev => prev.includes(flag) ? prev.replace(flag, '') : prev + flag)}
                >
                  {flag.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Export</Label>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => copyRegex("js")}>
                <Code className="h-4 w-4 mr-2" />
                JS
              </Button>
              <Button size="sm" onClick={() => copyRegex("python")}>
                <Code className="h-4 w-4 mr-2" />
                Python
              </Button>
            </div>
          </div>
        </div>

        {/* Tester Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Test Text</Label>
            <Textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text to test your regex against..."
              className="min-h-[150px] font-mono text-sm"
              onInput={() => pattern && updatePattern(pattern)} // Re-test on text change
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <strong>Error:</strong> {error}. Check your syntax.
              </AlertDescription>
            </Alert>
          )}

          {!error && explanation && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">{explanation}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Matches & Groups</Label>
            {renderMatches()}
          </div>
        </div>
      </div>
    </div>
  );
};
