import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, Type } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const loremWords = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit", "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
];

const generateLorem = (numParagraphs: number, length: 'short' | 'medium' | 'long') => {
  const wordsPerParagraph = length === 'short' ? 20 : length === 'medium' ? 50 : 100;
  const paragraphs = [];
  for (let p = 0; p < numParagraphs; p++) {
    let paragraph = '';
    for (let w = 0; w < wordsPerParagraph; w++) {
      paragraph += loremWords[Math.floor(Math.random() * loremWords.length)] + ' ';
    }
    paragraphs.push(paragraph.trim() + '.');
  }
  return paragraphs.join('\n\n');
};

export const LoremIpsumGenerator = () => {
  const [numParagraphs, setNumParagraphs] = useState(3);
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const generateText = () => {
    const text = generateLorem(numParagraphs, length);
    setGeneratedText(text);
  };

  const copyText = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-6 space-y-8 rounded-lg glass border ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Lorem Ipsum Content Generator</h2>
          <p className={`text-muted-foreground ${theme === 'dark' ? 'text-gray-300' : ''}`}>Generate placeholder text for design and development.</p>
        </div>
        <Button onClick={generateText} size="sm">
          <Type className="h-4 w-4 mr-2" />
          Generate
        </Button>
      </div>

      {/* Controls */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
        <div className="space-y-2">
          <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Number of Paragraphs</Label>
          <Input
            type="number"
            value={numParagraphs}
            onChange={(e) => setNumParagraphs(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            max={20}
            className="w-full glass"
          />
        </div>
        <div className="space-y-2">
          <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Length</Label>
          <Select value={length} onValueChange={(value: 'short' | 'medium' | 'long') => setLength(value)}>
            <SelectTrigger className="w-full glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Output */}
      {generatedText && (
        <div className={`space-y-2 glass p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
          <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Generated Content</Label>
          <div className="relative">
            <Textarea
              value={generatedText}
              readOnly
              className={`min-h-[200px] font-serif text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-muted/50'}`}
              placeholder="Generated lorem ipsum text will appear here..."
            />
            <Button
              onClick={copyText}
              className="absolute right-2 top-2 h-8 w-8 p-0"
              size="sm"
              variant={copied ? "default" : "outline"}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {copied && <p className="text-sm text-green-600">Copied to clipboard!</p>}
        </div>
      )}
    </div>
  );
};