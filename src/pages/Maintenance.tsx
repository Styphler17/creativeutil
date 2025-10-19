import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Mail, Settings } from "lucide-react";
import logo from "@/assets/creativeutil-logo.png";

const Maintenance = () => {
  return (
    <>
      <Helmet>
        <title>Maintenance Mode – CreativeUtil</title>
        <meta name="description" content="CreativeUtil is temporarily under maintenance. We'll be back soon with improvements to our web development and design tools." />
        <meta name="keywords" content="maintenance, under construction, CreativeUtil, web development tools" />
        <meta name="author" content="CreativeUtil" />
        <link rel="canonical" href="https://creativeutil.com/maintenance" />
        <meta property="og:title" content="Maintenance Mode – CreativeUtil" />
        <meta property="og:description" content="CreativeUtil is temporarily under maintenance. We'll be back soon!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://creativeutil.com/maintenance" />
        <meta property="og:image" content="https://creativeutil.com/assets/creativeutil-og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@CreativeUtil" />
        <meta name="twitter:title" content="Maintenance Mode – CreativeUtil" />
        <meta name="twitter:description" content="CreativeUtil is temporarily under maintenance. We'll be back soon!" />
        <meta name="twitter:image" content="https://creativeutil.com/assets/creativeutil-og-image.png" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10 opacity-40 pattern-bg" />

        {/* Gradient Overlays */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -z-10" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />

        {/* Branded Accent Shapes */}
        <div className="fixed top-1/4 left-1/4 w-24 h-24 bg-gradient-to-br from-secondary to-accent rounded-full opacity-20 blur-lg -z-10" />
        <div className="fixed bottom-1/4 right-1/4 w-32 h-32 bg-gradient-to-tl from-accent to-primary rounded-full opacity-20 blur-xl -z-10" />

        <div className="flex-1 flex items-center justify-center px-4 md:px-6">
          <div className="glass rounded-3xl p-12 md:p-16 text-center max-w-2xl mx-auto space-y-8 relative overflow-hidden">
            {/* Gradient Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-3xl" />

            <div className="space-y-4 relative z-10">
              {/* Logo */}
              <img
                src={logo}
                alt="CreativeUtil Logo"
                className="mx-auto h-16 w-auto mb-6"
              />
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Maintenance
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Mode Active
              </h2>
              <p className="text-xl text-muted-foreground font-semibold">
                We're temporarily under maintenance to bring you an even better CreativeUtil experience. 
                Our team is working hard on improvements and new features. Check back soon!
              </p>
              <div className="flex justify-center">
                <Settings className="h-12 w-12 text-primary animate-spin" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                asChild
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-lg rounded-full shadow-2xl hover:scale-105 transition-transform"
              >
                <Link to="/">
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="glass border-2 px-8 py-6 text-lg rounded-full hover:scale-105 transition-transform"
              >
                <Link to="/contact">
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Us
                </Link>
              </Button>
            </div>

            <div className="pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Estimated time: A few hours. Follow us on social media for updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Maintenance;
