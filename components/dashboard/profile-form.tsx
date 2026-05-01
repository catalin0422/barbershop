"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(profile.full_name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr(null);

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload/avatar", { method: "POST", body: fd });
    const json = await res.json();
    setUploading(false);

    if (!res.ok) {
      setErr(json.error ?? "Upload eșuat");
      setAvatarPreview(avatarUrl);
      return;
    }
    setAvatarUrl(json.url);
    setMsg("Avatar actualizat.");
    router.refresh();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, bio: bio || null, avatar_url: avatarUrl || null })
      .eq("id", profile.id);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setMsg("Profil actualizat.");
    router.refresh();
  }

  const initials = fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <form onSubmit={save} className="space-y-6">
      {/* Avatar upload */}
      <div className="flex items-center gap-5">
        <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
          <div className="h-20 w-20 rounded-full overflow-hidden bg-secondary grid place-items-center text-xl font-display text-gold-300 ring-2 ring-gold-500/20">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Camera className="h-5 w-5 text-white" />
            )}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Fotografie de profil</p>
          <p className="text-xs text-muted-foreground mt-0.5">JPEG, PNG sau WebP · max 2 MB</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Încarc...</> : "Schimbă poza"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="full_name">Nume</Label>
        <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="mt-1.5" placeholder="Câteva cuvinte despre tine și stilul tău..." />
      </div>

      {err && (
        <p className="text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-md p-2">{err}</p>
      )}
      {msg && (
        <p className="text-sm text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 rounded-md p-2">{msg}</p>
      )}
      <Button type="submit" disabled={busy || uploading}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Salvează
      </Button>
    </form>
  );
}
