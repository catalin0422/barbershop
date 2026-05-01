"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({
  next,
  initialError,
}: {
  next?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: authError, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    if (!data.user) {
      setError("Autentificare eșuată.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    const target =
      next ??
      (profile?.role === "owner"
        ? "/admin"
        : profile?.role === "barber"
          ? "/dashboard"
          : "/");
    router.replace(target);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="password">Parolă</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5"
        />
      </div>
      {error && (
        <p className="text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-md p-2">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy} className="w-full">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Se autentifică...
          </>
        ) : (
          "Autentificare"
        )}
      </Button>
    </form>
  );
}
