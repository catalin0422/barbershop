"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Pencil, Trash2, UserPlus } from "lucide-react";
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

interface CreateForm {
  mode: "create";
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  bio: string;
}

interface EditForm {
  mode: "edit";
  id: string;
  full_name: string;
  role: UserRole;
  bio: string;
  avatar_url: string;
}

type FormState = CreateForm | EditForm;

const EMPTY_CREATE: CreateForm = {
  mode: "create",
  email: "",
  password: "",
  full_name: "",
  role: "barber",
  bio: "",
};

export function BarbersManager({ profiles }: { profiles: Profile[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_CREATE);
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setForm(EMPTY_CREATE);
    setError(null);
    setShowPass(false);
    setOpen(true);
  }

  function openEdit(p: Profile) {
    setForm({
      mode: "edit",
      id: p.id,
      full_name: p.full_name,
      role: p.role,
      bio: p.bio ?? "",
      avatar_url: p.avatar_url ?? "",
    });
    setError(null);
    setOpen(true);
  }

  function updateField(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value } as FormState));
  }

  async function save() {
    setBusy(true);
    setError(null);

    const isEdit = form.mode === "edit";
    const url = isEdit ? `/api/barbers/${(form as EditForm).id}` : "/api/barbers";
    const method = isEdit ? "PATCH" : "POST";

    const body = isEdit
      ? {
          full_name: form.full_name,
          role: form.role,
          bio: (form as EditForm).bio,
          avatar_url: (form as EditForm).avatar_url,
        }
      : {
          email: (form as CreateForm).email,
          password: (form as CreateForm).password,
          full_name: form.full_name,
          role: form.role,
          bio: (form as CreateForm).bio,
        };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

  const canSave =
    form.mode === "edit"
      ? !!form.full_name.trim()
      : !!(form.email.trim() && form.password.length >= 6 && form.full_name.trim());

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          {profiles.length} profile {pending && "(actualizare...)"}
        </span>
        <Button size="sm" onClick={openCreate}>
          <UserPlus className="h-4 w-4" /> Cont nou
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
              <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                Niciun profil. Creează primul cont.
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
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(p.id)}>
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
              {form.mode === "edit" ? "Editează profilul" : "Cont nou"}
            </DialogTitle>
            <DialogDescription>
              {form.mode === "edit"
                ? "Modifică detaliile profilului."
                : "Creează un cont de frizer sau owner direct din aplicație."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Câmpuri doar la creare */}
            {form.mode === "create" && (
              <>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={(form as CreateForm).email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="frizer@salon.ro"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Parolă</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPass ? "text" : "password"}
                      value={(form as CreateForm).password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="Minim 6 caractere"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Comunicați parola frizerului după creare.
                  </p>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="full_name">Nume complet</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => updateField("full_name", e.target.value)}
                placeholder="Ion Popescu"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Rol</Label>
              <Select
                value={form.role}
                onValueChange={(v) => updateField("role", v as UserRole)}
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
                value={form.mode === "create" ? (form as CreateForm).bio : (form as EditForm).bio}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="Câteva cuvinte despre frizer..."
                className="mt-1.5"
              />
            </div>

            {form.mode === "edit" && (
              <div>
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  value={(form as EditForm).avatar_url}
                  onChange={(e) => updateField("avatar_url", e.target.value)}
                  placeholder="https://..."
                  className="mt-1.5"
                />
              </div>
            )}

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
            <Button onClick={save} disabled={busy || !canSave}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {form.mode === "edit" ? "Salvează" : "Creează contul"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
