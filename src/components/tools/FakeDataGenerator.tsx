import React, { useMemo, useState } from "react";

import { Copy, Download, Loader2, Wand2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type OutputFormat = "json" | "csv" | "sql" | "table";

type FieldKey = "name" | "email" | "phone" | "address" | "date" | "number";

interface FakeRow {
  [key: string]: string | number;
}

const AVAILABLE_FIELDS: { key: FieldKey; label: string }[] = [
  { key: "name", label: "Full Name" },
  { key: "email", label: "Email Address" },
  { key: "phone", label: "Phone Number" },
  { key: "address", label: "Address" },
  { key: "date", label: "Date" },
  { key: "number", label: "Random Number" },
];

const MIN_RECORDS = 1;
const MAX_RECORDS = 500;

export const FakeDataGenerator: React.FC = () => {
  const { toast } = useToast();

  const [count, setCount] = useState(25);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("json");
  const [selectedFields, setSelectedFields] = useState<Record<FieldKey, boolean>>({
    name: true,
    email: true,
    phone: false,
    address: false,
    date: false,
    number: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRows, setGeneratedRows] = useState<FakeRow[]>([]);
  const [generatedText, setGeneratedText] = useState("");

  const activeFields = useMemo(() => {
    const enabled = AVAILABLE_FIELDS.filter(field => selectedFields[field.key]);
    if (enabled.length === 0) {
      return AVAILABLE_FIELDS.slice(0, 2);
    }
    return enabled;
  }, [selectedFields]);

  const formattedPreviewFields = activeFields.map(field => field.label).join(" • ");

  const randomNumber = () => Math.floor(Math.random() * 10_000);

  const randomDate = () => {
    const now = Date.now();
    const offset = Math.floor(Math.random() * 365);
    return new Date(now - offset * 86400000).toISOString().split("T")[0];
  };

  const fakeName = (index: number) => {
    const firstNames = ["Jordan", "Harper", "Maya", "Elliott", "Carter", "Riley", "Indigo", "Kai"];
    const lastNames = ["Rivera", "Adams", "Hayes", "Singh", "Osei", "Garcia", "Lopez", "Zhu"];
    return `${firstNames[index % firstNames.length]} ${lastNames[(index * 3) % lastNames.length]}`;
  };

  const fakeEmail = (name: string, index: number) => {
    const handle = name.toLowerCase().replace(/[^a-z]/g, ".");
    const domains = ["example.com", "creativemail.com", "product.dev", "teamhub.io"];
    return `${handle}.${index + 1}@${domains[index % domains.length]}`;
  };

  const fakePhone = (index: number) => {
    const base = 1000 + (index % 9000);
    return `+1-555-${String(base).padStart(4, "0")}`;
  };

  const fakeAddress = (index: number) => {
    const streets = ["Maple", "Ridge", "Market", "Harbor", "Sunset", "Park", "Cypress", "Oak"];
    const cities = ["Seattle", "Austin", "Denver", "Portland", "Toronto", "Chicago"];
    const street = streets[index % streets.length];
    const city = cities[(index * 2) % cities.length];
    return `${index + 17} ${street} Ave, ${city}, ${19000 + index}`;
  };

  const generateRows = (total: number) => {
    const rows: FakeRow[] = [];

    for (let i = 0; i < total; i += 1) {
      const name = fakeName(i);
      const record: FakeRow = {};

      activeFields.forEach(field => {
        switch (field.key) {
          case "name":
            record.name = name;
            break;
          case "email":
            record.email = fakeEmail(name, i);
            break;
          case "phone":
            record.phone = fakePhone(i);
            break;
          case "address":
            record.address = fakeAddress(i);
            break;
          case "date":
            record.date = randomDate();
            break;
          case "number":
            record.number = randomNumber();
            break;
          default:
            break;
        }
      });

      rows.push(record);
    }

    return rows;
  };

  const formatRows = (rows: FakeRow[], format: OutputFormat) => {
    if (rows.length === 0) {
      return "";
    }

    switch (format) {
      case "json":
        return JSON.stringify(rows, null, 2);
      case "csv": {
        const headers = Object.keys(rows[0]);
        const data = rows.map(row =>
          headers
            .map(header => {
              const value = row[header] ?? "";
              const needsQuotes = typeof value === "string" && /[",\n]/.test(value);
              const escaped = typeof value === "string" ? value.replace(/"/g, '""') : value;
              return needsQuotes ? `"${escaped}"` : escaped;
            })
            .join(","),
        );
        return [headers.join(","), ...data].join("\n");
      }
      case "sql": {
        const tableName = "fake_data";
        const columns = Object.keys(rows[0]);
        const values = rows
          .map(row =>
            `(${columns
              .map(column => {
                const value = row[column];
                if (typeof value === "number") return value;
                return `'${String(value).replace(/'/g, "''")}'`;
              })
              .join(", ")})`,
          )
          .join(",\n");
        return `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES\n${values};`;
      }
      case "table":
      default: {
        const headers = Object.keys(rows[0]);
        const headerRow = `| ${headers.join(" | ")} |`;
        const divider = `| ${headers.map(() => "---").join(" | ")} |`;
        const body = rows
          .map(row => `| ${headers.map(header => row[header] ?? "").join(" | ")} |`)
          .join("\n");
        return [headerRow, divider, body].join("\n");
      }
    }
  };

  const handleGenerate = async () => {
    if (count < MIN_RECORDS || count > MAX_RECORDS) {
      toast({
        title: "Invalid record count",
        description: `Choose a value between ${MIN_RECORDS} and ${MAX_RECORDS}.`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const rows = generateRows(count);
      const formatted = formatRows(rows, outputFormat);
      setGeneratedRows(rows);
      setGeneratedText(formatted);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedText) return;

    const extension = outputFormat === "table" ? "md" : outputFormat;
    const blob = new Blob([generatedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `fake-data.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!generatedText) return;
    await navigator.clipboard.writeText(generatedText);
    toast({
      title: "Copied to clipboard",
      description: "Your fake data is ready to paste.",
    });
  };

  const toggleField = (field: FieldKey, checked: boolean) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: checked,
    }));
  };

  const setAllFields = (enabled: boolean) => {
    const next: Record<FieldKey, boolean> = {
      name: enabled,
      email: enabled,
      phone: enabled,
      address: enabled,
      date: enabled,
      number: enabled,
    };
    setSelectedFields(next);
  };

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-3xl text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Fake Data Generator</h1>
        <p className="text-lg text-muted-foreground">
          Create lightweight mock datasets for prototyping, demos, and API testing in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Choose how many rows to generate, the output format, and the fields you want to include.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="record-count" className="text-sm font-medium">
                Number of records
              </Label>
              <Input
                id="record-count"
                type="number"
                min={MIN_RECORDS}
                max={MAX_RECORDS}
                value={count}
                onChange={event => setCount(Number(event.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Generate between {MIN_RECORDS} and {MAX_RECORDS} rows. Large datasets may take longer to download.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Output format</Label>
              <Select value={outputFormat} onValueChange={value => setOutputFormat(value as OutputFormat)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="sql">SQL INSERT</SelectItem>
                  <SelectItem value="table">Markdown table</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Label className="text-sm font-medium">Fields to include</Label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setAllFields(true)}>
                    Select all
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setAllFields(false)}>
                    Clear all
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {AVAILABLE_FIELDS.map(({ key, label }) => (
                  <label
                    key={key}
                    htmlFor={`field-${key}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background/70 px-3 py-2 text-sm shadow-sm"
                  >
                    <Checkbox
                      id={`field-${key}`}
                      checked={!!selectedFields[key]}
                      onCheckedChange={checked => toggleField(key, Boolean(checked))}
                    />
                    <span className="font-medium text-foreground">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerate} className="w-full" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate data
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="glass lg:col-start-2">
          <CardHeader>
            <CardTitle>Generated dataset</CardTitle>
            <CardDescription>
              Preview the generated mock data, then copy or download it in your chosen format.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Fields: {formattedPreviewFields} — {generatedRows.length} records
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!generatedText}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!generatedText}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>

            <Textarea
              value={generatedText}
              readOnly
              placeholder="Generated data will appear here..."
              className="min-h-[28rem] font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
