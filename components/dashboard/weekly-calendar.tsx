"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/types";

interface CalendarAppointment {
  id: string;
  client_name: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  service: { name: string; duration_minutes: number } | null;
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 9); // 09:00 → 19:00
const HOUR_HEIGHT = 64; // px per hour
const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: "bg-amber-500/20 border-amber-500/50 text-amber-200",
  confirmed: "bg-gold-500/20 border-gold-500/50 text-gold-200",
  completed: "bg-emerald-500/20 border-emerald-500/50 text-emerald-200",
  cancelled: "bg-red-500/10 border-red-500/30 text-red-300 opacity-50",
};

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday-first
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function WeeklyCalendar({
  appointments,
}: {
  appointments: CalendarAppointment[];
}) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function romDateStr(d: Date) {
    return d.toLocaleDateString("sv", { timeZone: "Europe/Bucharest" });
  }

  function aptsForDay(day: Date) {
    const iso = romDateStr(day);
    return appointments.filter(
      (a) => romDateStr(new Date(a.start_time)) === iso && a.status !== "cancelled",
    );
  }

  function topOffset(dt: Date) {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: "Europe/Bucharest",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(dt);
    const h = parseInt(parts.find((p) => p.type === "hour")!.value) - HOURS[0];
    const m = parseInt(parts.find((p) => p.type === "minute")!.value);
    return (h + m / 60) * HOUR_HEIGHT;
  }

  function blockHeight(start: Date, end: Date) {
    const diffMin = (end.getTime() - start.getTime()) / 60_000;
    return Math.max((diffMin / 60) * HOUR_HEIGHT, 28);
  }

  return (
    <div className="rounded-xl border border-white/5 bg-card/50 overflow-hidden">
      {/* Week nav */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeekStart((w) => addDays(w, -7))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {weekStart.toLocaleDateString("ro-RO", {
            day: "numeric",
            month: "long",
          })}{" "}
          —{" "}
          {addDays(weekStart, 6).toLocaleDateString("ro-RO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeekStart((w) => addDays(w, 7))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-white/5">
        <div />
        {weekDays.map((day) => {
          const isToday = day.getTime() === today.getTime();
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "py-2 text-center text-xs border-l border-white/5",
                isToday && "bg-gold-500/5",
              )}
            >
              <div className="text-muted-foreground uppercase tracking-wider">
                {day.toLocaleDateString("ro-RO", { weekday: "short" }).replace(".", "")}
              </div>
              <div
                className={cn(
                  "font-display text-lg mt-0.5",
                  isToday && "text-gold-400",
                )}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="overflow-y-auto max-h-[540px]">
        <div
          className="grid grid-cols-[48px_repeat(7,1fr)] relative"
          style={{ minHeight: HOUR_HEIGHT * HOURS.length }}
        >
          {/* Hour labels */}
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute left-0 w-full text-right pr-2 text-xs text-muted-foreground"
                style={{ top: (h - HOURS[0]) * HOUR_HEIGHT - 7 }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => {
            const isToday = day.getTime() === today.getTime();
            const apts = aptsForDay(day);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "relative border-l border-white/5",
                  isToday && "bg-gold-500/3",
                )}
                style={{ minHeight: HOUR_HEIGHT * HOURS.length }}
              >
                {/* Hour lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-white/5"
                    style={{ top: (h - HOURS[0]) * HOUR_HEIGHT }}
                  />
                ))}

                {/* Appointments */}
                {apts.map((apt) => {
                  const start = new Date(apt.start_time);
                  const end = new Date(apt.end_time);
                  const top = topOffset(start);
                  const height = blockHeight(start, end);
                  if (top < 0 || top > HOUR_HEIGHT * HOURS.length) return null;

                  return (
                    <div
                      key={apt.id}
                      title={`${apt.client_name} — ${apt.service?.name}`}
                      className={cn(
                        "absolute left-1 right-1 rounded-md border px-1.5 py-1 text-xs overflow-hidden cursor-default transition-opacity hover:opacity-90",
                        STATUS_COLORS[apt.status],
                      )}
                      style={{ top, height: Math.max(height, 28) }}
                    >
                      <div className="font-semibold truncate leading-tight">
                        {apt.client_name}
                      </div>
                      {height > 36 && (
                        <div className="truncate opacity-80 leading-tight">
                          {apt.service?.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-2 border-t border-white/5 text-xs text-muted-foreground">
        {(["pending", "confirmed", "completed"] as AppointmentStatus[]).map(
          (s) => (
            <span key={s} className="flex items-center gap-1.5">
              <Badge variant={s === "pending" ? "warning" : s === "confirmed" ? "default" : "success"}>·</Badge>
              {s === "pending" ? "Pending" : s === "confirmed" ? "Confirmat" : "Finalizat"}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
