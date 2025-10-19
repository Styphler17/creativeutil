import React, { useEffect, useMemo, useRef, useState } from "react";

import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

type BlockKey =
  | "hero"
  | "header"
  | "nav"
  | "navHeader"
  | "articleCard"
  | "profileCard"
  | "intro"
  | "text"
  | "button"
  | "image"
  | "twoColumn"
  | "featureList"
  | "testimonial"
  | "callout"
  | "footer"
  | "spacer"
  | "divider"
  | "social";

const EMAIL_BLOCKS: Record<BlockKey, string> = {
  hero: `<section style="background-color: #0f172a; color: #f8fafc; padding: 48px 24px; text-align: center;">
  <h1 style="margin: 0 0 16px; font-size: 28px; line-height: 1.2;">Launch Something Extraordinary</h1>
  <p style="margin: 0 auto 24px; max-width: 520px; line-height: 1.6;">
    Introduce your campaign with a bold hero statement that captures attention and invites the reader to scroll.
  </p>
  <a href="#" style="background-color: #38bdf8; color: #0f172a; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-weight: 600;">
    Explore Now
  </a>
</section>`,
  header: `<header style="background: #f8fafc; padding: 20px; text-align: center;">
  <h2 style="margin: 0; font-size: 24px; color: #0f172a;">Your Newsletter Title</h2>
</header>`,
  nav: `<nav role="navigation" aria-label="Primary" style="background-color: #0f172a; color: #f8fafc; padding: 18px 24px;">
  <style>
    @media only screen and (max-width: 600px) {
      .stack-nav td {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
      }
      .stack-nav-links a {
        display: inline-block !important;
        margin: 8px 12px !important;
      }
    }
  </style>
  <table class="stack-nav" role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="border-collapse: collapse;">
    <tr>
      <td style="font-weight: 700; font-size: 18px; padding-bottom: 8px;">BrandName</td>
      <td class="stack-nav-links" align="right">
        <a href="#" style="color: #38bdf8; text-decoration: none; margin-left: 16px;">Product</a>
        <a href="#" style="color: #38bdf8; text-decoration: none; margin-left: 16px;">Pricing</a>
        <a href="#" style="color: #38bdf8; text-decoration: none; margin-left: 16px;">Resources</a>
        <a href="#" style="color: #38bdf8; text-decoration: none; margin-left: 16px;">Contact</a>
      </td>
    </tr>
  </table>
</nav>`,
  navHeader: `<header style="background: linear-gradient(135deg, #0f172a, #1d4ed8); color: #f8fafc;">
  <style>
    @media only screen and (max-width: 600px) {
      .stack-nav-header td {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
      }
      .stack-nav-header-links a {
        display: inline-block !important;
        margin: 8px 12px !important;
      }
      .stack-nav-header-copy {
        text-align: center !important;
      }
    }
  </style>
  <table class="stack-nav-header" role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="border-collapse: collapse; padding: 32px 24px;">
    <tr>
      <td style="font-weight: 700; font-size: 20px; padding-bottom: 8px;">CreativeLaunch</td>
      <td class="stack-nav-header-links" align="right">
        <a href="#" style="color: #bae6fd; text-decoration: none; margin-left: 16px;">Overview</a>
        <a href="#" style="color: #bae6fd; text-decoration: none; margin-left: 16px;">Case Studies</a>
        <a href="#" style="color: #bae6fd; text-decoration: none; margin-left: 16px;">Partners</a>
      </td>
    </tr>
  </table>
  <div style="padding: 32px 24px; text-align: left;">
    <h1 class="stack-nav-header-copy" style="margin: 0 0 12px; font-size: 30px; line-height: 1.2;">Launch your next big release with confidence</h1>
    <p class="stack-nav-header-copy" style="margin: 0 0 20px; max-width: 520px; line-height: 1.6;">
      Introduce your announcement with a clean navigation bar, prominent hero copy, and an optional secondary action.
    </p>
    <a href="#" style="display: inline-block; background-color: #38bdf8; color: #0f172a; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-weight: 600;">
      Explore the launch checklist
    </a>
  </div>
</header>`,
  articleCard: `<article style="padding: 28px; background-color: #ffffff; color: #111827; border: 1px solid #e5e7eb; border-radius: 16px;">
  <header style="margin-bottom: 16px;">
    <p style="margin: 0 0 8px; font-size: 13px; color: #6366f1; letter-spacing: 0.05em; text-transform: uppercase;">Featured Insight</p>
    <h2 style="margin: 0; font-size: 22px; line-height: 1.4;">Build persuasive campaign narratives in three steps</h2>
  </header>
  <p style="margin: 0 0 16px; line-height: 1.7;">Share a short summary or teaser for the article. Keep it concise so readers are encouraged to click through to your full story.</p>
  <footer style="display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: #6b7280;">
    <span>By Maya Singh</span>
    <a href="#" style="color: #2563eb; text-decoration: none; font-weight: 600;">Read more &rarr;</a>
  </footer>
</article>`,
  profileCard: `<article style="padding: 24px; background-color: #ffffff; color: #111827; border: 1px solid #e5e7eb; border-radius: 16px; text-align: center;">
  <figure style="margin: 0 0 16px;">
    <img src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=240&q=80" alt="Team member headshot" style="width: 96px; height: 96px; border-radius: 50%; object-fit: cover;">
    <figcaption style="margin-top: 8px; font-size: 12px; color: #6b7280;">Photo via Unsplash</figcaption>
  </figure>
  <h3 style="margin: 0 0 4px; font-size: 18px;">Jordan Blake</h3>
  <p style="margin: 0 0 16px; font-size: 13px; color: #6b7280;">Customer Success Lead</p>
  <p style="margin: 0 0 20px; line-height: 1.6;">"A short testimonial or introduction works well here. Keep it friendly and focused on the outcome you delivered."</p>
  <div>
    <a href="#" style="color: #2563eb; text-decoration: none; font-weight: 600; margin-right: 16px;">LinkedIn</a>
    <a href="#" style="color: #2563eb; text-decoration: none; font-weight: 600;">Portfolio</a>
  </div>
</article>`,
  intro: `<section style="padding: 24px; background-color: #ffffff; color: #1f2937;">
  <h3 style="margin: 0 0 12px; font-size: 20px;">Hey there 👋</h3>
  <p style="margin: 0; line-height: 1.6;">
    Kick off your email with a friendly introduction that sets expectations for the content to follow.
  </p>
</section>`,
  text: `<section style="padding: 24px; background-color: #ffffff; color: #1f2937;">
  <p style="margin: 0; line-height: 1.7;">
    Share your story, product update, or announcement. Break long paragraphs into smaller sections for better readability on mobile devices.
  </p>
</section>`,
  button: `<div style="text-align: center; padding: 24px;">
  <a href="#" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 999px; text-decoration: none; font-weight: 600; letter-spacing: 0.5px;">
    Call To Action
  </a>
</div>`,
  image: `<figure style="margin: 0; text-align: center; padding: 24px; background-color: #ffffff;">
  <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80" alt="Creative workspace" style="max-width: 100%; height: auto; border-radius: 12px;">
  <figcaption style="margin-top: 12px; font-size: 13px; color: #6b7280;">Photo via Unsplash</figcaption>
</figure>`,
  twoColumn: `<section style="padding: 24px; background-color: #ffffff;">
  <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="border-collapse: collapse;">
    <tr>
      <td style="padding: 0 12px; width: 50%; vertical-align: top;">
        <h3 style="margin: 0 0 12px; color: #0f172a;">Feature Highlight</h3>
        <p style="margin: 0; line-height: 1.6; color: #1f2937;">
          Outline a key benefit or story. Keep the copy succinct so it works on smaller screens.
        </p>
      </td>
      <td style="padding: 0 12px; width: 50%; vertical-align: top;">
        <h3 style="margin: 0 0 12px; color: #0f172a;">Key Stat</h3>
        <p style="margin: 0; line-height: 1.6; color: #1f2937;">
          Pair your narrative with a supporting metric or testimonial for extra credibility.
        </p>
      </td>
    </tr>
  </table>
</section>`,
  featureList: `<section style="padding: 24px; background-color: #0f172a; color: #f8fafc;">
  <h3 style="margin: 0 0 16px;">Why teams choose us</h3>
  <ul style="padding: 0; margin: 0; list-style: none; line-height: 1.7;">
    <li style="margin-bottom: 12px;">&bull; Clear value proposition and onboarding journey</li>
    <li style="margin-bottom: 12px;">&bull; Thoughtfully designed collaboration tools</li>
    <li style="margin: 0;">&bull; Dedicated support with 2-hour response SLA</li>
  </ul>
</section>`,
  testimonial: `<article style="padding: 32px; background-color: #f8fafc; color: #111827;">
  <blockquote style="margin: 0; font-style: italic; line-height: 1.7;">
    "This platform transformed how we launch campaigns. Our team now ships creative stories twice as fast."
  </blockquote>
  <p style="margin: 16px 0 0; font-weight: 600;">- Alex Rivera, Product Marketing Lead</p>
</article>`,
  callout: `<section style="padding: 24px; background-color: #fbbf24; color: #0f172a; text-align: center;">
  <h3 style="margin: 0 0 12px;">Limited Time Bonus</h3>
  <p style="margin: 0;">Reply to this email before Friday and unlock a complimentary strategy session.</p>
</section>`,
  footer: `<footer style="background: #0f172a; padding: 24px; text-align: center; color: #9ca3af; font-size: 13px;">
  <p style="margin: 0 0 12px;">You are receiving this email because you subscribed at example.com</p>
  <p style="margin: 0;">123 Creative Avenue, Suite 200, San Francisco, CA</p>
  <a href="#" style="color: #38bdf8; text-decoration: none; display: inline-block; margin-top: 12px;">Unsubscribe</a>
</footer>`,
  spacer: `<div style="height: 32px; background-color: transparent;"></div>`,
  divider: `<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;">`,
  social: `<section style="padding: 24px; background-color: #ffffff; text-align: center; color: #1f2937;">
  <p style="margin: 0 0 16px; font-weight: 600;">Stay connected</p>
  <p style="margin: 0 0 20px; line-height: 1.6;">Follow us for fresh inspiration, resources, and behind-the-scenes updates.</p>
  <div style="display: inline-flex; gap: 12px;">
    <a href="#" style="color: #2563eb; text-decoration: none;">Instagram</a>
    <a href="#" style="color: #2563eb; text-decoration: none;">LinkedIn</a>
    <a href="#" style="color: #2563eb; text-decoration: none;">YouTube</a>
  </div>
</section>`,
};

