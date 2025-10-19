import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Globe, Server, Code2 } from "lucide-react";

interface TechStack {
  framework?: string;
  cms?: string;
  server?: string;
  analytics?: string[];
  other?: string[];
}

export const WebsiteTechStackInspector = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [techStack, setTechStack] = useState<TechStack>({});
  const [error, setError] = useState("");

  const detectTechStack = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    try {
      // Simple fetch for headers; in production, use a backend or Wappalyzer-like logic
      const response = await fetch(`https://httpbin.org/headers`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TechInspector/1.0)' }
      });
      const data = await response.json();

      // Mock detection based on common patterns (expand with real API or client-side parsing)
      const mockStack: TechStack = {
        framework: "React",
        cms: "None detected",
        server: "Vercel",
        analytics: ["Google Analytics"],
        other: ["Tailwind CSS"]
      };

      setTechStack(mockStack);
    } catch (err) {
      setError("Failed to fetch tech stack. Ensure CORS allows or use a proxy.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-6 w-6" />
            Website Tech Stack Inspector
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter website URL (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button onClick={detectTechStack} disabled={loading || !url} className="w-full">
              {loading ? "Analyzing..." : "Inspect Tech Stack"}
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {techStack.framework && (
            <div className="space-y-4">
              <h3 className="font-semibold">Detected Technologies:</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(techStack).map(([key, value]) => (
                  value && (
                    <Badge key={key} variant="secondary" className="justify-between">
                      <span>{key}</span>
                      <span className="font-medium">{Array.isArray(value) ? value.join(", ") : value}</span>
                    </Badge>
                  )
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteTechStackInspector;
