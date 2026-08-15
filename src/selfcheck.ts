/**
 * Runnable check for the two pieces of non-trivial logic: day gating and the
 * scheduler. Run with `npm run check`.
 */
import assert from "node:assert/strict";
import {
  phaseForDay,
  isOutputUnlocked,
  daysUntilOutput,
  dailyTarget,
  tasksForDay,
  clampDay,
  OUTPUT_UNLOCK_DAY,
  TOTAL_DAYS,
} from "./protocol";
import {
  newCard,
  schedule,
  addDays,
  dueQueue,
  isDue,
  newCardsRemaining,
  MIN_EASE,
  MAX_EASE,
  MAX_INTERVAL_DAYS,
  type Card,
} from "./srs";
import { pickJapaneseVoice } from "./speech";

// --- protocol: phases tile the whole programme without gaps ---
for (let d = 1; d <= TOTAL_DAYS; d++) {
  const p = phaseForDay(d);
  assert.ok(d >= p.from && d <= p.to, `day ${d} fell outside phase ${p.id}`);
}

assert.equal(clampDay(0), 1, "days below 1 clamp up");
assert.equal(clampDay(9999), TOTAL_DAYS, "days past the end clamp down");
assert.equal(phaseForDay(1).id, "calibration");
assert.equal(phaseForDay(89).id, "silence");
assert.equal(phaseForDay(90).id, "voice");

// --- protocol: the output gate is exact, not fuzzy ---
assert.equal(isOutputUnlocked(OUTPUT_UNLOCK_DAY - 1), false, "day 89 must stay locked");
assert.equal(isOutputUnlocked(OUTPUT_UNLOCK_DAY), true, "day 90 must unlock");
assert.equal(daysUntilOutput(1), 89);
assert.equal(daysUntilOutput(OUTPUT_UNLOCK_DAY), 0);
assert.equal(daysUntilOutput(150), 0, "never goes negative");

// No output task may leak into the silent phase — this is the whole premise.
for (let d = 1; d < OUTPUT_UNLOCK_DAY; d++) {
  assert.ok(
    tasksForDay(d).every((t) => t.kind !== "output"),
    `day ${d} prescribed an output task before the gate`,
  );
}
assert.ok(
  tasksForDay(OUTPUT_UNLOCK_DAY).some((t) => t.kind === "output"),
  "day 90 must prescribe output",
);

// Targets stay sane across every day.
for (let d = 1; d <= TOTAL_DAYS; d++) {
  const t = dailyTarget(d);
  assert.ok(t.inputMinutes > 0 && t.inputMinutes <= 180, `day ${d} input target out of range`);
  assert.ok(t.newCards > 0 && t.newCards <= 30, `day ${d} new-card target out of range`);
}

// --- srs: date arithmetic survives a month boundary ---
assert.equal(addDays("2026-01-31", 1), "2026-02-01");
assert.equal(addDays("2026-02-28", 1), "2026-03-01", "2026 is not a leap year");
assert.equal(addDays("2026-12-31", 1), "2027-01-01");

// --- srs: intervals grow on success and collapse on failure ---
const T = "2026-08-15";
let c = newCard("w001", T);
assert.equal(c.intervalDays, 0);
assert.ok(isDue(c, T), "a brand new card is due immediately");

c = schedule(c, "good", T);
assert.equal(c.intervalDays, 1, "first pass schedules one day out");
c = schedule(c, "good", T);
assert.equal(c.intervalDays, 3, "second pass schedules three days out");

const third = schedule(c, "good", T);
assert.ok(third.intervalDays > c.intervalDays, "intervals must keep growing on 'good'");
assert.equal(third.due, addDays(T, third.intervalDays), "due date tracks the interval");

const lapsed = schedule(third, "again", T);
assert.equal(lapsed.intervalDays, 0, "'again' drops the card back into learning");
assert.equal(lapsed.lapses, 1);
assert.equal(lapsed.due, T, "a lapsed card comes back the same day");
assert.ok(lapsed.ease < third.ease, "'again' penalises ease");

// 'easy' should outrun 'good' from the same starting card.
assert.ok(
  schedule(c, "easy", T).intervalDays > schedule(c, "good", T).intervalDays,
  "'easy' must schedule further out than 'good'",
);

// --- srs: ease stays inside its clamp under abuse ---
let punished = newCard("w002", T);
for (let i = 0; i < 40; i++) punished = schedule(punished, "again", T);
assert.equal(punished.ease, MIN_EASE, "ease floors at MIN_EASE");

