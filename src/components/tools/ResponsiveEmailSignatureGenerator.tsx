import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Copy,
  Download,
  Facebook,
  Globe,
  Layout,
  Link as LinkIcon,
  Linkedin,
  Mail,
  Palette,
  Phone,
  RefreshCcw,
  Share,
  Smartphone,
  Twitter,
  User,
  Info,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type LayoutPreset = "classic" | "modern" | "banner";
type PhotoShape = "circle" | "rounded" | "square";
type SocialPlatform = "LinkedIn" | "Twitter" | "Facebook" | "Website" | "Custom";

type SocialLink = {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
};

const randomId = () => Math.random().toString(36).slice(2, 8);

const DEFAULT_SOCIALS: SocialLink[] = [
  { id: randomId(), platform: "LinkedIn", label: "LinkedIn", url: "https://linkedin.com/in/username" },
  { id: randomId(), platform: "Twitter", label: "Twitter", url: "https://twitter.com/username" },
];

const FONT_OPTIONS = ["Inter", "Arial", "Roboto", "Georgia", "Calibri", "Helvetica"];

const LAYOUT_OPTIONS: Array<{ value: LayoutPreset; label: string; description: string }> = [
  { value: "classic", label: "Classic", description: "Avatar on the left, details stacked to the right." },
  { value: "modern", label: "Modern", description: "Text-first with photo tile on the edge." },
  { value: "banner", label: "Banner", description: "Bold header stripe with optional promotional banner." },
];

const DEFAULT_DISCLAIMER =
  "Confidentiality Notice: This message may contain proprietary information. If you are not the intended recipient, please delete it.";
const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=640&q=80";
const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80";

const getPlatformIcon = (platform: SocialPlatform) => {
  switch (platform) {
    case "LinkedIn":
      return <Linkedin className="h-4 w-4" />;
    case "Twitter":
      return <Twitter className="h-4 w-4" />;
    case "Facebook":
      return <Facebook className="h-4 w-4" />;
    case "Website":
      return <Globe className="h-4 w-4" />;
    default:
      return <LinkIcon className="h-4 w-4" />;
  }
};

