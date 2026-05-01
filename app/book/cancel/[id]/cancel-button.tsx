"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CancelButton({ appointmentId }: { appointmentId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
      method: "POST",
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Eroare la anulare. Încearcă din nou.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
        <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
        <p className="font-display text-2xl text-white">Anulat cu succes</p>
        <p className="text-sm text-muted-foreground">
          Programarea ta a fost anulată. Ne vedem altă dată!
        </p>
        <Link
          href="/book"
          className="inline-block mt-2 text-sm text-gold-400 hover:text-gold-300"
        >
          Fă o programare nouă →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        variant="destructive"
        className="w-full"
        onClick={handleCancel}
        disabled={loading}
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Se anulează...</>
        ) : (
          "Anulează programarea"
        )}
      </Button>
      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}
