import Link from "next/link";
import { Scissors } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Login — MaisonBarber",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <main className="min-h-screen grid place-items-center px-4 py-12 relative">
      <div className="absolute inset-0 -z-10 opacity-50 bg-[radial-gradient(ellipse_at_center,_hsla(43,65%,52%,0.15),_transparent_70%)]" />

      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-gradient-to-br from-gold-400 to-gold-700 text-gold-900 shadow-lg shadow-gold-500/30">
            <Scissors className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold">
            Maison<span className="text-gold-400">Barber</span>
          </span>
        </Link>

        <div className="rounded-xl border border-white/5 bg-card/70 backdrop-blur-sm p-8 shadow-2xl shadow-black/30">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Bun venit înapoi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Autentifică-te pentru a accesa panoul de administrare.
          </p>

          <LoginForm next={searchParams.next} initialError={searchParams.error} />
        </div>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Doar pentru personalul salonului. Clienții pot rezerva direct{" "}
          <Link href="/book" className="text-gold-400 hover:underline">
            aici
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
