import Link from "next/link";
import { LogOut } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Props {
  title: string;
  user: { name: string; role: string };
  nav: NavItem[];
  children: React.ReactNode;
}

export function DashboardShell({ title, user, nav, children }: Props) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[256px_1fr] bg-white">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col border-r border-zinc-200 sticky top-0 h-screen bg-white">
        {/* Logo */}
        <div className="px-6 h-16 flex items-center border-b border-zinc-200 shrink-0">
          <Link href="/">
            <span className="font-display text-lg tracking-[0.3em] text-zinc-900 hover:text-zinc-500 transition-colors uppercase">
              Barbershop
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.72rem] tracking-[0.08em] uppercase text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-6 py-5 border-t border-zinc-100">
          <div className="text-sm font-medium text-zinc-900">{user.name}</div>
          <div className="text-xs text-zinc-400 capitalize mt-0.5">{user.role}</div>
          <form action="/api/auth/signout" method="POST" className="mt-3">
            <button
              type="submit"
              className="flex items-center gap-2 text-[0.65rem] tracking-[0.1em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Ieși din cont
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-col min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white">
          <div className="px-4 lg:px-8 h-16 flex items-center justify-between">
            <h1 className="font-display text-xl tracking-[0.15em] uppercase text-zinc-900">
              {title}
            </h1>
            <div className="lg:hidden flex items-center gap-3">
              <span className="text-sm text-zinc-500 hidden sm:inline">
                {user.name}
              </span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Mobile nav */}
          <div className="lg:hidden border-t border-zinc-100 overflow-x-auto">
            <nav className="flex gap-1 px-2 py-2">
              {nav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[0.65rem] tracking-[0.08em] uppercase text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 whitespace-nowrap transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="p-4 lg:p-8 max-w-7xl w-full">{children}</main>
      </div>
    </div>
  );
}
