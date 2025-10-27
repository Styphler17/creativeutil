import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Github, Twitter, Mail, ExternalLink } from "lucide-react";

export const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className="mt-auto py-8 px-4 md:px-6" role="contentinfo">
      <div className={`max-w-7xl mx-auto glass rounded-3xl px-8 py-8 ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>CreativeUtil</h3>
            <p className="text-muted-foreground dark:text-gray-300 mb-4">
              Your creative toolkit for modern web development and design. Build, optimize, and deploy with our comprehensive collection of developer tools.
            </p>
          </div>

          {/* Tools Section */}
          <div>
            <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Popular Tools</h4>
            <div className="flex flex-col gap-2">
              <Link to="/tools/markdown-preview" className="text-muted-foreground dark:text-gray-300 hover:text-primary dark:hover:text-cyan-400 transition-colors inline-flex w-fit">
                Markdown Preview
              </Link>
              <Link to="/tools/qr-generator" className="text-muted-foreground dark:text-gray-300 hover:text-primary dark:hover:text-cyan-400 transition-colors inline-flex w-fit">
                QR Code Generator
              </Link>
              <Link to="/tools/json-formatter" className="text-muted-foreground dark:text-gray-300 hover:text-primary dark:hover:text-cyan-400 transition-colors inline-flex w-fit">
                JSON Formatter
              </Link>
              <Link to="/tools/css-gradient" className="text-muted-foreground dark:text-gray-300 hover:text-primary dark:hover:text-cyan-400 transition-colors inline-flex w-fit">
                CSS Gradient Generator
              </Link>
              <Link to="/tools" className="text-muted-foreground dark:text-gray-300 hover:text-primary dark:hover:text-cyan-400 transition-colors inline-flex items-center gap-1 w-fit">
                View All Tools <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Resources Section */}
          <div>
            <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Resources</h4>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="text-muted-foreground dark:text-gray-300 hover:text-primary dark:hover:text-cyan-400 transition-colors inline-flex w-fit">
                About Us
              </Link>
              <Link to="/contact" className="text-muted-foreground dark:text-gray-300 hover:text-primary dark:hover:text-cyan-400 transition-colors inline-flex w-fit">
                Contact
              </Link>
              <Link to="/tools" className="text-muted-foreground dark:text-gray-300 hover:text-primary dark:hover:text-cyan-400 transition-colors inline-flex w-fit">
                Tool Directory
              </Link>
            </div>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Legal & Support</h4>
            <div className="flex flex-col gap-2">
              <Link to="/privacy" className="text-muted-foreground dark:text-gray-300 hover:text-primary dark:hover:text-cyan-400 transition-colors inline-flex w-fit">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-muted-foreground dark:text-gray-300 hover:text-primary dark:hover:text-cyan-400 transition-colors inline-flex w-fit">
                Terms of Service
              </Link>
              <a
                href="mailto:support@creativeutil.com?subject=Support Request"
                className="text-muted-foreground dark:text-gray-300 hover:text-primary dark:hover:text-cyan-400 transition-colors inline-flex w-fit"
              >
                Support
              </a>
              <a
                href="mailto:support@creativeutil.com?subject=Tool Request&body=Hi, I would like to request a new tool: [Tool Name]%0A%0ADescription: [Brief description of what the tool should do]%0A%0AUse case: [How would you use this tool?]"
                className="text-muted-foreground dark:text-gray-300 hover:text-primary dark:hover:text-cyan-400 transition-colors inline-flex w-fit"
              >
                Request a Tool
              </a>
            </div>
          </div>
        </div>

        <div className={`mt-8 pt-8 border-t text-center ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
          <p>&copy; 2025 CreativeUtil. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
