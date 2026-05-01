import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server misconfigurat" }, { status: 500 });
  }

  const admin = createServiceClient();

  const { data: apt } = await admin
    .from("appointments")
    .select("id, status")
    .eq("id", params.id)
    .maybeSingle();

  if (!apt) {
    return NextResponse.json({ error: "Programarea nu a fost găsită." }, { status: 404 });
  }
  if (apt.status === "cancelled") {
    return NextResponse.json({ ok: true, alreadyCancelled: true });
  }

  const { error } = await admin
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
