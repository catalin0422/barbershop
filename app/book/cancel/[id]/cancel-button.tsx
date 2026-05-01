"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CancelButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    router.refresh();
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
