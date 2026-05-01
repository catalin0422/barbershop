import { NextResponse } from "next/server";
import { sendContactMessage } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    name: string;
    phone: string;
    message: string;
  } | null;

  if (!body?.name?.trim() || !body?.message?.trim()) {
    return NextResponse.json({ error: "Nume și mesaj sunt obligatorii." }, { status: 400 });
  }

  await sendContactMessage({
    name: body.name.trim(),
    phone: body.phone?.trim() ?? "",
    message: body.message.trim(),
  }).catch(console.error);

  return NextResponse.json({ ok: true });
}
