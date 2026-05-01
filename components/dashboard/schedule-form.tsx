"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const DAYS = [
  { id: 1, short: "Lu", long: "Luni" },
  { id: 2, short: "Ma", long: "Marți" },
  { id: 3, short: "Mi", long: "Miercuri" },
  { id: 4, short: "Jo", long: "Joi" },
  { id: 5, short: "Vi", long: "Vineri" },
  { id: 6, short: "Sâ", long: "Sâmbătă" },
  { id: 7, short: "Du", long: "Duminică" },
];

interface DaySchedule {
  day_of_week: number;
  open_hour: number;
  close_hour: number;
}

interface Block {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
}

interface Props {
  initialSchedule: DaySchedule[];
  initialBlocks: Block[];
}

export function ScheduleForm({ initialSchedule, initialBlocks }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Weekly schedule state
  const [days, setDays] = useState<DaySchedule[]>(
    DAYS.map((d) => {
      const existing = initialSchedule.find((s) => s.day_of_week === d.id);
      return existing ?? { day_of_week: d.id, open_hour: 10, close_hour: 20 };
    }),
  );
  const [activeDays, setActiveDays] = useState<Set<number>>(
    new Set(initialSchedule.map((s) => s.day_of_week)),
  );
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleMsg, setScheduleMsg] = useState<string | null>(null);

  // Blocks state
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [newBlock, setNewBlock] = useState({ start_date: "", end_date: "", reason: "" });
  const [addingBlock, setAddingBlock] = useState(false);
  const [blockErr, setBlockErr] = useState<string | null>(null);

  function toggleDay(id: number) {
    setActiveDays((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function updateDayHours(id: number, field: "open_hour" | "close_hour", value: number) {
    setDays((prev) =>
      prev.map((d) => (d.day_of_week === id ? { ...d, [field]: value } : d)),
    );
  }

  async function saveSchedule() {
    setSavingSchedule(true);
    setScheduleMsg(null);
    const res = await fetch("/api/schedule", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        days: days.filter((d) => activeDays.has(d.day_of_week)),
      }),
    });
    setSavingSchedule(false);
    if (res.ok) {
      setScheduleMsg("Program salvat!");
      startTransition(() => router.refresh());
    } else {
      const j = await res.json().catch(() => ({}));
      setScheduleMsg(j.error ?? "Eroare la salvare");
    }
  }

  async function addBlock() {
    if (!newBlock.start_date || !newBlock.end_date) {
      setBlockErr("Selectează data de start și final.");
      return;
    }
    if (newBlock.end_date < newBlock.start_date) {
      setBlockErr("Data final trebuie să fie după data de start.");
      return;
    }
    setAddingBlock(true);
    setBlockErr(null);
    const res = await fetch("/api/schedule/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBlock),
    });
    const j = await res.json().catch(() => ({}));
    setAddingBlock(false);
    if (!res.ok) { setBlockErr(j.error ?? "Eroare"); return; }
    setBlocks((prev) => [...prev, j.block]);
    setNewBlock({ start_date: "", end_date: "", reason: "" });
    startTransition(() => router.refresh());
  }

  async function removeBlock(id: string) {
    const res = await fetch(`/api/schedule/blocks/${id}`, { method: "DELETE" });
    if (res.ok) setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="space-y-8">
      {/* Weekly schedule */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d) => (
            <button
              key={d.id}
              onClick={() => toggleDay(d.id)}
              className={cn(
                "w-12 h-12 rounded-lg text-sm font-medium border transition-all",
                activeDays.has(d.id)
                  ? "border-gold-500 bg-gold-500/10 text-gold-300"
                  : "border-border bg-secondary/30 text-muted-foreground hover:border-gold-500/40",
              )}
            >
              {d.short}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {DAYS.filter((d) => activeDays.has(d.id)).map((d) => {
            const s = days.find((x) => x.day_of_week === d.id)!;
            return (
              <div key={d.id} className="flex items-center gap-3 text-sm">
                <span className="w-20 text-muted-foreground">{d.long}</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={6}
                    max={22}
                    value={s.open_hour}
                    onChange={(e) => updateDayHours(d.id, "open_hour", Number(e.target.value))}
                    className="w-16 h-8 text-center"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    type="number"
                    min={7}
                    max={23}
                    value={s.close_hour}
                    onChange={(e) => updateDayHours(d.id, "close_hour", Number(e.target.value))}
                    className="w-16 h-8 text-center"
                  />
                </div>
              </div>
            );
          })}
          {activeDays.size === 0 && (
            <p className="text-sm text-muted-foreground">
              Nicio zi selectată — clienții nu vor putea rezerva.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={saveSchedule} disabled={savingSchedule} size="sm">
            {savingSchedule && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Salvează programul
          </Button>
          {scheduleMsg && (
            <span className={cn("text-sm", scheduleMsg.includes("Eroare") ? "text-red-400" : "text-emerald-400")}>
              {scheduleMsg}
            </span>
          )}
        </div>
      </div>

      {/* Blocked periods */}
      <div className="border-t border-white/5 pt-6 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-white">Zile libere / Concediu</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Adaugă perioade în care nu ești disponibil. Clienții nu vor vedea sloturi în acele zile.
          </p>
        </div>

        {blocks.length > 0 && (
          <div className="space-y-2">
            {blocks.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-secondary/20 px-3 py-2">
                <div className="text-sm">
                  <span className="text-white">
                    {b.start_date === b.end_date
                      ? formatDate(b.start_date)
                      : `${formatDate(b.start_date)} — ${formatDate(b.end_date)}`}
                  </span>
                  {b.reason && (
                    <span className="ml-2 text-muted-foreground">· {b.reason}</span>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  onClick={() => removeBlock(b.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 rounded-lg border border-white/5 bg-secondary/10 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">De la</Label>
              <Input
                type="date"
                value={newBlock.start_date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setNewBlock((p) => ({ ...p, start_date: e.target.value, end_date: p.end_date || e.target.value }))}
                className="mt-1 h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Până la</Label>
              <Input
                type="date"
                value={newBlock.end_date}
                min={newBlock.start_date || new Date().toISOString().slice(0, 10)}
                onChange={(e) => setNewBlock((p) => ({ ...p, end_date: e.target.value }))}
                className="mt-1 h-8"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Motiv (opțional)</Label>
            <Input
              value={newBlock.reason}
              onChange={(e) => setNewBlock((p) => ({ ...p, reason: e.target.value }))}
              placeholder="Concediu, zi liberă..."
              className="mt-1 h-8"
            />
          </div>
          {blockErr && <p className="text-xs text-red-400">{blockErr}</p>}
          <Button onClick={addBlock} disabled={addingBlock} size="sm" variant="outline">
            {addingBlock ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Adaugă perioadă
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
