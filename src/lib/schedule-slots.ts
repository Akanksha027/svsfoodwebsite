/** One-hour delivery window (IST, same-day). */
export type ScheduleSlot = {
  id: string;
  /** YYYY-MM-DD in IST */
  dateKey: string;
  startHour: number;
  endHour: number;
  label: string;
};

export type ScheduleSelection = {
  mode: "instant" | "scheduled";
  slot: ScheduleSlot | null;
};

const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

function istParts(now = new Date()) {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  return {
    year: ist.getUTCFullYear(),
    month: ist.getUTCMonth(),
    day: ist.getUTCDate(),
    hour: ist.getUTCHours(),
    minute: ist.getUTCMinutes(),
  };
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function dateKeyFromParts(p: { year: number; month: number; day: number }) {
  return `${p.year}-${pad2(p.month + 1)}-${pad2(p.day)}`;
}

function formatHour12(h: number): string {
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mer = h < 12 ? "AM" : "PM";
  return `${h12} ${mer}`;
}

function slotLabel(startHour: number, endHour: number): string {
  return `${formatHour12(startHour)} - ${formatHour12(endHour)}`;
}

/** Same-day slots from (current IST hour + 1) through 11 PM end. */
export function buildTodayScheduleSlots(now = new Date()): ScheduleSlot[] {
  const p = istParts(now);
  const dateKey = dateKeyFromParts(p);
  const firstStart = p.hour + 1;
  const lastStart = 22; // 10–11 PM is the last window ending at 11 PM

  const slots: ScheduleSlot[] = [];
  for (let start = firstStart; start <= lastStart; start += 1) {
    const end = start + 1;
    slots.push({
      id: `${dateKey}-${start}`,
      dateKey,
      startHour: start,
      endHour: end,
      label: slotLabel(start, end),
    });
  }
  return slots;
}

export function formatScheduleDayLabel(now = new Date()): string {
  const p = istParts(now);
  const d = new Date(Date.UTC(p.year, p.month, p.day));
  const dayMonth = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return `Today, ${dayMonth}`;
}

export function formatScheduledEta(slot: ScheduleSlot): string {
  return `Scheduled for ${slot.label}`;
}

/** Slot start as UTC ISO (IST wall-clock → UTC). */
export function slotStartToIso(slot: ScheduleSlot): string {
  const [y, m, d] = slot.dateKey.split("-").map(Number);
  const asUtcMs = Date.UTC(y, m - 1, d, slot.startHour, 0, 0);
  return new Date(asUtcMs - IST_OFFSET_MS).toISOString();
}

/** Re-validate a selection against current time (client-side). */
export function isScheduleSelectionValid(
  selection: ScheduleSelection,
  now = new Date(),
): boolean {
  if (selection.mode !== "scheduled" || !selection.slot) return true;
  const available = buildTodayScheduleSlots(now);
  return available.some((s) => s.id === selection.slot?.id);
}
