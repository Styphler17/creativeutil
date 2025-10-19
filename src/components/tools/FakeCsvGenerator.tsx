import { useCallback, useMemo, useState } from "react";
import { Copy, Download, ListPlus, MonitorSmartphone, Trash2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type FieldType =
  | "fullName"
  | "firstName"
  | "lastName"
  | "email"
  | "jobTitle"
  | "company"
  | "country"
  | "city"
  | "streetAddress"
  | "phone"
  | "date"
  | "integer"
  | "float"
  | "uuid"
  | "sentence";

type SchemaField = { id: string; label: string; type: FieldType };

type FieldDefinition = { type: FieldType; label: string; description: string };

const FIELD_DEFINITIONS: FieldDefinition[] = [
  { type: "fullName", label: "Full Name", description: "Random first and last name" },
  { type: "firstName", label: "First Name", description: "Random given name" },
  { type: "lastName", label: "Last Name", description: "Random family name" },
  { type: "email", label: "Email", description: "Email built from the name" },
  { type: "jobTitle", label: "Job Title", description: "Sample creative job title" },
  { type: "company", label: "Company", description: "Fictional company name" },
  { type: "country", label: "Country", description: "Country from sample list" },
  { type: "city", label: "City", description: "City matched to random country" },
  { type: "streetAddress", label: "Street Address", description: "Street + number" },
  { type: "phone", label: "Phone", description: "Formatted North American number" },
  { type: "date", label: "ISO Date", description: "Date within the last 365 days" },
  { type: "integer", label: "Integer", description: "Whole number between 1 and 10,000" },
  { type: "float", label: "Decimal", description: "Decimal number between 0 and 100" },
  { type: "uuid", label: "UUID", description: "Random UUID v4 string" },
  { type: "sentence", label: "Sentence", description: "Short lorem sentence" },
];

const firstNames = ["Jordan", "Harper", "Maya", "Elliott", "Carter", "Riley", "Indigo", "Kai", "Morgan", "Sawyer"];
const lastNames = ["Rivera", "Adams", "Hayes", "Singh", "Osei", "Garcia", "Lopez", "Zhu", "Anderson", "Patel"];
const jobTitles = ["Product Designer", "Frontend Engineer", "Data Analyst", "Brand Strategist", "UX Researcher", "AI Specialist"];
const companies = ["Northwind Labs", "CreativeUtil", "Evergreen Systems", "Pixel Forge", "Brightside Ventures", "Atlas Works"];
const countries = ["USA", "Canada", "Germany", "Brazil", "Japan", "Australia", "UK", "Spain"];
const cities = ["Seattle", "Toronto", "Berlin", "Rio de Janeiro", "Tokyo", "Melbourne", "London", "Barcelona"];
const streets = ["Maple", "Ridge", "Market", "Harbor", "Sunset", "Park", "Cypress", "Oak", "Cedar", "Pine"];
const loremSnippets = [
  "Collaborate with stakeholders to ship great work.",
  "Prototype rapidly to uncover the best ideas.",
  "Focus on clarity, craft, and measurable impact.",
  "Turn rough concepts into polished user journeys.",
  "Communicate insights that unblock the team.",
  "Blend research, product thinking, and visual design.",
];

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10);

const DEFAULT_SCHEMA: SchemaField[] = [
  { id: createId(), label: "Full Name", type: "fullName" },
  { id: createId(), label: "Email", type: "email" },
  { id: createId(), label: "Company", type: "company" },
  { id: createId(), label: "Job Title", type: "jobTitle" },
];

const MIN_ROWS = 1;
const MAX_ROWS = 1000;

const randomItem = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomDateWithinYear = () => {
  const now = Date.now();
  const offset = randomInt(0, 364);
  return new Date(now - offset * 86400000);
};

const randomUuid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
        const rand = (Math.random() * 16) | 0;
        const value = char === "x" ? rand : (rand & 0x3) | 0x8;
        return value.toString(16);
      });

