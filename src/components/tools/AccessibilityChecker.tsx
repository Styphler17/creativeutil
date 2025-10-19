import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, CheckCircle, AlertCircle, Copy, Download, Share2, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";

interface CheckResult {
  id: string;
  type: 'contrast' | 'alt' | 'heading' | 'link';
  passed: boolean;
  message: string;
  details?: string;
}

interface SessionHistory {
  id: string;
  timestamp: Date;
  source: string;
  results: CheckResult[];
  content: string;
}

export const AccessibilityChecker = () => {
  const [htmlInput, setHtmlInput] = useState(`
<html>
  <head>
    <title>Sample Page</title>
  </head>
  <body>
    <h1>Welcome</h1>
    <p style="color: #333; background-color: #fff;">This is a paragraph.</p>
    <img src="image.jpg" alt="Sample image">
    <a href="#">Link without description</a>
  </body>
</html>
`);
  const [urlInput, setUrlInput] = useState('');
  const [results, setResults] = useState<CheckResult[]>([]);
  const [activeTab, setActiveTab] = useState<'html' | 'url'>('html');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const { toast } = useToast();
  const { theme } = useTheme();

  // Load session history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('accessibilityCheckerHistory');
    if (saved) {
      try {
        const history = JSON.parse(saved);
        setSessionHistory(history.map((item: unknown) => ({
          ...item as SessionHistory,
          timestamp: new Date((item as SessionHistory).timestamp)
        })));
      } catch (e) {
        console.warn('Failed to load accessibility checker history');
      }
    }
  }, []);

  // Save session history to localStorage
  useEffect(() => {
    localStorage.setItem('accessibilityCheckerHistory', JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  const checkContrast = (fgColor: string, bgColor: string): number => {
    const getLuminance = (color: string) => {
      const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
      const [r, g, b] = rgb.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(fgColor);
    const l2 = getLuminance(bgColor);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const runChecks = async () => {
    setIsLoading(true);
    let content = htmlInput;

    if (activeTab === 'url' && urlInput.trim()) {
      try {
        // Use a CORS proxy or direct fetch (in production, you'd want a backend service)
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(urlInput)}`);
        const data = await response.json();
        content = data.contents;
      } catch (error) {
        toast({
          title: "Error Fetching URL",
          description: "Could not fetch content from the provided URL. Please check the URL and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }

    const newResults: CheckResult[] = [];

    // Basic HTML structure check
    if (!content.includes('<title>')) {
      newResults.push({
        id: 'title',
        type: 'heading',
        passed: false,
        message: 'Missing or empty title tag',
      });
    }

    // Alt text check (simple regex)
    const imgTags = content.match(/<img[^>]*alt=["']([^"']*)["'][^>]*>/gi) || [];
    imgTags.forEach((tag, index) => {
      const alt = tag.match(/alt=["']([^"']*)["']/)?.[1] || '';
      if (!alt || alt.toLowerCase() === 'image' || alt.trim() === '') {
        newResults.push({
          id: `alt-${index}`,
          type: 'alt',
          passed: false,
          message: `Image ${index + 1} missing meaningful alt text`,
          details: tag,
        });
      }
    });

    // Heading structure check
    const headingLevels = content.match(/<h([1-6])>/g) || [];
    const levels = headingLevels.map(match => parseInt(match.match(/h([1-6])/)?.[1] || '0'));
    if (levels.length === 0) {
      newResults.push({
        id: 'headings',
        type: 'heading',
        passed: false,
        message: 'No heading elements found',
      });
    } else if (Math.max(...levels) > 1 && !levels.includes(1)) {
      newResults.push({
        id: 'h1',
        type: 'heading',
        passed: false,
        message: 'Missing H1 heading',
      });
    }

    // Link text check
    const linkTags = content.match(/<a[^>]*>([^<]+)<\/a>/gi) || [];
    linkTags.forEach((tag, index) => {
      const text = tag.match(/>([^<]+)<\/a>/)?.[1] || '';
      if (text.trim().length < 3 || text.toLowerCase().includes('click here')) {
        newResults.push({
          id: `link-${index}`,
          type: 'link',
          passed: false,
          message: `Link ${index + 1} has vague or insufficient text`,
          details: text.trim(),
        });
      }
    });

    // Color contrast check (simple extraction)
    const styleMatches = content.match(/style="[^"]*color:\s*([^;"]+)[^"]*background-color:\s*([^;"]+)/gi);
    if (styleMatches) {
      styleMatches.forEach((match, index) => {
        const fg = match.match(/color:\s*([^;"]+)/)?.[1] || '#000';
        const bg = match.match(/background-color:\s*([^;"]+)/)?.[1] || '#fff';
        const ratio = checkContrast(fg, bg);
        if (ratio < 4.5) {
          newResults.push({
            id: `contrast-${index}`,
            type: 'contrast',
            passed: false,
            message: `Low contrast ratio: ${ratio.toFixed(2)}:1`,
            details: `${fg} on ${bg}`,
          });
        }
      });
    }

    setResults(newResults);
    setIsLoading(false);

    // Add to session history
    const newSession: SessionHistory = {
      id: Date.now().toString(),
      timestamp: new Date(),
      source: activeTab === 'url' ? urlInput : 'HTML Input',
      results: newResults,
      content: content
    };
    setSessionHistory(prev => [newSession, ...prev.slice(0, 9)]); // Keep last 10 sessions

    toast({
      title: "Accessibility Check Complete!",
      description: `${newResults.length} issues found. Review results below.`,
    });
  };

  const copyReport = () => {
    const report = results.map(r =>
      `- ${r.passed ? 'PASS' : 'FAIL'}: ${r.message}${r.details ? ` (${r.details})` : ''}`
    ).join('\n');
    navigator.clipboard.writeText(report);
    setCopiedItem('report');
    setTimeout(() => setCopiedItem(null), 2000);
    toast({
      title: "Report Copied!",
      description: "Accessibility report copied to clipboard.",
    });
  };

  const downloadReport = () => {
    const report = `Accessibility Check Report\nGenerated: ${new Date().toLocaleString()}\n\n${results.map(r =>
      `${r.passed ? 'PASS' : 'FAIL'}: ${r.message}${r.details ? ` (${r.details})` : ''}`
    ).join('\n')}\n\nAccessibility Tips:\n• Use meaningful alt text for images\n• Ensure color contrast ratios meet WCAG 2.1 AA (4.5:1)\n• Structure content with proper headings (H1-H6)\n• Link text should describe the destination\n• Add ARIA labels for complex interactions\n• Test with screen readers like NVDA or VoiceOver`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setCopiedItem('download');
    setTimeout(() => setCopiedItem(null), 2000);
    toast({
      title: "Report Downloaded!",
      description: "Accessibility report saved to your downloads.",
    });
  };

  const shareReport = () => {
    const report = `Accessibility Check Report\n\n${results.map(r =>
      `${r.passed ? 'PASS' : 'FAIL'}: ${r.message}${r.details ? ` (${r.details})` : ''}`
    ).join('\n')}\n\nCheck out CreativeUtil for more web development tools!`;

    if (navigator.share) {
      navigator.share({
        title: 'Accessibility Check Report',
        text: report,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(report);
      toast({
        title: "Report Copied for Sharing!",
        description: "Report copied to clipboard. Share it with your team!",
      });
    }
    setCopiedItem('share');
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const loadSession = (session: SessionHistory) => {
    setResults(session.results);
    if (session.source.startsWith('http')) {
      setUrlInput(session.source);
      setActiveTab('url');
    } else {
      setHtmlInput(session.content);
      setActiveTab('html');
    }
    setShowHistory(false);
    toast({
      title: "Session Loaded!",
      description: `Loaded results from ${session.timestamp.toLocaleString()}`,
    });
  };

  const getIcon = (type: CheckResult['type']) => {
    switch (type) {
      case 'contrast': return <Eye className="h-4 w-4" />;
      case 'alt': return <AlertCircle className="h-4 w-4" />;
      case 'heading': return <CheckCircle className="h-4 w-4" />;
      case 'link': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className={`p-6 space-y-8 rounded-lg glass border ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Accessibility Checker</h2>
        <p className={`text-foreground ${theme === 'dark' ? 'text-gray-300' : ''}`}>
          Check your HTML for common accessibility issues like contrast, alt text, and structure.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Input */}
        <Card className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <CardHeader>
            <CardTitle className={`${theme === 'dark' ? 'text-white' : ''}`}>Input HTML</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'html' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('html')}
                  size="sm"
                  className={`${theme === 'dark' ? 'text-white' : ''}`}
                >
                  HTML Code
                </Button>
                <Button
                  variant={activeTab === 'url' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('url')}
                  size="sm"
                  className={`${theme === 'dark' ? 'text-white' : ''}`}
                >
                  URL
                </Button>
              </div>
              {activeTab === 'html' ? (
                <Textarea
                  value={htmlInput}
                  onChange={(e) => setHtmlInput(e.target.value)}
                  placeholder="Paste your HTML here..."
                  rows={15}
                  className="font-mono glass"
                />
              ) : (
                <Input
                  placeholder="Enter URL to check (e.g., https://example.com)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="glass"
                />
              )}
              <Button onClick={runChecks} className="w-full" disabled={isLoading}>
                {isLoading ? "Checking..." : "Run Accessibility Check"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* HTML Preview with Highlights */}
        <Card className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <CardHeader>
            <CardTitle className={`${theme === 'dark' ? 'text-white' : ''}`}>HTML Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`rounded-lg p-4 max-h-96 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-black/20'}`}>
              <pre className={`text-xs font-mono whitespace-pre-wrap ${theme === 'dark' ? 'text-green-300' : 'text-green-400'}`}>
                {htmlInput.split('\n').map((line, index) => {
                  let highlightedLine = line;
                  // Highlight issues with red background
                  results.forEach(result => {
                    if (result.details && line.includes(result.details)) {
                      highlightedLine = highlightedLine.replace(
                        result.details,
                        `<span class="bg-red-500/30 px-1 rounded">${result.details}</span>`
                      );
                    }
                  });
                  return (
                    <span key={index} dangerouslySetInnerHTML={{ __html: highlightedLine + (index < htmlInput.split('\n').length - 1 ? '\n' : '') }} />
                  );
                })}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={`${theme === 'dark' ? 'text-white' : ''}`}>Results</CardTitle>
              <Badge variant={results.length === 0 ? "default" : "destructive"}>
                {results.length} Issues
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className={`flex items-center justify-center py-8 ${theme === 'dark' ? 'text-white' : ''}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Analyzing...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.length === 0 ? (
                  <Alert className="glass"> 
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className={`${theme === 'dark' ? 'text-white' : ''}`}>No issues found! Your content appears accessible.</AlertDescription>
                  </Alert>
                ) : (
                  results.map((result) => (
                    <Alert
                      key={result.id}
                      variant={result.passed ? "default" : "destructive"}
                      className="flex items-start gap-2 glass"
                    >
                      {getIcon(result.type)}
                      <div>
                        <AlertDescription className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>{result.message}</AlertDescription>
                        {result.details && <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>{result.details}</p>}
                      </div>
                    </Alert>
                  ))
                )}
              </div>
            )}
            {results.length > 0 && !isLoading && (
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={copyReport}
                  variant="outline"
                  size="sm"
                  className={`transition-all duration-200 ${copiedItem === 'report' ? 'bg-green-500 text-white scale-105' : ''} ${theme === 'dark' ? 'text-white' : ''}`}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copiedItem === 'report' ? 'Copied!' : 'Copy Report'}
                </Button>
                <Button
                  onClick={downloadReport}
                  variant="outline"
                  size="sm"
                  className={`transition-all duration-200 ${copiedItem === 'download' ? 'bg-green-500 text-white scale-105' : ''} ${theme === 'dark' ? 'text-white' : ''}`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {copiedItem === 'download' ? 'Downloaded!' : 'Download'}
                </Button>
                <Button
                  onClick={shareReport}
                  variant="outline"
                  size="sm"
                  className={`transition-all duration-200 ${copiedItem === 'share' ? 'bg-green-500 text-white scale-105' : ''} ${theme === 'dark' ? 'text-white' : ''}`}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {copiedItem === 'share' ? 'Shared!' : 'Share'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card className={`glass ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
        <CardHeader>
          <CardTitle className={`${theme === 'dark' ? 'text-white' : ''}`}>Accessibility Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : ''}`}>
            <li>• Use meaningful alt text for images</li>
            <li>• Ensure color contrast ratios meet WCAG 2.1 AA (4.5:1)</li>
            <li>• Structure content with proper headings (H1-H6)</li>
            <li>• Link text should describe the destination</li>
            <li>• Add ARIA labels for complex interactions</li>
            <li>• Test with screen readers like NVDA or VoiceOver</li>
          </ul>
        </CardContent>
      </Card>

      {/* Session History Button */}
      {sessionHistory.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowHistory(true)}
            className={`glass ${theme === 'dark' ? 'text-white' : ''}`}
          >
            <History className="h-4 w-4 mr-2" />
            View History ({sessionHistory.length})
          </Button>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-2xl max-h-[80vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className={`${theme === 'dark' ? 'text-white' : ''}`}>Session History</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)} className={`${theme === 'dark' ? 'text-white' : ''}`}> 
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessionHistory.map((session) => (
                <div key={session.id} className={`border rounded-lg p-4 space-y-2 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>{session.source}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                        {session.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadSession(session)}
                        className={`${theme === 'dark' ? 'text-white' : ''}`}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Delete session
                          setSessionHistory(prev => prev.filter(s => s.id !== session.id));
                          toast({
                            title: "Session Deleted",
                            description: "History entry removed.",
                          });
                        }}
                        className={`${theme === 'dark' ? 'text-white' : ''}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    {session.results.slice(0, 3).map((result) => (
                      <p key={result.id} className="text-destructive">
                        • {result.message}
                      </p>
                    ))}
                    {session.results.length > 3 && (
                      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>... and {session.results.length - 3} more</p>
                    )}
                  </div>
                </div>
              ))}
              {sessionHistory.length === 0 && (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>No history yet. Run some checks to get started.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
