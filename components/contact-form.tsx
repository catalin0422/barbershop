"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Eroare la trimitere.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <CheckCircle2 className="h-10 w-10 text-zinc-900" />
        <p className="font-display text-2xl text-zinc-900">Mesaj trimis!</p>
        <p className="text-sm text-zinc-400">Te vom contacta în curând.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="c-name" className="text-zinc-500 text-xs uppercase tracking-wider">Nume *</Label>
        <Input
          id="c-name"
          required
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Ion Popescu"
          className="mt-1.5 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-300 rounded-lg focus-visible:ring-zinc-900"
        />
      </div>
      <div>
        <Label htmlFor="c-phone" className="text-zinc-500 text-xs uppercase tracking-wider">Telefon</Label>
        <Input
          id="c-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          placeholder="07XX XXX XXX"
          className="mt-1.5 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-300 rounded-lg focus-visible:ring-zinc-900"
        />
      </div>
      <div>
        <Label htmlFor="c-msg" className="text-zinc-500 text-xs uppercase tracking-wider">Mesaj *</Label>
        <Textarea
          id="c-msg"
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          placeholder="Cu ce te putem ajuta?"
          className="mt-1.5 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-300 rounded-lg resize-none focus-visible:ring-zinc-900"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 bg-zinc-900 text-white px-6 py-3.5 rounded-full text-[0.68rem] font-semibold tracking-[0.18em] uppercase hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Trimite mesajul
      </button>
    </form>
  );
}
