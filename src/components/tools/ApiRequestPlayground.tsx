import React, { useEffect, useMemo, useState } from "react";
import { Save, Play, Trash2, Plus } from "lucide-react";

import { useTheme } from "@/contexts/ThemeContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

interface Header {
  key: string;
  value: string;
}

interface SavedRequest {
  id: string;
  name: string;
  url: string;
  method: (typeof METHODS)[number];
  headers: Header[];
  body: string;
}

const DEFAULT_HEADERS: Header[] = [{ key: "Content-Type", value: "application/json" }];

const buildGlassClass = (isDark: boolean) =>
  `glass ${isDark ? "border-gray-700 bg-gray-900/60 text-white" : "border-gray-200 bg-white/60 text-gray-900"}`;

export const ApiRequestPlayground = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [method, setMethod] = useState<(typeof METHODS)[number]>("GET");
  const [headers, setHeaders] = useState<Header[]>(DEFAULT_HEADERS);
  const [body, setBody] = useState("");
  const [requestName, setRequestName] = useState("Sample GET Request");
  const [response, setResponse] = useState<string | object | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([
    {
      id: "sample1",
      name: "Sample GET Request",
      url: "https://jsonplaceholder.typicode.com/posts/1",
      method: "GET",
      headers: DEFAULT_HEADERS,
      body: "",
    },
  ]);

  const containerGlass = `${buildGlassClass(isDark)} p-4 sm:p-6 lg:p-8 rounded-2xl space-y-8`;
  const cardGlass = buildGlassClass(isDark);
  const fieldGlass = `${buildGlassClass(isDark)} placeholder:text-gray-500 ${
    isDark ? "placeholder:text-gray-400" : ""
  }`;
  const outlineButtonTone = isDark ? "text-white" : "text-gray-900";
  const subtleText = isDark ? "text-gray-400" : "text-muted-foreground";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cached = window.localStorage.getItem("apiRequests");
    if (cached) {
      try {
        setSavedRequests(JSON.parse(cached));
      } catch {
        // Ignore malformed cache
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("apiRequests", JSON.stringify(savedRequests));
  }, [savedRequests]);

  const addHeader = () => {
    setHeaders((prev) => [...prev, { key: "", value: "" }]);
  };

  const updateHeader = (index: number, field: keyof Header, value: string) => {
    setHeaders((prev) => prev.map((header, idx) => (idx === index ? { ...header, [field]: value } : header)));
  };

  const removeHeader = (index: number) => {
    setHeaders((prev) => prev.filter((_, idx) => idx !== index));
  };

  const sendRequest = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResponse(null);
    setResponseStatus(null);
    setResponseHeaders({});

    try {
      const requestHeaders = headers.reduce<Record<string, string>>((accumulator, current) => {
        if (current.key && current.value) accumulator[current.key] = current.value;
        return accumulator;
      }, {});

      const options: RequestInit = { method, headers: requestHeaders };

      if (method !== "GET" && body.trim()) {
        options.body = body;
      }

      const res = await fetch(url, options);
      setResponseStatus(res.status);

      const nextHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        nextHeaders[key] = value;
      });
      setResponseHeaders(nextHeaders);

      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("json")) {
        setResponse(await res.json());
        return;
      }

      const textBody = await res.text();
      setResponse(textBody);
    } catch (error) {
      setResponseStatus(0);
      setResponse(error instanceof Error ? { error: error.message } : { error: "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  const saveRequest = () => {
    if (!requestName.trim() || !url.trim()) return;
    const snapshot: SavedRequest = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name: requestName.trim(),
      url: url.trim(),
      method,
      headers: headers.filter((header) => header.key || header.value),
      body,
    };

    setSavedRequests((prev) => [snapshot, ...prev]);
    setRequestName("");
  };

  const loadRequest = (req: SavedRequest) => {
    setUrl(req.url);
    setMethod(req.method);
    setHeaders(req.headers.length ? req.headers : DEFAULT_HEADERS);
    setBody(req.body);
  };

  const deleteRequest = (id: string) => {
    setSavedRequests((prev) => prev.filter((request) => request.id !== id));
  };

  const formattedResponse = useMemo(() => {
    if (response === null) return "";
    if (typeof response === "string") return response;
    try {
      return JSON.stringify(response, null, 2);
    } catch {
      return String(response);
    }
  }, [response]);

  return (
    <div className={containerGlass}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className={`text-2xl font-semibold sm:text-3xl ${isDark ? "text-white" : "text-gray-900"}`}>
            API Request &amp; Response Playground
          </h2>
          <p className={`text-sm ${subtleText}`}>
            Build, send, and test HTTP requests with an instant preview of response status, headers, and body.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <Card className={`${cardGlass} shadow-sm`}>
          <CardContent className="flex flex-col gap-6 p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
                <Select value={method} onValueChange={(value) => setMethod(value as (typeof METHODS)[number])}>
                  <SelectTrigger className={`${fieldGlass} h-11 w-full md:w-32`}>
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {METHODS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex flex-col gap-3 md:flex-1 md:flex-row">
                  <Input
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://api.example.com/endpoint"
                    className={`${fieldGlass} h-11 w-full`}
                  />
                  <Button
                    type="button"
                    onClick={sendRequest}
                    disabled={loading}
                    className={`h-11 w-full md:w-auto ${isDark ? "bg-blue-500 hover:bg-blue-400 text-white" : ""}`}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {loading ? "Sending…" : "Send"}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Headers</Label>
                  <Button
                    type="button"
                    onClick={addHeader}
                    variant="outline"
                    size="sm"
                    className={`${fieldGlass} h-9 ${outlineButtonTone}`}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add header
                  </Button>
                </div>

                <div className="space-y-3">
                  {headers.map((header, index) => (
                    <div key={`header-${index}`} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex flex-col gap-3 sm:flex-1 sm:flex-row">
                        <Input
                          value={header.key}
                          onChange={(event) => updateHeader(index, "key", event.target.value)}
                          placeholder="Header name"
                          className={`${fieldGlass} h-10`}
                        />
                        <Input
                          value={header.value}
                          onChange={(event) => updateHeader(index, "value", event.target.value)}
                          placeholder="Header value"
                          className={`${fieldGlass} h-10`}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeHeader(index)}
                        variant="outline"
                        size="icon"
                        className={`${fieldGlass} h-10 w-full sm:w-10`}
                        aria-label={`Remove header ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {method !== "GET" && (
                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Body</Label>
                  <Textarea
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    placeholder='JSON or XML payload e.g. {"name":"Ada"}'
                    className={`${fieldGlass} min-h-[140px] font-mono text-sm`}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                value={requestName}
                onChange={(event) => setRequestName(event.target.value)}
                placeholder="Save request as…"
                className={`${fieldGlass} h-11 sm:flex-1`}
              />
              <Button
                type="button"
                onClick={saveRequest}
                variant="outline"
                className={`${fieldGlass} h-11 w-full sm:w-auto ${outlineButtonTone}`}
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardGlass} shadow-sm`}>
          <CardContent className="flex flex-col gap-4 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <Label className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Saved Requests</Label>
              <span className={`text-xs ${subtleText}`}>{savedRequests.length} total</span>
            </div>
            <div className="space-y-3 overflow-hidden rounded-xl border border-dashed border-gray-500/30">
              <div className="max-h-80 space-y-3 overflow-y-auto p-3">
                {savedRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`${buildGlassClass(isDark)} flex flex-col gap-3 rounded-xl border px-3 py-3 transition hover:border-primary/60 sm:flex-row sm:items-center sm:justify-between`}
                  >
                    <div className="min-w-0 space-y-1">
                      <p className={`truncate text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                        {request.name}
                      </p>
                      <p className={`truncate text-xs uppercase tracking-wide ${subtleText}`}>
                        {request.method} • {request.url}
                      </p>
                    </div>
                    <div className="flex w-full gap-2 sm:w-auto">
                      <Button
                        type="button"
                        onClick={() => loadRequest(request)}
                        variant="outline"
                        size="sm"
                        className={`${fieldGlass} w-full sm:w-auto ${outlineButtonTone}`}
                      >
                        Load
                      </Button>
                      <Button
                        type="button"
                        onClick={() => deleteRequest(request.id)}
                        variant="outline"
                        size="sm"
                        className={`${fieldGlass} w-full sm:w-10 sm:px-0 ${outlineButtonTone}`}
                        aria-label={`Delete ${request.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {savedRequests.length === 0 && (
                  <p className={`text-center text-sm ${subtleText}`}>Saved requests will appear here.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {response !== null && (
        <Card className={`${cardGlass} shadow-sm`}>
          <CardContent className="flex flex-col gap-4 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Label className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Response</Label>
                {responseStatus !== null && (
                  <Badge variant={responseStatus >= 200 && responseStatus < 300 ? "default" : "destructive"}>
                    {responseStatus}
                  </Badge>
                )}
              </div>
              <p className={`text-xs ${subtleText}`}>
                {Object.keys(responseHeaders).length} headers • {typeof response === "string" ? `${response.length} chars` : "JSON"}
              </p>
            </div>

            <Tabs defaultValue="body" className="w-full">
              <TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
                <TabsTrigger value="body" className={`${fieldGlass} h-9 px-4 text-xs sm:text-sm`}>
                  Body
                </TabsTrigger>
                <TabsTrigger value="headers" className={`${fieldGlass} h-9 px-4 text-xs sm:text-sm`}>
                  Headers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="body" className="mt-3">
                <pre
                  className={`${fieldGlass} max-h-[400px] overflow-auto rounded-xl border px-4 py-4 font-mono text-xs sm:text-sm`}
                >
                  {formattedResponse}
                </pre>
              </TabsContent>

              <TabsContent value="headers" className="mt-3">
                <pre
                  className={`${fieldGlass} max-h-[400px] overflow-auto rounded-xl border px-4 py-4 font-mono text-xs sm:text-sm`}
                >
                  {JSON.stringify(responseHeaders, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiRequestPlayground;