let spoiled = newCard("w003", T);
for (let i = 0; i < 40; i++) spoiled = schedule(spoiled, "easy", T);
assert.equal(spoiled.ease, MAX_EASE, "ease ceilings at MAX_EASE");

// Intervals compound, so without a cap this overflows Date and throws.
assert.equal(spoiled.intervalDays, MAX_INTERVAL_DAYS, "interval ceilings at MAX_INTERVAL_DAYS");
assert.ok(!Number.isNaN(Date.parse(spoiled.due)), "a maxed-out card still has a valid due date");

// --- srs: the queue only surfaces due cards, oldest first ---
const cards: Card[] = [
  { ...newCard("a", T), due: "2026-08-20" },
  { ...newCard("b", T), due: "2026-08-10" },
  { ...newCard("c", T), due: "2026-08-15" },
];
const q = dueQueue(cards, T);
assert.deepEqual(
  q.map((x) => x.id),
  ["b", "c"],
  "future cards excluded, backlog drains oldest first",
);

// --- srs: the new-card budget is per day, so a session can actually end ---
assert.equal(newCardsRemaining([], T, 10), 10, "a fresh day has the whole allowance");

const introducedToday = [newCard("x", T), newCard("y", T), newCard("z", T)];
assert.equal(newCardsRemaining(introducedToday, T, 10), 7, "cards seen today spend the budget");
assert.equal(newCardsRemaining(introducedToday, T, 3), 0, "a spent budget hits zero, not negative");

// Yesterday's cards must not count against today — this is the bug that made the
// queue refill forever and never drain.
const introducedYesterday = introducedToday.map((c) => ({ ...c, firstSeen: addDays(T, -1) }));
assert.equal(
  newCardsRemaining(introducedYesterday, T, 10),
  10,
  "yesterday's new cards do not consume today's budget",
);

// Grading a card must not re-arm it as new.
assert.equal(schedule(newCard("k", T), "good", T).firstSeen, T, "firstSeen survives scheduling");

// --- speech: pick a Japanese voice, and admit it when there is none ---
const enUS = { lang: "en-US", name: "Samantha", localService: true };
const jaRemote = { lang: "ja-JP", name: "Google 日本語", localService: false };
const jaLocal = { lang: "ja-JP", name: "Kyoko", localService: true };

assert.equal(pickJapaneseVoice([]), null, "no voices at all yields null");
assert.equal(pickJapaneseVoice([enUS]), null, "an English-only device yields null");
assert.equal(pickJapaneseVoice([enUS, jaRemote]), jaRemote, "finds ja among other languages");

// Kyoko is a named-good voice, so it wins regardless of ordering.
assert.equal(
  pickJapaneseVoice([enUS, jaRemote, jaLocal]),
  jaLocal,
  "a known-good voice wins over an unnamed one",
);

// The bug this guards: macOS lists novelty character voices alphabetically ahead
// of Kyoko, so taking the first local ja voice picked a cartoon.
const novelty = [
  { lang: "ja-JP", name: "Eddy (日文（日本）)", localService: true },
  { lang: "ja-JP", name: "Grandma (日文（日本）)", localService: true },
  { lang: "ja-JP", name: "Kyoko", localService: true },
  { lang: "ja-JP", name: "Rocko (日文（日本）)", localService: true },
];
assert.equal(pickJapaneseVoice(novelty)?.name, "Kyoko", "Kyoko beats the novelty voices");

// With nothing recognisable, still prefer something that works offline.
const unknown = [
  { lang: "ja-JP", name: "Cloud Voice A", localService: false },
  { lang: "ja-JP", name: "Offline Voice B", localService: true },
];
assert.equal(
  pickJapaneseVoice(unknown)?.name,
  "Offline Voice B",
  "unrecognised names fall back to a local voice",
);

// Platforms disagree on the separator, and 'java'-like tags must not match.
assert.equal(pickJapaneseVoice([{ lang: "ja_JP", name: "Otoya" }])?.name, "Otoya", "ja_JP matches");
assert.equal(pickJapaneseVoice([{ lang: "ja", name: "Bare" }])?.name, "Bare", "bare ja matches");
assert.equal(pickJapaneseVoice([{ lang: "jav", name: "Javanese" }]), null, "jav is not Japanese");

console.log("selfcheck: all assertions passed");
