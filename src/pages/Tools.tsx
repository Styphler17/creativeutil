import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AnimatedBlobs } from "@/components/AnimatedBlobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { Search, Sparkles, X } from "lucide-react";
import bgImage from "@/assets/bg-1.png";

import { tools } from "@/config/tools";

type SortOption =
  | "new-desc"
  | "new-asc"
  | "date-desc"
  | "date-asc"
  | "month-asc"
  | "month-desc"
  | "year-asc"
  | "year-desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "new-desc", label: "New (Newest first)" },
  { value: "new-asc", label: "New (Oldest first)" },
  { value: "date-desc", label: "Date Created (Newest first)" },
  { value: "date-asc", label: "Date Created (Oldest first)" },
  { value: "month-asc", label: "Month (Jan to Dec)" },
  { value: "month-desc", label: "Month (Dec to Jan)" },
  { value: "year-asc", label: "Year (Oldest to Newest)" },
  { value: "year-desc", label: "Year (Newest to Oldest)" },
];

const DESKTOP_RECOMMENDED = new Set<string>([
  "code-diff-merge",
  "html-email-template-builder",
  "responsive-layout-builder",
  "bulk-watermark-creator",
  "audio-cutter-converter",
  "video-gif-maker-trimmer",
  "visualtrim",
  "csv-editor-analyzer",
  "fake-csv-generator",
  "icon-font-generator",
  "api-playground",
  "json-yaml-xml-diff-merge",
  "css-animation-generator",
]);

const MOBILE_FRIENDLY = new Set<string>([
  "qr-generator",
  "password-generator",
  "color-palette",
  "css-gradient",
  "markdown-preview",
  "unit-currency-converter",
  "contrast-checker",
  "lorem-ipsum-generator",
  "css-button",
  "pulse-animation",
  "svg-customizer",
  "html-to-markdown",
]);

const getDeviceBadge = (toolId: string) => {
  if (DESKTOP_RECOMMENDED.has(toolId)) {
    return {
      label: "Best on Desktop",
      className:
        "border-amber-400/70 bg-amber-200/40 text-amber-700 dark:border-amber-300/50 dark:bg-amber-400/10 dark:text-amber-200",
    };
  }
  if (MOBILE_FRIENDLY.has(toolId)) {
    return {
      label: "Mobile Friendly",
      className:
        "border-emerald-400/70 bg-emerald-200/30 text-emerald-700 dark:border-emerald-300/50 dark:bg-emerald-400/10 dark:text-emerald-200",
    };
  }
  return {
    label: "Desktop & Mobile",
    className:
      "border-slate-400/60 bg-slate-200/40 text-slate-700 dark:border-slate-300/40 dark:bg-slate-400/10 dark:text-slate-200",
  };
};

