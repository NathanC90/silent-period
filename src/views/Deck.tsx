import { useCallback, useEffect, useState } from "react";
import type { App } from "../store";
import type { Grade } from "../srs";
import { wordById } from "../deck";

const GRADES: { g: Grade; label: string; key: string }[] = [
  { g: "again", label: "Again", key: "1" },
  { g: "hard", label: "Hard", key: "2" },
  { g: "good", label: "Good", key: "3" },
  { g: "easy", label: "Easy", key: "4" },
];

export default function Deck({ app }: { app: App }) {
  const [shown, setShown] = useState(false);
  const id = app.session[0];
  const word = id ? wordById.get(id) : undefined;

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
          setShown(true);
        }
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
  }, [shown, word, answer]);

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
              <div className="card-reading">{word.reading}</div>
              <div className="card-gloss">{word.gloss}</div>
              <div className="card-tier">tier {word.tier}</div>
            </div>
          ) : (
            <button className="reveal" onClick={() => setShown(true)}>
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
