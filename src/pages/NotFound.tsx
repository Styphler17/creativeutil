import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Only log 404 errors for non-blog routes
    if (!location.pathname.startsWith('/blog')) {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Page Not Found – CreativeUtil</title>
        <meta name="description" content="Sorry, the page you're looking for doesn't exist. Return to CreativeUtil's homepage to explore our web development and design tools." />
        <meta name="keywords" content="404 error, page not found, CreativeUtil, web development tools" />
        <meta name="author" content="CreativeUtil" />
        <link rel="canonical" href="https://creativeutil.com/404" />
        <meta property="og:title" content="Page Not Found – CreativeUtil" />
        <meta property="og:description" content="Sorry, the page you're looking for doesn't exist. Return to CreativeUtil's homepage." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://creativeutil.com/404" />
        <meta property="og:image" content="https://creativeutil.com/assets/creativeutil-og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@CreativeUtil" />
        <meta name="twitter:title" content="Page Not Found – CreativeUtil" />
        <meta name="twitter:description" content="Sorry, the page you're looking for doesn't exist. Return to CreativeUtil's homepage." />
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
              <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                404
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Oops! Page Not Found
              </h2>
              <p className="text-xl text-muted-foreground font-semibold">
                The page you're looking for seems to have wandered off into the digital wilderness.
                Don't worry, let's get you back to the CreativeUtil!
              </p>
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
                <Link to="/tools">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Explore Tools
                </Link>
              </Button>
            </div>

            <div className="pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please{" "}
                <Link to="/contact" className="text-primary hover:underline">
                  contact us
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