const luminance = (color: string) => {
  const clean = color.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

const pickAccessibleText = (background: string) => (luminance(background) > 0.6 ? "#0f172a" : "#ffffff");

export const ResponsiveEmailSignatureGenerator = () => {
  const { toast } = useToast();

  const [fullName, setFullName] = useState("Jordan Rivera");
  const [role, setRole] = useState("Lead Product Designer");
  const [company, setCompany] = useState("CreativeUtil");
  const [email, setEmail] = useState("jordan@creativeutil.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [website, setWebsite] = useState("https://creativeutil.com");
  const [address, setAddress] = useState("San Francisco, CA");
  const [photoUrl, setPhotoUrl] = useState(DEFAULT_PHOTO);

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(DEFAULT_SOCIALS);
  const [layout, setLayout] = useState<LayoutPreset>("classic");
  const [photoShape, setPhotoShape] = useState<PhotoShape>("rounded");

  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [accentColor, setAccentColor] = useState("#f97316");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#0f172a");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState(14);

  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [disclaimer, setDisclaimer] = useState(DEFAULT_DISCLAIMER);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerUrl, setBannerUrl] = useState(DEFAULT_BANNER);
  const [showUsageGuide, setShowUsageGuide] = useState(true);

  const photoBorderRadius = useMemo(() => {
    switch (photoShape) {
      case "circle":
        return "999px";
      case "square":
        return "4px";
      default:
        return "16px";
    }
  }, [photoShape]);
  const contactRows = useMemo(() => {
    const rows: Array<{ icon: string; label: string }> = [];
    const makeIcon = (glyph: string) =>
      `<span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;background:${primaryColor};color:${pickAccessibleText(
        primaryColor,
      )};border-radius:4px;margin-right:8px;">${glyph}</span>`;

    if (email) {
      rows.push({
        icon: makeIcon('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7l9 6 9-6"/><rect x="3" y="5" width="18" height="14" rx="2"/></svg>'),
        label: `<a href="mailto:${email}" style="color:${textColor};text-decoration:none;">${email}</a>`,
      });
    }
    if (phone) {
      rows.push({
        icon: makeIcon('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 16.92-5-5a3 3 0 0 0-4.24 0l-.7.7a16.05 16.05 0 0 1-4.53-4.53l.7-.7a3 3 0 0 0 0-4.24l-5-5A3 3 0 0 0 2 2.08C2 13.09 10.91 22 21.92 22a3 3 0 0 0 2-5.08Z"/></svg>'),
        label: `<a href="tel:${phone}" style="color:${textColor};text-decoration:none;">${phone}</a>`,
      });
    }
    if (website) {
      rows.push({
        icon: makeIcon('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10"/></svg>'),
        label: `<a href="${website}" style="color:${textColor};text-decoration:none;">${website}</a>`,
      });
    }
    if (address) {
      rows.push({
        icon: makeIcon('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z"/><circle cx="12" cy="9" r="2"/></svg>'),
        label: `<span style="color:${textColor};">${address}</span>`,
      });
    }
    return rows;
  }, [email, phone, website, address, primaryColor, textColor]);

  const socialHtml = useMemo(() => {
    const filtered = socialLinks.filter((social) => social.url.trim().length > 0);
    if (!filtered.length) return "";
    const items = filtered
      .map(
        (social) => `
        <td style="padding-right:10px;">
          <a href="${social.url}" style="display:inline-flex;align-items:center;gap:6px;text-decoration:none;color:${primaryColor};font-size:${fontSize - 1}px;font-family:${fontFamily}, Arial;">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:6px;border:1px solid ${primaryColor};color:${primaryColor};">
              ${getPlatformIcon(social.platform)?.props?.children ?? ""}
            </span>
            ${social.label || social.platform}
          </a>
        </td>`,
      )
      .join("");
    return `
      <tr>
        <td style="padding-top:10px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>${items}</tr>
          </table>
        </td>
      </tr>`;
  }, [socialLinks, fontFamily, fontSize, primaryColor]);
  const bodyHtml = useMemo(() => {
    const fontSizePx = `${fontSize}px`;
    const nameColor = primaryColor;

    const template = (main: string) => `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;color:${textColor};font-size:${fontSizePx};line-height:1.5;font-family:${fontFamily}, Arial;">
        <tr>${main}</tr>
      </table>
    `;

    const classic = template(`
      <td style="padding-right:20px;">
        <div style="width:96px;height:96px;border-radius:${photoBorderRadius};overflow:hidden;border:2px solid ${primaryColor};">
          <img src="${photoUrl}" alt="Profile" width="96" height="96" style="display:block;width:100%;height:100%;object-fit:cover;" />
        </div>
      </td>
      <td>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding-bottom:12px;">
              <p style="margin:0;font-size:${fontSize + 2}px;font-weight:600;color:${nameColor};line-height:1.2;">${fullName}</p>
              <p style="margin:4px 0 0;color:${textColor}B3;font-size:${fontSize}px;">${role}</p>
              <p style="margin:4px 0 0;color:${primaryColor};font-size:${fontSize - 1}px;">${company}</p>
            </td>
          </tr>
          ${contactRows
            .map(
              (row) => `<tr><td style="padding:3px 0;"><span style="display:flex;align-items:center;font-size:${fontSize - 1}px;">${row.icon}${row.label}</span></td></tr>`,
            )
            .join("")}
          ${socialHtml}
        </table>
      </td>
    `);

    const modern = template(`
      <td style="padding-right:24px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding-bottom:12px;">
              <p style="margin:0;font-size:${fontSize + 2}px;font-weight:600;color:${nameColor};line-height:1.2;">${fullName}</p>
              <p style="margin:4px 0 0;color:${textColor}B3;font-size:${fontSize}px;">${role} · ${company}</p>
            </td>
          </tr>
          ${contactRows
            .map(
              (row) => `<tr><td style="padding:3px 0;"><span style="display:flex;align-items:center;font-size:${fontSize - 1}px;">${row.icon}${row.label}</span></td></tr>`,
            )
            .join("")}
          ${socialHtml}
        </table>
      </td>
      <td>
        <div style="width:96px;height:96px;border-radius:${photoBorderRadius};overflow:hidden;border:2px solid ${primaryColor};">
          <img src="${photoUrl}" alt="Profile" width="96" height="96" style="display:block;width:100%;height:100%;object-fit:cover;" />
        </div>
      </td>
    `);

    const banner = template(`
      <td>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;">
          <tr>
            <td colspan="2" style="padding-bottom:12px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:${primaryColor};border-radius:16px;color:${pickAccessibleText(primaryColor)};">
                <tr>
                  <td style="padding:18px;">
                    <p style="margin:0;font-size:${fontSize + 3}px;font-weight:600;color:${pickAccessibleText(primaryColor)};">${fullName}</p>
                    <p style="margin:6px 0 0;color:${pickAccessibleText(primaryColor)}CC;font-size:${fontSize}px;">${role} · ${company}</p>
                  </td>
                  <td style="padding:18px;">
                    <div style="width:88px;height:88px;border-radius:${photoBorderRadius};overflow:hidden;border:2px solid ${pickAccessibleText(primaryColor)};">
                      <img src="${photoUrl}" alt="Profile" width="88" height="88" style="display:block;width:100%;height:100%;object-fit:cover;" />
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                ${contactRows
                  .map(
                    (row) => `<tr><td style="padding:3px 0;"><span style="display:flex;align-items:center;font-size:${fontSize - 1}px;">${row.icon}${row.label}</span></td></tr>`,
                  )
                  .join("")}
              </table>
            </td>
          </tr>
          ${socialHtml}
        </table>
      </td>
    `);

    if (layout === "modern") return modern;
    if (layout === "banner") return banner;
    return classic;
  }, [layout, primaryColor, fontFamily, fontSize, photoBorderRadius, photoUrl, fullName, role, company, textColor, contactRows, socialHtml]);

  const signatureHtml = useMemo(() => {
    const wrapperBackground = backgroundColor || "#ffffff";
    const borderColor = "rgba(15,23,42,0.08)";
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * { box-sizing:border-box; }
      @media (max-width: 520px) {
        .sig-wrapper { width: 100% !important; }
        .sig-main { display: block !important; }
        .sig-main td { display: block !important; width: 100% !important; padding-right: 0 !important; padding-left: 0 !important; }
        .sig-main img { margin-bottom: 12px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${wrapperBackground};">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="sig-wrapper" style="width:100%;max-width:600px;background:${wrapperBackground};border:1px solid ${borderColor};border-radius:18px;padding:22px;font-family:${fontFamily}, Arial, sans-serif;color:${textColor};">
      <tr>
        <td>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="sig-main" style="width:100%;">
            ${bodyHtml}
          </table>
        </td>
      </tr>
      ${
        showDisclaimer && disclaimer
          ? `<tr><td style="padding-top:12px;border-top:1px solid ${borderColor};"><p style="margin:0;color:${textColor}B3;font-size:${fontSize - 2}px;line-height:1.5;">${disclaimer}</p></td></tr>`
          : ""
      }
      ${
        showBanner && bannerUrl
          ? `<tr><td style="padding-top:12px;"><img src="${bannerUrl}" alt="Signature banner" style="width:100%;display:block;border-radius:14px;border:1px solid ${borderColor};" /></td></tr>`
          : ""
      }
    </table>
  </body>
</html>`;
  }, [backgroundColor, bodyHtml, bannerUrl, disclaimer, fontFamily, fontSize, showBanner, showDisclaimer, textColor]);
  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(signatureHtml);
      toast({ title: "HTML copied", description: "Signature markup copied to clipboard." });
    } catch (error) {
      console.error(error);
      toast({
        title: "Copy failed",
        description: "Clipboard copy was blocked. Select the HTML block and copy manually instead.",
        variant: "destructive",
      });
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([signatureHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "email-signature.html";
    link.click();
    URL.revokeObjectURL(url);
  };

  const addSocialLink = () => {
    setSocialLinks((prev) => [...prev, { id: randomId(), platform: "Custom", label: "Portfolio", url: "https://" }]);
  };

  const updateSocial = (id: string, updates: Partial<SocialLink>) => {
    setSocialLinks((prev) => prev.map((social) => (social.id === id ? { ...social, ...updates } : social)));
  };

  const removeSocial = (id: string) => {
    setSocialLinks((prev) => prev.filter((social) => social.id !== id));
  };

  const resetBranding = () => {
    setPrimaryColor("#2563eb");
    setAccentColor("#f97316");
    setBackgroundColor("#ffffff");
    setTextColor("#0f172a");
    setFontFamily("Inter");
    setFontSize(14);
    setPhotoShape("rounded");
  };
  return (
    <div className="space-y-8">
      <Dialog open={showUsageGuide} onOpenChange={setShowUsageGuide}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add your signature to email clients</DialogTitle>
            <DialogDescription>Copy the generated HTML, then follow the steps for your email platform.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p className="rounded-2xl border border-border/60 bg-background/60 p-4 text-foreground">
              Start by clicking <strong>Copy HTML</strong> (or <strong>Download HTML</strong>) below. Paste the markup in the signature editor for your email client.
            </p>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-foreground">Gmail</p>
                <ol className="list-decimal space-y-1 pl-5">
                  <li>Open Gmail &gt; click the gear icon &gt; <em>See all settings</em>.</li>
                  <li>Scroll to the <em>Signature</em> section and create a new signature.</li>
                  <li>Switch to the code view (<code>&lt;&gt;</code> icon), paste the HTML, then save changes.</li>
                </ol>
              </div>
              <div>
                <p className="font-semibold text-foreground">Outlook (desktop/web)</p>
                <ol className="list-decimal space-y-1 pl-5">
                  <li>Go to <em>Settings &gt; Mail &gt; Compose and reply</em> (or <em>File &gt; Options &gt; Mail &gt; Signatures</em> on desktop).</li>
                  <li>Create a new signature and choose the HTML editor option.</li>
                  <li>Paste the copied markup and assign it to new messages and replies.</li>
                </ol>
              </div>
              <div>
                <p className="font-semibold text-foreground">Apple Mail</p>
                <ol className="list-decimal space-y-1 pl-5">
                  <li>Compose a new message, choose <em>Format &gt; Make Plain Text</em>, then <em>Edit &gt; Paste</em> the HTML.</li>
                  <li>Select the entire signature block and drag it into <em>Mail &gt; Settings &gt; Signatures</em>.</li>
                  <li>Set the new signature as default for the intended account.</li>
                </ol>
              </div>
            </div>
            <p>
              Test by sending yourself an email to confirm fonts, links, and mobile responsiveness render as expected.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowUsageGuide(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Card className="glass border border-border/70">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl md:text-3xl">Responsive Email Signature Generator</CardTitle>
            <CardDescription className="max-w-2xl text-sm md:text-base text-muted-foreground">
              Build polished, brand-ready signatures with social buttons, disclaimers, and promotional banners. Export raw HTML that renders reliably across Gmail, Outlook, and Apple Mail.
            </CardDescription>
          </div>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <Badge variant="outline" className="border-pink-400/70 bg-pink-200/40 text-pink-700 uppercase tracking-wide">
              Design Tools
            </Badge>
            <Button
              variant="outline"
              className="glass border border-border/70 text-sm"
              onClick={() => setShowUsageGuide(true)}
            >
              <Info className="mr-2 h-4 w-4" />
              How to install
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="identity" className="space-y-6">
            <TabsList className="glass grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 rounded-2xl border border-border/60 bg-background/70 p-1">
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-4">
              <Card className="glass border border-border/70">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </CardTitle>
                  <CardDescription>Set the core details displayed in the header.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full name</Label>
                    <Input id="full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="glass border border-border/70" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" value={role} onChange={(event) => setRole(event.target.value)} className="glass border border-border/70" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" value={company} onChange={(event) => setCompany(event.target.value)} className="glass border border-border/70" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="photo-url">Profile photo / logo URL</Label>
                    <Input id="photo-url" value={photoUrl} onChange={(event) => setPhotoUrl(event.target.value)} className="glass border border-border/70" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border border-border/70">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layout className="h-4 w-4" /> Photo style
                  </CardTitle>
                  <CardDescription>Choose how your photo or logo should render.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {(["circle", "rounded", "square"] as PhotoShape[]).map((shape) => (
                    <Button
                      key={shape}
                      variant={photoShape === shape ? "default" : "outline"}
                      className={cn("capitalize", photoShape === shape ? "" : "glass border border-border/70")}
                      onClick={() => setPhotoShape(shape)}
                    >
                      {shape}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass border border-border/70">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layout className="h-4 w-4" /> Layout presets
                  </CardTitle>
                  <CardDescription>Select a responsive template.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                  {LAYOUT_OPTIONS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setLayout(preset.value)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition",
                        layout === preset.value
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border/60 bg-background/60 hover:border-primary/40",
                      )}
                    >
                      <p className="font-semibold">{preset.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{preset.description}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contact">
              <Card className="glass border border-border/70">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Contact details
                  </CardTitle>
                  <CardDescription>Recipients will use these details to get in touch.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={email} onChange={(event) => setEmail(event.target.value)} className="glass border border-border/70" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={phone} onChange={(event) => setPhone(event.target.value)} className="glass border border-border/70" />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input value={website} onChange={(event) => setWebsite(event.target.value)} className="glass border border-border/70" />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={address} onChange={(event) => setAddress(event.target.value)} className="glass border border-border/70" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <Card className="glass border border-border/70">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Share className="h-4 w-4" /> Social links
                  </CardTitle>
                  <CardDescription>Add badges for your social profiles or custom URLs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {socialLinks.map((social) => (
                    <div key={social.id} className="rounded-2xl border border-border/60 bg-background/60 p-4 space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Platform</Label>
                          <div className="flex flex-wrap gap-2">
                            {(["LinkedIn", "Twitter", "Facebook", "Website", "Custom"] as SocialPlatform[]).map((platform) => (
                              <Button
                                key={platform}
                                variant={social.platform === platform ? "default" : "outline"}
                                className={cn(
                                  "flex items-center gap-2 capitalize",
                                  social.platform === platform ? "" : "glass border border-border/70",
                                )}
                                onClick={() => updateSocial(social.id, { platform, label: platform })}
                              >
                                {getPlatformIcon(platform)}
                                {platform}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Label</Label>
                          <Input
                            value={social.label}
                            onChange={(event) => updateSocial(social.id, { label: event.target.value })}
                            className="glass border border-border/70"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label>URL</Label>
                          <Input
                            value={social.url}
                            onChange={(event) => updateSocial(social.id, { url: event.target.value })}
                            className="glass border border-border/70"
                            placeholder="https://"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="ghost" className="text-destructive" onClick={() => removeSocial(social.id)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addSocialLink} className="glass border border-dashed border-border/70">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Add social link
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding" className="space-y-4">
              <Card className="glass border border-border/70">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="h-4 w-4" /> Colors & typography
                  </CardTitle>
                  <CardDescription>Match the signature to your brand system.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Primary color</Label>
                    <div className="flex items-center gap-3">
                      <Input type="color" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} className="h-10 w-16" />
                      <Input value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} className="glass border border-border/70" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Accent color</Label>
                    <div className="flex items-center gap-3">
                      <Input type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} className="h-10 w-16" />
                      <Input value={accentColor} onChange={(event) => setAccentColor(event.target.value)} className="glass border border-border/70" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Background color</Label>
                    <div className="flex items-center gap-3">
                      <Input type="color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} className="h-10 w-16" />
                      <Input value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} className="glass border border-border/70" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Text color</Label>
                    <div className="flex items-center gap-3">
                      <Input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} className="h-10 w-16" />
                      <Input value={textColor} onChange={(event) => setTextColor(event.target.value)} className="glass border border-border/70" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Font family</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {FONT_OPTIONS.map((font) => (
                        <Button
                          key={font}
                          variant={fontFamily === font ? "default" : "outline"}
                          className={cn(fontFamily === font ? "" : "glass border border-border/70")}
                          style={{ fontFamily: font }}
                          onClick={() => setFontFamily(font)}
                        >
                          {font}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Base font size</Label>
                    <Slider min={12} max={18} step={1} value={[fontSize]} onValueChange={([size]) => setFontSize(size)} />
                    <p className="text-xs text-muted-foreground">{fontSize}px</p>
                  </div>
                </CardContent>
                <CardContent className="flex justify-end pt-0">
                  <Button variant="ghost" onClick={resetBranding} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <RefreshCcw className="h-4 w-4" /> Reset branding
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card className="glass border border-border/70">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Disclaimer
                  </CardTitle>
                  <CardDescription>Toggle optional compliance or legal copy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 p-4">
                    <div>
                      <p className="font-medium">Include disclaimer</p>
                      <p className="text-sm text-muted-foreground">Adds a confidentiality notice below the signature.</p>
                    </div>
                    <Switch checked={showDisclaimer} onCheckedChange={setShowDisclaimer} />
                  </div>
                  {showDisclaimer && (
                    <div className="space-y-2">
                      <Label htmlFor="disclaimer-text">Disclaimer text</Label>
                      <Textarea
                        id="disclaimer-text"
                        value={disclaimer}
                        onChange={(event) => setDisclaimer(event.target.value)}
                        className="min-h-[120px] glass border border-border/70"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass border border-border/70">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layout className="h-4 w-4" /> Promotional banner
                  </CardTitle>
                  <CardDescription>Promote launches or campaigns beneath the signature block.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 p-4">
                    <div>
                      <p className="font-medium">Show banner</p>
                      <p className="text-sm text-muted-foreground">Ideal for webinars, product drops, or seasonal offers.</p>
                    </div>
                    <Switch checked={showBanner} onCheckedChange={setShowBanner} />
                  </div>
                  {showBanner && (
                    <div className="space-y-2">
                      <Label htmlFor="banner-url">Banner image URL</Label>
                      <Input
                        id="banner-url"
                        value={bannerUrl}
                        onChange={(event) => setBannerUrl(event.target.value)}
                        className="glass border border-border/70"
                        placeholder="https://yourcdn.com/banner.jpg"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="glass border border-border/70">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Smartphone className="h-4 w-4" /> Live preview
                </CardTitle>
                <CardDescription>Toggle desktop and mobile views to confirm responsive behavior.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={copyHtml} className="glass border border-border/70">
                  <Copy className="mr-2 h-4 w-4" /> Copy HTML
                </Button>
                <Button variant="outline" onClick={downloadHtml} className="glass border border-border/70">
                  <Download className="mr-2 h-4 w-4" /> Download HTML
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="desktop" className="space-y-4">
                <TabsList className="glass inline-flex rounded-full border border-border/70 bg-background/70 p-1">
                  <TabsTrigger value="desktop">Desktop</TabsTrigger>
                  <TabsTrigger value="mobile">Mobile</TabsTrigger>
                </TabsList>
                <TabsContent value="desktop">
                  <div className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-lg">
                    <div dangerouslySetInnerHTML={{ __html: signatureHtml }} />
                  </div>
                </TabsContent>
                <TabsContent value="mobile">
                  <div className="mx-auto max-w-sm rounded-3xl border border-border/60 bg-background/80 p-4 shadow-lg">
                    <div className="scale-90 origin-top" dangerouslySetInnerHTML={{ __html: signatureHtml }} />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="glass border border-dashed border-border/60">
            <CardHeader>
              <CardTitle className="text-base">HTML output</CardTitle>
              <CardDescription>Copy or tweak before embedding in your email client.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={signatureHtml} readOnly className="min-h-[320px] font-mono text-xs glass border border-border/70" />
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponsiveEmailSignatureGenerator;
