import Link from "next/link";
import {
  ArrowRight,
  Award,
  Calendar,
  Clock,
  Scissors,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
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
      .eq("role", "barber")
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
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Highlights />
        <ServicesSection services={services} />
        <BarbersSection barbers={barbers} />
        <AboutSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <Badge className="mb-6">
              <Sparkles className="h-3 w-3 mr-1" /> Premium Grooming Studio
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
              Stilul tău,
              <br />
              <span className="text-gradient-gold">redefinit.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">
              Atelier de grooming pentru gentlemeni. Frizerii noștri combină
              tehnica clasică cu eleganța modernă pentru o experiență
              memorabilă.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild>
                <Link href="/book">
                  Programează-te <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#services">Vezi serviciile</Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-gold-400 text-gold-400"
                  />
                ))}
                <span className="ml-2">4.9 / 5</span>
              </div>
              <span>· 1.2k+ clienți mulțumiți</span>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-gold-500/20 glow-gold">
              <div className="absolute inset-0 bg-gradient-to-br from-gold-900/20 via-transparent to-black" />
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&q=80')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 glass rounded-xl p-4 flex items-center gap-3">
                <Award className="h-8 w-8 text-gold-400" />
                <div>
                  <div className="text-sm font-semibold">
                    Maeștri ai foarfecii
                  </div>
                  <div className="text-xs text-muted-foreground">
                    +10 ani experiență per frizer
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 -z-10 h-40 w-40 rounded-full bg-gold-500/30 blur-3xl" />
            <div className="absolute -top-6 -right-6 -z-10 h-40 w-40 rounded-full bg-amber-700/30 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Highlights() {
  const items = [
    {
      icon: Scissors,
      title: "Tehnică clasică",
      desc: "Formare europeană, instrumentar profesional.",
    },
    {
      icon: Calendar,
      title: "Programări simple",
      desc: "Rezervi în 30 secunde, online.",
    },
    {
      icon: Clock,
      title: "Punctualitate",
      desc: "Timpul tău contează — onorăm fiecare slot.",
    },
    {
      icon: Award,
      title: "Produse premium",
      desc: "Brand-uri selectate pentru păr și barbă.",
    },
  ];
  return (
    <section className="border-y border-white/5 bg-card/30">
      <div className="container py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-gold-400 mt-1 shrink-0" />
            <div>
              <div className="text-sm font-semibold">{title}</div>
              <div className="text-xs text-muted-foreground">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServicesSection({ services }: { services: Service[] }) {
  return (
    <section id="services" className="container py-20 md:py-28">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge variant="outline" className="mb-3">
          Servicii
        </Badge>
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          Crafted for the <span className="text-gradient-gold">discerning</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Servicii executate de mâini experimentate, cu produse premium.
        </p>
      </div>

      {services.length === 0 ? (
        <EmptyServices />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <Card
              key={s.id}
              className="group hover:border-gold-500/30 hover:shadow-gold-500/10 transition-all"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle>{s.name}</CardTitle>
                  <span className="font-display text-2xl text-gradient-gold whitespace-nowrap">
                    {formatPrice(Number(s.price))}
                  </span>
                </div>
                <CardDescription>
                  {s.description ?? "Serviciu premium executat de echipa noastră."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(s.duration_minutes)}
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/book?service=${s.id}`}>
                    Rezervă <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyServices() {
  return (
    <Card className="text-center p-12">
      <CardTitle className="mb-2">Catalogul de servicii se pregătește</CardTitle>
      <CardDescription>
        Configurează variabilele Supabase și execută <code>schema.sql</code>{" "}
        pentru a popula serviciile.
      </CardDescription>
    </Card>
  );
}

function BarbersSection({ barbers }: { barbers: Profile[] }) {
  if (barbers.length === 0) return null;
  return (
    <section
      id="barbers"
      className="container py-20 md:py-28 border-t border-white/5"
    >
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge variant="outline" className="mb-3">
          Echipa
        </Badge>
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          Frizerii <span className="text-gradient-gold">noștri</span>
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.map((b) => (
          <Card key={b.id} className="overflow-hidden">
            <div className="aspect-[4/3] relative bg-secondary/40">
              {b.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.avatar_url}
                  alt={b.full_name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-4xl font-display text-gold-400/50">
                  {b.full_name
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
            </div>
            <CardHeader>
              <CardTitle>{b.full_name}</CardTitle>
              <CardDescription>
                {b.bio ?? "Maestru al foarfecii și al briciului."}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section
      id="about"
      className="container py-20 md:py-28 border-t border-white/5"
    >
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <Badge variant="outline" className="mb-3">
            Despre noi
          </Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            O <span className="text-gradient-gold">tradiție</span>
            <br />
            modernă.
          </h2>
          <p className="mt-6 text-muted-foreground">
            Am deschis MaisonBarber în 2019 cu o singură obsesie: să recreăm
            ritualul clasic al frizeriei într-un spațiu contemporan. Fiecare
            tunsoare începe cu o consultație, fiecare brici cu un prosop fierbinte,
            fiecare client este tratat ca un oaspete.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <Stat label="Ani experiență" value="6+" />
            <Stat label="Frizeri" value="8" />
            <Stat label="Clienți / lună" value="1.2k" />
          </div>
        </div>
        <div className="relative aspect-square rounded-2xl overflow-hidden border border-gold-500/20">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=900&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-card/50 p-4">
      <div className="font-display text-3xl text-gradient-gold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function CtaSection() {
  return (
    <section className="container pb-24">
      <div className="relative overflow-hidden rounded-2xl border border-gold-500/30 bg-gradient-to-br from-gold-900/40 via-card to-card p-10 md:p-16 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsla(43,65%,52%,0.3),_transparent_60%)]" />
        <div className="relative">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Pregătit pentru o nouă imagine?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Rezervă în mai puțin de 30 de secunde. Plata se face la salon.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/book">
              Programează-te acum <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
