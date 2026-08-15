import { useCallback, useEffect, useState } from "react";
import type { App } from "../store";
import type { Grade } from "../srs";
import { wordById } from "../deck";
import { pickJapaneseVoice, speak, speechSupported } from "../speech";

const GRADES: { g: Grade; label: string; key: string }[] = [
  { g: "again", label: "Again", key: "1" },
  { g: "hard", label: "Hard", key: "2" },
  { g: "good", label: "Good", key: "3" },
  { g: "easy", label: "Easy", key: "4" },
];

/**
 * getVoices() is empty until the platform loads the list. The documented signal
 * for that is `voiceschanged`, but it is not dependable — some browsers populate
 * the list a moment later without ever firing it, which would leave the replay
 * button permanently hidden. So poll briefly as well and take whichever wins.
 */
function useJapaneseVoice() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [settled, setSettled] = useState(!speechSupported());

  useEffect(() => {
    if (!speechSupported()) return;

    const load = () => {
      const all = window.speechSynthesis.getVoices();
      if (all.length === 0) return false;
      setVoice(pickJapaneseVoice(all));
      setSettled(true);
      return true;
    };

    if (load()) return;

    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      // Four seconds is long past when a real device would have answered.
      if (load() || tries >= 20) {
        clearInterval(timer);
        setSettled(true);
      }
    }, 200);

    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      clearInterval(timer);
      window.speechSynthesis.removeEventListener("voiceschanged", load);
    };
  }, []);

  return { voice, settled };
}

export default function Deck({ app }: { app: App }) {
  const [shown, setShown] = useState(false);
  const { voice, settled } = useJapaneseVoice();
  const id = app.session[0];
  const word = id ? wordById.get(id) : undefined;

  const say = useCallback(() => {
    if (word) speak(word.reading, voice);
  }, [word, voice]);

  // Hearing the word is the point of the exercise, so the reveal plays it. This
  // runs inside the tap/keypress handler, which is what iOS requires to speak.
  const reveal = useCallback(() => {
    setShown(true);
    say();
  }, [say]);

  const answer = useCallback(
    (g: Grade) => {
      if (!word) return;
      app.grade(word.id, g);
      setShown(false);
    },
    [app, word],
  );

  // Reviewing is a two-key rhythm — reveal, then grade. Reaching for the mouse
  // every card is what makes people stop doing this.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!word) return;
      if (!shown) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          reveal();
        }
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        say();
        return;
      }
      const hit = GRADES.find((g) => g.key === e.key);
      if (hit) {
        e.preventDefault();
        answer(hit.g);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shown, word, answer, reveal, say]);

  if (!word) {
    return (
      <div className="view">
        <header className="view-head">
          <h1>
            語彙 <span className="dim">Deck</span>
          </h1>
        </header>
        <div className="panel empty">
          <p className="empty-ja">お疲れさま</p>
          <p>Deck cleared. Nothing else is due today.</p>
          <p className="hint">
            The deck is the smaller half of this method. The hours of input are the half that
            actually moves you.
          </p>
        </div>
      </div>
    );
  }

  const isNew = !app.state.cards[word.id];

  return (
    <div className="view">
      <header className="view-head">
        <div>
          <h1>
            語彙 <span className="dim">Deck</span>
          </h1>
          <p className="lede">
            {app.session.length} left · recognition only, you are not producing these yet
          </p>
        </div>
      </header>

      <div className="card-stage">
        <div className="card">
          {isNew && <span className="new-badge">new</span>}
          <div className="card-ja">{word.ja}</div>
          {shown ? (
            <div className="card-back">
              <div className="reading-row">
                <span className="card-reading">{word.reading}</span>
                {voice && (
                  <button className="say" onClick={say} aria-label={`Play ${word.reading} again`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
                      <path className="wave" d="M15.5 9a4 4 0 0 1 0 6" />
                      <path className="wave" d="M18 6.5a7.5 7.5 0 0 1 0 11" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="card-gloss">{word.gloss}</div>
              <div className="card-tier">tier {word.tier}</div>
              {settled && !voice && (
                <div className="no-voice">No Japanese voice installed on this device</div>
              )}
            </div>
          ) : (
            <button className="reveal" onClick={reveal}>
              Show
            </button>
          )}
        </div>

        {shown && (
          <div className="grades">
            {GRADES.map((g) => (
              <button
                key={g.g}
                className={`grade grade-${g.g}`}
                onClick={() => answer(g.g)}
                aria-label={`${g.label} (key ${g.key})`}
              >
                <span>{g.label}</span>
                <kbd>{g.key}</kbd>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="panel deck-stats">
        <div>
          <span className="stat-n">{app.studied}</span>
          <span className="stat-l">words seen</span>
        </div>
        <div>
          <span className="stat-n">{app.session.length}</span>
          <span className="stat-l">in queue</span>
        </div>
        <div>
          <span className="stat-n">{app.target.newCards}</span>
          <span className="stat-l">new/day</span>
        </div>
      </div>
    </div>
  );
}
