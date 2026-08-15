/**
 * SM-2 with the usual modern softening: eases are clamped, lapses drop the card
 * back into learning rather than resetting it to zero knowledge.
 */

export type Grade = "again" | "hard" | "good" | "easy";

export interface Card {
  id: string;
  ease: number;
  /** Scheduling interval in days. 0 means the card is still in learning. */
  intervalDays: number;
  /** ISO date (YYYY-MM-DD) the card next comes up. */
  due: string;
  /** ISO date the card was first introduced — used to cap new cards per day. */
  firstSeen: string;
  reps: number;
  lapses: number;
}

export const MIN_EASE = 1.3;
export const MAX_EASE = 2.7;
const START_EASE = 2.5;

/**
 * Intervals compound, so an unbounded schedule overflows Date within ~40 reviews.
 * 100 years is the conventional ceiling and is indistinguishable from "known".
 */
export const MAX_INTERVAL_DAYS = 36_500;

export function newCard(id: string, today: string): Card {
  return { id, ease: START_EASE, intervalDays: 0, due: today, firstSeen: today, reps: 0, lapses: 0 };
}

/** How many of today's new-card allowance is still unspent. */
export function newCardsRemaining(cards: Card[], today: string, allowance: number): number {
  const introduced = cards.filter((c) => c.firstSeen === today).length;
  return Math.max(0, allowance - introduced);
}

export function isDue(card: Card, today: string): boolean {
  return card.due <= today;
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function todayISO(now: Date = new Date()): string {
  // Local calendar day, not UTC — a review at 23:00 belongs to that day.
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

const clampEase = (e: number) => Math.min(MAX_EASE, Math.max(MIN_EASE, e));
const clampInterval = (d: number) => Math.min(MAX_INTERVAL_DAYS, Math.max(0, d));

export function schedule(card: Card, grade: Grade, today: string): Card {
  const next: Card = { ...card, reps: card.reps + 1 };

  switch (grade) {
    case "again":
      next.ease = clampEase(card.ease - 0.2);
      next.intervalDays = 0;
      next.lapses = card.lapses + 1;
      break;
    case "hard":
      next.ease = clampEase(card.ease - 0.15);
      next.intervalDays = card.intervalDays === 0 ? 1 : Math.max(1, Math.round(card.intervalDays * 1.2));
      break;
    case "good":
      next.intervalDays =
        card.intervalDays === 0 ? 1 : card.intervalDays === 1 ? 3 : Math.round(card.intervalDays * card.ease);
      break;
    case "easy":
      next.ease = clampEase(card.ease + 0.15);
      next.intervalDays =
        card.intervalDays === 0 ? 3 : Math.round(Math.max(card.intervalDays, 1) * card.ease * 1.3);
      break;
  }

  next.intervalDays = clampInterval(next.intervalDays);
  // A lapsed card is due again in the same session, so it stays on today.
  next.due = addDays(today, next.intervalDays);
  return next;
}

/** Due cards first, oldest due date first, so backlogs drain in order. */
export function dueQueue(cards: Card[], today: string): Card[] {
  return cards.filter((c) => isDue(c, today)).sort((a, b) => a.due.localeCompare(b.due));
}
