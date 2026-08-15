/**
 * Pronunciation through the platform's own speech synthesiser.
 *
 * No audio files, no network, nothing to license — iOS, Android and macOS all
 * ship a Japanese voice, and where one is missing we can say so rather than
 * failing silently.
 */

/** Structural shape of SpeechSynthesisVoice, so the picker is testable off-DOM. */
export interface VoiceLike {
  lang: string;
  name: string;
  localService?: boolean;
}

// BCP-47 tags use a hyphen, but some platforms report ja_JP.
const JA = /^ja(?:[-_]|$)/i;

/**
 * Known-good Japanese voices, best first.
 *
 * Quality varies wildly and the default is not the best one: macOS and iOS list
 * Kyoko and Otoya next to a set of novelty character voices (Eddy, Grandma,
 * Rocko…), and picking alphabetically lands on a cartoon. For a pronunciation
 * model that is worse than useless, so name the good ones explicitly.
 */
const PREFERRED = [
  "kyoko", // macOS / iOS, the standard female voice
  "otoya", // macOS / iOS, male
  "o-ren",
  "google 日本語",
  "google japanese",
  "nanami", // Windows
  "haruka",
  "ayumi",
  "ichiro",
];

/**
 * Falls back to any locally-installed voice: remote voices need a network round
 * trip and go silent offline, which is exactly when someone drills on a commute.
 */
export function pickJapaneseVoice<T extends VoiceLike>(voices: readonly T[]): T | null {
  const ja = voices.filter((v) => JA.test(v.lang));
  if (ja.length === 0) return null;

  for (const wanted of PREFERRED) {
    const hit = ja.find((v) => v.name.toLowerCase().includes(wanted));
    if (hit) return hit;
  }
  return ja.find((v) => v.localService) ?? ja[0];
}

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Speak the reading, never the kanji: 人 alone is ひと or じん depending on the
 * word, and the synthesiser has no context to choose. The kana is unambiguous.
 */
export function speak(text: string, voice: SpeechSynthesisVoice | null): void {
  if (!speechSupported()) return;
  // Re-tapping restarts rather than queueing a backlog of utterances.
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voice?.lang ?? "ja-JP";
  if (voice) utterance.voice = voice;
  // Native pace is too fast to pick apart when the word is new.
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}
