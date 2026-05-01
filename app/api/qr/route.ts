import { NextResponse } from "next/server";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const text = url.searchParams.get("text");
  if (!text) {
    return NextResponse.json({ error: "text param required" }, { status: 400 });
  }

  const dataUrl = await QRCode.toDataURL(text, {
    width: 200,
    margin: 1,
    color: { dark: "#d4af37", light: "#0f0e0d" },
  });

  // Strip the data:image/png;base64, prefix and return raw PNG
  const base64 = dataUrl.split(",")[1];
  const buffer = Buffer.from(base64, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
