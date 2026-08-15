import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Card,
  type Grade,
  newCard,
  schedule,
  dueQueue,
  todayISO,
  newCardsRemaining,
} from "./srs";
import { DECK } from "./deck";
import { clampDay, dailyTarget } from "./protocol";

const KEY = "silent-period-v1";

export interface State {
  startDate: string;
  /** Preview control: pins the protocol to a chosen day instead of the calendar. */
  dayOverride: number | null;
  cards: Record<string, Card>;
  /** ISO date -> minutes of active input logged. */
  minutes: Record<string, number>;
  /** ISO date -> completed task ids. */
  done: Record<string, string[]>;
}

function initial(): State {
  return { startDate: todayISO(), dayOverride: 1, cards: {}, minutes: {}, done: {} };
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initial(), ...(JSON.parse(raw) as State) } : initial();
  } catch {
    return initial();
  }
}

function daysBetween(from: string, to: string): number {
  const ms = new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime();
  return Math.floor(ms / 86_400_000);
}

export function useApp() {
  const [state, setState] = useState<State>(load);
  const today = todayISO();

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const day = clampDay(state.dayOverride ?? daysBetween(state.startDate, today) + 1);
  const target = dailyTarget(day);

  /**
   * Due cards, then unseen words — but only as many new ones as today's budget
   * still allows, otherwise the queue refills forever and never drains.
   */
  const session = useMemo(() => {
    const all = Object.values(state.cards);
    const due = dueQueue(all, today);
    const room = newCardsRemaining(all, today, target.newCards);
    const fresh = DECK.filter((w) => !state.cards[w.id]).slice(0, room);
    return [...due.map((c) => c.id), ...fresh.map((w) => w.id)];
  }, [state.cards, today, target.newCards]);

  const grade = useCallback(
    (id: string, g: Grade) => {
      setState((s) => {
        const card = s.cards[id] ?? newCard(id, today);
        return { ...s, cards: { ...s.cards, [id]: schedule(card, g, today) } };
      });
    },
    [today],
  );

  const logMinutes = useCallback(
    (mins: number) => {
      setState((s) => ({ ...s, minutes: { ...s.minutes, [today]: (s.minutes[today] ?? 0) + mins } }));
    },
    [today],
  );

  const toggleTask = useCallback(
    (id: string) => {
      setState((s) => {
        const list = s.done[today] ?? [];
        const next = list.includes(id) ? list.filter((t) => t !== id) : [...list, id];
        return { ...s, done: { ...s.done, [today]: next } };
      });
    },
    [today],
  );

  const setDay = useCallback((d: number) => {
    setState((s) => ({ ...s, dayOverride: clampDay(d) }));
  }, []);

  const reset = useCallback(() => setState(initial()), []);

  return {
    state,
    day,
    today,
    target,
    session,
    minutesToday: state.minutes[today] ?? 0,
    doneToday: state.done[today] ?? [],
    studied: Object.keys(state.cards).length,
    grade,
    logMinutes,
    toggleTask,
    setDay,
    reset,
  };
}

export type App = ReturnType<typeof useApp>;
