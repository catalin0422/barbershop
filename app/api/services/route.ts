import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function requireOwner() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401 };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "owner") return { ok: false as const, status: 403 };
  return { ok: true as const, supabase };
}

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("price");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ services: data });
}

export async function POST(request: Request) {
  const auth = await requireOwner();
  if (!auth.ok) {
    return NextResponse.json({ error: "forbidden" }, { status: auth.status });
  }
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    duration_minutes?: number;
    price?: number;
    description?: string;
    is_active?: boolean;
  } | null;
  if (
    !body?.name ||
    typeof body.duration_minutes !== "number" ||
    typeof body.price !== "number"
  ) {
    return NextResponse.json(
      { error: "name, duration_minutes, price are required" },
      { status: 400 },
    );
  }
  const { data, error } = await auth.supabase
    .from("services")
    .insert({
      name: body.name,
      duration_minutes: body.duration_minutes,
      price: body.price,
      description: body.description ?? null,
      is_active: body.is_active ?? true,
    })
    .select("id")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ id: data.id }, { status: 201 });
}
