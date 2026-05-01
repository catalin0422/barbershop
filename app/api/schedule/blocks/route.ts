import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("barber_blocks")
    .select("id, start_date, end_date, reason")
    .eq("barber_id", user.id)
    .gte("end_date", new Date().toISOString().slice(0, 10))
    .order("start_date");

  return NextResponse.json({ blocks: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as {
    start_date: string;
    end_date: string;
    reason?: string;
  } | null;

  if (!body?.start_date || !body?.end_date) {
    return NextResponse.json({ error: "start_date și end_date sunt necesare" }, { status: 400 });
  }

  const admin = createServiceClient();
  const { data, error } = await admin
    .from("barber_blocks")
    .insert({ barber_id: user.id, start_date: body.start_date, end_date: body.end_date, reason: body.reason ?? null })
    .select("id, start_date, end_date, reason")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ block: data }, { status: 201 });
}
