import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeAvailableSlots } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const serviceId = url.searchParams.get("service");
  const barberId = url.searchParams.get("barber");
  const day = url.searchParams.get("day");

  if (!serviceId || !barberId || !day) {
    return NextResponse.json(
      { error: "service, barber, day are required" },
      { status: 400 },
    );
  }

  const supabase = createClient();

  // Try the SQL RPC first.
  const rpc = await supabase.rpc("get_available_slots", {
    p_barber_id: barberId,
    p_service_id: serviceId,
    p_day: day,
  });

  if (!rpc.error && rpc.data) {
    return NextResponse.json({
      slots: rpc.data.map((row) => row.slot_start),
    });
  }

  // Fallback: compute in TS (e.g. RPC isn't deployed).
  const [{ data: service }, { data: existing }] = await Promise.all([
    supabase
      .from("services")
      .select("duration_minutes")
      .eq("id", serviceId)
      .maybeSingle(),
    supabase
      .from("appointments")
      .select("start_time, end_time, status")
      .eq("barber_id", barberId)
      .gte("start_time", `${day}T00:00:00.000Z`)
      .lt("start_time", `${day}T23:59:59.999Z`),
  ]);

  if (!service) {
    return NextResponse.json({ error: "service not found" }, { status: 404 });
  }

  const dayStart = new Date(`${day}T00:00:00`);
  const slots = computeAvailableSlots({
    day: dayStart,
    durationMinutes: service.duration_minutes,
    existing: existing ?? [],
  });

  return NextResponse.json({
    slots: slots.map((d) => d.toISOString()),
  });
}
