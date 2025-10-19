import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Monitor, Smartphone, Tablet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LayoutElement {
  id: string;
  type: 'header' | 'nav' | 'main' | 'sidebar' | 'footer';
  content: string;
  styles: Record<string, string>;
}

export const ResponsiveLayoutBuilder = () => {
  const [elements, setElements] = useState<LayoutElement[]>([
    { id: 'header', type: 'header', content: 'Header', styles: { backgroundColor: '#f0f0f0', padding: '1rem' } },
    { id: 'nav', type: 'nav', content: 'Navigation', styles: { backgroundColor: '#e0e0e0', padding: '0.5rem' } },
    { id: 'main', type: 'main', content: 'Main Content', styles: { backgroundColor: '#ffffff', padding: '1rem', minHeight: '200px' } },
    { id: 'sidebar', type: 'sidebar', content: 'Sidebar', styles: { backgroundColor: '#f8f8f8', padding: '1rem' } },
    { id: 'footer', type: 'footer', content: 'Footer', styles: { backgroundColor: '#f0f0f0', padding: '1rem' } },
  ]);
  const [selectedElement, setSelectedElement] = useState<string>('header');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const { toast } = useToast();

  const updateElement = (id: string, updates: Partial<LayoutElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const generateCSS = () => {
    const css = elements.map(el => `
.${el.type} {
  ${Object.entries(el.styles).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`).join('\n  ')}
}`).join('\n');

    const responsiveCSS = `
/* Desktop */
@media (min-width: 1024px) {
  .container {
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    grid-template-rows: auto auto 1fr auto;
    grid-template-areas:
      "header header header"
      "nav nav nav"
      "sidebar main main"
      "footer footer footer";
    gap: 1rem;
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .container {
    display: grid;
    grid-template-columns: 1fr 2fr;
    grid-template-rows: auto auto 1fr auto;
    grid-template-areas:
      "header header"
      "nav nav"
      "sidebar main"
      "footer footer";
    gap: 1rem;
  }
}

/* Mobile */
@media (max-width: 767px) {
  .container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}

${css}
`;

    return responsiveCSS;
  };

  const generateHTML = () => {
    return `
<div class="container">
  ${elements.map(el => `<div class="${el.type}" style="${Object.entries(el.styles).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}">${el.content}</div>`).join('\n  ')}
</div>
`;
  };

  const handleCopy = (type: 'css' | 'html') => {
    const content = type === 'css' ? generateCSS() : generateHTML();
    navigator.clipboard.writeText(content);
    toast({
      title: `${type.toUpperCase()} Copied!`,
      description: `The ${type} code has been copied to clipboard.`,
    });
  };

  const currentElement = elements.find(el => el.id === selectedElement);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Responsive Layout Builder</h2>
        <p className="text-foreground">
          Build responsive layouts with CSS Grid and Flexbox. Preview on different devices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="glass lg:col-span-1">
          <CardHeader>
            <CardTitle>Layout Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Element</Label>
              <Select value={selectedElement} onValueChange={setSelectedElement}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {elements.map(el => (
                    <SelectItem key={el.id} value={el.id}>
                      {el.type.charAt(0).toUpperCase() + el.type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentElement && (
              <>
                <div>
                  <Label>Content</Label>
                  <Input
                    value={currentElement.content}
                    onChange={(e) => updateElement(currentElement.id, { content: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Background Color</Label>
                  <Input
                    type="color"
                    value={currentElement.styles.backgroundColor || '#ffffff'}
                    onChange={(e) => updateElement(currentElement.id, {
                      styles: { ...currentElement.styles, backgroundColor: e.target.value }
                    })}
                    className="w-full h-10"
                  />
                </div>

                <div>
                  <Label>Padding</Label>
                  <Input
                    value={currentElement.styles.padding || '1rem'}
                    onChange={(e) => updateElement(currentElement.id, {
                      styles: { ...currentElement.styles, padding: e.target.value }
                    })}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Live Preview</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={viewport === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewport('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewport === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewport('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewport === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewport('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed border-muted rounded-lg bg-background/50 p-4 ${
                viewport === 'desktop' ? 'w-full' :
                viewport === 'tablet' ? 'w-3/4 mx-auto' : 'w-1/2 mx-auto'
              }`}
              style={{
                minHeight: '400px',
                display: viewport === 'mobile' ? 'flex' : 'grid',
                flexDirection: viewport === 'mobile' ? 'column' : undefined,
                gridTemplateColumns: viewport === 'desktop' ? '1fr 3fr 1fr' :
                                   viewport === 'tablet' ? '1fr 2fr' : undefined,
                gridTemplateRows: viewport !== 'mobile' ? 'auto auto 1fr auto' : undefined,
                gridTemplateAreas: viewport !== 'mobile' ?
                  `"header header header"
                   "nav nav nav"
                   "sidebar main main"
                   "footer footer footer"` : undefined,
                gap: '1rem',
              }}
            >
              {elements.map(el => (
                <div
                  key={el.id}
                  className="rounded border text-center flex items-center justify-center"
                  style={{
                    ...el.styles,
                    gridArea: viewport !== 'mobile' ? el.type : undefined,
                  }}
                >
                  {el.content}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Code Output */}
      <Tabs defaultValue="css" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
        </TabsList>
        <TabsContent value="css">
          <Card className="glass">
            <CardHeader>
              <CardTitle>CSS Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto font-mono border max-h-96 overflow-y-auto">
                  {generateCSS()}
                </pre>
                <Button
                  onClick={() => handleCopy('css')}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="outline"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy CSS
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="html">
          <Card className="glass">
            <CardHeader>
              <CardTitle>HTML Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto font-mono border">
                  {generateHTML()}
                </pre>
                <Button
                  onClick={() => handleCopy('html')}
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="outline"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy HTML
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
