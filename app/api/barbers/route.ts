import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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
  if ((profile as any)?.role !== "owner") return { ok: false as const, status: 403 };
  return { ok: true as const };
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

export async function POST(request: Request) {
  const auth = await requireOwner();
  if (!auth.ok) {
    return NextResponse.json({ error: "forbidden" }, { status: auth.status });
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
    full_name?: string;
    role?: "owner" | "barber";
    bio?: string;
    avatar_url?: string;
  } | null;

  if (!body?.email || !body.password || !body.full_name) {
    return NextResponse.json(
      { error: "email, password și full_name sunt obligatorii" },
      { status: 400 },
    );
  }

  if (body.password.length < 6) {
    return NextResponse.json(
      { error: "Parola trebuie să aibă cel puțin 6 caractere" },
      { status: 400 },
    );
  }

  const admin = createServiceClient();

  // Create the auth user
  const { data: created, error: authErr } = await admin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true, // skip email verification
    user_metadata: {
      full_name: body.full_name,
      role: body.role ?? "barber",
    },
  });

  if (authErr || !created.user) {
    return NextResponse.json(
      { error: authErr?.message ?? "Eroare la crearea contului" },
      { status: 400 },
    );
  }

  // Upsert profile (trigger auto-creates it, but we want to set the role immediately)
  const { error: profileErr } = await admin.from("profiles").upsert({
    id: created.user.id,
    full_name: body.full_name,
    role: body.role ?? "barber",
    bio: body.bio ?? null,
    avatar_url: body.avatar_url ?? null,
  });

  if (profileErr) {
    // Auth user was created but profile failed — return partial success
    return NextResponse.json(
      { error: `Cont creat dar profilul a eșuat: ${profileErr.message}` },
      { status: 207 },
    );
  }

  return NextResponse.json({ id: created.user.id }, { status: 201 });
}
