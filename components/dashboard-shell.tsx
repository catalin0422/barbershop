import Link from "next/link";
import { LogOut, Scissors } from "lucide-react";

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
    <div className="min-h-screen lg:grid lg:grid-cols-[256px_1fr]">
      <aside className="hidden lg:flex flex-col border-r border-white/5 bg-card/40 backdrop-blur-sm sticky top-0 h-screen">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-gradient-to-br from-gold-400 to-gold-700 text-gold-900">
              <Scissors className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">
              Maison<span className="text-gold-400">Barber</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="text-sm">{user.name}</div>
          <div className="text-xs text-muted-foreground capitalize">
            {user.role}
          </div>
          <form action="/api/auth/signout" method="POST" className="mt-3">
            <button
              type="submit"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-gold-300 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <div>
        <header className="sticky top-0 z-30 border-b border-white/5 bg-background/70 backdrop-blur-xl">
          <div className="px-4 lg:px-8 h-16 flex items-center justify-between">
            <h1 className="font-display text-xl font-semibold">{title}</h1>
            <div className="lg:hidden flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.name}
              </span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-xs text-muted-foreground hover:text-gold-300"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="lg:hidden border-t border-white/5 overflow-x-auto">
            <nav className="flex gap-1 px-2 py-2">
              {nav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="p-4 lg:p-8 max-w-7xl">{children}</main>
      </div>
    </div>
  );
}
