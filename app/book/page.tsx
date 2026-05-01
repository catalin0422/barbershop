import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
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
    <>
      <SiteHeader />
      <main className="container py-10 md:py-16 min-h-[80vh]">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Rezervă-ți <span className="text-gradient-gold">slotul</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            4 pași simpli — și ne vedem la salon.
          </p>
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
    </>
  );
}
