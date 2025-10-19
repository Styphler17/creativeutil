import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Target, Users, Heart } from "lucide-react";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About CreativeUtil – Your Creative Toolkit for Web Development & Design</title>
        <meta name="description" content="Learn about CreativeUtil, your ultimate creative toolkit for modern web development and design. Discover our mission, community, and commitment to empowering creators." />
        <meta name="keywords" content="about CreativeUtil, creative toolkit, web development tools, design tools, mission, community, CreativeUtil story" />
        <meta name="author" content="CreativeUtil" />
        <link rel="canonical" href="https://creativeutil.com/about" />
        <meta property="og:title" content="About CreativeUtil – Your Creative Toolkit" />
        <meta property="og:description" content="Learn about CreativeUtil, your ultimate creative toolkit for modern web development and design." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://creativeutil.com/about" />
        <meta property="og:image" content="https://creativeutil.com/assets/creativeutil-about-og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@CreativeUtil" />
        <meta name="twitter:title" content="About CreativeUtil – Your Creative Toolkit" />
        <meta name="twitter:description" content="Learn about CreativeUtil, your ultimate creative toolkit for modern web development and design." />
        <meta name="twitter:image" content="https://creativeutil.com/assets/creativeutil-about-og-image.png" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About CreativeUtil",
            "url": "https://creativeutil.com/about",
            "description": "Learn about CreativeUtil, your ultimate creative toolkit for modern web development and design.",
            "mainEntity": {
              "@type": "Organization",
              "name": "CreativeUtil",
              "url": "https://creativeutil.com/",
              "description": "Your one-stop toolkit for web development, design, and productivity tools.",
              "foundingDate": "2024",
              "sameAs": [
                "https://twitter.com/CreativeUtil"
              ]
            }
          })}
        </script>
      </Helmet>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 -z-10 opacity-40 pattern-bg" />

      <div className="fixed top-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -z-10" />

      {/* Branded Accent Shapes */}
      <div className="fixed top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20 blur-xl -z-10" />
      <div className="fixed bottom-1/4 left-1/4 w-24 h-24 bg-gradient-to-tl from-secondary to-accent rounded-full opacity-20 blur-lg -z-10" />

      <Header />

      <main className="flex-1 pt-32 pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
            {/* Gradient Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-3xl" />

            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent relative z-10">
              About CreativeUtil
            </h1>
            <p className="text-xl text-foreground dark:text-gray-100 leading-relaxed font-semibold relative z-10">
              CreativeUtil is your ultimate creative toolkit, bringing together the best tools
              and resources for modern web development and design in one playful,
              easy-to-use platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/30 active:scale-95 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background">
              {/* Tinted Glass Background with Brand Colors */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/15 dark:from-primary/25 dark:via-secondary/20 dark:to-accent/25 backdrop-blur-xl border border-primary/20 dark:border-primary/30 rounded-3xl shadow-xl group-hover:shadow-2xl group-hover:shadow-primary/40 transition-all duration-500" />

              {/* Soft Glow Effect on Hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />

              <div className="relative z-10 p-8 text-center space-y-6 h-full min-h-[280px] flex flex-col">
                {/* Prominent Icon at Top */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative overflow-hidden">
                    {/* Icon Glow Effect */}
                    <div className="absolute inset-0 bg-white/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Target className="w-12 h-12 text-white relative z-10 drop-shadow-2xl" />
                  </div>
                </div>

                {/* Large High-Contrast Title and Description */}
                <div className="flex-1 flex flex-col justify-center space-y-3">
                  <h3 className="text-2xl font-extrabold text-foreground dark:text-white group-hover:text-primary dark:group-hover:text-cyan-300 transition-colors duration-300 leading-tight">
                    Our Mission
                  </h3>
                  <p className="text-muted-foreground dark:text-gray-300 text-sm font-semibold leading-relaxed line-clamp-3 px-2">
                    To empower creators with intuitive, powerful tools that make complex tasks simple.
                  </p>
                </div>
              </div>

              {/* Subtle Scaling and Glow Animation */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>

            <div className="group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-3 hover:shadow-2xl hover:shadow-secondary/30 active:scale-95 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-secondary/50 focus:ring-offset-2 focus:ring-offset-background">
              {/* Tinted Glass Background with Brand Colors */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/15 via-accent/10 to-primary/15 dark:from-secondary/25 dark:via-accent/20 dark:to-primary/25 backdrop-blur-xl border border-secondary/20 dark:border-secondary/30 rounded-3xl shadow-xl group-hover:shadow-2xl group-hover:shadow-secondary/40 transition-all duration-500" />

              {/* Soft Glow Effect on Hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-secondary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />

              <div className="relative z-10 p-8 text-center space-y-6 h-full min-h-[280px] flex flex-col">
                {/* Prominent Icon at Top */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-r from-secondary to-accent flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative overflow-hidden">
                    {/* Icon Glow Effect */}
                    <div className="absolute inset-0 bg-white/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Users className="w-12 h-12 text-white relative z-10 drop-shadow-2xl" />
                  </div>
                </div>

                {/* Large High-Contrast Title and Description */}
                <div className="flex-1 flex flex-col justify-center space-y-3">
                  <h3 className="text-2xl font-extrabold text-foreground dark:text-white group-hover:text-secondary dark:group-hover:text-green-300 transition-colors duration-300 leading-tight">
                    Our Community
                  </h3>
                  <p className="text-muted-foreground dark:text-gray-300 text-sm font-semibold leading-relaxed line-clamp-3 px-2">
                    Join thousands of creators who trust CreativeUtil for their daily workflow.
                  </p>
                </div>
              </div>

              {/* Subtle Scaling and Glow Animation */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-secondary/10 via-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>

            <div className="group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-3 hover:shadow-2xl hover:shadow-accent/30 active:scale-95 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-background">
              {/* Tinted Glass Background with Brand Colors */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-primary/10 to-secondary/15 dark:from-accent/25 dark:via-primary/20 dark:to-secondary/25 backdrop-blur-xl border border-accent/20 dark:border-accent/30 rounded-3xl shadow-xl group-hover:shadow-2xl group-hover:shadow-accent/40 transition-all duration-500" />

              {/* Soft Glow Effect on Hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-accent/20 via-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />

              <div className="relative z-10 p-8 text-center space-y-6 h-full min-h-[280px] flex flex-col">
                {/* Prominent Icon at Top */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-r from-accent to-primary flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative overflow-hidden">
                    {/* Icon Glow Effect */}
                    <div className="absolute inset-0 bg-white/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Heart className="w-12 h-12 text-white relative z-10 drop-shadow-2xl" />
                  </div>
                </div>

                {/* Large High-Contrast Title and Description */}
                <div className="flex-1 flex flex-col justify-center space-y-3">
                  <h3 className="text-2xl font-extrabold text-foreground dark:text-white group-hover:text-accent dark:group-hover:text-purple-300 transition-colors duration-300 leading-tight">
                    Our Values
                  </h3>
                  <p className="text-muted-foreground dark:text-gray-300 text-sm font-semibold leading-relaxed line-clamp-3 px-2">
                    Built with love, designed for simplicity, and focused on your success.
                  </p>
                </div>
              </div>

              {/* Subtle Scaling and Glow Animation */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-accent/10 via-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          </div>

          <div className="glass rounded-3xl p-12 space-y-6 relative overflow-hidden">
            {/* Gradient Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-accent/5 to-primary/10 rounded-3xl" />

            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent relative z-10">
              Why Choose CreativeUtil?
            </h2>
            <div className="space-y-4 text-lg text-foreground dark:text-gray-100 font-medium relative z-10">
              <p>
                We believe that great tools should be accessible to everyone. That's why we've
                created CreativeUtil - a platform that combines powerful functionality with a
                delightful user experience.
              </p>
              <p>
                Whether you're a seasoned developer, a creative designer, or just starting your
                journey, CreativeUtil provides everything you need to turn your ideas into reality.
              </p>
              <p>
                Our commitment to continuous improvement means we're always adding new tools,
                features, and integrations to help you work smarter, not harder.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      </div>
    </>
  );
};

export default About;
