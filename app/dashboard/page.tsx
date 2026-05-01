import { Calendar, CheckCircle2, Clock, Hourglass } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppointmentsTable } from "@/components/admin/appointments-table";
import { WeeklyCalendar } from "@/components/dashboard/weekly-calendar";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BarberDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: appointments } = await supabase
    .from("appointments")
    .select(
      "id, client_name, client_phone, client_email, start_time, end_time, status, notes, barber:profiles!appointments_barber_id_fkey(id, full_name), service:services(id, name, price, duration_minutes)",
    )
    .eq("barber_id", user.id)
    .order("start_time", { ascending: true });

  const upcoming =
    appointments?.filter(
      (a: any) =>
        a.status !== "cancelled" && new Date(a.start_time) >= new Date(),
    ) ?? [];

  const counts = (appointments ?? []).reduce<Record<string, number>>(
    (acc, a: any) => {
      acc[a.status as AppointmentStatus] =
        (acc[a.status as AppointmentStatus] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const calendarApts = (appointments ?? []).map((a: any) => ({
    id: a.id,
    client_name: a.client_name,
    start_time: a.start_time,
    end_time: a.end_time,
    status: a.status,
    service: a.service,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Programări viitoare" value={upcoming.length} icon={Calendar} />
        <StatCard label="Pending" value={counts.pending ?? 0} icon={Hourglass} />
        <StatCard label="Confirmate" value={counts.confirmed ?? 0} icon={Clock} />
        <StatCard label="Finalizate" value={counts.completed ?? 0} icon={CheckCircle2} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendar săptămânal</CardTitle>
          <CardDescription>Vizualizare grafică a programărilor tale.</CardDescription>
        </CardHeader>
        <CardContent>
          <WeeklyCalendar appointments={calendarApts} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista programărilor</CardTitle>
          <CardDescription>
            Schimbă statusul fiecărei programări pentru a o confirma sau finalizată.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentsTable
            appointments={(appointments ?? []) as any}
            allowAllStatusChanges
          />
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription>{label}</CardDescription>
        <Icon className="h-4 w-4 text-gold-400" />
      </CardHeader>
      <CardContent>
        <div className="font-display text-3xl">{value}</div>
      </CardContent>
    </Card>
  );
}
