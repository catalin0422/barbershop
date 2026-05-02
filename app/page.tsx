import Link from "next/link";
import {
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  Play,
  Scissors,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeaderServer } from "@/components/site-header-server";
import { ContactForm } from "@/components/contact-form";
import { createClient } from "@/lib/supabase/server";
import { formatDuration, formatPrice } from "@/lib/utils";
import type { Profile, Service } from "@/lib/types";

export const revalidate = 60;

async function getLandingData() {
  const supabase = createClient();
  const [services, barbers] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, full_name, role, bio, avatar_url, created_at, updated_at")
      .in("role", ["barber", "owner"])
      .limit(6),
  ]);

  return {
    services: (services.data ?? []) as Service[],
    barbers: (barbers.data ?? []) as Profile[],
  };
}

export default async function HomePage() {
  const { services, barbers } = await getLandingData();

  return (
    <div className="bg-black min-h-screen">
      {/* Transparent header over hero */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <SiteHeaderServer transparent />
      </div>

      <main>
        <Hero />
        <ServicesSection services={services} />
        {barbers.length > 0 && <BarbersSection barbers={barbers} />}
        <AboutSection />
        <GallerySection />
        <TestimonialsSection />
        <ContactSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col bg-black overflow-hidden">
      {/* Split layout */}
      <div className="flex flex-1 min-h-screen">

        {/* LEFT — text content */}
        <div className="relative z-10 flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-24 w-full md:w-[40%] bg-black">
          <div className="max-w-lg pt-28 pb-20 md:pt-24 md:pb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-6">
              Premium Grooming Studio
            </p>
            <h1 className="font-display text-6xl sm:text-7xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight text-white">
              Ridică-ți
              <br />
              stilul la
              <br />
              <span className="text-gradient-gold">alt nivel.</span>
            </h1>
            <Link
              href="/book"
              className="mt-10 inline-flex items-center gap-3 text-base text-white/60 hover:text-white transition-colors group"
            >
              <span className="w-8 h-px bg-white/40 group-hover:w-12 group-hover:bg-white transition-all" />
              Programează-te
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Bottom watch videos */}
          <div className="absolute bottom-10 left-8 md:left-16 lg:left-24 flex items-center gap-3 text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer">
            <span className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center">
              <Play className="h-3 w-3 fill-current" />
            </span>
            Urmărește video-urile noastre
          </div>
        </div>

        {/* RIGHT — image */}
        <div className="hidden md:block md:w-[60%] relative">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=85"
              alt="Barber"
              className="h-full w-full object-cover object-center"
            />
            {/* Gradient fade left to black */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
            {/* Gradient fade bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
          </div>
        </div>

        {/* Mobile: image as bg */}
        <div
          className="md:hidden absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center right",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/20">
        <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
      </div>

      {/* Credit */}
      <div className="absolute bottom-4 right-6 text-[10px] text-white/20 tracking-wide">
        Realizat de Dogaru Catalin · +37360171888
      </div>
    </section>
  );
}

function ServicesSection({ services }: { services: Service[] }) {
  return (
    <section id="services" className="bg-black py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-white/30 mb-4">
              Serviciile noastre
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
              Crafted for the
              <br />
              <span className="text-gradient-gold">discerning.</span>
            </h2>
          </div>
          <Button
            asChild
            variant="outline"
            className="self-start md:self-auto border-white/10 text-white/70 hover:text-white hover:border-white/30 bg-transparent"
          >
            <Link href="/book">
              Rezervă acum <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {services.length === 0 ? (
          <p className="text-white/30 text-sm">
            Configurează Supabase și rulează schema.sql pentru a afișa serviciile.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
            {services.map((s, i) => (
              <Link
                key={s.id}
                href={`/book?service=${s.id}`}
                className="group relative p-8 bg-black hover:bg-white/[0.03] transition-colors flex flex-col justify-between min-h-[200px]"
              >
                <div>
                  <p className="text-xs text-white/30 mb-3">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display text-xl font-semibold text-white mb-2">
                    {s.name}
                  </h3>
                  <p className="text-sm text-white/40 line-clamp-2">
                    {s.description ?? "Serviciu executat de mâini experimentate."}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-white/30">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(s.duration_minutes)}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-xl text-gradient-gold">
                      {formatPrice(Number(s.price))}
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function BarbersSection({ barbers }: { barbers: Profile[] }) {
  return (
    <section id="barbers" className="bg-black py-24 md:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
        <div className="mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-white/30 mb-4">
            Echipa
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
            Frizerii <span className="text-gradient-gold">noștri.</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers.map((b) => (
            <div key={b.id} className="group relative overflow-hidden rounded-xl">
              <div className="aspect-[3/4] bg-white/5 relative">
                {b.avatar_url ? (
                  <img
                    src={b.avatar_url}
                    alt={b.full_name}
                    className="absolute inset-0 h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <Scissors className="h-12 w-12 text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="font-display text-xl font-semibold text-white">
                    {b.full_name}
                  </p>
                  {b.bio && (
                    <p className="text-xs text-white/50 mt-1 line-clamp-2">
                      {b.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const stats = [
    { value: "6+", label: "Ani experiență" },
    { value: "8", label: "Frizeri" },
    { value: "1.2k", label: "Clienți / lună" },
  ];

  return (
    <section id="about" className="bg-black py-24 md:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden order-last md:order-first">
            <img
              src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=900&q=80"
              alt="Interior salon"
              className="absolute inset-0 h-full w-full object-cover grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-transparent" />
          </div>

          {/* Text */}
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-white/30 mb-4">
              Despre noi
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
              O <span className="text-gradient-gold">tradiție</span>
              <br />
              modernă.
            </h2>
            <p className="mt-8 text-white/50 leading-relaxed">
              Am deschis BarberShop în 2019 cu o singură obsesie: să recreăm
              ritualul clasic al frizeriei într-un spațiu contemporan. Fiecare
              tunsoare începe cu o consultație, fiecare brici cu un prosop
              fierbinte, fiecare client este tratat ca un oaspete.
            </p>
            <div className="mt-12 grid grid-cols-3 gap-8 border-t border-white/5 pt-10">
              {stats.map(({ value, label }) => (
                <div key={label}>
                  <div className="font-display text-3xl md:text-4xl text-gradient-gold">
                    {value}
                  </div>
                  <div className="text-xs text-white/30 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const GALLERY = [
  { src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80", alt: "Tunsoare clasică" },
  { src: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80", alt: "Styling bărbat" },
  { src: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80", alt: "Barbierit" },
  { src: "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=800&q=80", alt: "Frizer la lucru" },
  { src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80", alt: "Interior salon" },
  { src: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80", alt: "Produse premium" },
];

function GallerySection() {
  return (
    <section id="gallery" className="bg-black py-24 md:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-white/30 mb-4">Galerie</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
            Arta <span className="text-gradient-gold">noastră.</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          {GALLERY.map((img, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-lg ${i === 0 ? "md:row-span-2" : ""}`}
            >
              <div className={i === 0 ? "aspect-[3/4] md:aspect-auto md:h-full" : "aspect-square"}>
                <img
                  src={img.src}
                  alt={img.alt}
                  className="absolute inset-0 h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 hover:bg-black/0 transition-colors duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    name: "Alexandru M.",
    text: "Cel mai bun salon din oraș. Frizerul a înțeles exact ce voiam fără să explic prea mult. Mă întorc de fiecare dată.",
    rating: 5,
    since: "Client din 2022",
  },
  {
    name: "Bogdan T.",
    text: "Atmosferă deosebită, curățenie impecabilă și rezultate de calitate. Rezervarea online e super simplă.",
    rating: 5,
    since: "Client din 2023",
  },
  {
    name: "Mihai R.",
    text: "Am venit prima dată acum 2 ani și nu am mai schimbat salonul de atunci. Profesionalism la nivel înalt.",
    rating: 5,
    since: "Client din 2021",
  },
];

function TestimonialsSection() {
  return (
    <section id="reviews" className="bg-black py-24 md:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-white/30 mb-4">Recenzii</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
            Ce spun <span className="text-gradient-gold">clienții.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-6 flex flex-col gap-4">
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
                ))}
              </div>
              <p className="text-white/60 text-sm leading-relaxed flex-1">"{t.text}"</p>
              <div>
                <p className="text-white font-medium text-sm">{t.name}</p>
                <p className="text-white/30 text-xs mt-0.5">{t.since}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contact" className="bg-black py-24 md:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-white/30 mb-4">Contact</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
            Ia <span className="text-gradient-gold">legătura.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left — info + map */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-medium">Adresă</p>
                  <p className="text-white/50 text-sm mt-0.5">Strada Mendeleev 7, București</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gold-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-medium">Telefon</p>
                  <p className="text-white/50 text-sm mt-0.5">+40 712 345 678</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gold-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-medium">Program</p>
                  <p className="text-white/50 text-sm mt-0.5">Luni – Sâmbătă: 10:00 – 20:00</p>
                  <p className="text-white/50 text-sm">Duminică: închis</p>
                </div>
              </div>
            </div>

            {/* Google Maps embed — înlocuiește src cu locația ta */}
            <div className="rounded-xl overflow-hidden border border-white/10 h-56">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2848.8444388087937!2d26.09748!3d44.44676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b1ff4770adb5b3%3A0x58087f627f5be6d0!2sStrada%20Mendeleev%2C%20Bucure%C8%99ti!5e0!3m2!1sro!2sro!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right — contact form */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
            <h3 className="font-display text-2xl text-white mb-6">Trimite un mesaj</h3>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="bg-black py-24 md:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-white/30 mb-6">
          Urmează pasul
        </p>
        <h2 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight">
          Pregătit pentru o
          <br />
          <span className="text-gradient-gold">nouă imagine?</span>
        </h2>
        <p className="mt-6 text-white/40 max-w-md mx-auto">
          Rezervă în mai puțin de 30 de secunde. Plata se face la salon.
        </p>
        <Link
          href="/book"
          className="mt-10 inline-flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors group"
        >
          <span className="w-8 h-px bg-white/30 group-hover:w-16 group-hover:bg-gold-400 transition-all duration-300" />
          Programează-te acum
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