const BLOCK_PALETTE: { type: BlockKey; label: string; icon: string; description: string }[] = [
  { type: "hero", label: "Hero Banner", icon: "[HB]", description: "Bold headline with CTA" },
  { type: "header", label: "Header", icon: "[HD]", description: "Logo-friendly intro area" },
  { type: "nav", label: "Navigation Bar", icon: "[NV]", description: "Primary email navigation links" },
  { type: "navHeader", label: "Nav + Hero", icon: "[NH]", description: "Navigation paired with hero copy" },
  { type: "articleCard", label: "Article Card", icon: "[AC]", description: "Linked feature story preview" },
  { type: "profileCard", label: "Profile Card", icon: "[PC]", description: "Team member spotlight" },
  { type: "intro", label: "Intro Text", icon: "[IN]", description: "Warm greeting copy" },
  { type: "text", label: "Body Text", icon: "[TX]", description: "WYSIWYG paragraph block" },
  { type: "image", label: "Featured Image", icon: "[IM]", description: "Unsplash hero visual" },
  { type: "twoColumn", label: "Two-Column", icon: "[2C]", description: "Responsive layout pair" },
  { type: "featureList", label: "Feature List", icon: "[FL]", description: "Checklist of benefits" },
  { type: "testimonial", label: "Testimonial", icon: "[TS]", description: "Quote with attribution" },
  { type: "callout", label: "Callout Banner", icon: "[CB]", description: "Accent message bar" },
  { type: "button", label: "CTA Button", icon: "[CT]", description: "Primary conversion link" },
  { type: "social", label: "Social Links", icon: "[SN]", description: "Invite subscribers to connect" },
  { type: "divider", label: "Divider Line", icon: "[DV]", description: "Visual separation" },
  { type: "spacer", label: "Spacer", icon: "[SP]", description: "Breathing room between sections" },
  { type: "footer", label: "Footer", icon: "[FT]", description: "Compliance & contact info" },
];

