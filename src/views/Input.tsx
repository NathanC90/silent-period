import type { App } from "../store";
import { LIBRARY } from "../library";

export default function Input({ app }: { app: App }) {
  return (
    <div className="view">
      <header className="view-head">
        <div>
          <h1>
            入力 <span className="dim">Input</span>
          </h1>
          <p className="lede">
            Aim for material you follow at roughly 80–90%. Below that you are decoding; above it you
            are not learning.
          </p>
        </div>
      </header>

      <section className="panel">
        <h2>Logged today</h2>
        <div className="big-num">
          {app.minutesToday}
          <span> / {app.target.inputMinutes} min</span>
        </div>
        <div className="quicklog">
          {[10, 20, 30, 45].map((m) => (
            <button key={m} onClick={() => app.logMinutes(m)}>
              +{m}
            </button>
          ))}
        </div>
      </section>

      <section className="sources">
        {LIBRARY.map((s) => {
          const locked = app.day < s.fromDay;
          return (
            <article key={s.id} className={`source ${locked ? "locked" : ""}`}>
              <div className="source-top">
                <span className={`kind kind-${s.kind}`}>{s.kind}</span>
                {locked && <span className="from">opens day {s.fromDay}</span>}
              </div>
              <h3>{s.title}</h3>
              <p className="band">{s.band}</p>
              <p className="note">{s.note}</p>
              {!locked && s.url && (
                <a href={s.url} target="_blank" rel="noreferrer">
                  Open ↗
                </a>
              )}
            </article>
          );
        })}
      </section>

      <p className="footnote">
        External sources, listed for convenience and not affiliated with this app.
      </p>
    </div>
  );
}
