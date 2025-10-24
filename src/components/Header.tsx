import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/creativeutil-logo.png";

export const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;

    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 p-4 md:p-6 transition-transform duration-300 ${isHidden ? "-translate-y-full" : ""}`}>
      <nav className="max-w-7xl mx-auto glass rounded-3xl px-6 py-4">
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="flex-shrink-0 flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={logo} alt="CreativeUtil Logo" className="h-10 w-auto object-contain" />
            <span className="text-xl font-bold text-foreground">CreativeUtil</span>
          </Link>

          {/* Mobile Search */}
          {location.pathname === '/tools' && (
            <div className="md:hidden flex-1 mx-2 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tools..."
                  className="w-full pl-10 pr-4 py-2 rounded-full glass border-2 focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* Desktop Nav Links - Center */}
          <div className="hidden md:flex items-center gap-8 mx-auto">
            <Link
              to="/"
              className={`font-medium transition-colors ${
                location.pathname === "/"
                  ? "text-primary bg-primary/10 px-3 py-1 rounded-full"
                  : "text-foreground hover:text-primary"
              }`}
              aria-current={location.pathname === "/" ? "page" : undefined}
            >
              Home
            </Link>
            <Link
              to="/tools"
              className={`font-medium transition-colors ${
                location.pathname === "/tools"
                  ? "text-primary bg-primary/10 px-3 py-1 rounded-full"
                  : "text-foreground hover:text-primary"
              }`}
              aria-current={location.pathname === "/tools" ? "page" : undefined}
            >
              Tools
            </Link>
            <Link
              to="/about"
              className={`font-medium transition-colors ${
                location.pathname === "/about"
                  ? "text-primary bg-primary/10 px-3 py-1 rounded-full"
                  : "text-foreground hover:text-primary"
              }`}
              aria-current={location.pathname === "/about" ? "page" : undefined}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`font-medium transition-colors ${
                location.pathname === "/contact"
                  ? "text-primary bg-primary/10 px-3 py-1 rounded-full"
                  : "text-foreground hover:text-primary"
              }`}
              aria-current={location.pathname === "/contact" ? "page" : undefined}
            >
              Contact
            </Link>
          </div>

          {/* Desktop Get Started - Right */}
          <div className="hidden md:flex items-center justify-end gap-4">
            <ThemeToggle />
            <Link
              to="/tools"
              className="bg-secondary text-secondary-foreground px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform shadow-lg"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex-shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen ? "true" : "false"}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10 space-y-4">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={`block font-medium transition-colors ${
                location.pathname === "/"
                  ? "text-primary bg-primary/10 px-3 py-2 rounded-full"
                  : "text-foreground hover:text-primary"
              }`}
            >
              Home
            </Link>
            <Link
              to="/tools"
              onClick={() => setIsMenuOpen(false)}
              className={`block font-medium transition-colors ${
                location.pathname === "/tools"
                  ? "text-primary bg-primary/10 px-3 py-2 rounded-full"
                  : "text-foreground hover:text-primary"
              }`}
            >
              Tools
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMenuOpen(false)}
              className={`block font-medium transition-colors ${
                location.pathname === "/about"
                  ? "text-primary bg-primary/10 px-3 py-2 rounded-full"
                  : "text-foreground hover:text-primary"
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
              className={`block font-medium transition-colors ${
                location.pathname === "/contact"
                  ? "text-primary bg-primary/10 px-3 py-2 rounded-full"
                  : "text-foreground hover:text-primary"
              }`}
            >
              Contact
            </Link>
            <div className="flex items-center justify-center gap-4 pt-2">
              <ThemeToggle />
              <Link
                to="/tools"
                onClick={() => setIsMenuOpen(false)}
                className="block bg-secondary text-secondary-foreground px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform shadow-lg text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
