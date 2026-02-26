"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Grid, History } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Search", icon: Search },
    { href: "/genres", label: "Genres", icon: Grid },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
            >
              <div className={`relative flex items-center justify-center w-8 h-8 ${isActive ? "bg-primary/10" : ""}`}>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary" />
                )}
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-primary" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area untuk HP dengan gesture bar */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  );
}