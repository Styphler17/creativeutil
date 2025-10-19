import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Plus, Minus, Table as TableIcon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export const HTMLTableBuilder = () => {
  const [rows, setRows] = useState(3);
  const [columns, setColumns] = useState(3);
  const [tableData, setTableData] = useState<string[][]>(Array.from({ length: 3 }, () => Array(3).fill("")));
  const [showPreview, setShowPreview] = useState(true);
  const { theme } = useTheme();

  const addRow = () => {
    setRows(prev => prev + 1);
    setTableData(prev => [...prev, Array(columns).fill("")]);
  };

  const removeRow = () => {
    if (rows > 1) {
      setRows(prev => prev - 1);
      setTableData(prev => prev.slice(0, -1));
    }
  };

  const addColumn = () => {
    setColumns(prev => prev + 1);
    setTableData(prev => prev.map(row => [...row, ""]));
  };

  const removeColumn = () => {
    if (columns > 1) {
      setColumns(prev => prev - 1);
      setTableData(prev => prev.map(row => row.slice(0, -1)));
    }
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex] = value;
    setTableData(newData);
  };

  const generateHTML = () => {
    let html = `<table border="1" style="border-collapse: collapse; width: 100%;">\n`;
    html += "  <thead>\n    <tr>\n";
    for (let col = 0; col < columns; col++) {
      html += `      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">${tableData[0][col] || `Column ${col + 1}`}</th>\n`;
    }
    html += "    </tr>\n  </thead>\n  <tbody>\n";
    for (let row = 1; row < rows; row++) {
      html += "    <tr>\n";
      for (let col = 0; col < columns; col++) {
        html += `      <td style="padding: 8px; border: 1px solid #ddd;">${tableData[row][col]}</td>\n`;
      }
      html += "    </tr>\n";
    }
    html += "  </tbody>\n</table>";
    return html;
  };

  const copyHTML = () => {
    navigator.clipboard.writeText(generateHTML());
    // Add feedback toast if needed
  };

  return (
    <div className={`p-6 space-y-8 rounded-lg glass border ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'} max-w-7xl`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>HTML Table Builder</h2>
          <p className={`text-muted-foreground ${theme === 'dark' ? 'text-gray-300' : ''}`}>Build tables with easy controls and export HTML code.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addRow} size="sm" className={`${theme === 'dark' ? 'text-white' : ''}`}>
            <Plus className="h-4 w-4 mr-1" /> Add Row
          </Button>
          <Button variant="outline" onClick={removeRow} size="sm" disabled={rows <= 1} className={`${theme === 'dark' ? 'text-white' : ''}`}>
            <Minus className="h-4 w-4 mr-1" /> Remove Row
          </Button>
          <Button variant="outline" onClick={addColumn} size="sm" className={`${theme === 'dark' ? 'text-white' : ''}`}>
            <Plus className="h-4 w-4 mr-1" /> Add Column
          </Button>
          <Button variant="outline" onClick={removeColumn} size="sm" disabled={columns <= 1} className={`${theme === 'dark' ? 'text-white' : ''}`}>
            <Minus className="h-4 w-4 mr-1" /> Remove Column
          </Button>
        </div>
      </div>

      {/* Table Editor */}
      <div className={`p-2 grid grid-cols-1 gap-2 overflow-x-auto glass rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
        {tableData.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((cell, colIndex) => (
              <Input
                key={colIndex}
                value={cell}
                onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                placeholder={`R${rowIndex + 1}, C${colIndex + 1}`}
                className="flex-1 min-w-[100px] glass"
              />
            ))}
          </div>
        ))}
      </div>

      {/* Preview Toggle */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setShowPreview(!showPreview)} size="sm" className={`${theme === 'dark' ? 'text-white' : ''}`}>
          {showPreview ? "Hide" : "Show"} Preview
        </Button>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>
          Rows: {rows} | Columns: {columns}
        </div>
      </div>

      {/* Live Preview */}
      {showPreview && (
        <div className={`border rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-background/50'}`}>
          <Table>
            <TableHeader>
              <TableRow className={`${theme === 'dark' ? 'border-gray-700' : ''}`}>
                {tableData[0]?.map((header, index) => (
                  <TableHead key={index} className={`${theme === 'dark' ? 'text-white' : ''}`}>{header || `Column ${index + 1}`}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.slice(1).map((row, rowIndex) => (
                <TableRow key={rowIndex} className={`${theme === 'dark' ? 'border-gray-700' : ''}`}>
                  {row.map((cell, colIndex) => (
                    <TableCell key={colIndex} className={`${theme === 'dark' ? 'text-gray-300' : ''}`}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Export HTML */}
      <div className={`space-y-2 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
        <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Export HTML Code</Label>
        <div className="relative">
          <Textarea
            value={generateHTML()}
            readOnly
            className="min-h-[200px] font-mono text-sm glass"
            placeholder="Your HTML table code will appear here..."
          />
          <Button onClick={copyHTML} className="absolute right-2 top-2 h-8 w-8 p-0" size="sm">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>Click the copy button to copy the HTML code to clipboard.</p>
      </div>
    </div>
  );
};
