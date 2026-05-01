import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("barber_schedules")
    .select("day_of_week, open_hour, close_hour")
    .eq("barber_id", user.id)
    .order("day_of_week");

  return NextResponse.json({ schedule: data ?? [] });
}

export async function PUT(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as {
    days: { day_of_week: number; open_hour: number; close_hour: number }[];
  } | null;
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const admin = createServiceClient();

  // Delete existing schedule and replace
  await admin.from("barber_schedules").delete().eq("barber_id", user.id);

  if (body.days.length > 0) {
    const { error } = await admin.from("barber_schedules").insert(
      body.days.map((d) => ({ ...d, barber_id: user.id })),
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
