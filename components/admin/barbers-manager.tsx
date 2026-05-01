"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Trash2, UserPlus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Profile, UserRole } from "@/lib/types";

interface FormState {
  id: string | null;
  full_name: string;
  role: UserRole;
  bio: string;
  avatar_url: string;
}

const EMPTY: FormState = {
  id: null,
  full_name: "",
  role: "barber",
  bio: "",
  avatar_url: "",
};

export function BarbersManager({ profiles }: { profiles: Profile[] }) {
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
  function openEdit(p: Profile) {
    setForm({
      id: p.id,
      full_name: p.full_name,
      role: p.role,
      bio: p.bio ?? "",
      avatar_url: p.avatar_url ?? "",
    });
    setError(null);
    setOpen(true);
  }

  async function save() {
    setBusy(true);
    setError(null);
    const url = form.id ? `/api/barbers/${form.id}` : "/api/barbers";
    const res = await fetch(url, {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: form.full_name,
        role: form.role,
        bio: form.bio,
        avatar_url: form.avatar_url,
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
    if (!confirm("Sigur ștergi acest profil?")) return;
    const res = await fetch(`/api/barbers/${id}`, { method: "DELETE" });
    if (res.ok) startTransition(() => router.refresh());
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          {profiles.length} profile {pending && "(actualizare...)"}
        </span>
        <Button size="sm" onClick={openCreate}>
          <UserPlus className="h-4 w-4" /> Profil nou
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nume</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="hidden md:table-cell">Bio</TableHead>
            <TableHead className="text-right">Acțiuni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground py-12"
              >
                Niciun profil. Adaugă-ți contul de owner sau creează frizeri în
                Supabase Auth.
              </TableCell>
            </TableRow>
          )}
          {profiles.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <div className="font-medium">{p.full_name}</div>
              </TableCell>
              <TableCell>
                <Badge variant={p.role === "owner" ? "default" : "secondary"}>
                  {p.role}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-md line-clamp-2">
                {p.bio ?? "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(p)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(p.id)}
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
              {form.id ? "Editează profilul" : "Profil nou"}
            </DialogTitle>
            <DialogDescription>
              {form.id
                ? "Modifică detaliile profilului."
                : "Crează un profil pentru un cont auth existent."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nume complet</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, full_name: e.target.value }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Rol</Label>
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, role: v as UserRole }))
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="barber">Barber</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bio: e.target.value }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                value={form.avatar_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, avatar_url: e.target.value }))
                }
                className="mt-1.5"
                placeholder="https://..."
              />
            </div>
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
            <Button onClick={save} disabled={busy || !form.full_name.trim()}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Salvează
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
