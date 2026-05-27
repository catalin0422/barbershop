import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Login — BarberShop",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <div className="min-h-screen flex">

      {/* ── Stânga: imagine dark ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden flex-col justify-between p-14">
        <img
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=85"
          alt="Barbershop"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
            <div className="font-display text-2xl tracking-[0.35em] text-white leading-none">
              BARBERS
            </div>
            <div className="text-[0.55rem] tracking-[0.55em] text-white/50 uppercase mt-0.5">
              Bucharest
            </div>
          </Link>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <h2 className="font-display text-5xl lg:text-6xl text-white uppercase leading-none">
            Panoul
            <br />
            de control
          </h2>
          <p className="text-zinc-400 text-sm mt-4 max-w-xs leading-relaxed">
            Gestionează programările, frizerii și statisticile salonului.
          </p>
        </div>
      </div>

      {/* ── Dreapta: formular alb ── */}
      <div className="flex-1 flex flex-col bg-white">

        {/* Back link */}
        <div className="px-8 lg:px-14 pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[0.65rem] tracking-[0.15em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Înapoi acasă
          </Link>
        </div>

        {/* Form centered */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-14 py-12">
          <div className="w-full max-w-sm">

            {/* Heading */}
            <div className="mb-10">
              <p className="text-[0.6rem] tracking-[0.3em] uppercase text-zinc-400 mb-4 font-sans">
                /autentificare
              </p>
              <h1 className="font-display text-4xl md:text-5xl text-zinc-900 uppercase leading-none">
                Bun venit
                <br />
                înapoi
              </h1>
              <p className="text-zinc-400 text-sm mt-3">
                Doar pentru personalul salonului.
              </p>
            </div>

            <LoginForm next={searchParams.next} initialError={searchParams.error} />

            <p className="mt-8 text-xs text-zinc-400 text-center">
              Ești client?{" "}
              <Link href="/book" className="text-zinc-900 font-semibold hover:underline">
                Rezervă direct aici →
              </Link>
            </p>
          </div>
        </div>

        {/* Footer mic */}
        <div className="px-8 lg:px-14 pb-8 text-[0.6rem] text-zinc-300 tracking-wide">
          © {new Date().getFullYear()} BarberShop
        </div>
      </div>

    </div>
  );
}