const buildColumnValue = (type: FieldType, rowIndex: number) => {
  switch (type) {
    case "fullName":
      return `${randomItem(firstNames)} ${randomItem(lastNames)}`;
    case "firstName":
      return randomItem(firstNames);
    case "lastName":
      return randomItem(lastNames);
    case "email": {
      const name = `${randomItem(firstNames)} ${randomItem(lastNames)}`.toLowerCase().replace(/[^a-z]/g, ".");
      const domains = ["teamhub.io", "creativeutil.com", "maildrop.co", "inbox.dev"];
      return `${name}.${rowIndex + 1}@${randomItem(domains)}`;
    }
    case "jobTitle":
      return randomItem(jobTitles);
    case "company":
      return randomItem(companies);
    case "country":
      return randomItem(countries);
    case "city":
      return randomItem(cities);
    case "streetAddress":
      return `${randomInt(11, 999)} ${randomItem(streets)} Ave`;
    case "phone":
      return `+1-555-${String(1000 + ((rowIndex * 83) % 9000)).padStart(4, "0")}`;
    case "date":
      return randomDateWithinYear().toISOString().split("T")[0];
    case "integer":
      return randomInt(1, 10000).toString();
    case "float":
      return (Math.random() * 100).toFixed(2);
    case "uuid":
      return randomUuid();
    case "sentence":
      return randomItem(loremSnippets);
    default:
      return "";
  }
};

