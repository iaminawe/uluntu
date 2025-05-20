'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sun, Moon } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm shadow-sm"
          : "bg-gradient-to-r from-orange-500 to-red-500"
      }`}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-white font-bold text-xl flex items-center"
          >
            Nelson Tech
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/events"
              className="text-white hover:text-orange-100 transition-colors"
            >
              Events
            </Link>
            <Link
              href="/directory"
              className="text-white hover:text-orange-100 transition-colors"
            >
              Directory
            </Link>
            <Link
              href="/companies"
              className="text-white hover:text-orange-100 transition-colors"
            >
              Companies
            </Link>
            <Link
              href="/opportunities"
              className="text-white hover:text-orange-100 transition-colors"
            >
              Opportunities
            </Link>
            <Link
              href="/marketplace"
              className="text-white hover:text-orange-100 transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/resources"
              className="text-white hover:text-orange-100 transition-colors"
            >
              Resources
            </Link>
            <Link
              href="/groups"
              className="text-white hover:text-orange-100 transition-colors"
            >
              Groups
            </Link>
            <Link
              href="/news"
              className="text-white hover:text-orange-100 transition-colors"
            >
              News
            </Link>
            <button
              onClick={toggleDarkMode}
              className="p-2 text-white hover:text-orange-100 transition-colors"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </nav>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-white hover:text-orange-100 transition-colors mr-2"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-gradient-to-r from-orange-600 to-red-600">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/events"
                className="block px-3 py-2 text-white hover:bg-orange-700 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Events
              </Link>
              <Link
                href="/directory"
                className="block px-3 py-2 text-white hover:bg-orange-700 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Directory
              </Link>
              <Link
                href="/companies"
                className="block px-3 py-2 text-white hover:bg-orange-700 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Companies
              </Link>
              <Link
                href="/opportunities"
                className="block px-3 py-2 text-white hover:bg-orange-700 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Opportunities
              </Link>
              <Link
                href="/marketplace"
                className="block px-3 py-2 text-white hover:bg-orange-700 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Marketplace
              </Link>
              <Link
                href="/resources"
                className="block px-3 py-2 text-white hover:bg-orange-700 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Resources
              </Link>
              <Link
                href="/groups"
                className="block px-3 py-2 text-white hover:bg-orange-700 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Groups
              </Link>
              <Link
                href="/news"
                className="block px-3 py-2 text-white hover:bg-orange-700 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                News
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}