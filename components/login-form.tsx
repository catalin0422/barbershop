"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label
          htmlFor="email"
          className="text-zinc-500 text-xs uppercase tracking-wider"
        >
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-300 rounded-lg focus-visible:ring-zinc-900"
        />
      </div>
      <div>
        <Label
          htmlFor="password"
          className="text-zinc-500 text-xs uppercase tracking-wider"
        >
          Parolă
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-300 rounded-lg focus-visible:ring-zinc-900"
        />
      </div>
      {error && (
        <p className="text-sm text-red-500 border border-red-200 bg-red-50 rounded-lg p-3">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="w-full flex items-center justify-center gap-2.5 bg-zinc-900 text-white px-6 py-3.5 rounded-full text-[0.68rem] font-semibold tracking-[0.18em] uppercase hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Se autentifică...
          </>
        ) : (
          "Autentificare"
        )}
      </button>
    </form>
  );
}
