import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const NAV = [
  { href: "/#services", label: "SERVICII" },
  { href: "/#barbers", label: "ECHIPA" },
  { href: "/#about", label: "DESPRE" },
  { href: "/#contact", label: "CONTACT" },
];

interface Props {
  /** true = text alb pe fundal întunecat (hero), false = text negru pe alb */
  dark?: boolean;
}

export async function PageHeader({ dark = false }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  type ProfileRow = { full_name: string; role: string };
  let profile: ProfileRow | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();
    profile = (data as ProfileRow | null) ?? null;
  }

  const fg = dark ? "text-white/65 hover:text-white" : "text-zinc-400 hover:text-zinc-900";
  const fgStrong = dark ? "text-white" : "text-zinc-900";
  const line = dark ? "bg-white/20" : "bg-zinc-200";

  return (
    <nav className="w-full px-8 lg:px-14 pt-7 pb-0">
      {/* Top rule */}
      <div className={`h-px ${line} mb-5`} />

      <div className="relative flex items-start justify-between min-h-[44px]">

        {/* Left — stacked nav links */}
        <div className="hidden md:flex flex-col gap-[3px]">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[0.6rem] tracking-[0.22em] transition-colors font-sans ${fg}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Center — logo */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <Link href="/">
            <div className={`font-display text-base md:text-xl tracking-[0.25em] md:tracking-[0.35em] leading-none ${fgStrong}`}>
              BARBERS
            </div>
            <div className={`text-[0.5rem] tracking-[0.55em] uppercase mt-0.5 ${dark ? "text-white/50" : "text-zinc-400"}`}>
              Bucharest
            </div>
          </Link>
        </div>

        {/* Right — auth / contact */}
        <div className={`text-right text-[0.62rem] space-y-0.5 hidden md:block ${fg}`}>
          {profile ? (
            <>
              <div className={`font-semibold ${fgStrong}`}>{profile.full_name}</div>
              <Link
                href={profile.role === "owner" ? "/admin" : "/dashboard"}
                className={`block transition-colors ${fg}`}
              >
                Dashboard →
              </Link>
            </>
          ) : (
            <>
              <div className="tracking-wide">office@barbershop.ro</div>
              <div className="tracking-wide">+40 712 345 678</div>
            </>
          )}
        </div>
      </div>

      {/* Bottom rule */}
      <div className={`h-px ${line} mt-3`} />
    </nav>
  );
}