const toCsv = (rows: string[][]) =>
  rows
    .map((row) =>
      row
        .map((cell) => {
          if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(","),
    )
    .join("\n");

export const FakeCsvGenerator = () => {
  const { toast } = useToast();
  const [rowCount, setRowCount] = useState(250);
  const [schema, setSchema] = useState<SchemaField[]>(DEFAULT_SCHEMA);
  const [delimiter, setDelimiter] = useState<"," | ";" | "\t">(",");

  const dataset = useMemo(() => {
    const headers = schema.map((field) => field.label.trim() || field.type);
    const rows: string[][] = [headers];

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      rows.push(schema.map((field) => buildColumnValue(field.type, rowIndex)));
    }

    return rows;
  }, [schema, rowCount]);

  const limitedPreview = useMemo(() => dataset.slice(0, Math.min(dataset.length, 11)), [dataset]);

  const csvString = useMemo(() => {
    if (delimiter === ",") {
      return toCsv(dataset);
    }

    return dataset.map((row) => row.map((cell) => cell.replace(/\t/g, " ")).join(delimiter)).join("\n");
  }, [dataset, delimiter]);

  const handleRowCountChange = (value: number) => {
    if (Number.isNaN(value)) return;
    const safe = Math.min(Math.max(value, MIN_ROWS), MAX_ROWS);
    setRowCount(safe);
  };

  const updateFieldLabel = (id: string, label: string) => {
    setSchema((prev) => prev.map((field) => (field.id === id ? { ...field, label } : field)));
  };

  const updateFieldType = (id: string, type: FieldType) => {
    setSchema((prev) => prev.map((field) => (field.id === id ? { ...field, type } : field)));
  };

  const addField = () => {
    const fallback = FIELD_DEFINITIONS[0];
    setSchema((prev) => [...prev, { id: createId(), label: fallback.label, type: fallback.type }]);
  };

  const removeField = (id: string) => {
    setSchema((prev) => prev.filter((field) => field.id !== id));
  };

  const downloadCsv = useCallback(() => {
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fake-data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 0);

    toast({
      title: "CSV downloaded",
      description: `${rowCount.toLocaleString()} rows saved to fake-data.csv.`,
    });
  }, [csvString, rowCount, toast]);

  const copyCsv = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(csvString);
      toast({
        title: "Copied to clipboard",
        description: "The generated CSV is ready to paste.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Your browser blocked clipboard access.",
        variant: "destructive",
      });
    }
  }, [csvString, toast]);

  return (
    <div className="space-y-6">
      <div className="md:hidden space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-amber-300/70 bg-amber-100/85 px-4 py-3 text-sm text-amber-800 shadow-sm">
          <MonitorSmartphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <p>
            This generator is optimized for desktop. Use a larger screen to edit columns and export CSVs without layout constraints.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Desktop Recommended</CardTitle>
            <CardDescription>
              You can copy small CSV snippets on mobile, but schema editing, previews, and bulk downloads are easier on tablets or desktops.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>&bull; Generate a few sample rows here, then copy the CSV text manually.</p>
            <p>&bull; For larger datasets or frequent edits, open this tool on a desktop browser.</p>
          </CardContent>
        </Card>
      </div>

      <div className="hidden flex-col gap-6 md:flex">
        <Card>
          <CardHeader className="flex flex-col gap-4 pb-6 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="text-2xl md:text-3xl">Fake CSV Data Generator</CardTitle>
              <CardDescription>
                Compose a schema, generate thousands of rows of realistic mock CSV data, and export instantly.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs uppercase tracking-wide">
              {rowCount.toLocaleString()} rows | {schema.length} columns
            </Badge>
          </CardHeader>

          <CardContent className="grid gap-10 lg:grid-cols-[minmax(0,360px)_1fr]">
            <div className="space-y-8">
              <section className="space-y-2">
                <Label htmlFor="row-count">Number of rows</Label>
                <Input
                  id="row-count"
                  type="number"
                  min={MIN_ROWS}
                  max={MAX_ROWS}
                  value={rowCount}
                  onChange={(event) => handleRowCountChange(Number(event.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Generate between {MIN_ROWS.toLocaleString()} and {MAX_ROWS.toLocaleString()} rows. For massive datasets consider slicing in
                  code.
                </p>
              </section>

              <section className="space-y-2">
                <Label htmlFor="delimiter">Delimiter</Label>
                <Select value={delimiter} onValueChange={(value) => setDelimiter(value as "," | ";" | "\t")}>
                  <SelectTrigger id="delimiter" className="w-full">
                    <SelectValue placeholder="Select delimiter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=",">Comma separated (,)</SelectItem>
                    <SelectItem value=";">Semicolon (;)</SelectItem>
                    <SelectItem value="\t">Tab separated</SelectItem>
                  </SelectContent>
                </Select>
              </section>

              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Label>Columns</Label>
                  <Button type="button" variant="outline" onClick={addField} className="h-12 w-full gap-2 sm:w-auto">
                    <ListPlus className="h-4 w-4" />
                    Add column
                  </Button>
                </div>

                <div className="space-y-4">
                  {schema.map((field, index) => (
                    <div key={field.id} className="flex flex-col gap-4 rounded-xl border border-border/60 bg-muted/40 p-6 shadow-sm backdrop-blur">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Column {index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-12 w-full sm:w-auto"
                          onClick={() => removeField(field.id)}
                          disabled={schema.length <= 1}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-3">
                          <Label htmlFor={`label-${field.id}`} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Header label
                          </Label>
                          <Input
                            id={`label-${field.id}`}
                            value={field.label}
                            onChange={(event) => updateFieldLabel(field.id, event.target.value)}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Data type</Label>
                          <Select value={field.type} onValueChange={(value) => updateFieldType(field.id, value as FieldType)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {FIELD_DEFINITIONS.map((definition) => (
                                <SelectItem key={definition.type} value={definition.type}>
                                  <div>
                                    <p className="font-medium text-foreground">{definition.label}</p>
                                    <p className="text-xs text-muted-foreground">{definition.description}</p>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">Preview</h3>
                    <p className="text-xs text-muted-foreground">Showing first {Math.min(10, rowCount)} rows.</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap md:justify-end md:gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={copyCsv}
                      disabled={dataset.length === 0}
                      className="h-12 w-full sm:w-auto"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy CSV
                    </Button>
                    <Button
                      type="button"
                      onClick={downloadCsv}
                      disabled={dataset.length === 0}
                      className="h-12 w-full sm:w-auto"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border/60 bg-background/70 shadow-sm">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {schema.map((field) => (
                          <th
                            key={field.id}
                            className="border-b border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                          >
                            {field.label.trim() || field.type}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {limitedPreview.slice(1).map((row, rowIndex) => (
                        <tr key={`preview-${rowIndex}`} className="border-b border-border/40">
                          {row.map((cell, cellIndex) => (
                            <td key={`preview-${rowIndex}-${cellIndex}`} className="whitespace-nowrap px-3 py-2 text-foreground">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {limitedPreview.length <= 1 && (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">No rows generated yet.</div>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  CSV output preview
                </Label>
                <div className="overflow-x-auto rounded-lg border border-border/60 bg-background/70 shadow-sm">
                  <Textarea
                    value={csvString.slice(0, 8000)}
                    readOnly
                    className="min-h-[240px] w-full resize-none border-0 bg-transparent font-mono text-xs leading-5"
                    placeholder="Generated CSV will appear here..."
                  />
                </div>
                {csvString.length > 8000 && (
                  <p className="text-xs text-muted-foreground">
                    Preview truncated for readability. Use copy or export to access the full dataset.
                  </p>
                )}
              </section>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
            <CardDescription>Pair this generator with the CSV Editor to clean, template, or enrich datasets after export.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              &bull; Use <strong>tab-separated</strong> output when pasting into spreadsheets that interpret commas as decimal separators.
            </p>
            <p>&bull; Increase realism by renaming headers to match your production schema. Labels are baked into the export.</p>
            <p>&bull; Need custom data types? Duplicate this tool and swap the generator functions with your own logic.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FakeCsvGenerator;
