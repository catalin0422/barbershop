import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { AppointmentsTable } from "@/components/admin/appointments-table";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage() {
  const supabase = createClient();

  const { data: appointments } = await supabase
    .from("appointments")
    .select(
      "id, client_name, client_phone, client_email, start_time, end_time, status, notes, barber:profiles!appointments_barber_id_fkey(id, full_name), service:services(id, name, price, duration_minutes)",
    )
    .order("start_time", { ascending: false });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Toate programările</CardTitle>
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
