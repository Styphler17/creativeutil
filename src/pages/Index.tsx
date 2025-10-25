import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

import { tools } from "@/config/tools";

const featuredTools = tools.slice(0, 4);

const Index = () => {

  return (
    <>
      <Helmet>
        <title>CreativeUtil – Your Creative Toolkit for Modern Web Development & Design</title>
        <meta name="description" content="Discover, preview, and use amazing creative tools at CreativeUtil – your one-stop toolkit for web development, design, and productivity. Generate CSS, preview Markdown, create QR codes, and more!" />
        <meta name="keywords" content="tools, web development, design, toolkit, CSS generator, markdown preview, QR code, utilities, CreativeUtil, developer tools, creative tools" />
        <meta name="author" content="CreativeUtil" />
        <link rel="canonical" href="https://creativeutil.com/" />
        <meta property="og:title" content="CreativeUtil – Your Creative Toolkit" />
        <meta property="og:description" content="Discover, preview, and use creative tools for modern web development and design at CreativeUtil." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://creativeutil.com/" />
        <meta property="og:image" content="https://creativeutil.com/assets/creativeutil-og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@CreativeUtil" />
        <meta name="twitter:title" content="CreativeUtil – Your Creative Toolkit" />
        <meta name="twitter:description" content="Explore a curated collection of creative tools at CreativeUtil for web development and design needs." />
        <meta name="twitter:image" content="https://creativeutil.com/assets/creativeutil-og-image.png" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "CreativeUtil",
            "url": "https://creativeutil.com/",
            "logo": "https://creativeutil.com/assets/creativeutil-logo.svg",
            "description": "Your one-stop toolkit for web development, design, and productivity tools.",
            "sameAs": [
              "https://twitter.com/CreativeUtil"
            ],
            "offers": {
              "@type": "Offer",
              "category": "Software",
              "description": "Free web development and design tools"
            }
          })}
        </script>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6388735455910610" crossOrigin="anonymous"></script>
      </Helmet>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10 opacity-40 pattern-bg" />
        
        {/* Gradient Overlays */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -z-10" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />

        <Header />

        <main className="flex-1 pt-32 pb-16 px-4 md:px-6">
          {/* Hero Section */}
          <section className="max-w-7xl mx-auto text-center mb-24 relative">
            {/* Branded Accent Shapes */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20 blur-xl" />
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-gradient-to-tl from-secondary to-accent rounded-full opacity-20 blur-xl" />
            <div className="absolute top-1/2 -left-20 w-16 h-16 bg-gradient-to-r from-accent to-primary rounded-full opacity-30 blur-lg" />

            <div className="glass rounded-3xl p-12 md:p-16 space-y-8 relative overflow-hidden">
              {/* Gradient Background Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-3xl" />

              <h1 className="text-5xl md:text-7xl font-bold leading-tight relative z-10">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-lg">
                  CreativeUtil
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-foreground max-w-3xl mx-auto font-semibold relative z-10">
                Powerful web development tools at your fingertips - generate CSS, preview Markdown, create QR codes, and more!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 relative z-10">
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white px-8 py-6 text-lg rounded-full shadow-2xl hover:scale-105 transition-all font-bold border-2 border-white/20"
                >
                  <Link to="/tools">Explore the CreativeUtil</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="glass border-2 border-primary/50 px-8 py-6 text-lg rounded-full hover:scale-105 transition-all font-bold text-primary hover:bg-primary/10"
                >
                  <Link to="/about" aria-label="Learn more about CreativeUtil">Learn More</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Featured Tools */}
          <section className="max-w-7xl mx-auto mb-16 relative">
            {/* Section Divider */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Featured Tools
              </h2>
              <p className="text-xl text-foreground font-semibold">
                Discover our most popular tools
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    to={`/tools/${tool.id}`}
                    className="glass cursor-pointer hover:scale-105 transition-transform duration-300 border-2 hover:border-primary/50 group overflow-hidden rounded-3xl shadow-lg hover:shadow-xl relative"
                  >
                    {/* Card Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/3 to-accent/5 rounded-3xl" />

                    <div className="p-8 flex flex-col items-center text-center gap-4 h-full relative z-10">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center ${tool.color} group-hover:scale-110 transition-transform shadow-lg`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      <div className="text-center flex-1">
                        <h3 className="text-2xl font-bold dark:text-white">{tool.title}</h3>
                        <p className="text-foreground text-sm mt-2 dark:text-gray-300 font-medium">{tool.description}</p>
                      </div>

                      <div className="mt-auto pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full px-4 py-2 hover:bg-gradient-to-r hover:from-primary/20 hover:to-secondary/20 transition-all border-primary/50 text-primary dark:text-cyan-400 font-semibold shadow-md"
                        >
                          Open Tool →
                        </Button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-4 text-lg rounded-full shadow-2xl hover:scale-105 transition-all font-bold border-2 border-white/20"
              >
                <Link to="/tools">View All Tools</Link>
              </Button>
            </div>
          </section>

          {/* Features Section */}
          <section className="max-w-7xl mx-auto mt-24 relative">
            {/* Section Divider */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50" />

            <div className="glass rounded-3xl p-12 text-center space-y-6 relative overflow-hidden">
              {/* Gradient Background Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-accent/5 to-primary/10 rounded-3xl" />

              <h2 className="text-3xl font-bold relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Why Choose CreativeUtil?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 relative z-10">
                <div className="space-y-2 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm">
                  <div className="text-4xl">⚡</div>
                  <h3 className="text-xl font-bold text-primary">Lightning Fast</h3>
                  <p className="text-foreground font-medium">
                    Instant results with no delays or loading times
                  </p>
                </div>
                <div className="space-y-2 p-6 rounded-2xl bg-gradient-to-br from-secondary/5 to-accent/5 backdrop-blur-sm">
                  <div className="text-4xl">🎨</div>
                  <h3 className="text-xl font-bold text-secondary">Beautiful UI</h3>
                  <p className="text-foreground font-medium">
                    Clean, modern interface with glassmorphism design
                  </p>
                </div>
                <div className="space-y-2 p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-primary/5 backdrop-blur-sm">
                  <div className="text-4xl">🔧</div>
                  <h3 className="text-xl font-bold text-accent">Developer-Friendly</h3>
                  <p className="text-foreground font-medium">
                    Built by developers, for developers
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />

        <BackToTop />


      </div>
    </>
  );
};

export default Index;
