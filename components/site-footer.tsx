import Link from "next/link";
import { Instagram, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-14 grid gap-10 md:grid-cols-4">

        {/* Brand */}
        <div className="md:col-span-2">
          <Link href="/" className="inline-block group">
            <span className="font-display text-2xl tracking-[0.3em] text-white group-hover:text-zinc-300 transition-colors uppercase">
              Barbershop
            </span>
          </Link>
          <p className="mt-4 text-sm text-zinc-400 max-w-sm leading-relaxed">
            Atelier de grooming pentru gentlemeni. Tunsori clasice și moderne,
            executate cu precizie și pasiune.
          </p>
          <div className="mt-6 h-px w-12 bg-zinc-700" />
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.2em] text-white mb-5">
            Contact
          </h4>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li className="flex items-center gap-2.5 hover:text-white transition-colors cursor-pointer">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              Strada Mendeleev 7, București
            </li>
            <li className="flex items-center gap-2.5 hover:text-white transition-colors cursor-pointer">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              +40 712 345 678
            </li>
            <li className="flex items-center gap-2.5 hover:text-white transition-colors cursor-pointer">
              <Instagram className="h-3.5 w-3.5 shrink-0" />
              @barbershop
            </li>
          </ul>
        </div>

        {/* Schedule */}
        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.2em] text-white mb-5">
            Program
          </h4>
          <ul className="space-y-2.5 text-sm text-zinc-400">
            <li>Luni — Vineri · 10:00 — 20:00</li>
            <li>Sâmbătă · 10:00 — 18:00</li>
            <li className="text-zinc-600 italic">Duminică · închis</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-4 text-xs text-zinc-600 flex flex-col sm:flex-row gap-2 justify-between items-center">
          <span>© {new Date().getFullYear()} BarberShop. Toate drepturile rezervate.</span>
          <span className="italic">Crafted with precision.</span>
        </div>
      </div>
    </footer>
  );
}
