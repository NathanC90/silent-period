/**
 * A frequency-ordered seed deck. The real protocol runs on ~1,000 words; this is
 * the first slice of it, ordered so that the earliest cards buy the most
 * comprehension per card.
 */

export interface Word {
  id: string;
  ja: string;
  reading: string;
  gloss: string;
  tier: 1 | 2 | 3;
}

export const DECK: Word[] = [
  // Tier 1 — the words that carry ordinary sentences.
  { id: "w001", ja: "私", reading: "わたし", gloss: "I, me", tier: 1 },
  { id: "w002", ja: "人", reading: "ひと", gloss: "person", tier: 1 },
  { id: "w003", ja: "事", reading: "こと", gloss: "thing (abstract), matter", tier: 1 },
  { id: "w004", ja: "物", reading: "もの", gloss: "thing (physical)", tier: 1 },
  { id: "w005", ja: "時", reading: "とき", gloss: "time, when", tier: 1 },
  { id: "w006", ja: "今", reading: "いま", gloss: "now", tier: 1 },
  { id: "w007", ja: "何", reading: "なに", gloss: "what", tier: 1 },
  { id: "w008", ja: "日", reading: "ひ", gloss: "day, sun", tier: 1 },
  { id: "w009", ja: "年", reading: "とし", gloss: "year", tier: 1 },
  { id: "w010", ja: "所", reading: "ところ", gloss: "place", tier: 1 },
  { id: "w011", ja: "見る", reading: "みる", gloss: "to see, to watch", tier: 1 },
  { id: "w012", ja: "行く", reading: "いく", gloss: "to go", tier: 1 },
  { id: "w013", ja: "来る", reading: "くる", gloss: "to come", tier: 1 },
  { id: "w014", ja: "言う", reading: "いう", gloss: "to say", tier: 1 },
  { id: "w015", ja: "思う", reading: "おもう", gloss: "to think, to feel", tier: 1 },
  { id: "w016", ja: "分かる", reading: "わかる", gloss: "to understand", tier: 1 },
  { id: "w017", ja: "知る", reading: "しる", gloss: "to know", tier: 1 },
  { id: "w018", ja: "出る", reading: "でる", gloss: "to leave, to go out", tier: 1 },
  { id: "w019", ja: "入る", reading: "はいる", gloss: "to enter", tier: 1 },
  { id: "w020", ja: "良い", reading: "よい", gloss: "good", tier: 1 },

  // Tier 2 — everyday concrete vocabulary.
  { id: "w021", ja: "食べる", reading: "たべる", gloss: "to eat", tier: 2 },
  { id: "w022", ja: "飲む", reading: "のむ", gloss: "to drink", tier: 2 },
  { id: "w023", ja: "話す", reading: "はなす", gloss: "to speak, to talk", tier: 2 },
  { id: "w024", ja: "聞く", reading: "きく", gloss: "to listen, to ask", tier: 2 },
  { id: "w025", ja: "読む", reading: "よむ", gloss: "to read", tier: 2 },
  { id: "w026", ja: "書く", reading: "かく", gloss: "to write", tier: 2 },
  { id: "w027", ja: "買う", reading: "かう", gloss: "to buy", tier: 2 },
  { id: "w028", ja: "作る", reading: "つくる", gloss: "to make", tier: 2 },
  { id: "w029", ja: "使う", reading: "つかう", gloss: "to use", tier: 2 },
  { id: "w030", ja: "持つ", reading: "もつ", gloss: "to hold, to carry", tier: 2 },
  { id: "w031", ja: "家", reading: "いえ", gloss: "house, home", tier: 2 },
  { id: "w032", ja: "水", reading: "みず", gloss: "water", tier: 2 },
  { id: "w033", ja: "車", reading: "くるま", gloss: "car", tier: 2 },
  { id: "w034", ja: "道", reading: "みち", gloss: "road, way", tier: 2 },
  { id: "w035", ja: "町", reading: "まち", gloss: "town", tier: 2 },
  { id: "w036", ja: "国", reading: "くに", gloss: "country", tier: 2 },
  { id: "w037", ja: "手", reading: "て", gloss: "hand", tier: 2 },
  { id: "w038", ja: "目", reading: "め", gloss: "eye", tier: 2 },
  { id: "w039", ja: "名前", reading: "なまえ", gloss: "name", tier: 2 },
  { id: "w040", ja: "友達", reading: "ともだち", gloss: "friend", tier: 2 },
  { id: "w041", ja: "先生", reading: "せんせい", gloss: "teacher", tier: 2 },
  { id: "w042", ja: "学校", reading: "がっこう", gloss: "school", tier: 2 },
  { id: "w043", ja: "会社", reading: "かいしゃ", gloss: "company", tier: 2 },
  { id: "w044", ja: "仕事", reading: "しごと", gloss: "work, job", tier: 2 },
  { id: "w045", ja: "今日", reading: "きょう", gloss: "today", tier: 2 },
  { id: "w046", ja: "明日", reading: "あした", gloss: "tomorrow", tier: 2 },
  { id: "w047", ja: "昨日", reading: "きのう", gloss: "yesterday", tier: 2 },
  { id: "w048", ja: "毎日", reading: "まいにち", gloss: "every day", tier: 2 },

  // Tier 3 — modifiers and abstractions that unlock nuance.
  { id: "w049", ja: "大きい", reading: "おおきい", gloss: "big", tier: 3 },
  { id: "w050", ja: "小さい", reading: "ちいさい", gloss: "small", tier: 3 },
  { id: "w051", ja: "新しい", reading: "あたらしい", gloss: "new", tier: 3 },
  { id: "w052", ja: "古い", reading: "ふるい", gloss: "old (of things)", tier: 3 },
  { id: "w053", ja: "高い", reading: "たかい", gloss: "tall, expensive", tier: 3 },
  { id: "w054", ja: "安い", reading: "やすい", gloss: "cheap", tier: 3 },
  { id: "w055", ja: "長い", reading: "ながい", gloss: "long", tier: 3 },
  { id: "w056", ja: "少し", reading: "すこし", gloss: "a little, a few", tier: 3 },
  { id: "w057", ja: "多い", reading: "おおい", gloss: "many, numerous", tier: 3 },
  { id: "w058", ja: "難しい", reading: "むずかしい", gloss: "difficult", tier: 3 },
  { id: "w059", ja: "時間", reading: "じかん", gloss: "time, hour", tier: 3 },
  { id: "w060", ja: "言葉", reading: "ことば", gloss: "word, language", tier: 3 },
  { id: "w061", ja: "意味", reading: "いみ", gloss: "meaning", tier: 3 },
  { id: "w062", ja: "問題", reading: "もんだい", gloss: "problem, question", tier: 3 },
  { id: "w063", ja: "元気", reading: "げんき", gloss: "well, energetic", tier: 3 },
  { id: "w064", ja: "好き", reading: "すき", gloss: "liked, favourite", tier: 3 },
];

export const wordById = new Map(DECK.map((w) => [w.id, w]));
