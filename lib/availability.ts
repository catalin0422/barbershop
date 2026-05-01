import type { Appointment } from "@/lib/types";

export interface SlotRange {
  start: Date;
  end: Date;
}

export interface BusinessHours {
  openHour: number;
  closeHour: number;
  stepMinutes: number;
}

export const DEFAULT_HOURS: BusinessHours = {
  openHour: 10,
  closeHour: 20,
  stepMinutes: 30,
};

export function rangesOverlap(a: SlotRange, b: SlotRange): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Verifies a barber doesn't already have an active appointment overlapping
 * [start, end). The DB enforces this via trigger as a hard guarantee — this
 * function exists so the booking UI can pre-validate before submitting.
 */
export function isSlotFree(
  slot: SlotRange,
  existing: Pick<Appointment, "start_time" | "end_time" | "status">[],
): boolean {
  return !existing.some(
    (a) =>
      a.status !== "cancelled" &&
      rangesOverlap(slot, {
        start: new Date(a.start_time),
        end: new Date(a.end_time),
      }),
  );
}

/**
 * Generates the candidate time slots for a barber on a given day, filtering
 * out any that overlap an existing appointment. Used as a fallback when the
 * Supabase RPC is unavailable (e.g. unit tests, optimistic UI).
 */
export function computeAvailableSlots(params: {
  day: Date;
  durationMinutes: number;
  existing: Pick<Appointment, "start_time" | "end_time" | "status">[];
  hours?: BusinessHours;
}): Date[] {
  const { day, durationMinutes, existing, hours = DEFAULT_HOURS } = params;

  const slots: Date[] = [];
  const cursor = new Date(day);
  cursor.setHours(hours.openHour, 0, 0, 0);
  const close = new Date(day);
  close.setHours(hours.closeHour, 0, 0, 0);

  while (
    cursor.getTime() + durationMinutes * 60_000 <= close.getTime()
  ) {
    const candidate: SlotRange = {
      start: new Date(cursor),
      end: new Date(cursor.getTime() + durationMinutes * 60_000),
    };
    if (isSlotFree(candidate, existing)) {
      slots.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + hours.stepMinutes);
  }

  return slots;
}
