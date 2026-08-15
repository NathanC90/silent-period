/**
 * The input catalogue. The method lives or dies on having material at the right
 * difficulty on tap, so the app ships a graded shortlist of free sources rather
 * than asking the learner to go hunting every day.
 */

export interface Source {
  id: string;
  title: string;
  kind: "video" | "podcast" | "reading";
  /** Protocol day this source becomes appropriate. */
  fromDay: number;
  band: string;
  note: string;
  url: string;
}

export const LIBRARY: Source[] = [
  {
    id: "s1",
    title: "Comprehensible Japanese",
    kind: "video",
    fromDay: 1,
    band: "Absolute beginner → intermediate",
    note: "Gestures, drawings and props carry the meaning. Watchable on day one with zero vocabulary.",
    url: "https://www.youtube.com/@cijapanese",
  },
  {
    id: "s2",
    title: "Nihongo con Teppei for Beginners",
    kind: "podcast",
    fromDay: 14,
    band: "Beginner",
    note: "Short unscripted episodes, slow and repetitive on purpose. Good for volume once kana is solid.",
    url: "https://nihongoconteppei.com/",
  },
  {
    id: "s3",
    title: "Japanese with Shun",
    kind: "podcast",
    fromDay: 30,
    band: "Beginner → lower intermediate",
    note: "Everyday topics at a measured pace. Transcripts exist if you need to repair a gap.",
    url: "https://japanesewithshun.com/",
  },
  {
    id: "s4",
    title: "Game Gengo",
    kind: "video",
    fromDay: 30,
    band: "Beginner → intermediate",
    note: "Grammar explained through video game lines. Use it to resolve a pattern you keep half-hearing.",
    url: "https://www.youtube.com/@GameGengo",
  },
  {
    id: "s5",
    title: "NHK News Web Easy",
    kind: "reading",
    fromDay: 60,
    band: "Lower intermediate",
    note: "Real news rewritten simply, with furigana. Short enough to finish, which matters more than it sounds.",
    url: "https://www3.nhk.or.jp/news/easy/",
  },
  {
    id: "s6",
    title: "Onomappu",
    kind: "video",
    fromDay: 75,
    band: "Intermediate",
    note: "Natural speed with Japanese subtitles. The first place most learners feel the silent period paying off.",
    url: "https://www.youtube.com/@onomappu",
  },
  {
    id: "s7",
    title: "Yuyu no Nihongo",
    kind: "podcast",
    fromDay: 90,
    band: "Intermediate",
    note: "Relaxed monologue, no learner scaffolding. Audio only, so nothing props you up.",
    url: "https://www.youtube.com/@yuyunihongopodcast",
  },
  {
    id: "s8",
    title: "Native material of your choice",
    kind: "video",
    fromDay: 120,
    band: "Native",
    note: "Drama, variety, VTubers, anything. The rule stops being difficulty and becomes: would you watch this in English?",
    url: "",
  },
];

export function availableOn(day: number): Source[] {
  return LIBRARY.filter((s) => day >= s.fromDay);
}
