import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { HelmetProvider } from "react-helmet-async";
import { ToolOutputsProvider } from "@/contexts/ToolOutputsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PageLoader } from "@/components/PageLoader";
import Index from "./pages/Index";

const Tools = lazy(() => import("./pages/Tools"));
const ToolPage = lazy(() => import("./pages/ToolPage"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Maintenance = lazy(() => import("./pages/Maintenance"));

const queryClient = new QueryClient();

const App = () => {
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToolOutputsProvider>
          <TooltipProvider>
            <HelmetProvider>
              <Toaster />
              <Sonner />
              {isMaintenanceMode ? (
                <Suspense fallback={<PageLoader message="Loading CreativeUtil experience..." />}>
                  <Maintenance />
                </Suspense>
              ) : (
                <BrowserRouter>
                  <Suspense fallback={<PageLoader message="Loading CreativeUtil experience..." />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/tools" element={<Tools />} />
                      <Route path="/tools/:id" element={<ToolPage />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/maintenance" element={<Maintenance />} />

                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              )}
            </HelmetProvider>
          </TooltipProvider>
        </ToolOutputsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
