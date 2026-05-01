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
    full_name?: string;
    role?: "owner" | "barber";
    bio?: string;
    avatar_url?: string;
  } | null;
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const update: Record<string, unknown> = {};
  if (body.full_name !== undefined) update.full_name = body.full_name;
  if (body.role !== undefined) update.role = body.role;
  if (body.bio !== undefined) update.bio = body.bio || null;
  if (body.avatar_url !== undefined) update.avatar_url = body.avatar_url || null;
  update.updated_at = new Date().toISOString();

  const { error } = await auth.supabase
    .from("profiles")
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
  // Note: this only removes the profile row. The auth.users row must be
  // deleted separately via the Supabase dashboard or admin API.
  const { error } = await auth.supabase
    .from("profiles")
    .delete()
    .eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
