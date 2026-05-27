import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  Scissors,
  Star,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { ContactForm } from "@/components/contact-form";
import { PageHeader } from "@/components/page-header";

function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
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
    <div className="min-h-screen">
      <main>
        <Hero />
        <ServicesSection services={services} />
        {barbers.length > 0 && <BarbersSection barbers={barbers} />}
        <AboutSection />
        <TestimonialsSection />
        <ContactSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}

function SectionLabel({ num, text }: { num: string; text: string }) {
  return (
    <p className="text-[0.6rem] tracking-[0.3em] uppercase text-zinc-400 mb-5 font-sans">
      /{num} — {text}
    </p>
  );
}

function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] bg-black overflow-hidden">
      {/* ── Full-bleed background image ── */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1800&q=90"
          alt="Frizer la lucru"
          className="h-full w-full object-cover object-center"
        />
        {/* Dark cinematic overlay — heavier on left & bottom */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      </div>

      {/* ── Navigation ── */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <PageHeader dark />
      </div>

      {/* ── Main content — bottom-left ── */}
      <div className="absolute bottom-0 left-0 z-20 px-8 lg:px-14 pb-12 lg:pb-16"
           style={{ maxWidth: "min(700px, calc(100% - 300px))" }}>

        {/* Section marker */}
        <p className="text-white/35 text-[0.7rem] tracking-[0.25em] mb-3 font-sans">/01</p>

        {/* Hero heading */}
        <h1 className="font-display text-[14vw] sm:text-[12vw] md:text-[9.5vw] lg:text-[8.5vw] text-white leading-[0.92] tracking-tight uppercase">
          Barbering
          <br />
          is what
          <br />
          we do
        </h1>

        {/* CTA row */}
        <div className="flex items-center gap-3 mt-8 md:mt-10 flex-wrap">
          {/* Scroll button */}
          <button
            className="w-10 h-10 rounded-full border border-white/35 flex items-center justify-center text-white/55 hover:text-white hover:border-white/70 transition-all shrink-0"
            aria-label="Scroll în jos"
          >
            <ArrowDown className="h-4 w-4" />
          </button>

          {/* Book CTA */}
          <Link
            href="/book"
            className="inline-flex items-center gap-3 bg-white text-black px-7 py-3 rounded-full text-[0.68rem] font-semibold tracking-[0.18em] uppercase hover:bg-white/90 transition-colors group"
          >
            Programează-te
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Services CTA */}
          <Link
            href="/#services"
            className="inline-flex items-center gap-3 border border-white/40 text-white px-7 py-3 rounded-full text-[0.68rem] font-semibold tracking-[0.18em] uppercase hover:border-white/80 transition-colors group"
          >
            Servicii
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

    </section>
  );
}

