import type { App } from "../store";
import {
  phaseForDay,
  tasksForDay,
  TOTAL_DAYS,
  OUTPUT_UNLOCK_DAY,
  daysUntilOutput,
  PHASES,
} from "../protocol";

function Ring({ day }: { day: number }) {
  const r = 78;
  const c = 2 * Math.PI * r;
  const pct = day / TOTAL_DAYS;
  const unlockAngle = (OUTPUT_UNLOCK_DAY / TOTAL_DAYS) * 360 - 90;

  return (
    <svg className="ring" viewBox="0 0 200 200" role="img" aria-label={`Day ${day} of ${TOTAL_DAYS}`}>
      <circle cx="100" cy="100" r={r} className="ring-track" />
      <circle
        cx="100"
        cy="100"
        r={r}
        className="ring-fill"
        strokeDasharray={`${c * pct} ${c}`}
        transform="rotate(-90 100 100)"
      />
      <line
        x1={100 + (r - 10) * Math.cos((unlockAngle * Math.PI) / 180)}
        y1={100 + (r - 10) * Math.sin((unlockAngle * Math.PI) / 180)}
        x2={100 + (r + 10) * Math.cos((unlockAngle * Math.PI) / 180)}
        y2={100 + (r + 10) * Math.sin((unlockAngle * Math.PI) / 180)}
        className="ring-mark"
      />
      <text x="100" y="94" className="ring-n">
        {day}
      </text>
      <text x="100" y="118" className="ring-label">
        of {TOTAL_DAYS}
      </text>
    </svg>
  );
}

function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="bar-row">
      <div className="bar-head">
        <span>{label}</span>
        <span className="bar-num">
          {value} / {max}
        </span>
      </div>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Today({ app }: { app: App }) {
  const phase = phaseForDay(app.day);
  const tasks = tasksForDay(app.day);
  const until = daysUntilOutput(app.day);

  return (
    <div className="view">
      <header className="view-head">
        <div>
          <h1>
            {phase.ja} <span className="dim">{phase.name}</span>
          </h1>
          <p className="lede">{phase.premise}</p>
        </div>
      </header>

      <section className="grid-top">
        <div className="panel ring-panel">
          <Ring day={app.day} />
          {until > 0 ? (
            <p className="ring-cap">
              <strong>{until}</strong> days of silence remaining
            </p>
          ) : (
            <p className="ring-cap open">Output is open</p>
          )}
        </div>

        <div className="panel">
          <h2>Today's floor</h2>
          <Bar value={app.minutesToday} max={app.target.inputMinutes} label="Active input (min)" />
          <Bar value={app.session.length === 0 ? 1 : 0} max={1} label="Deck cleared" />
          <div className="quicklog">
            {[10, 20, 30].map((m) => (
              <button key={m} onClick={() => app.logMinutes(m)}>
                +{m} min
              </button>
            ))}
          </div>
          <p className="hint">
            Log input as you finish it. The target is a floor, not a ceiling — but the floor is the
            part that decides whether this works.
          </p>
        </div>
      </section>

      <section className="panel">
        <h2>The prescription</h2>
        <p className="hint">
          You do not choose today's work. Tick it off and stop thinking about it.
        </p>
        <ul className="tasks">
          {tasks.map((t) => {
            const done = app.doneToday.includes(t.id);
            return (
              <li key={t.id} className={done ? "done" : ""}>
                <button
                  className="check"
                  onClick={() => app.toggleTask(t.id)}
                  aria-pressed={done}
                  aria-label={t.label}
                >
                  {done ? "✓" : ""}
                </button>
                <div>
                  <div className="task-label">
                    {t.label}
                    <span className={`kind kind-${t.kind}`}>{t.kind}</span>
                  </div>
                  <div className="task-detail">{t.detail}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel">
        <h2>The 200 days</h2>
        <ol className="phases">
          {PHASES.map((p) => (
            <li key={p.id} className={p.id === phase.id ? "on" : app.day > p.to ? "past" : ""}>
              <span className="ph-days">
                {p.from}–{p.to}
              </span>
              <span className="ph-name">
                {p.ja} {p.name}
              </span>
              <span className="ph-premise">{p.premise}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
