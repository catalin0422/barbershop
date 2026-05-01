import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeAvailableSlots } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const serviceId = url.searchParams.get("service");
  const barberId = url.searchParams.get("barber");
  const day = url.searchParams.get("day"); // yyyy-mm-dd

  if (!serviceId || !barberId || !day) {
    return NextResponse.json(
      { error: "service, barber, day are required" },
      { status: 400 },
    );
  }

  const supabase = createClient();

  // JS: 0=Sun…6=Sat → our DB: 1=Mon…7=Sun
  const jsDay = new Date(`${day}T12:00:00`).getDay();
  const ourDay = jsDay === 0 ? 7 : jsDay;

  const [serviceRes, existingRes, scheduleRes, blocksRes] = await Promise.all([
    supabase.from("services").select("duration_minutes").eq("id", serviceId).maybeSingle(),
    supabase
      .from("appointments")
      .select("start_time, end_time, status")
      .eq("barber_id", barberId)
      .gte("start_time", `${day}T00:00:00.000Z`)
      .lt("start_time", `${day}T23:59:59.999Z`),
    supabase
      .from("barber_schedules")
      .select("day_of_week, open_hour, close_hour")
      .eq("barber_id", barberId),
    supabase
      .from("barber_blocks")
      .select("start_date, end_date")
      .eq("barber_id", barberId)
      .lte("start_date", day)
      .gte("end_date", day),
  ]);

  if (!serviceRes.data) {
    return NextResponse.json({ error: "service not found" }, { status: 404 });
  }

  const schedule = scheduleRes.data ?? [];
  const blocks = blocksRes.data ?? [];
  const existing = existingRes.data ?? [];
  const service = serviceRes.data;

  // Date is blocked → no slots
  if (blocks.length > 0) {
    return NextResponse.json({ slots: [] });
  }

  // Barber has a schedule → check if this weekday is a working day
  let hours: { openHour: number; closeHour: number; stepMinutes: number } | undefined;
  if (schedule.length > 0) {
    const workingDay = schedule.find((s: any) => s.day_of_week === ourDay);
    if (!workingDay) {
      return NextResponse.json({ slots: [] });
    }
    hours = { openHour: workingDay.open_hour, closeHour: workingDay.close_hour, stepMinutes: 30 };
  }

  const slots = computeAvailableSlots({
    day: new Date(`${day}T00:00:00`),
    durationMinutes: service.duration_minutes,
    existing,
    hours,
  });

  return NextResponse.json({ slots: slots.map((d) => d.toISOString()) });
}
