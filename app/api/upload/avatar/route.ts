import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const BUCKET = "avatars";
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Server misconfigurat: SUPABASE_SERVICE_ROLE_KEY lipsește din variabilele de mediu Vercel." },
      { status: 500 },
    );
  }

  // Verify auth with regular client
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "no file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP allowed" },
      { status: 400 },
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large (max 2 MB)" },
      { status: 400 },
    );
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/avatar.${ext}`;
  const bytes = await file.arrayBuffer();

  // Use service client for storage upload to bypass RLS/bucket policies
  const admin = createServiceClient();

  // Ensure the bucket exists (creates it if missing, ignores error if it already exists)
  await admin.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const { error: uploadErr } = await admin.storage
    .from(BUCKET)
    .upload(path, bytes, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(BUCKET).getPublicUrl(path);

  const url = `${publicUrl}?t=${Date.now()}`;

  await admin
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", user.id);

  return NextResponse.json({ url });
}
