import React, { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type ContrastResult = {
  pair: [string, string];
  contrast: number;
  aa: boolean;
  aaa: boolean;
};

const ACCESSIBLE_ALTERNATIVES = ["#0F172A", "#111827", "#1D4ED8", "#0EA5E9", "#F8FAFC", "#F97316"];

const formatColor = (value: string) => value.toUpperCase();

const calculateContrast = (color1: string, color2: string) => {
  const parseHex = (hex: string) => parseInt(hex.replace("#", ""), 16);
  const getLuminance = (hex: string) => {
    const rgb = parseHex(hex);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    const toLinear = (channel: number) => {
      const normalized = channel / 255;
      return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
    };
    const rLinear = toLinear(r);
    const gLinear = toLinear(g);
    const bLinear = toLinear(b);
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

export const AccessibilityContrastGuidedFixer: React.FC = () => {
  const [colors, setColors] = useState<string[]>(["#0F172A", "#F8FAFC", "#6366F1"]);
  const [results, setResults] = useState<ContrastResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const hasResults = results.length > 0;

  const paletteSummary = useMemo(
    () => colors.map((color, index) => `${index + 1}. ${formatColor(color)}`).join("\n"),
    [colors],
  );

  const addColor = () => {
    setColors(prev => [...prev, "#CBD5F5"]);
  };

  const updateColor = (index: number, color: string) => {
    const formatted = color.startsWith("#") ? color.toUpperCase() : `#${color.toUpperCase()}`;
    const next = [...colors];
    next[index] = formatted;
    setColors(next);
  };

  const removeColor = (index: number) => {
    if (colors.length <= 2) {
      return;
    }
    setColors(colors.filter((_, i) => i !== index));
  };

  const checkCompliance = () => {
    const pairs: ContrastResult[] = [];
    const uniqueColors = colors.filter(Boolean);

    for (let i = 0; i < uniqueColors.length; i += 1) {
      for (let j = i + 1; j < uniqueColors.length; j += 1) {
        const first = uniqueColors[i];
        const second = uniqueColors[j];
        const ratio = calculateContrast(first, second);
        pairs.push({
          pair: [formatColor(first), formatColor(second)],
          contrast: ratio,
          aa: ratio >= 4.5,
          aaa: ratio >= 7,
        });
      }
    }

    setResults(pairs);

    const messages = new Set<string>();

    pairs
      .filter(result => !result.aa)
      .forEach(result => {
        messages.add(
          `Increase contrast between ${result.pair[0]} and ${result.pair[1]} until the ratio reaches at least 4.5:1.`,
        );
      });

    uniqueColors.forEach(color => {
      ACCESSIBLE_ALTERNATIVES.forEach(alternative => {
        if (calculateContrast(color, alternative) >= 4.5) {
          messages.add(`Try pairing ${formatColor(color)} with ${formatColor(alternative)} for AA compliance.`);
        }
      });
    });

    if (messages.size === 0 && pairs.length > 0) {
      messages.add("Excellent work. All tested color pairs meet WCAG AA contrast guidelines.");
    }

    setSuggestions(Array.from(messages));
  };

  const downloadReport = () => {
    const reportLines = [
      "Accessibility Contrast Report",
      `Generated: ${new Date().toISOString()}`,
      "",
      "Colors Tested:",
      paletteSummary,
      "",
      "Contrast Results:",
      results
        .map(result => {
          const status = `AA ${result.aa ? "Pass" : "Fail"} | AAA ${result.aaa ? "Pass" : "Fail"}`;
          return `${result.pair[0]} vs ${result.pair[1]}: ${result.contrast.toFixed(2)} (${status})`;
        })
        .join("\n"),
      "",
      "Suggestions:",
      suggestions.join("\n"),
    ];

    const blob = new Blob([reportLines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "contrast-report.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <header className="mx-auto max-w-3xl text-center space-y-3">
        <Badge variant="secondary" className="rounded-full px-4 py-1 uppercase tracking-wide">
          Accessibility Toolkit
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Accessibility Contrast Guided Fixer
        </h1>
        <p className="text-muted-foreground text-lg">
          Evaluate your palette against WCAG AA and AAA targets, then apply actionable color adjustments to stay
          compliant.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="glass">
          <CardHeader className="space-y-2">
            <CardTitle>Palette Configuration</CardTitle>
            <CardDescription>
              Add or update colors, then run a full contrast sweep across your entire palette.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Current colors</p>
                <p className="text-sm text-muted-foreground">
                  Include brand primaries, surfaces, and text tokens for a complete check.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addColor}>
                Add Color
              </Button>
            </div>

            <div className="space-y-4">
              {colors.map((color, index) => (
                <div
                  key={`${color}-${index}`}
                  className="flex flex-col gap-3 rounded-xl border border-muted/40 bg-background/60 p-4 shadow-sm transition hover:border-primary/40 md:flex-row md:items-center"
                >
                  <Label htmlFor={`color-${index}`} className="text-sm font-medium text-foreground md:w-24">
                    Color {index + 1}
                  </Label>
                  <div className="flex flex-1 items-center gap-3">
                    <input
                      aria-label={`Select color ${index + 1}`}
                      type="color"
                      value={color}
                      onChange={event => updateColor(index, event.target.value)}
                      className="h-12 w-16 cursor-pointer rounded-lg border border-muted shadow-inner"
                    />
                    <Input
                      id={`color-${index}`}
                      value={color}
                      onChange={event => updateColor(index, event.target.value)}
                      placeholder="#0F172A"
                      className="font-mono uppercase"
                    />
                  </div>
                  {colors.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeColor(index)}
                      className="md:w-auto"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Button onClick={checkCompliance} size="lg" className="w-full md:w-auto">
                Run Contrast Audit
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass">
            <CardHeader className="space-y-2">
              <CardTitle>Contrast Results</CardTitle>
              <CardDescription>
                Each color pair is evaluated against WCAG thresholds with AA targets for text and AAA for enhanced
                legibility.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasResults ? (
                <div className="space-y-4">
                  {results.map(result => (
                    <div
                      key={`${result.pair[0]}-${result.pair[1]}`}
                      className="flex flex-col gap-3 rounded-xl border border-muted/40 bg-background/60 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-full border border-muted shadow-inner"
                          style={{ backgroundColor: result.pair[0] }}
                        />
                        <span className="font-medium text-foreground">vs</span>
                        <div
                          className="h-10 w-10 rounded-full border border-muted shadow-inner"
                          style={{ backgroundColor: result.pair[1] }}
                        />
                        <div className="ml-4 space-y-1">
                          <p className="font-semibold text-foreground">
                            {result.pair[0]} ⇄ {result.pair[1]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ratio {result.contrast.toFixed(2)} : 1
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={result.aa ? "secondary" : "destructive"} className="px-3 py-1">
                          AA {result.aa ? "Pass" : "Fail"}
                        </Badge>
                        <Badge variant={result.aaa ? "secondary" : "outline"} className="px-3 py-1">
                          AAA {result.aaa ? "Pass" : "Fail"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-muted-foreground/40 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                  Run the audit to see contrast ratios for every color combination in your palette.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="space-y-2">
              <CardTitle>Guided Suggestions</CardTitle>
              <CardDescription>
                Apply these targeted adjustments to strengthen contrast without losing your brand personality.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suggestions.length > 0 ? (
                <ul className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={`${suggestion}-${index}`}
                      className="rounded-lg border border-muted/40 bg-background/60 p-3 text-sm text-foreground shadow-sm"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl border border-dashed border-muted-foreground/40 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                  Suggestions will appear after you audit your palette. Passing all checks? Celebrate the good news!
                </div>
              )}
            </CardContent>
          </Card>

          {hasResults && (
            <Card className="glass">
              <CardHeader>
                <CardTitle>Export</CardTitle>
                <CardDescription>
                  Save your findings as a plain-text report to share with designers, developers, or stakeholders.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={downloadReport} variant="outline" size="lg" className="w-full md:w-auto">
                  Download Contrast Report
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
