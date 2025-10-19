import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Download,
  Upload,
  RefreshCcw,
  BarChart3,
  AlertCircle,
  ClipboardList,
  Plus,
  ArrowUpDown,
  Filter,
  Table,
  LayoutGrid,
  Circle,
  Percent,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CsvRow = string[];

type SummaryMetrics = {
  rowCount: number;
  columnCount: number;
  emptyCellCount: number;
  completeness: number;
};

const defaultCsv = "Name,Role\nLena,Designer\nArjun,Engineer\nMaya,Product Manager";
const NONE_VALUE = "__none__";

const parseCsv = (csv: string): { headers: string[]; rows: CsvRow[] } => {
  const result = Papa.parse<string[]>(csv, { skipEmptyLines: true });

  if (result.errors.length > 0) {
    throw new Error(result.errors[0].message);
  }

  if (!result.data.length) {
    throw new Error("CSV is empty.");
  }

  const [headerRow, ...restRows] = result.data;
  const columnCount = headerRow.length;

  if (columnCount === 0) {
    throw new Error("No columns detected in CSV.");
  }

  const normalizedRows = restRows.map((row) => {
    const cells = [...row];
    if (cells.length < columnCount) {
      return [...cells, ...Array(columnCount - cells.length).fill("")];
    }
    if (cells.length > columnCount) {
      return cells.slice(0, columnCount);
    }
    return cells;
  });

  return { headers: headerRow, rows: normalizedRows };
};

