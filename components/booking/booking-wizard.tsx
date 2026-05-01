"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  Scissors,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn, formatDuration, formatPrice } from "@/lib/utils";
import type { Profile, Service } from "@/lib/types";

interface Props {
  services: Service[];
  barbers: Profile[];
  initialServiceId?: string;
  initialBarberId?: string;
}

interface Form {
  serviceId: string | null;
  barberId: string | null;
  day: string | null; // ISO date (yyyy-mm-dd)
  slotStart: string | null; // ISO timestamptz
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
}

const STEPS = [
  { id: 1, label: "Serviciu", icon: Scissors },
  { id: 2, label: "Frizer", icon: User },
  { id: 3, label: "Dată & Oră", icon: CalendarIcon },
  { id: 4, label: "Confirmare", icon: Check },
];

export function BookingWizard({
  services,
  barbers,
  initialServiceId,
  initialBarberId,
}: Props) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Form>({
    serviceId: initialServiceId ?? null,
    barberId: initialBarberId ?? null,
    day: null,
    slotStart: null,
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    notes: "",
  });

  const service = useMemo(
    () => services.find((s) => s.id === form.serviceId) ?? null,
    [services, form.serviceId],
  );
  const barber = useMemo(
    () => barbers.find((b) => b.id === form.barberId) ?? null,
    [barbers, form.barberId],
  );

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function canAdvance() {
    if (step === 1) return !!form.serviceId;
    if (step === 2) return !!form.barberId;
    if (step === 3) return !!form.slotStart;
    if (step === 4)
      return form.clientName.trim().length >= 2 && form.clientPhone.trim().length >= 6;
    return false;
  }

  async function submit() {
    if (!form.serviceId || !form.barberId || !form.slotStart) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: form.serviceId,
          barber_id: form.barberId,
          start_time: form.slotStart,
          client_name: form.clientName.trim(),
          client_phone: form.clientPhone.trim(),
          client_email: form.clientEmail.trim() || null,
          notes: form.notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Nu am putut salva programarea.");
      }
      const json = await res.json();
      setAppointmentId(json.id ?? null);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare necunoscută");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) return <SuccessPanel form={form} service={service} barber={barber} appointmentId={appointmentId} />;

  return (
    <div className="mt-10">
      <Stepper current={step} />

      <div className="mt-8 rounded-xl border border-white/5 bg-card/60 backdrop-blur-sm p-6 md:p-8 shadow-2xl shadow-black/20 animate-fade-in">
        {step === 1 && (
          <ServiceStep
            services={services}
            selected={form.serviceId}
            onSelect={(id) => update("serviceId", id)}
          />
        )}
        {step === 2 && (
          <BarberStep
            barbers={barbers}
            selected={form.barberId}
            onSelect={(id) => update("barberId", id)}
          />
        )}
        {step === 3 && form.serviceId && form.barberId && (
          <DateTimeStep
            serviceId={form.serviceId}
            barberId={form.barberId}
            day={form.day}
            slotStart={form.slotStart}
            onDayChange={(d) => {
              update("day", d);
              update("slotStart", null);
            }}
            onSlotChange={(s) => update("slotStart", s)}
          />
        )}
        {step === 4 && (
          <ConfirmStep
            form={form}
            service={service}
            barber={barber}
            onChange={update}
            error={error}
          />
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1 || submitting}
        >
          <ArrowLeft className="h-4 w-4" /> Înapoi
        </Button>
        {step < 4 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
          >
            Continuă <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={submit} disabled={!canAdvance() || submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Se trimite...
              </>
            ) : (
              <>
                Confirmă programarea <Check className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center justify-between gap-2">
      {STEPS.map((s, i) => {
        const active = current === s.id;
        const done = current > s.id;
        const Icon = s.icon;
        return (
          <li key={s.id} className="flex-1 flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 transition-all",
                active && "scale-105",
              )}
            >
              <div
                className={cn(
                  "h-9 w-9 rounded-full grid place-items-center border transition-colors",
                  active
                    ? "border-gold-500 bg-gold-500/10 text-gold-300"
                    : done
                      ? "border-gold-500/50 bg-gold-500/20 text-gold-300"
                      : "border-border bg-secondary/40 text-muted-foreground",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span
                className={cn(
                  "hidden sm:inline text-sm",
                  active ? "text-foreground font-medium" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px",
                  done ? "bg-gold-500/50" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ServiceStep({
  services,
  selected,
  onSelect,
}: {
  services: Service[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  if (services.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Niciun serviciu disponibil. Contactează salonul.
      </p>
    );
  }
  return (
    <div>
      <h2 className="font-display text-2xl mb-1">Alege serviciul</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Poți modifica selecția ulterior.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {services.map((s) => {
          const active = selected === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={cn(
                "text-left p-4 rounded-lg border transition-all",
                active
                  ? "border-gold-500 bg-gold-500/5 shadow-md shadow-gold-500/20"
                  : "border-border bg-secondary/30 hover:border-gold-500/40",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium">{s.name}</div>
                <span className="text-gradient-gold font-display text-lg">
                  {formatPrice(Number(s.price))}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {s.description}
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDuration(s.duration_minutes)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BarberStep({
  barbers,
  selected,
  onSelect,
}: {
  barbers: Profile[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  if (barbers.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Niciun frizer activ în acest moment.
      </p>
    );
  }
  return (
    <div>
      <h2 className="font-display text-2xl mb-1">Alege frizerul</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Toți frizerii noștri sunt experimentați. Alege preferatul tău.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {barbers.map((b) => {
          const active = selected === b.id;
          const initials = b.full_name
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return (
            <button
              key={b.id}
              onClick={() => onSelect(b.id)}
              className={cn(
                "text-left p-4 rounded-lg border transition-all flex items-center gap-3",
                active
                  ? "border-gold-500 bg-gold-500/5 shadow-md shadow-gold-500/20"
                  : "border-border bg-secondary/30 hover:border-gold-500/40",
              )}
            >
              <div className="h-12 w-12 rounded-full overflow-hidden bg-secondary grid place-items-center text-sm font-display text-gold-300 shrink-0">
                {b.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.avatar_url}
                    alt={b.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">{b.full_name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {b.bio ?? "Maestru al foarfecii"}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateTimeStep({
  serviceId,
  barberId,
  day,
  slotStart,
  onDayChange,
  onSlotChange,
}: {
  serviceId: string;
  barberId: string;
  day: string | null;
  slotStart: string | null;
  onDayChange: (d: string) => void;
  onSlotChange: (s: string) => void;
}) {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Build the next 14 days
  const days = useMemo(() => {
    const out: { iso: string; label: string; weekday: string }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      out.push({
        iso,
        label: `${d.getDate()}`,
        weekday: d
          .toLocaleDateString("ro-RO", { weekday: "short" })
          .replace(".", ""),
      });
    }
    return out;
  }, []);

  useEffect(() => {
    if (!day) return;
    let aborted = false;
    setLoading(true);
    setErr(null);
    fetch(
      `/api/availability?service=${serviceId}&barber=${barberId}&day=${day}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (aborted) return;
        if (data.error) throw new Error(data.error);
        setSlots(data.slots ?? []);
      })
      .catch((e) => {
        if (!aborted) setErr(e.message ?? "Eroare la încărcare");
      })
      .finally(() => !aborted && setLoading(false));
    return () => {
      aborted = true;
    };
  }, [serviceId, barberId, day]);

  return (
    <div>
      <h2 className="font-display text-2xl mb-1">Alege data și ora</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Sloturile indisponibile nu apar în listă.
      </p>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {days.map((d) => {
          const active = day === d.iso;
          return (
            <button
              key={d.iso}
              onClick={() => onDayChange(d.iso)}
              className={cn(
                "snap-start shrink-0 w-16 py-3 rounded-lg border text-center transition-all",
                active
                  ? "border-gold-500 bg-gold-500/10 text-gold-200"
                  : "border-border bg-secondary/30 hover:border-gold-500/40",
              )}
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {d.weekday}
              </div>
              <div className="font-display text-xl">{d.label}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {!day && (
          <p className="text-sm text-muted-foreground">
            Selectează o zi pentru a vedea sloturile.
          </p>
        )}
        {day && loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă sloturile...
          </div>
        )}
        {day && err && (
          <p className="text-sm text-red-400">Eroare: {err}</p>
        )}
        {day && !loading && !err && slots.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nu sunt sloturi disponibile pentru ziua selectată.
          </p>
        )}
        {day && !loading && slots.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {slots.map((s) => {
              const date = new Date(s);
              const label = date.toLocaleTimeString("ro-RO", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const active = slotStart === s;
              return (
                <button
                  key={s}
                  onClick={() => onSlotChange(s)}
                  className={cn(
                    "py-2 rounded-md border text-sm transition-all",
                    active
                      ? "border-gold-500 bg-gold-500/15 text-gold-200"
                      : "border-border bg-secondary/30 hover:border-gold-500/40",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmStep({
  form,
  service,
  barber,
  onChange,
  error,
}: {
  form: Form;
  service: Service | null;
  barber: Profile | null;
  onChange: <K extends keyof Form>(k: K, v: Form[K]) => void;
  error: string | null;
}) {
  const slot = form.slotStart ? new Date(form.slotStart) : null;
  return (
    <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6">
      <div>
        <h2 className="font-display text-2xl mb-1">Detaliile tale</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Le folosim doar pentru a confirma programarea.
        </p>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nume complet *</Label>
            <Input
              id="name"
              required
              value={form.clientName}
              onChange={(e) => onChange("clientName", e.target.value)}
              placeholder="Andrei Popescu"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefon *</Label>
            <Input
              id="phone"
              required
              type="tel"
              value={form.clientPhone}
              onChange={(e) => onChange("clientPhone", e.target.value)}
              placeholder="07XX XXX XXX"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="email">Email (opțional)</Label>
            <Input
              id="email"
              type="email"
              value={form.clientEmail}
              onChange={(e) => onChange("clientEmail", e.target.value)}
              placeholder="andrei@exemplu.ro"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="notes">Note pentru frizer (opțional)</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              placeholder="Ex: prima vizită, păr lung, tunsoare scurtă în lateral..."
              className="mt-1.5"
            />
          </div>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-md p-2">
            {error}
          </p>
        )}
      </div>
      <div className="hidden lg:block w-px bg-border self-stretch" />
      <aside className="lg:pl-2">
        <h3 className="text-sm uppercase tracking-wider text-gold-400 font-semibold mb-3">
          Sumar
        </h3>
        <div className="space-y-3 rounded-lg border border-white/5 bg-background/40 p-4 text-sm">
          <Row label="Serviciu" value={service?.name ?? "—"} />
          <Row
            label="Durată"
            value={service ? formatDuration(service.duration_minutes) : "—"}
          />
          <Row label="Frizer" value={barber?.full_name ?? "—"} />
          <Row
            label="Data"
            value={
              slot
                ? slot.toLocaleDateString("ro-RO", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : "—"
            }
          />
          <Row
            label="Ora"
            value={
              slot
                ? slot.toLocaleTimeString("ro-RO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"
            }
          />
          <div className="border-t border-border/50 pt-3 flex justify-between items-baseline">
            <span className="text-muted-foreground">Total</span>
            <span className="font-display text-2xl text-gradient-gold">
              {service ? formatPrice(Number(service.price)) : "—"}
            </span>
          </div>
          <Badge variant="warning" className="w-full justify-center">
            Plata se face la salon
          </Badge>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function SuccessPanel({
  form,
  service,
  barber,
  appointmentId,
}: {
  form: Form;
  service: Service | null;
  barber: Profile | null;
  appointmentId: string | null;
}) {
  const slot = form.slotStart ? new Date(form.slotStart) : null;
  const site = typeof window !== "undefined" ? window.location.origin : "";
  const qrText = appointmentId
    ? `${site}/book/confirmation/${appointmentId}`
    : `${site}/book`;
  const qrSrc = `/api/qr?text=${encodeURIComponent(qrText)}`;

  return (
    <div className="mt-10 rounded-xl border border-gold-500/30 bg-gradient-to-br from-gold-900/30 via-card to-card p-8 md:p-10 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 text-center md:text-left">
          <CheckCircle2 className="h-12 w-12 text-gold-400 mx-auto md:mx-0" />
          <h2 className="mt-4 font-display text-3xl">Programare confirmată</h2>
          <p className="mt-2 text-muted-foreground">
            Te așteptăm la salon. Te vom suna pentru confirmare.
          </p>
          <div className="mt-6 inline-block text-left rounded-lg border border-white/5 bg-background/40 p-4 text-sm space-y-2">
            <Row label="Serviciu" value={service?.name ?? "—"} />
            <Row label="Frizer" value={barber?.full_name ?? "—"} />
            <Row
              label="Când"
              value={
                slot
                  ? `${slot.toLocaleDateString("ro-RO", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })} · ${slot.toLocaleTimeString("ro-RO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "—"
              }
            />
            {service && (
              <Row label="Total" value={formatPrice(Number(service.price))} />
            )}
          </div>
          <div className="mt-6">
            <Button asChild>
              <a href="/">Înapoi la pagina principală</a>
            </Button>
          </div>
        </div>

        {/* QR code */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="rounded-xl border border-gold-500/20 p-3 bg-background/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc} alt="QR programare" width={160} height={160} className="rounded-lg" />
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-[160px]">
            Prezintă QR-ul la salon
          </p>
          {appointmentId && (
            <p className="text-[10px] text-muted-foreground/60 font-mono">
              #{appointmentId.slice(0, 8)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
