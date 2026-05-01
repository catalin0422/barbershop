import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleForm } from "@/components/dashboard/schedule-form";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: schedule }, { data: blocks }] = await Promise.all([
    supabase
      .from("barber_schedules")
      .select("day_of_week, open_hour, close_hour")
      .eq("barber_id", user.id)
      .order("day_of_week"),
    supabase
      .from("barber_blocks")
      .select("id, start_date, end_date, reason")
      .eq("barber_id", user.id)
      .gte("end_date", new Date().toISOString().slice(0, 10))
      .order("start_date"),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Program săptămânal</CardTitle>
          <CardDescription>
            Bifează zilele în care lucrezi și setează orele de start și final.
            Clienții pot rezerva doar în zilele și intervalele bifate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleForm
            initialSchedule={(schedule ?? []) as any}
            initialBlocks={(blocks ?? []) as any}
          />
        </CardContent>
      </Card>
    </div>
  );
}
