import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Download, FileUp, FileText } from "lucide-react";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import { Document, Packer, Paragraph } from "docx";
import PptxGenJS from "pptxgenjs";
import * as XLSX from "xlsx";
import JSZip from "jszip";

type OutputFormat = "docx" | "xlsx" | "pptx" | "txt" | "png" | "jpg" | "html";

interface ConvertedFile {
  name: string;
  size: number;
  blob: Blob;
}

const outputLabels: Record<OutputFormat, string> = {
  docx: "Word (DOCX)",
  xlsx: "Excel (XLSX)",
  pptx: "PowerPoint (PPTX)",
  txt: "Plain text (TXT)",
  png: "PNG image",
  jpg: "JPG image",
  html: "HTML file",
};

const formatOptions: OutputFormat[] = ["docx", "xlsx", "pptx", "txt", "png", "jpg", "html"];

const parsePageSelection = (value: string, totalPages: number): number[] => {
  if (!value.trim()) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set<number>();
  value
    .split(",")
    .map((segment) => segment.trim())
    .forEach((segment) => {
      if (!segment) return;
      if (segment.includes("-")) {
        const [startStr, endStr] = segment.split("-").map((part) => part.trim());
        const start = Number(startStr);
        const end = Number(endStr);
        if (!Number.isNaN(start) && !Number.isNaN(end)) {
          for (let page = Math.max(1, Math.min(start, end)); page <= Math.min(totalPages, Math.max(start, end)); page += 1) {
            pages.add(page);
          }
        }
      } else {
        const page = Number(segment);
        if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
          pages.add(page);
        }
      }
    });
  return Array.from(pages).sort((a, b) => a - b);
};

