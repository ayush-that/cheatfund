// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Menu, X } from "lucide-react";

const navItems = [
  { name: "Features", href: "#features" },
  { name: "How it Works", href: "#how-it-works" },
  { name: "Security", href: "#security" },
  { name: "Contact", href: "#contact" },
];

export function TubelightNavbar() {
  const [activeItem, setActiveItem] = useState("");
  const [hoveredItem, setHoveredItem] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map((item) =>
        document.querySelector(item.href),
      );
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveItem(navItems[i].href);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <span className="text-primary-foreground text-lg font-bold">
                C
              </span>
            </div>
            <span className="text-foreground text-xl font-bold">CheatFund</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center md:flex">
            <div className="bg-muted/30 border-border/50 relative flex items-center rounded-full border p-1 backdrop-blur-sm">
              {/* Tubelight background */}
              <AnimatePresence>
                {(hoveredItem || activeItem) && (
                  <motion.div
                    className="bg-primary/20 border-primary/30 absolute inset-y-1 rounded-full border"
                    style={{
                      boxShadow:
                        "0 0 20px rgba(var(--color-primary), 0.3), inset 0 0 20px rgba(var(--color-primary), 0.1)",
                    }}
                    layoutId="navbar-indicator"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </AnimatePresence>

              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem("")}
                  className={`relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    activeItem === item.href
                      ? "text-primary"
                      : hoveredItem === item.href
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.name}

                  {/* Glow effect for active/hovered items */}
                  {(activeItem === item.href || hoveredItem === item.href) && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(var(--color-primary), 0.1) 0%, transparent 70%)",
                        filter: "blur(8px)",
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Connect Wallet Button & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground group relative overflow-hidden">
              <span className="relative z-10">Connect Wallet</span>
              <motion.div
                className="from-primary to-primary/80 absolute inset-0 bg-gradient-to-r"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ type: "tween", duration: 0.3 }}
              />
            </Button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-muted-foreground hover:text-foreground p-2 transition-colors md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-border/40 bg-background/95 border-t backdrop-blur md:hidden"
            >
              <div className="space-y-2 py-4">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    className={`block w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-all duration-300 ${
                      activeItem === item.href
                        ? "text-primary bg-primary/10 border-primary border-l-2"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
