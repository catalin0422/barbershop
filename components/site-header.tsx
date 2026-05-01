"use client";

import Link from "next/link";
import { useState } from "react";
import { LayoutDashboard, LogOut, Menu, Scissors, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/#services", label: "Servicii" },
  { href: "/#barbers", label: "Frizeri" },
  { href: "/#about", label: "Despre" },
  { href: "/#contact", label: "Contact" },
];

interface AuthUser {
  name: string;
  role: string;
}

interface Props {
  authUser?: AuthUser | null;
}

export function SiteHeader({ authUser }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  const dashboardHref = authUser?.role === "owner" ? "/admin" : "/dashboard";

  const AuthButtons = () =>
    authUser ? (
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
          <User className="h-3.5 w-3.5 text-gold-400" />
          <span className="text-gold-300 font-medium">{authUser.name}</span>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={dashboardHref}>
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Ieși</span>
        </Button>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/login">Cont</Link>
        </Button>
        <Button asChild>
          <Link href="/book">Programează-te</Link>
        </Button>
      </div>
    );

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
          <AuthButtons />
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
            {authUser ? (
              <>
                <Button variant="outline" asChild className="flex-1">
                  <Link href={dashboardHref}>Dashboard</Link>
                </Button>
                <Button variant="ghost" className="flex-1" onClick={signOut}>
                  Ieși din cont
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/login">Cont</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/book">Programează-te</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