export const HtmlEmailTemplateBuilder: React.FC = () => {
  const [template, setTemplate] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [blocks, setBlocks] = useState<
    Array<{ id: string; key: BlockKey; label: string; html: string }>
  >([]);
  const [blockSearch, setBlockSearch] = useState("");
  const [currentLibraryPage, setCurrentLibraryPage] = useState(1);

  const { toast } = useToast();
  const manualEditNotifiedRef = useRef(false);

  const blocksPerPage = 6;

  const filteredBlocks = useMemo(() => {
    const query = blockSearch.trim().toLowerCase();
    if (!query) {
      return BLOCK_PALETTE;
    }
    return BLOCK_PALETTE.filter(
      ({ label, description }) =>
        label.toLowerCase().includes(query) || description.toLowerCase().includes(query),
    );
  }, [blockSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredBlocks.length / blocksPerPage));

  const paginatedBlocks = useMemo(() => {
    const start = (currentLibraryPage - 1) * blocksPerPage;
    return filteredBlocks.slice(start, start + blocksPerPage);
  }, [filteredBlocks, currentLibraryPage]);

  const goToPrevPage = () => setCurrentLibraryPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentLibraryPage(prev => Math.min(totalPages, prev + 1));

  useEffect(() => {
    if (currentLibraryPage > totalPages) {
      setCurrentLibraryPage(totalPages);
    }
  }, [currentLibraryPage, totalPages]);

  const syncTemplateFromBlocks = (nextBlocks: typeof blocks) => {
    const nextTemplate = nextBlocks.map(block => block.html).join("\n\n");
    setTemplate(nextTemplate);
  };

  const addBlock = (blockType: BlockKey) => {
    manualEditNotifiedRef.current = false;
    const html = EMAIL_BLOCKS[blockType];
    if (!html) return;

    const paletteMeta = BLOCK_PALETTE.find(block => block.type === blockType);
    const label = paletteMeta?.label ?? blockType;

    const block = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      key: blockType,
      label,
      html,
    };

    setBlocks(prev => {
      const next = [...prev, block];
      syncTemplateFromBlocks(next);
      return next;
    });
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => {
      const next = prev.filter(block => block.id !== id);
      syncTemplateFromBlocks(next);
      return next;
    });
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    setBlocks(prev => {
      const index = prev.findIndex(block => block.id === id);
      if (index === -1) return prev;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }

      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);

      syncTemplateFromBlocks(next);
      return next;
    });
  };

  const clearBlocks = () => {
    setBlocks([]);
    setTemplate("");
    manualEditNotifiedRef.current = false;
  };

  const handleTemplateChange = (value: string) => {
    if (blocks.length > 0 && !manualEditNotifiedRef.current) {
      toast({
        title: "Manual edit mode",
        description: "Blocks were cleared so the editor matches your custom HTML.",
      });
      manualEditNotifiedRef.current = true;
      setBlocks([]);
    }
    setTemplate(value);
  };

  const handleExport = () => {
    const fullTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  ${template}
</body>
</html>`;

    const blob = new Blob([fullTemplate], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "email-template.html";
    anchor.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Template exported",
      description: "We generated email-template.html and saved it to your downloads.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-3xl text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">HTML Email Template Builder</h1>
        <p className="text-lg text-muted-foreground">
          Assemble campaign-ready emails by mixing reusable layout blocks, editing the markup, and previewing the
          result in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.3fr)_minmax(0,0.9fr)]">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Block Library</CardTitle>
            <CardDescription>
              Mix and match responsive sections that follow common email design conventions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={blockSearch}
              onChange={event => {
                setBlockSearch(event.target.value);
                setCurrentLibraryPage(1);
              }}
              placeholder="Search blocks..."
              className="h-10"
            />

            <div className="grid grid-cols-1 gap-3">
              {paginatedBlocks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-muted bg-card/70 px-4 py-6 text-center text-sm text-muted-foreground">
                  No blocks match your search yet. Try another keyword.
                </div>
              ) : (
                paginatedBlocks.map(({ type, label, icon, description }) => (
                  <Button
                    key={type}
                    type="button"
                    variant="outline"
                    onClick={() => addBlock(type)}
                    className="h-auto justify-start gap-3 rounded-xl border border-border bg-background/70 px-4 py-4 text-left shadow-sm transition hover:bg-background"
                  >
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                      {icon}
                    </span>
                    <span className="flex flex-1 flex-col items-start gap-1">
                      <span className="text-base font-semibold text-foreground">{label}</span>
                      <span className="text-sm text-muted-foreground">{description}</span>
                    </span>
                  </Button>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Page {currentLibraryPage}</span>
                  <span>{totalPages} total</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={currentLibraryPage === 1}
                  >
                    Previous
                  </Button>
                  <Slider
                    className="flex-1"
                    min={1}
                    max={totalPages}
                    step={1}
                    value={[currentLibraryPage]}
                    onValueChange={value => {
                      let next = Array.isArray(value) ? value[0] : Number(value);
                      if (!Number.isFinite(next)) {
                        next = 1;
                      }
                      next = Math.min(Math.max(Math.round(next), 1), totalPages);
                      setCurrentLibraryPage(next);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentLibraryPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button onClick={handleExport} className="w-full">
              Export HTML
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={clearBlocks}
              disabled={!blocks.length}
            >
              Clear all blocks
            </Button>
          </CardFooter>
        </Card>

        <Card className="glass">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle>Template Editor</CardTitle>
                <CardDescription>
                  Drop in new blocks, reorder them, or fine-tune the markup before sending to your ESP.
                </CardDescription>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => setPreviewMode(!previewMode)}>
                {previewMode ? "Back to editor" : "Preview markup"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 rounded-xl border border-dashed border-muted bg-card/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Active blocks</span>
                <span className="text-xs text-muted-foreground">{blocks.length} total</span>
              </div>
              {blocks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Added blocks will appear here for quick reordering and removal. Editing the raw HTML clears this list.
                </p>
              ) : (
                <div className="space-y-2">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-background/80 px-3 py-2 text-sm shadow-sm"
                    >
                      <span className="font-medium text-foreground">
                        {index + 1}. {block.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => moveBlock(block.id, "up")}
                          disabled={index === 0}
                        >
                          Move up
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => moveBlock(block.id, "down")}
                          disabled={index === blocks.length - 1}
                        >
                          Move down
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeBlock(block.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {previewMode ? (
              <div className="rounded-xl border border-border bg-card/70 p-4">
                <iframe
                  srcDoc={`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                      </head>
                      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
                        ${template}
                      </body>
                      </html>
                    `}
                  className="h-[28rem] w-full rounded-lg border border-dashed border-muted"
                  title="Email Preview"
                />
              </div>
            ) : (
              <Textarea
                value={template}
                onChange={event => handleTemplateChange(event.target.value)}
                placeholder="Drag blocks or write HTML here..."
                className="min-h-[26rem] font-mono text-sm"
              />
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              Render the current markup with your brand colours to sanity-check spacing and copy flow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[24rem] rounded-xl border border-dashed border-muted bg-card/70 p-6 text-sm shadow-sm">
              {template.trim() ? (
                <div dangerouslySetInnerHTML={{ __html: template }} />
              ) : (
                <div className="text-sm text-muted-foreground">
                  Add a block from the library or start writing HTML to preview your design.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Tips for sharper campaigns</CardTitle>
          <CardDescription>
            Keep these reminders nearby as you iterate toward a polished, inbox-friendly design.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Pair concise headlines with body copy under ~120 words for top-of-fold clarity.</li>
            <li>Use dividers and spacers to create rhythm—especially on mobile layouts.</li>
            <li>Replace the stock Unsplash image with a compressed JPG (≤ 1MB) before launch.</li>
            <li>Always send a test email to verify dark-mode behaviour and link tracking.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