export const PdfFileConverter = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>("docx");
  const [pageSelection, setPageSelection] = useState<string>("");
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [infoMessage, setInfoMessage] = useState<string>("");

  useEffect(() => {
    // Use CDN for PDF.js worker to avoid loading issues
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadMeta = async () => {
      if (!selectedFile) {
        setTotalPages(0);
        return;
      }
      try {
        const data = new Uint8Array(await selectedFile.arrayBuffer());
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        if (!cancelled) {
          setTotalPages(pdf.numPages);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to read PDF metadata. Make sure the file is not encrypted.");
      }
    };
    loadMeta();
    return () => {
      cancelled = true;
    };
  }, [selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    resetState();
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    setSelectedFile(file);
  };

  const resetState = () => {
    setConvertedFiles([]);
    setError("");
    setProgress(0);
    setInfoMessage("");
  };

  const handleDownloadAll = async () => {
    if (convertedFiles.length === 0) return;
    if (convertedFiles.length === 1) {
      const file = convertedFiles[0];
      saveAs(file.blob, file.name);
      return;
    }
    const zip = new JSZip();
    convertedFiles.forEach((file) => {
      zip.file(file.name, file.blob);
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "creativeutil-pdf-conversions.zip");
  };

  const processConversion = async () => {
    if (!selectedFile) {
      setError("Upload a PDF to begin.");
      return;
    }
    setIsConverting(true);
    setConvertedFiles([]);
    setError("");
    setInfoMessage("");
    setProgress(5);
    try {
      const data = new Uint8Array(await selectedFile.arrayBuffer());
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      const pagesToProcess = parsePageSelection(pageSelection, pdf.numPages);
      if (pagesToProcess.length === 0) {
        setError("No valid pages selected. Adjust the page selection input.");
        setIsConverting(false);
        return;
      }
      const results: ConvertedFile[] = [];
      const textPerPage: string[] = [];
      const htmlPerPage: string[] = [];
      const imageBlobs: { page: number; blob: Blob }[] = [];

      for (let index = 0; index < pagesToProcess.length; index += 1) {
        const pageNumber = pagesToProcess[index];
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item) => ("str" in item ? item.str : "")).join(" ").trim();
        textPerPage.push(`Page ${pageNumber}\n${text}\n`);
        htmlPerPage.push(`<section data-page="${pageNumber}"><h2>Page ${pageNumber}</h2><p>${text.replace(/\n/g, "<br />") || " "}</p></section>`);
        if (selectedFormat === "png" || selectedFormat === "jpg") {
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            const blob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob((result) => resolve(result), selectedFormat === "png" ? "image/png" : "image/jpeg", selectedFormat === "png" ? undefined : 0.92)
            );
            if (blob) {
              imageBlobs.push({ page: pageNumber, blob });
            }
          }
        }
        setProgress(Math.round(((index + 1) / pagesToProcess.length) * 70));
      }

      if (selectedFormat === "txt") {
        const blob = new Blob(textPerPage, { type: "text/plain;charset=utf-8" });
        results.push({ name: replaceExt(selectedFile.name, "txt"), size: blob.size, blob });
      } else if (selectedFormat === "html") {
        const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${selectedFile.name}</title></head><body>${htmlPerPage.join("")}</body></html>`;
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        results.push({ name: replaceExt(selectedFile.name, "html"), size: blob.size, blob });
      } else if (selectedFormat === "docx") {
        const doc = new Document({
          sections: [
            {
              children: textPerPage.map((content) => new Paragraph({ text: content })),
            },
          ],
        });
        const buffer = await Packer.toBlob(doc);
        results.push({ name: replaceExt(selectedFile.name, "docx"), size: buffer.size, blob: buffer });
      } else if (selectedFormat === "xlsx") {
        const worksheetData = textPerPage.map((pageText, idx) => ({ Page: pagesToProcess[idx], Content: pageText.trim() || "(empty)" }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted_Text");
        const wbout = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
        const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        results.push({ name: replaceExt(selectedFile.name, "xlsx"), size: blob.size, blob });
      } else if (selectedFormat === "pptx") {
        const pptx = new PptxGenJS();
        textPerPage.forEach((pageText, idx) => {
          const slide = pptx.addSlide();
          slide.addText(`Page ${pagesToProcess[idx]}`, { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: "203764" });
          slide.addText(pageText || "(empty page)", { x: 0.5, y: 1.2, fontSize: 14, color: "1A1A1A", w: "90%", h: "70%", valign: "top" });
        });
        const buffer = await pptx.write({ outputType: "blob" });
        results.push({ name: replaceExt(selectedFile.name, "pptx"), size: (buffer as Blob).size, blob: buffer as Blob });
      } else if (selectedFormat === "png" || selectedFormat === "jpg") {
        if (imageBlobs.length === 0) {
          throw new Error("No pages rendered to images. Try selecting different pages.");
        }
        if (imageBlobs.length === 1) {
          const entry = imageBlobs[0];
          results.push({
            name: `${stripExtension(selectedFile.name)}-page-${entry.page}.${selectedFormat}`,
            size: entry.blob.size,
            blob: entry.blob,
          });
        } else {
          const zip = new JSZip();
          imageBlobs.forEach((entry) => {
            zip.file(`${stripExtension(selectedFile.name)}-page-${entry.page}.${selectedFormat}`, entry.blob);
          });
          const zipBlob = await zip.generateAsync({ type: "blob" });
          results.push({
            name: `${stripExtension(selectedFile.name)}-${selectedFormat}-pages.zip`,
            size: zipBlob.size,
            blob: zipBlob,
          });
        }
      }

      setConvertedFiles(results);
      setInfoMessage(`Converted ${pagesToProcess.length} page${pagesToProcess.length > 1 ? "s" : ""} to ${outputLabels[selectedFormat]}.`);
      setProgress(100);
    } catch (err) {
      console.error(err);
      setError("Conversion failed. This PDF may be encrypted or not supported for offline conversion.");
    } finally {
      setIsConverting(false);
    }
  };

  const formattedFileSize = useMemo(() => {
    if (!selectedFile) return "";
    const size = selectedFile.size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }, [selectedFile]);

  return (
    <div className={`space-y-6 p-4 md:p-8 rounded-xl bg-white/50 dark:bg-gray-900/50`}>
      <Card className="border-2 border-dashed">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileUp className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Upload PDF</h2>
              <p className="text-sm text-muted-foreground">Select a PDF (max 50MB) to convert without using any external APIs.</p>
            </div>
          </div>
          <Input id="pdf-upload" type="file" accept="application/pdf" onChange={handleFileChange} />
          {selectedFile && (
            <div className="rounded-lg border bg-muted/50 p-4 text-sm space-y-1">
              <p><strong>Name:</strong> {selectedFile.name}</p>
              <p><strong>Size:</strong> {formattedFileSize}</p>
              <p><strong>Pages:</strong> {totalPages > 0 ? totalPages : "Loading..."}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="format">Output format</Label>
              <Select value={selectedFormat} onValueChange={(value: OutputFormat) => setSelectedFormat(value)}>
                <SelectTrigger id="format">
                  <SelectValue placeholder="Choose target format" />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {outputLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pages">Page selection (optional)</Label>
              <Input
                id="pages"
                placeholder="e.g. 1-3,5"
                value={pageSelection}
                onChange={(event) => setPageSelection(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">Leave blank for all pages. Use commas and ranges (e.g. 1, 3-5).</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Button
              onClick={processConversion}
              disabled={!selectedFile || isConverting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isConverting ? "Converting..." : "Convert PDF"}
            </Button>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>All conversions run locally in your browser.</span>
            </div>
          </div>

          {isConverting && (
            <div className="space-y-2">
              <Progress value={progress} aria-label="Conversion progress" />
              <p className="text-sm text-muted-foreground">Processing selected pages — this may take a moment for large PDFs.</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {infoMessage && (
            <Alert>
              <AlertDescription>{infoMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {convertedFiles.length > 0 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-lg font-semibold">Converted files</h3>
                <p className="text-sm text-muted-foreground">
                  Download individual files or grab everything in a single ZIP package.
                </p>
              </div>
              <Button onClick={handleDownloadAll} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download {convertedFiles.length > 1 ? "All" : "File"}
              </Button>
            </div>
            <div className="grid gap-3">
              {convertedFiles.map((file) => (
                <div key={file.name} className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 p-4">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                  </div>
                  <Button variant="ghost" onClick={() => saveAs(file.blob, file.name)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
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

const replaceExt = (name: string, ext: string) => `${stripExtension(name)}.${ext}`;

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default PdfFileConverter;
