"use client";

import Link from "next/link";
import { useState } from "react";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
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
  transparent?: boolean;
}

export function SiteHeader({ authUser, transparent }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  const dashboardHref = authUser?.role === "owner" ? "/admin" : "/dashboard";

  return (
    <header
      className={cn(
        "z-40 w-full",
        transparent
          ? "bg-transparent border-transparent"
          : "sticky top-0 bg-white border-b border-zinc-200",
      )}
    >
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 h-14 flex items-center justify-between gap-8">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <span className="font-display text-lg tracking-[0.3em] text-zinc-900 hover:text-zinc-500 transition-colors uppercase">
            Barbershop
          </span>
        </Link>

        {/* Nav links — center */}
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[0.65rem] tracking-[0.18em] text-zinc-400 hover:text-zinc-900 transition-colors uppercase font-sans"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons — right */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {authUser ? (
            <>
              <span className="text-xs text-zinc-400 mr-1">{authUser.name}</span>
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-1.5 border border-zinc-200 text-zinc-600 px-4 py-2 text-[0.65rem] tracking-[0.15em] uppercase hover:border-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
              </Link>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 text-zinc-400 px-3 py-2 text-[0.65rem] tracking-[0.15em] uppercase hover:text-zinc-900 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" /> Ieși
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[0.65rem] tracking-[0.15em] text-zinc-400 hover:text-zinc-900 transition-colors uppercase px-3 py-2"
              >
                Cont
              </Link>
              <Link
                href="/book"
                className="bg-zinc-900 hover:bg-black text-white px-5 py-2 rounded-full text-[0.65rem] tracking-[0.15em] uppercase transition-colors"
              >
                Programează-te
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden border-t border-zinc-200 bg-white transition-all overflow-hidden",
          open ? "max-h-96" : "max-h-0",
        )}
      >
        <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-[0.65rem] tracking-[0.18em] text-zinc-400 hover:text-zinc-900 uppercase py-2 font-sans"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-3 border-t border-zinc-100 mt-1">
            {authUser ? (
              <>
                <Link
                  href={dashboardHref}
                  className="flex-1 text-center border border-zinc-200 text-zinc-600 py-2.5 text-[0.65rem] tracking-[0.12em] uppercase hover:border-zinc-400 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="flex-1 text-center text-zinc-400 py-2.5 text-[0.65rem] tracking-[0.12em] uppercase hover:text-zinc-900 transition-colors"
                >
                  Ieși
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex-1 text-center border border-zinc-200 text-zinc-600 py-2.5 text-[0.65rem] tracking-[0.12em] uppercase hover:border-zinc-400 transition-colors"
                >
                  Cont
                </Link>
                <Link
                  href="/book"
                  className="flex-1 text-center bg-zinc-900 text-white py-2.5 rounded-full text-[0.65rem] tracking-[0.12em] uppercase hover:bg-black transition-colors"
                >
                  Programează-te
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
