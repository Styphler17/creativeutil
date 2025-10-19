import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { ToolOutputsProvider } from "@/contexts/ToolOutputsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PageLoader } from "@/components/PageLoader";
import Index from "./pages/Index";
import Tools from "./pages/Tools";
import ToolPage from "./pages/ToolPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Maintenance from "./pages/Maintenance";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ToolOutputsProvider>
        <TooltipProvider>
          <HelmetProvider>
            <Toaster />
            <Sonner />
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
          </HelmetProvider>
        </TooltipProvider>
      </ToolOutputsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
