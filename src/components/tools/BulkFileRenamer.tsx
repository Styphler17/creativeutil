import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import JSZip from "jszip";
import { Download, Files, RefreshCcw, AlertCircle } from "lucide-react";

interface RenameRule {
  prefix: string;
  suffix: string;
  startNumber: number;
  padding: number;
  replaceFrom: string;
  replaceTo: string;
}

interface FileEntry {
  file: File;
  previewName: string;
}

const defaultRule: RenameRule = {
  prefix: "",
  suffix: "",
  startNumber: 1,
  padding: 2,
  replaceFrom: "",
  replaceTo: "",
};

export const BulkFileRenamer = () => {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [rule, setRule] = useState<RenameRule>(defaultRule);
  const [error, setError] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const hasFiles = files.length > 0;

  const processedFiles = useMemo(() => {
    return files.map((entry, index) => {
      const ext = extractExtension(entry.file.name);
      const sequenceNumber = (rule.startNumber + index).toString().padStart(rule.padding, "0");
      let basename = stripExtension(entry.file.name);
      if (rule.replaceFrom) {
        try {
          const regex = new RegExp(rule.replaceFrom, "g");
          basename = basename.replace(regex, rule.replaceTo);
        } catch {
          // if invalid regex, treat as plain text
          basename = basename.split(rule.replaceFrom).join(rule.replaceTo);
        }
      }
      const newName = `${rule.prefix}${basename}${rule.suffix}${sequenceNumber}.${ext}`;
      return { original: entry.file, newName };
    });
  }, [files, rule]);

  const handleFiles = (fileList: FileList | null) => {
    setError("");
    setNotes("");
    if (!fileList || fileList.length === 0) return;
    const entries = Array.from(fileList).map((file) => ({
      file,
      previewName: file.name,
    }));
    setFiles(entries);
  };

  const updateRule = (key: keyof RenameRule, value: string) => {
    if (key === "startNumber" || key === "padding") {
      const numeric = Number(value);
      if (!Number.isNaN(numeric)) {
        setRule((prev) => ({ ...prev, [key]: numeric }));
      }
    } else {
      setRule((prev) => ({ ...prev, [key]: value }));
    }
  };

  const downloadZip = async () => {
    if (!hasFiles) return;
    try {
      const zip = new JSZip();
      processedFiles.forEach(({ original, newName }) => {
        zip.file(newName, original);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "creativeutil-renamed-files.zip";
      link.click();
      setNotes("Renamed archive generated. Actual files on your device remain untouched until you download.");
    } catch (err) {
      console.error(err);
      setError("Failed to generate ZIP archive.");
    }
  };

  const exportCsvLog = () => {
    if (!hasFiles) return;
    const rows = ["original,new"];
    processedFiles.forEach(({ original, newName }) => {
      rows.push(`"${original.name.replace(/"/g, '""')}","${newName.replace(/"/g, '""')}"`);
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "creativeutil-rename-log.csv";
    link.click();
  };

  const reset = () => {
    setFiles([]);
    setRule(defaultRule);
    setNotes("");
    setError("");
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Files className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Select files</h2>
              <p className="text-sm text-muted-foreground">Drop multiple files or choose them manually. Renaming happens locally — no uploads.</p>
            </div>
          </div>
          <Input type="file" multiple onChange={(event) => handleFiles(event.target.files)} />
          {hasFiles && (
            <Textarea
              readOnly
              value={files.map((entry) => entry.file.name).join("\n")}
              rows={4}
              className="font-mono text-xs"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prefix">Prefix</Label>
              <Input id="prefix" value={rule.prefix} onChange={(event) => updateRule("prefix", event.target.value)} placeholder="creativeutil-" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suffix">Suffix (before number)</Label>
              <Input id="suffix" value={rule.suffix} onChange={(event) => updateRule("suffix", event.target.value)} placeholder="-" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startNumber">Sequence start</Label>
              <Input id="startNumber" type="number" value={rule.startNumber} onChange={(event) => updateRule("startNumber", event.target.value)} min={0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="padding">Number padding</Label>
              <Input id="padding" type="number" value={rule.padding} onChange={(event) => updateRule("padding", event.target.value)} min={1} max={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="replaceFrom">Find</Label>
              <Input id="replaceFrom" value={rule.replaceFrom} onChange={(event) => updateRule("replaceFrom", event.target.value)} placeholder="e.g. draft" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="replaceTo">Replace with</Label>
              <Input id="replaceTo" value={rule.replaceTo} onChange={(event) => updateRule("replaceTo", event.target.value)} placeholder="final" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={downloadZip} disabled={!hasFiles} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download ZIP
            </Button>
            <Button variant="outline" onClick={exportCsvLog} disabled={!hasFiles}>
              Export CSV log
            </Button>
            <Button variant="outline" onClick={reset} className="flex items-center gap-2">
              <RefreshCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {notes && (
            <Alert>
              <AlertDescription>{notes}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {hasFiles && (
        <Card>
          <CardContent className="p-6 space-y-3">
            <h3 className="text-lg font-semibold">Preview</h3>
            <div className="grid gap-2">
              {processedFiles.map(({ original, newName }, index) => (
                <div key={`${original.name}-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border bg-muted/40 p-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Original</span>
                    <p className="font-mono text-xs md:text-sm">{original.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">New name</span>
                    <p className="font-mono text-xs md:text-sm text-primary">{newName}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const stripExtension = (name: string) => name.replace(/\.[^/.]+$/, "");

const extractExtension = (name: string) => {
  const match = /\.([^.]+)$/.exec(name);
  return match ? match[1] : "file";
};

export default BulkFileRenamer;
