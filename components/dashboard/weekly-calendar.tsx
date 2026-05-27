"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  pending: "bg-zinc-100 border-zinc-300 text-zinc-600",
  confirmed: "bg-zinc-900 border-zinc-900 text-white",
  completed: "bg-zinc-600 border-zinc-600 text-white",
  cancelled: "bg-red-50 border-red-200 text-red-400 opacity-50",
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmat",
  completed: "Finalizat",
  cancelled: "Anulat",
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
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      {/* Week nav */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
        <button
          onClick={() => setWeekStart((w) => addDays(w, -7))}
          className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-zinc-900">
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
        <button
          onClick={() => setWeekStart((w) => addDays(w, 7))}
          className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-zinc-100">
        <div />
        {weekDays.map((day) => {
          const isToday = day.getTime() === today.getTime();
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "py-2 text-center text-xs border-l border-zinc-100",
                isToday && "bg-zinc-50",
              )}
            >
              <div className="text-zinc-400 uppercase tracking-wider">
                {day.toLocaleDateString("ro-RO", { weekday: "short" }).replace(".", "")}
              </div>
              <div
                className={cn(
                  "font-display text-lg mt-0.5 text-zinc-700",
                  isToday && "text-zinc-900 font-bold",
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
                className="absolute left-0 w-full text-right pr-2 text-xs text-zinc-400"
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
                  "relative border-l border-zinc-100",
                  isToday && "bg-zinc-50/50",
                )}
                style={{ minHeight: HOUR_HEIGHT * HOURS.length }}
              >
                {/* Hour lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-zinc-100"
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
                        "absolute left-1 right-1 rounded-lg border px-1.5 py-1 text-xs overflow-hidden cursor-default transition-opacity hover:opacity-90",
                        STATUS_COLORS[apt.status],
                      )}
                      style={{ top, height: Math.max(height, 28) }}
                    >
                      <div className="font-semibold truncate leading-tight">
                        {apt.client_name}
                      </div>
                      {height > 36 && (
                        <div className="truncate opacity-70 leading-tight">
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
      <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 border-t border-zinc-100 text-xs text-zinc-500">
        {(["pending", "confirmed", "completed"] as AppointmentStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={cn("inline-block h-2.5 w-2.5 rounded-sm border", STATUS_COLORS[s])} />
            {STATUS_LABELS[s]}
          </span>
        ))}
      </div>
    </div>
  );
}
