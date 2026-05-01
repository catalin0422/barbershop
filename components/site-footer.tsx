import Link from "next/link";
import { Instagram, MapPin, Phone } from "lucide-react";
import { BarbershopLogo } from "@/components/barbershop-logo";

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="border-t border-white/5 bg-background/60 mt-24"
    >
      <div className="container py-12 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <BarbershopLogo size={40} />
            <span className="font-display text-xl tracking-widest text-white">
              BARBERSHOP
            </span>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground max-w-md">
            Atelier de grooming pentru gentlemeni. Tunsori clasice și moderne,
            executate cu precizie chirurgicală.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm uppercase tracking-wider text-gold-400 mb-3">
            Contact
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold-500" /> Strada Mendeleev 7,
              București
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold-500" /> +40 712 345 678
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-gold-500" /> @barbershop
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm uppercase tracking-wider text-gold-400 mb-3">
            Program
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Luni — Vineri · 10:00 — 20:00</li>
            <li>Sâmbătă · 10:00 — 18:00</li>
            <li>Duminică · închis</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="container py-4 text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 justify-between items-center">
          <span>© {new Date().getFullYear()} BarberShop. All rights reserved.</span>
          <span>Crafted with precision.</span>
        </div>
      </div>
    </footer>
  );
}
