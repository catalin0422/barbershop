import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isSlotFree } from "@/lib/availability";
import { sendBookingConfirmation, sendBarberNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

interface CreateBody {
  service_id: string;
  barber_id: string;
  start_time: string;
  client_name: string;
  client_phone: string;
  client_email?: string | null;
  notes?: string | null;
}

export async function POST(request: Request) {
  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const required: (keyof CreateBody)[] = [
    "service_id",
    "barber_id",
    "start_time",
    "client_name",
    "client_phone",
  ];
  for (const k of required) {
    if (!body[k] || String(body[k]).trim() === "") {
      return NextResponse.json({ error: `${k} is required` }, { status: 400 });
    }
  }

  const supabase = createClient();

  const [{ data: service, error: svcErr }, { data: barberProfile }] =
    await Promise.all([
      supabase
        .from("services")
        .select("name, duration_minutes, price, is_active")
        .eq("id", body.service_id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", body.barber_id)
        .maybeSingle(),
    ]);

  if (svcErr || !service || !service.is_active) {
    return NextResponse.json({ error: "service not found" }, { status: 404 });
  }

  const start = new Date(body.start_time);
  if (Number.isNaN(start.getTime())) {
    return NextResponse.json({ error: "invalid start_time" }, { status: 400 });
  }
  const end = new Date(start.getTime() + service.duration_minutes * 60_000);

  const { data: existing } = await supabase
    .from("appointments")
    .select("start_time, end_time, status")
    .eq("barber_id", body.barber_id)
    .gte("start_time", new Date(start.getTime() - 12 * 3600_000).toISOString())
    .lte("start_time", new Date(end.getTime() + 12 * 3600_000).toISOString());

  if (!isSlotFree({ start, end }, existing ?? [])) {
    return NextResponse.json(
      { error: "Slotul tocmai a fost ocupat. Te rugăm să alegi alt interval." },
      { status: 409 },
    );
  }

  const admin = createServiceClient();
  const { data, error } = await admin
    .from("appointments")
    .insert({
      service_id: body.service_id,
      barber_id: body.barber_id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      client_name: body.client_name,
      client_phone: body.client_phone,
      client_email: body.client_email ?? null,
      notes: body.notes ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    const isOverlap =
      error.code === "23P01" ||
      error.message?.toLowerCase().includes("conflict");
    return NextResponse.json(
      {
        error: isOverlap
          ? "Slotul tocmai a fost ocupat. Te rugăm să alegi alt interval."
          : error.message,
      },
      { status: isOverlap ? 409 : 500 },
    );
  }

  // Send emails async — don't block the response
  if (body.client_email) {
    sendBookingConfirmation({
      appointmentId: data.id,
      clientName: body.client_name,
      clientEmail: body.client_email,
      serviceName: service.name,
      barberName: barberProfile?.full_name ?? "Frizerul nostru",
      startTime: start.toISOString(),
      durationMinutes: service.duration_minutes,
      price: Number(service.price),
    }).catch(console.error);
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