const Tools = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLetter, setFilterLetter] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>("new-desc");
  const toolsPerPage = 8;

  const letters = Array.from(new Set(tools.map(t => t.title[0].toUpperCase()))).sort();
  const featuredTool = useMemo(() => tools.find(tool => tool.id === "fake-csv-generator"), []);

  const filteredTools = useMemo(() => {
    return tools.filter(
      (tool) =>
        (tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!filterLetter || tool.title.toLowerCase().startsWith(filterLetter.toLowerCase())) &&
        (!filterCategory || tool.category === filterCategory)
    );
  }, [filterCategory, filterLetter, searchTerm]);

  const sortedTools = useMemo(() => {
    const toSort = [...filteredTools];

    const dateValue = (tool: (typeof filteredTools)[number]) => new Date(tool.createdAt).getTime();
    const monthValue = (tool: (typeof filteredTools)[number]) => new Date(tool.createdAt).getUTCMonth();
    const yearValue = (tool: (typeof filteredTools)[number]) => new Date(tool.createdAt).getUTCFullYear();
    const boolToNumber = (value?: boolean) => (value ? 1 : 0);

    toSort.sort((a, b) => {
      switch (sortOption) {
        case "new-desc": {
          const score = boolToNumber(b.isNew) - boolToNumber(a.isNew);
          return score !== 0 ? score : dateValue(b) - dateValue(a);
        }
        case "new-asc": {
          const score = boolToNumber(a.isNew) - boolToNumber(b.isNew);
          return score !== 0 ? score : dateValue(a) - dateValue(b);
        }
        case "date-asc":
          return dateValue(a) - dateValue(b);
        case "month-asc": {
          const score = monthValue(a) - monthValue(b);
          return score !== 0 ? score : dateValue(a) - dateValue(b);
        }
        case "month-desc": {
          const score = monthValue(b) - monthValue(a);
          return score !== 0 ? score : dateValue(b) - dateValue(a);
        }
        case "year-asc": {
          const score = yearValue(a) - yearValue(b);
          return score !== 0 ? score : dateValue(a) - dateValue(b);
        }
        case "year-desc": {
          const score = yearValue(b) - yearValue(a);
          return score !== 0 ? score : dateValue(b) - dateValue(a);
        }
        case "date-desc":
        default:
          return dateValue(b) - dateValue(a);
      }
    });

    return toSort;
  }, [filteredTools, sortOption]);

  // Pagination logic
  const totalPages = Math.ceil(sortedTools.length / toolsPerPage);
  const startIndex = (currentPage - 1) * toolsPerPage;
  const endIndex = startIndex + toolsPerPage;
  const currentTools = sortedTools.slice(startIndex, endIndex);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterLetter, filterCategory, sortOption]);

  return (
    <>
      <Helmet>
        <title>CreativeUtil Tools – Professional Web Development & Design Utilities</title>
        <meta name="description" content="Explore CreativeUtil's comprehensive collection of web development tools. Generate CSS, preview Markdown, create QR codes, and access powerful utilities for developers and designers." />
        <meta name="keywords" content="web development tools, design tools, CSS generator, markdown preview, QR code generator, developer utilities, CreativeUtil tools, creative tools" />
        <meta name="author" content="CreativeUtil" />
        <link rel="canonical" href="https://creativeutil.com/tools" />
        <meta property="og:title" content="CreativeUtil Tools – Professional Web Development & Design Utilities" />
        <meta property="og:description" content="Explore CreativeUtil's comprehensive collection of web development tools for developers and designers." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://creativeutil.com/tools" />
        <meta property="og:image" content="https://creativeutil.com/assets/creativeutil-tools-og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@CreativeUtil" />
        <meta name="twitter:title" content="CreativeUtil Tools – Professional Web Development & Design Utilities" />
        <meta name="twitter:description" content="Explore CreativeUtil's comprehensive collection of web development tools for developers and designers." />
        <meta name="twitter:image" content="https://creativeutil.com/assets/creativeutil-tools-og-image.png" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "CreativeUtil Tools",
            "url": "https://creativeutil.com/tools",
            "description": "Comprehensive collection of web development and design tools",
            "provider": {
              "@type": "Organization",
              "name": "CreativeUtil",
              "url": "https://creativeutil.com/"
            },
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": tools.length,
              "itemListElement": tools.map((tool, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "SoftwareApplication",
                  "name": tool.title,
                  "description": tool.description,
                  "url": `https://creativeutil.com/tools/${tool.id}`,
                  "applicationCategory": "DeveloperApplication"
                }
              }))
            }
          })}
        </script>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6388735455910610" crossOrigin="anonymous"></script>
      </Helmet>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div
        className="fixed inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Gradient Overlays */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -z-10" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />

      {/* Animated Blobs */}
      <AnimatedBlobs />

      <Header />

      <main className="flex-1 pt-32 pb-16 px-4 md:px-6">
        <section className="max-w-7xl mx-auto relative">
          {/* Branded Accent Shapes */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-bl from-primary to-secondary rounded-full opacity-20 blur-xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-secondary to-accent rounded-full opacity-20 blur-xl" />

          <Breadcrumb />
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              CreativeUtil Hub
            </h1>
            <p className="text-xl text-foreground font-semibold">
              Professional-grade tools designed for developers and creators
            </p>
          </div>

          <div className="space-y-8">
              {featuredTool && (
                <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/20 via-secondary/10 to-accent/10 p-8 shadow-xl">
                  <div className="absolute inset-0 opacity-20">
                    <img src={bgImage} alt="" className="h-full w-full object-cover mix-blend-overlay" />
                  </div>
                  <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl space-y-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-sm font-semibold text-primary shadow-sm">
                        <Sparkles className="h-4 w-4" />
                        New tool
                      </div>
                      <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                        {featuredTool.title}
                      </h2>
                      <p className="text-base text-muted-foreground md:text-lg">
                        {featuredTool.description} Configure columns, preview data, and export clean CSVs in seconds.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 md:items-end">
                      <Link to={`/tools/${featuredTool.id}`}>
                        <Button size="lg" className="gap-2 rounded-full px-6 shadow-lg">
                          Launch tool
                        </Button>
                      </Link>
                      <Link to="/tools/csv-editor-analyzer" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
                        Compare with CSV Editor →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Search Button */}
              <div className="md:hidden mb-4 flex justify-center">
                <Button
                  onClick={() => setShowSearch(!showSearch)}
                  variant="outline"
                  className="rounded-full px-6 py-3 bg-background/80 backdrop-blur-sm border-2 hover:border-primary transition-all duration-200"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Tools
                </Button>
              </div>

              {/* Search Bar - Desktop always visible, Mobile toggleable */}
              {(typeof window === 'undefined' || window.innerWidth >= 768 || showSearch) && (
                <div className="mb-8 max-w-md mx-auto relative">
                  {/* Search Bar Accent */}
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20 blur-lg" />

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tools..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-12 py-3 rounded-full glass border-2 focus:border-primary font-medium"
                    />
                    {showSearch && (
                      <Button
                        onClick={() => {
                          setShowSearch(false);
                          setSearchTerm("");
                        }}
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Category Filter */}
              <div className="mb-8 text-center">
                <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto mb-4">
                  <button
                    onClick={() => setFilterCategory(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      filterCategory === null
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All Categories
                  </button>
                  {['CSS Tools', 'Development Tools', 'Design Tools', 'Conversion Tools'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setFilterCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        filterCategory === category
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* A-Z Filter */}
                <div className="flex flex-wrap justify-center gap-1 max-w-4xl mx-auto">
                  <button
                    onClick={() => setFilterLetter(null)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filterLetter === null
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All
                  </button>
                  {letters.map((letter) => (
                    <button
                      key={letter}
                      onClick={() => setFilterLetter(letter)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        filterLetter === letter
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
             
              {/* Sort Dropdown */}
              <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground text-center md:text-left">
                  Showing {sortedTools.length} tool{sortedTools.length === 1 ? "" : "s"} with advanced filters.
                </p>
                <div className="flex items-center justify-center md:justify-end gap-3">
                  <span className="text-sm font-semibold text-muted-foreground">Sort by</span>
                  <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                    <SelectTrigger className="w-60 rounded-full glass border-2 font-medium">
                      <SelectValue placeholder="Sort tools" />
                    </SelectTrigger>
                    <SelectContent className="rounded-3xl">
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="font-medium">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {currentTools.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-foreground">No tools found matching your search.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {currentTools.map((tool, index) => {
                      const Icon = tool.icon;
                      const deviceBadge = getDeviceBadge(tool.id);
                      return (
                      <Link
                        key={tool.id}
                        to={`/tools/${tool.id}`}
                        className="group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/30 active:scale-95 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Tinted Glass Background with Brand Colors */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/15 dark:from-primary/25 dark:via-secondary/20 dark:to-accent/25 backdrop-blur-xl border border-primary/20 dark:border-primary/30 rounded-3xl shadow-xl group-hover:shadow-2xl group-hover:shadow-primary/40 transition-all duration-500" />

                        {/* Soft Glow Effect on Hover */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />

                        {/* Content */}
                        <div className="relative z-10 p-8 flex flex-col items-center text-center gap-6 h-full min-h-[360px]">
                          {/* Prominent Icon at Top */}
                          <div className="flex-shrink-0">
                            <div
                              className={`w-24 h-24 rounded-3xl flex items-center justify-center ${tool.color} group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-2xl group-hover:shadow-3xl relative overflow-hidden`}
                            >
                              {/* Icon Glow Effect */}
                              <div className="absolute inset-0 bg-white/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              <Icon className="w-12 h-12 text-white relative z-10 drop-shadow-2xl" />
                            </div>
                          </div>

                          {/* Large High-Contrast Title and Description */}
                          <div className="text-center flex-1 flex flex-col justify-center space-y-3">
                            <h3 className="text-2xl font-extrabold text-foreground dark:text-white group-hover:text-primary dark:group-hover:text-cyan-300 transition-colors duration-300 leading-tight">
                              {tool.title}
                            </h3>
                            <p className="text-muted-foreground dark:text-gray-300 text-sm font-semibold leading-relaxed line-clamp-3 px-2">
                              {tool.description}
                            </p>
                            <div className="flex justify-center">
                              <Badge variant="outline" className={`text-[11px] font-semibold px-3 py-1 ${deviceBadge.className}`}>
                                {deviceBadge.label}
                              </Badge>
                            </div>
                          </div>

                          {/* Brand-Colored Pill Button */}
                          <div className="mt-auto w-full">
                            <Button
                              variant="default"
                              size="lg"
                              className="w-full rounded-full px-8 py-4 bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/50 focus:ring-4 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background relative overflow-hidden"
                            >
                              {/* Button Shine Effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

                              <span className="relative z-10 flex items-center justify-center gap-2">
                                Open Tool
                                <span className="group-hover:translate-x-1 transition-transform duration-300">🚀</span>
                              </span>
                            </Button>
                          </div>
                        </div>

                        {/* Subtle Scaling and Glow Animation */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      </Link>
                    );
                  })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          variant="outline"
                          className="rounded-full px-4 py-2"
                        >
                          Previous
                        </Button>

                        <div className="flex gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <Button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              variant={currentPage === page ? "default" : "outline"}
                              className={`rounded-full px-3 py-2 min-w-[40px] ${
                                currentPage === page
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-primary/10'
                              }`}
                            >
                              {page}
                            </Button>
                          ))}
                        </div>

                        <Button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          variant="outline"
                          className="rounded-full px-4 py-2"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
          </div>

          {/* Request a Tool Section */}
          <section className="max-w-7xl mx-auto mt-24 relative">
            {/* Section Divider */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

            <div className="glass rounded-3xl p-12 text-center space-y-6 relative overflow-hidden">
              {/* Gradient Background Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-3xl" />

              <h2 className="text-3xl font-bold relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Request a Tool
              </h2>
              <p className="text-xl text-foreground font-semibold max-w-3xl mx-auto relative z-10">
                Don't see the tool you need? Let us know and we'll consider adding it to our collection!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 relative z-10">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white px-8 py-4 text-lg rounded-full shadow-2xl hover:scale-105 transition-all font-bold border-2 border-white/20"
                  onClick={() => window.open('mailto:support@creativeutil.com?subject=Tool Request&body=Hi, I would like to request a new tool: [Tool Name]%0A%0ADescription: [Brief description of what the tool should do]%0A%0AUse case: [How would you use this tool?]')}
                >
                  Request a Tool
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="glass border-2 border-primary/50 px-8 py-4 text-lg rounded-full hover:scale-105 transition-all font-bold text-primary hover:bg-primary/10"
                  onClick={() => window.open('https://github.com/creativeutil/tools/discussions', '_blank')}
                >
                  Join Discussion
                </Button>
              </div>
            </div>
          </section>
        </section>
      </main>

      <Footer />

      <BackToTop />
      </div>
    </>
  );
};

export default Tools;
