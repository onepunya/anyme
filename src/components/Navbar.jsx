
"use client";

import Link from "next/link";
import { Search, Moon, Sun, History, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export default function Navbar({ genres = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const genreSubmenu = genres.slice(0, 5).map((genre) => ({
    label: genre.title,
    href: `/genres/${genre.genreId}`,
  }));

  if (genres.length > 0) {
    genreSubmenu.push({
      label: "View All Genres →",
      href: "/genres",
    });
  }

  const menuItems = [
    { label: "Home", href: "/", submenu: null },
    {
      label: "Browse",
      submenu: [
        { label: "Ongoing Anime", href: "/ongoing" },
        { label: "Populer Anime", href: "/populer" },
        { label: "Movie Anime", href: "/movie" },
        { label: "Schedule", href: "/schedule" },
      ],
    },
    {
      label: "Genres",
      submenu: genreSubmenu.length > 0 ? genreSubmenu : [
        { label: "Action", href: "/genres/action" },
        { label: "Comedy", href: "/genres/comedy" },
        { label: "Romance", href: "/genres/romance" },
        { label: "Fantasy", href: "/genres/fantasy" },
        { label: "View All Genres →", href: "/genres" },
      ],
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-1 h-6 bg-primary" />
            <h1 className="text-lg font-black uppercase tracking-widest text-foreground">
              Any<span className="text-primary">me</span>
            </h1>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {menuItems.map((item) =>
              item.submenu ? (
                <div key={item.label} className="relative">
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors hover:text-primary"
                  >
                    {item.label}
                    <ChevronDown className={`h-3 w-3 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === item.label && (
                    <div className="absolute left-0 top-full mt-1 w-48 border border-border bg-background shadow-lg max-h-96 overflow-y-auto">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="block px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors hover:bg-primary hover:text-primary-foreground border-b border-border/50 last:border-0"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              )
            )}
          </div>

          {/* Search Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search anime..."
                className="w-full bg-card border border-border pl-9 pr-4 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-1.5">
            <Link
              href="/history"
              className="flex h-8 w-8 items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors"
              aria-label="Watch History"
            >
              <History className="h-3.5 w-3.5" />
            </Link>
            {mounted && (
              <button
                onClick={toggleTheme}
                className="flex h-8 w-8 items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-3.5 w-3.5" />
                ) : (
                  <Moon className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-8 w-8 items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search anime..."
                  className="w-full bg-card border border-border pl-9 pr-4 py-2.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Mobile Nav Links */}
            <div className="space-y-1">
              {menuItems.map((item) =>
                item.submenu ? (
                  <div key={item.label}>
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors hover:text-primary"
                    >
                      {item.label}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`} />
                    </button>
                    {openDropdown === item.label && (
                      <div className="ml-3 border-l border-primary/30 pl-3 space-y-1 max-h-64 overflow-y-auto">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className="block py-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
