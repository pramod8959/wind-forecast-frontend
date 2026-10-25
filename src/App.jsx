import { useEffect, useState } from "react";
import { fetchAccuracy, fetchBriefing, fetchMeta } from "./api/client.js";
import BriefingView from "./components/BriefingView.jsx";
import AccuracyView from "./components/AccuracyView.jsx";

const DEFAULT_DAY = "2026-01-15";
const MIN_DAY = "2026-01-01";
const MAX_DAY = "2026-01-31";

export default function App() {
  const [tab, setTab] = useState("briefing");
  const [meta, setMeta] = useState(null);
  const [day, setDay] = useState(DEFAULT_DAY);
  const [briefing, setBriefing] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [m, a] = await Promise.all([fetchMeta(), fetchAccuracy()]);
        if (!cancelled) {
          setMeta(m);
          setAccuracy(a);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setBriefing(null);
    setBriefingLoading(true);
    setError(null);
    (async () => {
      try {
        const b = await fetchBriefing(day);
        if (!cancelled) setBriefing(b);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setBriefingLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [day]);

  return (
    <div className="app">
      <header className="hero">
        <div className="brand">Wind Day-Ahead Briefing</div>
        <h1>See the wind forecast that mattered at gate.</h1>
        <p>
          National wind for UK day-ahead procurement in January 2026: the
          forecast available before morning auctions on D−1, and how accurate
          those decision-time forecasts were versus outturn.
        </p>
      </header>

      <nav className="tabs" aria-label="Views">
        <button
          className={tab === "briefing" ? "active" : ""}
          onClick={() => setTab("briefing")}
          type="button"
        >
          Day-ahead briefing
        </button>
        <button
          className={tab === "accuracy" ? "active" : ""}
          onClick={() => setTab("accuracy")}
          type="button"
        >
          Forecast accuracy
        </button>
      </nav>

      {error && <div className="error">{error}</div>}
      {loading && <div className="status">Loading Elexon-backed briefing…</div>}

      {!loading && tab === "briefing" && (
        <BriefingView
          day={day}
          onDayChange={setDay}
          briefing={briefing}
          briefingLoading={briefingLoading}
          meta={meta}
          minDay={MIN_DAY}
          maxDay={MAX_DAY}
        />
      )}

      {!loading && !error && tab === "accuracy" && (
        <AccuracyView
          accuracy={accuracy}
          onSelectDay={(d) => {
            setDay(d);
            setTab("briefing");
          }}
        />
      )}

      <footer className="footer">
        Data: Elexon Insights FUELHH (WIND, 30-min MW) + WINDFOR (hourly MW).
        Scope: January 2026 delivery days only. Wind error measures forecast
        uncertainty; it does not by itself determine how much power to buy.
      </footer>
    </div>
  );
}
