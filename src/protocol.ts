/**
 * The 200-day protocol.
 *
 * The whole point of this method is that you do not choose what to do each day —
 * the calendar does. Output is gated shut until day 90 so that the temptation to
 * speak early is removed rather than resisted.
 */

export type PhaseId = "calibration" | "silence" | "voice" | "consolidation";

export interface Phase {
  id: PhaseId;
  name: string;
  ja: string;
  from: number;
  to: number;
  premise: string;
}

export const TOTAL_DAYS = 200;
export const OUTPUT_UNLOCK_DAY = 90;

export const PHASES: Phase[] = [
  {
    id: "calibration",
    name: "Calibration",
    ja: "調整",
    from: 1,
    to: 28,
    premise:
      "Kana to automaticity, deck seeded, sources chosen. You are building the machine, not running it.",
  },
  {
    id: "silence",
    name: "Silent Input",
    ja: "沈黙",
    from: 29,
    to: 89,
    premise:
      "Volume. Nothing but understood Japanese going in. No speaking, no output, no self-assessment.",
  },
  {
    id: "voice",
    name: "First Voice",
    ja: "初声",
    from: 90,
    to: 119,
    premise:
      "Output opens. What you say now comes from what you have heard, not from what you have translated.",
  },
  {
    id: "consolidation",
    name: "Consolidation",
    ja: "定着",
    from: 120,
    to: TOTAL_DAYS,
    premise:
      "Native-speed material and unscripted conversation. The deck shrinks; the listening grows.",
  },
];

export function phaseForDay(day: number): Phase {
  const d = clampDay(day);
  // Last phase absorbs anything past the end of the programme.
  return PHASES.find((p) => d >= p.from && d <= p.to) ?? PHASES[PHASES.length - 1];
}

export function clampDay(day: number): number {
  if (!Number.isFinite(day)) return 1;
  return Math.min(TOTAL_DAYS, Math.max(1, Math.floor(day)));
}

export function isOutputUnlocked(day: number): boolean {
  return clampDay(day) >= OUTPUT_UNLOCK_DAY;
}

export function daysUntilOutput(day: number): number {
  return Math.max(0, OUTPUT_UNLOCK_DAY - clampDay(day));
}

export function progressPct(day: number): number {
  return (clampDay(day) / TOTAL_DAYS) * 100;
}

export interface DailyTarget {
  inputMinutes: number;
  newCards: number;
}

/**
 * Targets ramp rather than starting at full volume — the failure mode of this
 * method is a heroic week one followed by nothing.
 */
export function dailyTarget(day: number): DailyTarget {
  const phase = phaseForDay(day);
  switch (phase.id) {
    case "calibration":
      return { inputMinutes: 20 + Math.floor(clampDay(day) / 7) * 10, newCards: 10 };
    case "silence":
      return { inputMinutes: 90, newCards: 15 };
    case "voice":
      return { inputMinutes: 90, newCards: 10 };
    case "consolidation":
      return { inputMinutes: 120, newCards: 5 };
  }
}

export interface Task {
  id: string;
  label: string;
  detail: string;
  kind: "input" | "review" | "output";
}

/** Today's prescription. Locked tasks are simply absent, not greyed out. */
export function tasksForDay(day: number): Task[] {
  const phase = phaseForDay(day);
  const target = dailyTarget(day);

  const review: Task = {
    id: "review",
    label: `Review the deck · ${target.newCards} new`,
    detail: "Clear everything due. Recognition only — you are not producing these yet.",
    kind: "review",
  };

  const input: Task = {
    id: "input",
    label: `Active input · ${target.inputMinutes} min`,
    detail:
      "Pick material you understand around 80–90%. Attention on the screen, not on a second task.",
    kind: "input",
  };

  switch (phase.id) {
    case "calibration":
      return [
        {
          id: "kana",
          label: "Kana drill · 10 min",
          detail: "Hiragana and katakana until recall is instant. This is the one thing you rote-learn.",
          kind: "review",
        },
        review,
        input,
      ];
    case "silence":
      return [review, input];
    case "voice":
      return [
        review,
        input,
        {
          id: "shadow",
          label: "Shadowing · 15 min",
          detail: "Speak over a native track. Match the rhythm before you worry about the sounds.",
          kind: "output",
        },
        {
          id: "speak",
          label: "Unscripted speaking · 20 min",
          detail: "A conversation partner, or talk to yourself. Do not prepare sentences in advance.",
          kind: "output",
        },
      ];
    case "consolidation":
      return [
        review,
        { ...input, detail: "Native-speed material now. Drop anything made for learners." },
        {
          id: "convo",
          label: "Conversation · 30 min",
          detail: "Real exchange with a native speaker. Errors are data, not failures.",
          kind: "output",
        },
      ];
  }
}