function ServicesSection({ services }: { services: Service[] }) {
  return (
    <section id="services" className="bg-white py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-zinc-200 mb-0">
          <div>
            <SectionLabel num="02" text="Servicii" />
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-zinc-900 uppercase leading-none">
              Ce oferim
            </h2>
          </div>
          <Link
            href="/book"
            className="inline-flex items-center gap-3 bg-zinc-900 text-white px-6 py-3 rounded-full text-[0.68rem] font-semibold tracking-[0.18em] uppercase hover:bg-black transition-colors self-start md:self-auto shrink-0"
          >
            Rezervă acum
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* List */}
        {services.length === 0 ? (
          <p className="text-zinc-400 text-sm mt-10">
            Configurează Supabase și rulează schema.sql pentru a afișa serviciile.
          </p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {services.map((s, i) => (
              <Link
                key={s.id}
                href={`/book?service=${s.id}`}
                className="group flex items-center justify-between py-6 md:py-7 hover:bg-zinc-50 -mx-4 px-4 transition-colors"
              >
                {/* Left: index + name + description */}
                <div className="flex items-baseline gap-5 md:gap-8 min-w-0">
                  <span className="text-[0.58rem] tracking-[0.2em] text-zinc-300 font-sans shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl md:text-3xl text-zinc-900 uppercase leading-none group-hover:text-zinc-500 transition-colors">
                      {s.name}
                    </h3>
                    {s.description && (
                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed line-clamp-1 max-w-xs md:max-w-sm">
                        {s.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: duration + price + arrow */}
                <div className="flex items-center gap-5 md:gap-8 shrink-0 ml-4">
                  <span className="hidden md:flex items-center gap-1.5 text-[0.65rem] text-zinc-400 tracking-wide">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {formatDuration(s.duration_minutes)}
                  </span>
                  <span className="font-display text-2xl md:text-3xl text-zinc-900 leading-none">
                    {formatPrice(Number(s.price))}
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all shrink-0" />
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
    <section id="barbers" className="bg-black py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">

        <div className="pb-10 border-b border-zinc-800 mb-10">
          <SectionLabel num="03" text="Echipa" />
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-white uppercase leading-none">
            Frizerii noștri
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {barbers.map((b) => (
            <div key={b.id} className="group relative overflow-hidden bg-black rounded-xl">
              <div className="aspect-[3/4] relative">
                {b.avatar_url ? (
                  <img
                    src={b.avatar_url}
                    alt={b.full_name}
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-zinc-900">
                    <Scissors className="h-12 w-12 text-zinc-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
                  <p className="font-display text-2xl text-white uppercase leading-none">
                    {b.full_name}
                  </p>
                  {b.bio && (
                    <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
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
    <section id="about" className="bg-white py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl order-last md:order-first">
            <img
              src="/barber-chair.png"
              alt="Barbershop chair"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Floating badge */}
            <div className="absolute top-4 right-4 bg-white border border-zinc-200 rounded-xl px-6 py-4 text-center shadow-sm">
              <div className="font-display text-3xl text-zinc-900 leading-none">2019</div>
              <div className="text-[0.55rem] tracking-[0.3em] uppercase text-zinc-400 mt-1">Deschis</div>
            </div>
          </div>

          {/* Text */}
          <div>
            <SectionLabel num="04" text="Despre noi" />
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-zinc-900 uppercase leading-none">
              O tradiție
              <br />
              modernă
            </h2>
            <div className="h-px bg-zinc-200 my-8" />
            <p className="text-zinc-500 leading-[1.9] text-sm md:text-base">
              Am deschis BarberShop în 2019 cu o singură obsesie: să recreăm
              ritualul clasic al frizeriei într-un spațiu contemporan. Fiecare
              tunsoare începe cu o consultație, fiecare brici cu un prosop
              fierbinte, fiecare client este tratat ca un oaspete.
            </p>
            <div className="mt-10 grid grid-cols-3 divide-x divide-zinc-200 border-t border-zinc-200 pt-8">
              {stats.map(({ value, label }) => (
                <div key={label} className="text-center px-4 first:pl-0 last:pr-0">
                  <div className="font-display text-4xl md:text-5xl text-zinc-900 leading-none">
                    {value}
                  </div>
                  <div className="text-xs text-zinc-400 mt-2 leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    name: "Alexandru M.",
    avatar: "https://i.pravatar.cc/48?img=3",
    text: "Cel mai bun salon din oraș. Frizerul a înțeles exact ce voiam fără să explic prea mult. Mă întorc de fiecare dată.",
    rating: 5,
    timeAgo: "acum 2 luni",
  },
  {
    name: "Bogdan T.",
    avatar: "https://i.pravatar.cc/48?img=15",
    text: "Atmosferă deosebită, curățenie impecabilă și rezultate de calitate. Rezervarea online e super simplă.",
    rating: 5,
    timeAgo: "acum 3 luni",
  },
  {
    name: "Mihai R.",
    avatar: "https://i.pravatar.cc/48?img=8",
    text: "Am venit prima dată acum 2 ani și nu am mai schimbat salonul de atunci. Profesionalism la nivel înalt.",
    rating: 5,
    timeAgo: "acum 4 luni",
  },
];

function TestimonialsSection() {
  return (
    <section id="reviews" className="bg-white py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">

        {/* Header cu rating global Google */}
        <div className="pb-10 border-b border-zinc-200 mb-10">
          <SectionLabel num="05" text="Recenzii" />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-zinc-900 uppercase leading-none">
              Ce spun clienții
            </h2>
            {/* Google rating badge */}
            <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-2xl px-5 py-3.5 self-start md:self-auto shrink-0">
              <GoogleIcon size={22} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-2xl text-zinc-900 leading-none">4.9</span>
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-[#FBBC04] text-[#FBBC04]" />
                    ))}
                  </div>
                </div>
                <p className="text-[0.6rem] text-zinc-400 tracking-wide mt-0.5">125 recenzii Google</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              {/* Top: Google logo */}
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[#FBBC04] text-[#FBBC04]" />
                  ))}
                </div>
                <GoogleIcon size={18} />
              </div>

              {/* Review text */}
              <p className="text-zinc-600 text-sm leading-[1.8] flex-1">
                "{t.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-1 border-t border-zinc-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
                <div>
                  <p className="text-zinc-900 font-semibold text-sm leading-tight">{t.name}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{t.timeAgo}</p>
                </div>
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
    <section id="contact" className="bg-white py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
        <div className="pb-10 border-b border-zinc-200 mb-12">
          <SectionLabel num="06" text="Contact" />
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-zinc-900 uppercase leading-none">
            Ia legătura
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left — info + map */}
          <div className="divide-y divide-zinc-100 border-y border-zinc-200">
            <div className="flex items-start gap-4 py-6">
              <div className="w-8 h-8 border border-zinc-200 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-zinc-600" />
              </div>
              <div>
                <p className="text-zinc-900 font-semibold text-sm">Adresă</p>
                <p className="text-zinc-500 text-sm mt-0.5">Strada Mendeleev 7, București</p>
              </div>
            </div>
            <div className="flex items-start gap-4 py-6">
              <div className="w-8 h-8 border border-zinc-200 rounded-lg flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-zinc-600" />
              </div>
              <div>
                <p className="text-zinc-900 font-semibold text-sm">Telefon</p>
                <p className="text-zinc-500 text-sm mt-0.5">+40 712 345 678</p>
              </div>
            </div>
            <div className="flex items-start gap-4 py-6">
              <div className="w-8 h-8 border border-zinc-200 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-zinc-600" />
              </div>
              <div>
                <p className="text-zinc-900 font-semibold text-sm">Program</p>
                <p className="text-zinc-500 text-sm mt-0.5">Luni – Sâmbătă: 10:00 – 20:00</p>
                <p className="text-zinc-500 text-sm">Duminică: <span className="italic">închis</span></p>
              </div>
            </div>

            <div className="overflow-hidden border border-zinc-200 rounded-xl h-56">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2848.8444388087937!2d26.09748!3d44.44676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b1ff4770adb5b3%3A0x58087f627f5be6d0!2sStrada%20Mendeleev%2C%20Bucure%C8%99ti!5e0!3m2!1sro!2sro!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right — contact form */}
          <div className="border border-zinc-200 bg-zinc-50 rounded-2xl p-8">
            <h3 className="font-display text-3xl text-zinc-900 uppercase mb-2">
              Trimite un mesaj
            </h3>
            <div className="h-px bg-zinc-200 mb-7" />
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="bg-zinc-900 py-24 md:py-40 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 80px)",
        }}
      />
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 text-center relative z-10">
        <p className="text-[0.6rem] tracking-[0.3em] uppercase text-zinc-500 mb-8 font-sans">/07</p>
        <h2 className="font-display text-[12vw] sm:text-[9vw] md:text-[7.5vw] text-white uppercase leading-[0.92]">
          Pregătit pentru o
          <br />
          nouă imagine?
        </h2>
        <p className="mt-8 text-zinc-400 max-w-sm mx-auto text-sm leading-relaxed">
          Rezervă în mai puțin de 30 de secunde. Plata se face la salon.
        </p>
        <Link
          href="/book"
          className="mt-10 inline-flex items-center gap-3 bg-white text-zinc-900 px-10 py-4 rounded-full text-[0.68rem] font-semibold tracking-[0.18em] uppercase hover:bg-zinc-100 transition-colors group"
        >
          Programează-te acum
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
