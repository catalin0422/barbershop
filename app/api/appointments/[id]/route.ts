import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const ALLOWED: AppointmentStatus[] = ["confirmed", "cancelled"];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    status?: string;
  } | null;
  if (!body?.status || !ALLOWED.includes(body.status as AppointmentStatus)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  // RLS handles authorization: barbers can only update their own appointments,
  // and the owner policy allows updating any.
  const { error } = await supabase
    .from("appointments")
    .update({ status: body.status as AppointmentStatus })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