export const CsvEditorAnalyzer = () => {
  const { toast } = useToast();
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [rawCsv, setRawCsv] = useState<string>(defaultCsv);
  const [filterColumn, setFilterColumn] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [chartColumn, setChartColumn] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");

  const hasData = headers.length > 0;

  const applyCsv = useCallback(
    (csv: string) => {
      const parsed = parseCsv(csv);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      return parsed;
    },
    [setHeaders, setRows],
  );

  useEffect(() => {
    try {
      const parsed = applyCsv(defaultCsv);
      setError("");
      setStatusMessage(`Loaded sample CSV with ${parsed.rows.length} rows.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load starter CSV.");
    }
  }, [applyCsv]);

  const summary = useMemo<SummaryMetrics>(() => {
    const rowCount = rows.length;
    const columnCount = headers.length;
    const totalCells = rowCount * columnCount;
    const emptyCellCount = rows.reduce((acc, row) => acc + row.filter((cell) => cell.trim() === "").length, 0);
    const completeness =
      totalCells === 0 ? 100 : Math.round(((totalCells - emptyCellCount) / totalCells) * 100);

    return {
      rowCount,
      columnCount,
      emptyCellCount,
      completeness,
    };
  }, [rows, headers]);

  const filteredRows = useMemo(() => {
    if (!filterColumn || !filterValue) {
      return rows;
    }
    const index = headers.indexOf(filterColumn);
    if (index === -1) {
      return rows;
    }
    const searchTerm = filterValue.toLowerCase();
    return rows.filter((row) => (row[index] || "").toLowerCase().includes(searchTerm));
  }, [filterColumn, filterValue, headers, rows]);

  const sortedRows = useMemo(() => {
    if (!sortColumn) {
      return filteredRows;
    }
    const index = headers.indexOf(sortColumn);
    if (index === -1) {
      return filteredRows;
    }
    return [...filteredRows].sort((a, b) => {
      const aVal = (a[index] || "").toLowerCase();
      const bVal = (b[index] || "").toLowerCase();
      if (aVal < bVal) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredRows, headers, sortColumn, sortDirection]);

  const chartData = useMemo(() => {
    if (!chartColumn) {
      return [];
    }
    const index = headers.indexOf(chartColumn);
    if (index === -1) {
      return [];
    }
    const counts: Record<string, number> = {};
    rows.forEach((row) => {
      const key = row[index] || "(blank)";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [rows, headers, chartColumn]);

  const handleCsvInput = () => {
    try {
      const parsed = applyCsv(rawCsv);
      setError("");
      setStatusMessage(`Parsed CSV with ${parsed.rows.length} rows and ${parsed.headers.length} columns.`);
      toast({
        title: "CSV parsed",
        description: "Your data is ready for filtering, sorting, and export.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to parse CSV input.";
      setError(message);
      toast({
        title: "Unable to parse CSV",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const parsed = applyCsv(text);
      setRawCsv(text);
      setError("");
      setStatusMessage(`Loaded ${file.name} (${parsed.rows.length} rows).`);
      toast({
        title: "CSV loaded",
        description: `${file.name} imported successfully.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to read CSV file.";
      setError(message);
      toast({
        title: "File import failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    setRows((prev) => {
      const clone = prev.map((row) => [...row]);
      if (!clone[rowIdx]) {
        return prev;
      }
      clone[rowIdx][colIdx] = value;
      return clone;
    });
  };

  const addRow = () => {
    if (!hasData) {
      return;
    }
    setRows((prev) => [...prev, Array(headers.length).fill("")]);
    setStatusMessage("Added a blank row to the dataset.");
  };

  const addColumn = () => {
    if (!hasData) {
      return;
    }
    const newHeader = `Column ${headers.length + 1}`;
    setHeaders((prev) => [...prev, newHeader]);
    setRows((prev) => prev.map((row) => [...row, ""]));
    setStatusMessage(`Added ${newHeader}.`);
  };

  const downloadCsv = () => {
    if (!hasData) {
      return;
    }
    const csv = Papa.unparse([headers, ...rows]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    triggerBlobDownload(blob, "creativeutil-edited.csv");
    toast({
      title: "CSV downloaded",
      description: "creativeutil-edited.csv saved to your device.",
    });
  };

  const copyAsHtml = async () => {
    if (!hasData) {
      return;
    }
    const html = `
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows
            .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
            .join("")}
        </tbody>
      </table>
    `;
    try {
      await navigator.clipboard.writeText(html.trim());
      setStatusMessage("Table HTML copied to clipboard.");
      toast({
        title: "HTML copied",
        description: "Formatted table HTML is ready to paste.",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Your browser blocked clipboard access.",
        variant: "destructive",
      });
    }
  };

  const downloadAsExcel = () => {
    if (!hasData) {
      return;
    }
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CreativeUtil CSV");
    const wbout = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    triggerBlobDownload(blob, "creativeutil.csv.xlsx");
    toast({
      title: "Excel exported",
      description: "creativeutil.csv.xlsx saved to your device.",
    });
  };

  const reset = () => {
    try {
      const parsed = applyCsv(defaultCsv);
      setRawCsv(defaultCsv);
      setFilterColumn("");
      setFilterValue("");
      setSortColumn("");
      setSortDirection("asc");
      setChartColumn("");
      setError("");
      setStatusMessage(`Reset to starter CSV (${parsed.rows.length} rows).`);
      toast({
        title: "Reset complete",
        description: "Restored the original CreativeUtil sample CSV.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to reset CSV.";
      setError(message);
      toast({
        title: "Reset failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const columnOptions = headers.map((header) => (
    <SelectItem key={header} value={header}>
      {header}
    </SelectItem>
  ));

  const filterActive = Boolean(filterColumn && filterValue);
  const sortActive = Boolean(sortColumn);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>CSV Editor & Analyzer</CardTitle>
            <CardDescription>
              Clean, transform, and explore comma separated data without leaving the browser. All processing
              happens locally.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <label className="inline-flex cursor-pointer items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload CSV
              <input type="file" accept=".csv,text/csv" hidden onChange={handleFileUpload} />
            </label>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-input">CSV input</Label>
            <Textarea
              id="csv-input"
              value={rawCsv}
              onChange={(event) => setRawCsv(event.target.value)}
              rows={8}
              className="font-mono text-sm leading-6"
              placeholder="Paste CSV data here..."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCsvInput} className="gap-2">
              <Table className="h-4 w-4" />
              Parse CSV
            </Button>
            <Button variant="outline" onClick={reset} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
          {error && (
            <Alert variant="destructive" className="border-destructive/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {statusMessage && !error && (
            <Alert>
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {hasData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Dataset overview</CardTitle>
              <CardDescription>Quick stats to understand completeness before you start transforming.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                  icon={Table}
                  label="Rows"
                  value={summary.rowCount.toLocaleString()}
                  helper="Including header"
                />
                <SummaryCard
                  icon={LayoutGrid}
                  label="Columns"
                  value={summary.columnCount.toLocaleString()}
                  helper="Detected fields"
                />
                <SummaryCard
                  icon={Circle}
                  label="Empty cells"
                  value={summary.emptyCellCount.toLocaleString()}
                  helper="Missing values"
                />
                <SummaryCard
                  icon={Percent}
                  label="Completeness"
                  value={`${summary.completeness}%`}
                  helper="Non-empty cells"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center gap-2">
              <Badge variant={filterActive ? "secondary" : "outline"} className="gap-1">
                <Filter className="h-3 w-3" />
                {filterActive ? `${filteredRows.length} rows match filter` : "No filters applied"}
              </Badge>
              <Badge variant={sortActive ? "secondary" : "outline"} className="gap-1">
                <ArrowUpDown className="h-3 w-3" />
                {sortActive ? `Sorted by ${sortColumn} (${sortDirection})` : "No sorting"}
              </Badge>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transform</CardTitle>
              <CardDescription>Filter, sort, visualize, and enrich your dataset.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-4">
                <div className="space-y-3">
                  <Label>Filter column</Label>
                  <Select
                    value={filterColumn || NONE_VALUE}
                    onValueChange={(value) => setFilterColumn(value === NONE_VALUE ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All columns" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>All columns</SelectItem>
                      {columnOptions}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Contains..."
                    value={filterValue}
                    onChange={(event) => setFilterValue(event.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Sort by</Label>
                  <Select
                    value={sortColumn || NONE_VALUE}
                    onValueChange={(value) => setSortColumn(value === NONE_VALUE ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Order unchanged" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>Original order</SelectItem>
                      {columnOptions}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
                    className="gap-2"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    {sortDirection === "asc" ? "Ascending" : "Descending"}
                  </Button>
                </div>

                <div className="space-y-3">
                  <Label>Chart column</Label>
                  <Select
                    value={chartColumn || NONE_VALUE}
                    onValueChange={(value) => setChartColumn(value === NONE_VALUE ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No chart" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>No chart</SelectItem>
                      {columnOptions}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    View the value distribution for any categorical column.
                  </p>
                </div>

                <div className="flex flex-col gap-3 lg:justify-end">
                  <Button variant="outline" onClick={addRow} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add row
                  </Button>
                  <Button variant="outline" onClick={addColumn} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add column
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={downloadCsv} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download CSV
                </Button>
                <Button variant="outline" onClick={downloadAsExcel} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Excel
                </Button>
                <Button variant="outline" onClick={copyAsHtml} className="gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Copy table HTML
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Edit cells</CardTitle>
              <CardDescription>Click any cell to edit its value. Changes update charts and exports immediately.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full border-b border-border text-sm">
                  <thead className="sticky top-0 z-10 bg-muted">
                    <tr>
                      {headers.map((header, index) => (
                        <th
                          key={header}
                          className="border-b border-border px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground"
                        >
                          {header || `Column ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRows.map((row, rowIndex) => (
                      <tr key={`${rowIndex}-${row.join("|")}`} className="border-b border-border/80">
                        {row.map((cell, cellIndex) => (
                          <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-2 align-middle">
                            <Input
                              value={cell}
                              onChange={(event) => handleCellChange(rowIndex, cellIndex, event.target.value)}
                              className="h-9 text-sm"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sortedRows.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No rows match the current filters.
                </div>
              )}
            </CardContent>
          </Card>

          {chartColumn && chartData.length > 0 && (
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base md:text-lg">Column distribution</CardTitle>
                </div>
                <CardDescription>{chartColumn}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

type SummaryCardProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  helper?: string;
};

const SummaryCard = ({ icon: Icon, label, value, helper }: SummaryCardProps) => (
  <div className="rounded-xl border border-border/60 bg-muted/30 p-4 shadow-sm backdrop-blur">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-foreground">{value}</p>
        {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      </div>
    </div>
  </div>
);

const triggerBlobDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export default CsvEditorAnalyzer;
