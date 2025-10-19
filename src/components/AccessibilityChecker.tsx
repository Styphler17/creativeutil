import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
  suggestion: string;
  wcag?: string;
}

interface AccessibilityScore {
  overall: number;
  contrast: number;
  structure: number;
  navigation: number;
  media: number;
}

export const AccessibilityChecker = () => {
  const [input, setInput] = useState('');
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [score, setScore] = useState<AccessibilityScore | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkAccessibility = async () => {
    if (!input.trim()) return;

    setIsChecking(true);
    setIssues([]);
    setScore(null);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const foundIssues: AccessibilityIssue[] = [];
    const scoreValues = {
      overall: 100,
      contrast: 100,
      structure: 100,
      navigation: 100,
      media: 100,
    };

    const html = input.toLowerCase();

    // Check for images without alt text
    const imgTags = input.match(/<img[^>]*>/gi) || [];
    imgTags.forEach((tag) => {
      if (!tag.includes('alt=')) {
        foundIssues.push({
          type: 'error',
          message: 'Image missing alt attribute',
          element: tag,
          suggestion: 'Add alt="descriptive text" to all img elements',
          wcag: '1.1.1 Non-text Content',
        });
        scoreValues.overall -= 15;
        scoreValues.media -= 20;
      }
    });

    // Check for missing headings
    if (!html.includes('<h1') && !html.includes('<h2') && !html.includes('<h3')) {
      foundIssues.push({
        type: 'warning',
        message: 'No heading structure found',
        suggestion: 'Add proper heading hierarchy (h1, h2, h3, etc.)',
        wcag: '1.3.1 Info and Relationships',
      });
      scoreValues.overall -= 10;
      scoreValues.structure -= 15;
    }

    // Check for color contrast issues (basic check)
    const colorMatches = input.match(/color:\s*#[0-9a-f]{3,6}/gi) || [];
    if (colorMatches.length > 0) {
      foundIssues.push({
        type: 'info',
        message: 'Color contrast should be checked manually',
        suggestion: 'Use a color contrast checker for text/background combinations',
        wcag: '1.4.3 Contrast (Minimum)',
      });
    }

    // Check for missing lang attribute
    if (!html.includes('<html lang=')) {
      foundIssues.push({
        type: 'warning',
        message: 'Missing language attribute',
        element: '<html>',
        suggestion: 'Add lang="en" (or appropriate language code) to html element',
        wcag: '3.1.1 Language of Page',
      });
      scoreValues.overall -= 5;
      scoreValues.structure -= 10;
    }

    // Check for form elements without labels
    const inputTags = input.match(/<input[^>]*>/gi) || [];
    inputTags.forEach((tag) => {
      if (!tag.includes('aria-label=') && !tag.includes('aria-labelledby=')) {
        const nearbyLabels = input.includes('<label') ? [] : ['potential issue'];
        if (nearbyLabels.length === 0) {
          foundIssues.push({
            type: 'error',
            message: 'Form input may be missing label',
            element: tag,
            suggestion: 'Associate inputs with labels using for/id attributes or aria-label',
            wcag: '1.3.1 Info and Relationships',
          });
          scoreValues.overall -= 10;
          scoreValues.structure -= 15;
        }
      }
    });

    // Check for keyboard navigation issues
    if (html.includes('onclick=') && !html.includes('tabindex=')) {
      foundIssues.push({
        type: 'warning',
        message: 'Clickable elements should be keyboard accessible',
        suggestion: 'Ensure all interactive elements can be accessed via keyboard',
        wcag: '2.1.1 Keyboard',
      });
      scoreValues.overall -= 8;
      scoreValues.navigation -= 12;
    }

    // Check for sufficient color contrast (very basic simulation)
    const hasLowContrast = html.includes('color:#000') && html.includes('background:#fff');
    if (hasLowContrast) {
      foundIssues.push({
        type: 'warning',
        message: 'Potential contrast issues detected',
        suggestion: 'Ensure text has sufficient contrast ratio (4.5:1 for normal text)',
        wcag: '1.4.3 Contrast (Minimum)',
      });
      scoreValues.contrast -= 20;
      scoreValues.overall -= 10;
    }

    setIssues(foundIssues);
    setScore(scoreValues);
    setIsChecking(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle>Accessibility Checker</CardTitle>
          <p className="text-sm text-muted-foreground">
            Analyze HTML code for accessibility issues and WCAG compliance
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              HTML Code to Check
            </label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your HTML code here..."
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          <Button
            onClick={checkAccessibility}
            disabled={!input.trim() || isChecking}
            className="w-full"
          >
            {isChecking ? 'Checking...' : 'Check Accessibility'}
          </Button>
        </CardContent>
      </Card>

      {score && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Accessibility Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(score.overall)}`}>
                  {score.overall}%
                </div>
                <div className="text-sm text-muted-foreground">Overall</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-semibold ${getScoreColor(score.contrast)}`}>
                  {score.contrast}%
                </div>
                <div className="text-sm text-muted-foreground">Contrast</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-semibold ${getScoreColor(score.structure)}`}>
                  {score.structure}%
                </div>
                <div className="text-sm text-muted-foreground">Structure</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-semibold ${getScoreColor(score.navigation)}`}>
                  {score.navigation}%
                </div>
                <div className="text-sm text-muted-foreground">Navigation</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-semibold ${getScoreColor(score.media)}`}>
                  {score.media}%
                </div>
                <div className="text-sm text-muted-foreground">Media</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {issues.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Issues Found ({issues.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {issues.map((issue, index) => (
                <Alert key={index} className={
                  issue.type === 'error' ? 'border-red-200 bg-red-50' :
                  issue.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }>
                  <div className="flex items-start gap-3">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{issue.type}</span>
                        {issue.wcag && (
                          <Badge variant="outline" className="text-xs">
                            {issue.wcag}
                          </Badge>
                        )}
                      </div>
                      <AlertDescription className="mb-2">
                        {issue.message}
                      </AlertDescription>
                      {issue.element && (
                        <div className="text-xs font-mono bg-muted p-2 rounded mb-2">
                          {issue.element}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        <strong>Suggestion:</strong> {issue.suggestion}
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {issues.length === 0 && score && !isChecking && (
        <Card className="glass">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Great job!</h3>
            <p className="text-muted-foreground">
              No major accessibility issues found. Your code appears to be well-structured.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
