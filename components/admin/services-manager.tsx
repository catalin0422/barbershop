"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDuration, formatPrice } from "@/lib/utils";
import type { Service } from "@/lib/types";

interface FormState {
  id: string | null;
  name: string;
  duration_minutes: number;
  price: number;
  description: string;
  is_active: boolean;
}

const EMPTY: FormState = {
  id: null,
  name: "",
  duration_minutes: 30,
  price: 0,
  description: "",
  is_active: true,
};

export function ServicesManager({ services }: { services: Service[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setForm(EMPTY);
    setError(null);
    setOpen(true);
  }
  function openEdit(s: Service) {
    setForm({
      id: s.id,
      name: s.name,
      duration_minutes: s.duration_minutes,
      price: Number(s.price),
      description: s.description ?? "",
      is_active: s.is_active,
    });
    setError(null);
    setOpen(true);
  }

  async function save() {
    setBusy(true);
    setError(null);
    const url = form.id ? `/api/services/${form.id}` : "/api/services";
    const res = await fetch(url, {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        duration_minutes: form.duration_minutes,
        price: form.price,
        description: form.description,
        is_active: form.is_active,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Eroare la salvare");
      return;
    }
    setOpen(false);
    startTransition(() => router.refresh());
  }

  async function remove(id: string) {
    if (!confirm("Sigur ștergi acest serviciu?")) return;
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) startTransition(() => router.refresh());
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          {services.length} servicii {pending && "(actualizare...)"}
        </span>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Serviciu nou
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nume</TableHead>
            <TableHead>Durată</TableHead>
            <TableHead>Preț</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Acțiuni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground py-12"
              >
                Niciun serviciu. Adaugă primul.
              </TableCell>
            </TableRow>
          )}
          {services.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                  {s.description}
                </div>
              </TableCell>
              <TableCell>{formatDuration(s.duration_minutes)}</TableCell>
              <TableCell className="font-medium text-gold-300">
                {formatPrice(Number(s.price))}
              </TableCell>
              <TableCell>
                <Badge variant={s.is_active ? "success" : "secondary"}>
                  {s.is_active ? "Activ" : "Inactiv"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(s)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(s.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Editează serviciul" : "Serviciu nou"}
            </DialogTitle>
            <DialogDescription>
              Completează detaliile serviciului.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nume</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="duration">Durată (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={5}
                  step={5}
                  value={form.duration_minutes}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      duration_minutes: Number(e.target.value),
                    }))
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="price">Preț (RON)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={1}
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: Number(e.target.value) }))
                  }
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descriere</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="mt-1.5"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_active: e.target.checked }))
                }
                className="h-4 w-4 rounded border-border accent-gold-500"
              />
              Activ (vizibil în pagina publică)
            </label>
            {error && (
              <p className="text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-md p-2">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Anulează
            </Button>
            <Button
              onClick={save}
              disabled={busy || !form.name.trim() || form.duration_minutes <= 0}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Salvează
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
