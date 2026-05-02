import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeAvailableSlots, DEFAULT_HOURS } from "@/lib/availability";

// Returns how many hours ahead of UTC Romania is on the given date (2 in winter, 3 in summer).
function getRomaniaOffset(dateStr: string): number {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const h = parseInt(
    new Intl.DateTimeFormat("en", {
      timeZone: "Europe/Bucharest",
      hour: "numeric",
      hour12: false,
    }).format(d),
  );
  return h - 12;
}

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
      .lt("start_time", new Date(new Date(`${day}T00:00:00Z`).getTime() + 86400_000).toISOString()),
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

  // Business hours in the DB are Romania local time. Convert to UTC so that
  // computeAvailableSlots (which calls setHours in UTC server time) produces
  // the correct UTC timestamps.
  const romOffset = getRomaniaOffset(day);
  const baseHours = hours ?? DEFAULT_HOURS;
  const utcHours = {
    openHour: baseHours.openHour - romOffset,
    closeHour: baseHours.closeHour - romOffset,
    stepMinutes: baseHours.stepMinutes,
  };

  const slots = computeAvailableSlots({
    day: new Date(`${day}T00:00:00Z`),
    durationMinutes: service.duration_minutes,
    existing,
    hours: utcHours,
  });

  return NextResponse.json({ slots: slots.map((d) => d.toISOString()) });
}
