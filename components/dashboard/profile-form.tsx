"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        bio: bio || null,
        avatar_url: avatarUrl || null,
      })
      .eq("id", profile.id);
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setMsg("Profil actualizat.");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <Label htmlFor="full_name">Nume</Label>
        <Input
          id="full_name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="avatar_url">Avatar URL</Label>
        <Input
          id="avatar_url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1.5"
        />
      </div>
      {err && (
        <p className="text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-md p-2">
          {err}
        </p>
      )}
      {msg && (
        <p className="text-sm text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 rounded-md p-2">
          {msg}
        </p>
      )}
      <Button type="submit" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Salvează
      </Button>
    </form>
  );
}
