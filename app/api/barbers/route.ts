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
    .from("profiles")
    .select("*")
    .order("full_name");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ profiles: data });
}

// Profiles are auto-created on auth signup. This endpoint is used to "claim"
// (upsert) a profile row before the owner has logged in for the first time,
// or to bulk-seed test data. The id must come from an existing auth.users row.
export async function POST(request: Request) {
  const auth = await requireOwner();
  if (!auth.ok) {
    return NextResponse.json({ error: "forbidden" }, { status: auth.status });
  }
  const body = (await request.json().catch(() => null)) as {
    id?: string;
    full_name?: string;
    role?: "owner" | "barber";
    bio?: string;
    avatar_url?: string;
  } | null;
  if (!body?.id || !body.full_name) {
    return NextResponse.json(
      { error: "id and full_name are required" },
      { status: 400 },
    );
  }
  const { error } = await auth.supabase.from("profiles").upsert({
    id: body.id,
    full_name: body.full_name,
    role: body.role ?? "barber",
    bio: body.bio ?? null,
    avatar_url: body.avatar_url ?? null,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
