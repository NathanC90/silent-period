import type { App } from "../store";
import {
  isOutputUnlocked,
  daysUntilOutput,
  OUTPUT_UNLOCK_DAY,
  tasksForDay,
  phaseForDay,
} from "../protocol";

export default function Output({ app }: { app: App }) {
  const unlocked = isOutputUnlocked(app.day);
  const until = daysUntilOutput(app.day);

  if (!unlocked) {
    const elapsed = ((OUTPUT_UNLOCK_DAY - until) / OUTPUT_UNLOCK_DAY) * 100;
    return (
      <div className="view">
        <div className="gate">
          <div className="gate-seal">黙</div>
          <h1>Output is closed</h1>
          <p className="gate-count">
            <strong>{until}</strong>
            <span>days remaining</span>
          </p>
          <div className="gate-bar">
            <div className="gate-fill" style={{ width: `${elapsed}%` }} />
          </div>
          <p className="gate-why">
            Speaking before you have heard enough builds fluent habits out of wrong material — and
            habits are far more expensive to remove than to never form. The gate is not
            encouragement to wait. It is the waiting, made non-negotiable.
          </p>
          <p className="gate-when">
            Opens on day {OUTPUT_UNLOCK_DAY}. Until then, this screen has nothing for you.
          </p>
        </div>
      </div>
    );
  }

  const drills = tasksForDay(app.day).filter((t) => t.kind === "output");
  const phase = phaseForDay(app.day);

  return (
    <div className="view">
      <header className="view-head">
        <div>
          <h1>
            発話 <span className="dim">Output</span>
          </h1>
          <p className="lede">
            Open since day {OUTPUT_UNLOCK_DAY}. You are in {phase.ja} {phase.name}.
          </p>
        </div>
      </header>

      <section className="panel unlocked-note">
        <h2>The rule that replaces the gate</h2>
        <p>
          Say what surfaces. If you catch yourself building a sentence in English and converting it,
          stop and say something simpler instead — the point is to speak from what you have heard,
          not from what you can translate.
        </p>
      </section>

      <section className="drills">
        {drills.map((d) => (
          <article key={d.id} className="panel drill">
            <h3>{d.label}</h3>
            <p>{d.detail}</p>
            <button onClick={() => app.toggleTask(d.id)} className={app.doneToday.includes(d.id) ? "on" : ""}>
              {app.doneToday.includes(d.id) ? "Done today ✓" : "Mark done"}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
