import { useState } from "react";
import { useApp } from "./store";
import { phaseForDay, TOTAL_DAYS, OUTPUT_UNLOCK_DAY, isOutputUnlocked } from "./protocol";
import Today from "./views/Today";
import Deck from "./views/Deck";
import Input from "./views/Input";
import Output from "./views/Output";

const TABS = [
  { id: "today", label: "Today", ja: "今日" },
  { id: "deck", label: "Deck", ja: "語彙" },
  { id: "input", label: "Input", ja: "入力" },
  { id: "output", label: "Output", ja: "発話" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function App() {
  const app = useApp();
  const [tab, setTab] = useState<TabId>("today");
  const phase = phaseForDay(app.day);
  const locked = !isOutputUnlocked(app.day);

  return (
    <div className="shell">
      <aside className="nav">
        <div className="brand">
          <span className="brand-ja">沈黙</span>
          <span className="brand-en">Silent Period</span>
        </div>

        <div className="daychip">
          <span className="daychip-n">{app.day}</span>
          <span className="daychip-of">/ {TOTAL_DAYS}</span>
          <span className={`phase phase-${phase.id}`}>{phase.name}</span>
        </div>

        <nav>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? "on" : ""}`}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              aria-label={t.id === "output" && locked ? `${t.label} (locked)` : t.label}
            >
              <span className="tab-ja">{t.ja}</span>
              <span className="tab-en">{t.label}</span>
              {t.id === "output" && locked && <span className="lock" aria-label="locked">🔒</span>}
            </button>
          ))}
        </nav>

        <div className="scrub">
          <label htmlFor="day">
            Preview day <strong>{app.day}</strong>
          </label>
          <input
            id="day"
            type="range"
            min={1}
            max={TOTAL_DAYS}
            value={app.day}
            onChange={(e) => app.setDay(Number(e.target.value))}
          />
          <div className="scrub-marks">
            {[1, 29, OUTPUT_UNLOCK_DAY, 120].map((d) => (
              <button key={d} onClick={() => app.setDay(d)}>
                {d}
              </button>
            ))}
          </div>
          <p className="scrub-note">
            Drag to see how the protocol changes shape. Day {OUTPUT_UNLOCK_DAY} is when speaking opens.
          </p>
        </div>
      </aside>

      <main className="main">
        {tab === "today" && <Today app={app} />}
        {tab === "deck" && <Deck app={app} />}
        {tab === "input" && <Input app={app} />}
        {tab === "output" && <Output app={app} />}
      </main>
    </div>
  );
}
