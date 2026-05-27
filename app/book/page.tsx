import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { PageHeader } from "@/components/page-header";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Service } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getBookingData() {
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
      .order("full_name"),
  ]);

  return {
    services: (services.data ?? []) as Service[],
    barbers: (barbers.data ?? []) as Profile[],
  };
}

export default async function BookPage({
  searchParams,
}: {
  searchParams: { service?: string; barber?: string };
}) {
  const { services, barbers } = await getBookingData();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav identic cu hero-ul */}
      <PageHeader />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-12 md:py-20">
          {/* Page header */}
          <div className="border-b border-zinc-200 pb-8 mb-10">
            <p className="text-[0.6rem] tracking-[0.3em] uppercase text-zinc-400 mb-4 font-sans">
              /rezervare
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-zinc-900 uppercase leading-none">
              Rezervă-ți slotul
            </h1>
            <p className="mt-3 text-zinc-400 text-sm">
              4 pași simpli — și ne vedem la salon.
            </p>
          </div>

          <Suspense fallback={null}>
            <BookingWizard
              services={services}
              barbers={barbers}
              initialServiceId={searchParams.service}
              initialBarberId={searchParams.barber}
            />
          </Suspense>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
