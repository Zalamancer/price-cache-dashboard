import { Link, useLocation } from "wouter";
import { Zap, Menu, X } from "lucide-react";
import StatusIndicator from "./StatusIndicator";
import { useState } from "react";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/benchmark", label: "Benchmark" },
    { href: "/observability", label: "Observability" },
    { href: "/circuit-breaker", label: "Circuit Breaker" },
  ];

  const navLinkClass = (path: string) => `text-sm font-medium transition-colors ${
    isActive(path)
      ? "text-accent"
      : "text-muted-foreground hover:text-foreground"
  }`;

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Zap className="w-6 h-6 text-accent" />
          <span className="font-bold text-lg tracking-tight hidden sm:inline">Price Cache</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={navLinkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section: Status + Mobile Menu Button */}
        <div className="flex items-center gap-4">
          {/* Status Indicator - Hidden on very small screens */}
          <div className="hidden sm:block">
            <StatusIndicator />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card/95 backdrop-blur">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isActive(link.href)
                    ? "bg-accent/20 text-accent font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Mobile Status Indicator */}
            <div className="sm:hidden pt-2 border-t border-border mt-2">
              <StatusIndicator />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
