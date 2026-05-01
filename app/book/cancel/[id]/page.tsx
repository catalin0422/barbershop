import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { SiteHeaderServer } from "@/components/site-header-server";
import { SiteFooter } from "@/components/site-footer";
import { CancelButton } from "./cancel-button";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CancelPage({
  params,
}: {
  params: { id: string };
}) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <ErrorPage message="Server misconfigurat. Contactează salonul." />;
  }

  const admin = createServiceClient();
  const { data: apt } = await admin
    .from("appointments")
    .select(
      "id, client_name, start_time, status, barber:profiles!appointments_barber_id_fkey(full_name), service:services(name, price, duration_minutes)",
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!apt) {
    return <ErrorPage message="Programarea nu a fost găsită sau linkul a expirat." />;
  }

  const alreadyCancelled = apt.status === "cancelled";
  const start = new Date(apt.start_time);
  const dateStr = start.toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = start.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const service = apt.service as any;
  const barber = apt.barber as any;

  return (
    <>
      <SiteHeaderServer />
      <main className="min-h-[80vh] container py-16 flex items-center justify-center">
        <div className="max-w-md w-full">
          {alreadyCancelled ? (
            <div className="text-center space-y-4">
              <p className="text-4xl">✓</p>
              <h1 className="font-display text-3xl text-white">
                Deja anulată
              </h1>
              <p className="text-muted-foreground">
                Această programare a fost deja anulată.
              </p>
              <Link href="/book" className="text-gold-400 hover:text-gold-300 text-sm">
                Fă o programare nouă →
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-3xl text-white">
                  Anulează programarea
                </h1>
                <p className="text-muted-foreground mt-2">
                  Ești sigur că dorești să anulezi?
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-card/60 p-5 space-y-3 text-sm">
                <Row label="Serviciu" value={service?.name ?? "—"} />
                <Row label="Frizer" value={barber?.full_name ?? "—"} />
                <Row label="Data" value={dateStr} />
                <Row label="Ora" value={timeStr} />
                {service && (
                  <Row label="Total" value={formatPrice(Number(service.price))} />
                )}
              </div>

              <CancelButton appointmentId={params.id} />

              <div className="text-center">
                <Link href="/" className="text-xs text-muted-foreground hover:text-white">
                  Nu anula — mergi înapoi
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function ErrorPage({ message }: { message: string }) {
  return (
    <>
      <SiteHeaderServer />
      <main className="min-h-[80vh] container py-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-display text-3xl text-white">Eroare</h1>
          <p className="text-muted-foreground">{message}</p>
          <Link href="/" className="text-gold-400 hover:text-gold-300 text-sm">
            Înapoi acasă →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
