"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Scissors, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/#services", label: "Servicii" },
  { href: "/#barbers", label: "Frizeri" },
  { href: "/#about", label: "Despre" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-gradient-to-br from-gold-400 to-gold-700 text-gold-900 shadow-lg shadow-gold-500/30 group-hover:shadow-gold-500/50 transition-shadow">
            <Scissors className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-wide">
            Maison<span className="text-gold-400">Barber</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-gold-300 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Cont</Link>
          </Button>
          <Button asChild>
            <Link href="/book">Programează-te</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2 text-muted-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl transition-all overflow-hidden",
          open ? "max-h-96" : "max-h-0",
        )}
      >
        <div className="container py-4 flex flex-col gap-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-sm text-muted-foreground hover:text-gold-300 py-1"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/login">Cont</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/book">Programează-te</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
