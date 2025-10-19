import React, { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Check, Copy, RefreshCw, Sparkles } from "lucide-react";

interface PalettePair {
  background: string;
  foreground: string;
}

interface BrandIdea {
  name: string;
  tagline: string;
  components: string[];
  palette: PalettePair[];
}

const MIN_CONTRAST_RATIO = 4.5;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const toTitleCase = (value: string) =>
  value
    .split(/[\s-]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const hexToRgb = (hex: string) => {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const componentToHex = (component: number) => {
  const hex = component.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
};

const rgbToHex = (r: number, g: number, b: number) => `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;

const rgbToHsl = (r: number, g: number, b: number) => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h, s, l };
};

const hslToRgb = (h: number, s: number, l: number) => {
  const hue = h / 360;

  const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = Math.round(hueToRgb(p, q, hue + 1 / 3) * 255);
  const g = Math.round(hueToRgb(p, q, hue) * 255);
  const b = Math.round(hueToRgb(p, q, hue - 1 / 3) * 255);

  return { r, g, b };
};

const hslToHex = (h: number, s: number, l: number) => {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
};

const shiftLightness = (hex: string, delta: number) => {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const nextLightness = clamp(l + delta, 0, 1);
  return hslToHex(h, s, nextLightness);
};

const calculateContrast = (hex1: string, hex2: string) => {
  const luminance = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const transform = (channel: number) => {
      const norm = channel / 255;
      return norm <= 0.03928 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
    };
    const rLin = transform(r);
    const gLin = transform(g);
    const bLin = transform(b);
    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  };

  const lum1 = luminance(hex1);
  const lum2 = luminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

const tuneColorForContrast = (color: string, reference: string, preferLighter: boolean) => {
  let current = color;
  for (let i = 0; i < 12 && calculateContrast(current, reference) < MIN_CONTRAST_RATIO; i += 1) {
    current = shiftLightness(current, preferLighter ? 0.05 : -0.05);
  }

  if (calculateContrast(current, reference) >= MIN_CONTRAST_RATIO) {
    return current;
  }

  return calculateContrast("#1D4ED8", reference) >= MIN_CONTRAST_RATIO ? "#1D4ED8" : "#0369A1";
};

const generateAccessiblePalette = (seed: string): PalettePair[] => {
  const seedValue = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = seedValue % 360;
  const baseAccent = hslToHex(hue, 0.62, 0.45);

  const lightText = "#F8FAFC";
  const darkText = "#0F172A";
  const neutralBackground = "#F1F5F9";
  const deepBackground = "#0F172A";

  const accentBackground = tuneColorForContrast(baseAccent, lightText, false);
  const accentOnDark = tuneColorForContrast(baseAccent, deepBackground, true);
  const accentOnNeutral = tuneColorForContrast(baseAccent, neutralBackground, false);

  return [
    { background: accentBackground, foreground: lightText },
    { background: deepBackground, foreground: accentOnDark },
    { background: neutralBackground, foreground: accentOnNeutral },
  ].filter(pair => calculateContrast(pair.background, pair.foreground) >= MIN_CONTRAST_RATIO);
};

const SUFFIXES = ["Labs", "Collective", "Studio", "Works", "Forge", "Co", "Nest", "Shift", "Spark", "Craft"];
const PREFIXES = ["Neo", "Hyper", "Bright", "Blue", "Pulse", "North", "Core", "Echo", "Ever", "Nova"];
const TAGLINE_TEMPLATES = [
  "Crafting {keyword} experiences with purpose.",
  "Where {keyword} ideas find their voice.",
  "Turning {keyword} insights into remarkable brands.",
  "Designing bold {keyword} journeys for modern teams.",
  "Helping founders build magnetic {keyword} stories.",
];

const enrichToken = (token: string) => toTitleCase(token.replace(/[^a-z0-9]+/gi, " "));

const createBrandIdeas = (keywords: string): BrandIdea[] => {
  const tokens = keywords
    .split(/[\s,]+/)
    .map(token => slugify(token))
    .filter(Boolean);

  if (tokens.length === 0) {
    return [];
  }

  const baseWords = tokens.map(enrichToken);
  const suggestions = new Map<string, { components: string[] }>();

  baseWords.forEach(word => {
    suggestions.set(word, { components: [word] });
    SUFFIXES.forEach(suffix => suggestions.set(`${word} ${suffix}`, { components: [word, suffix] }));
  });

  PREFIXES.forEach(prefix => {
    baseWords.forEach(word => {
      suggestions.set(`${prefix} ${word}`, { components: [prefix, word] });
    });
  });

  if (baseWords.length >= 2) {
    suggestions.set(baseWords.join(" "), { components: [...baseWords] });
    suggestions.set(`${baseWords[0]} & ${baseWords.slice(1).join(" ")}`, { components: [...baseWords] });
    SUFFIXES.slice(0, 4).forEach(suffix =>
      suggestions.set(`${baseWords[0]} ${suffix}`, { components: [baseWords[0], suffix] }),
    );
  }

  const uniqueIdeas = Array.from(suggestions.entries())
    .map(([name, meta]) => {
      const palette = generateAccessiblePalette(name);
      const template = TAGLINE_TEMPLATES[Math.floor(Math.random() * TAGLINE_TEMPLATES.length)];
      const keyword = baseWords[0] ?? "brand";
      const tagline = template.replace("{keyword}", keyword.toLowerCase());
      return {
        name,
        tagline,
        components: meta.components,
        palette,
      } as BrandIdea;
    })
    .slice(0, 12);

  return uniqueIdeas;
};

export const DomainAvailabilityNameGenerator: React.FC = () => {
  const [keywords, setKeywords] = useState("");
  const [ideas, setIdeas] = useState<BrandIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const generate = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setError(null);

    const cleaned = keywords.trim();
    if (!cleaned) {
      setIdeas([]);
      setError("Enter at least one keyword to explore brand directions.");
      return;
    }

    const nextIdeas = createBrandIdeas(cleaned);
    if (nextIdeas.length === 0) {
      setIdeas([]);
      setError("Use alphanumeric keywords so we can suggest memorable names.");
      return;
    }

    setIdeas(nextIdeas);
  };

  const reset = () => {
    setKeywords("");
    setIdeas([]);
    setError(null);
    setCopiedName(null);
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedName(value);
      setTimeout(() => setCopiedName(null), 1500);
    } catch (copyError) {
      console.error("Clipboard copy failed", copyError);
    }
  };

  return (
    <div className="space-y-8">
      <header className="mx-auto max-w-3xl text-center space-y-3">
        <Badge variant="secondary" className="rounded-full px-4 py-1 uppercase tracking-wide">
          Brand identity toolkit
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Brand Name Generator & Palette Curator
        </h1>
        <p className="text-muted-foreground text-lg">
          Transform raw keywords into memorable brand names, aligned taglines, and accessible color pairings.
        </p>
      </header>

      <Card className="glass">
        <CardHeader className="space-y-2">
          <CardTitle>Tell us about your concept</CardTitle>
          <CardDescription>
            Describe the audience, product, or vibe. We’ll craft names and palettes that fit your narrative.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={generate} className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              value={keywords}
              onChange={event => setKeywords(event.target.value)}
              placeholder="creative tools for designers"
              className="font-medium"
              aria-label="Brand keywords"
            />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 md:flex-none">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate brands
              </Button>
              <Button type="button" variant="outline" onClick={reset} className="flex-1 md:flex-none">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </form>
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Tip: Mix audience descriptors with a differentiator (e.g. “sustainable fashion marketplace”) for stronger
            suggestions.
          </p>
        </CardContent>
      </Card>

      {ideas.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map(idea => (
            <Card key={idea.name} className="glass flex h-full flex-col">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="text-xl font-bold text-foreground">{idea.name}</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleCopy(idea.name)}>
                    {copiedName === idea.name ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <CardDescription>{idea.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-5">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Name components</p>
                  <div className="flex flex-wrap gap-2">
                    {idea.components.map(part => (
                      <Badge key={`${idea.name}-${part}`} variant="outline" className="rounded-full px-3 py-1 text-xs">
                        {part}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Accessible palette</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {idea.palette.map((pair, index) => (
                      <div
                        key={`${idea.name}-${index}`}
                        className="rounded-xl border border-muted/40 p-3 text-sm shadow-sm"
                        style={{ backgroundColor: pair.background, color: pair.foreground }}
                      >
                        <span className="font-semibold">Brand</span>
                        <div className="mt-2 text-xs opacity-90">
                          {pair.background.toUpperCase()} / {pair.foreground.toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="glass">
        <CardHeader className="space-y-2">
          <CardTitle>Tips for sharper brand ideas</CardTitle>
          <CardDescription>Use these prompts while you iterate toward a name that resonates.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Balance the functional keyword (what you do) with an evocative word (how it feels).</li>
            <li>Say the option aloud—memorable names are easy to pronounce and spell.</li>
            <li>Pair each palette with your UI to confirm readability beyond the swatches.</li>
            <li>Shortlist three ideas and gather feedback before committing to visuals.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
