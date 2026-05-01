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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
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
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const update: Record<string, unknown> = {};
  for (const k of [
    "name",
    "duration_minutes",
    "price",
    "description",
    "is_active",
  ] as const) {
    if (body[k] !== undefined) update[k] = body[k];
  }
  const { error } = await auth.supabase
    .from("services")
    .update(update)
    .eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await requireOwner();
  if (!auth.ok) {
    return NextResponse.json({ error: "forbidden" }, { status: auth.status });
  }
  const { error } = await auth.supabase
    .from("services")
    .delete()
    .eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
