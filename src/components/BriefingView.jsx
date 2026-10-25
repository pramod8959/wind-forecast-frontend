import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function hourLabel(iso) {
  return iso.slice(11, 16);
}

function formatUtc(iso) {
  if (!iso) return "—";
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

export default function BriefingView({
  day,
  onDayChange,
  briefing,
  briefingLoading,
  meta,
  minDay,
  maxDay,
}) {
  const chartData =
    briefing?.points?.map((p) => ({
      hour: hourLabel(p.startTime),
      forecast: p.forecastMw,
      actual: p.actualMw,
      error: p.errorMw,
    })) ?? [];

  const coverage = briefing?.coverage;
  const metrics = briefing?.metrics;
  const missing =
    (coverage?.missingActualHours?.length || 0) +
    (coverage?.missingForecastHours?.length || 0);

  return (
    <section className="panel">
      <h2>Delivery day briefing</h2>
      <p className="sub">
        Forecast vintage locked at the documented D−1 cutoff — the last WINDFOR
        a trader could use before submitting day-ahead bids.
      </p>

      <div className="controls">
        <label>
          Delivery date
          <input
            type="date"
            min={minDay}
            max={maxDay}
            value={day}
            onChange={(e) => onDayChange(e.target.value)}
          />
        </label>
      </div>

      {briefingLoading && <div className="status">Loading day series…</div>}

      {!briefingLoading && briefing && (
        <>
          <div className="metrics">
            <div className="metric">
              <span>Decision date</span>
              <strong>{briefing.decisionDate}</strong>
              <em>D−1 for delivery {briefing.deliveryDate}</em>
            </div>
            <div className="metric">
              <span>Decision cutoff</span>
              <strong>{formatUtc(briefing.decisionCutoff)}</strong>
              <em>timezone {briefing.timezone || "UTC"}</em>
            </div>
            <div className="metric">
              <span>Forecast used</span>
              <strong>{formatUtc(briefing.publishTimesUsed?.[0])}</strong>
              <em>latest publishTime ≤ cutoff</em>
            </div>
            {metrics && (
              <>
                <div className="metric">
                  <span>Matched hours</span>
                  <strong>
                    {coverage?.matchedHours}/{coverage?.expectedHours}
                  </strong>
                  <em>
                    {missing === 0
                      ? "complete historical day"
                      : `${missing} hours missing`}
                  </em>
                </div>
                <div className="metric">
                  <span>MAE</span>
                  <strong>{metrics.maeMw.toLocaleString()}</strong>
                  <em>MW · n = {metrics.n} matched hours</em>
                </div>
                <div className="metric">
                  <span>Bias</span>
                  <strong>
                    {metrics.biasMw > 0 ? "+" : ""}
                    {metrics.biasMw.toLocaleString()}
                  </strong>
                  <em>
                    MW (forecast − actual)
                    {metrics.sameSign
                      ? " · all errors same sign, so MAE = |bias|"
                      : ` · ${coverage?.nOverforecast} over / ${coverage?.nUnderforecast} under`}
                  </em>
                </div>
              </>
            )}
          </div>

          {coverage && (
            <div className={`coverage-banner ${missing === 0 ? "ok" : "warn"}`}>
              <strong>
                Coverage: {coverage.matchedHours}/{coverage.expectedHours} matched
                hours (
                {Math.round(
                  (1000 * coverage.matchedHours) / coverage.expectedHours
                ) / 10}
                %)
              </strong>
              <span>
                from {coverage.actualHalfHours}/{coverage.expectedHalfHours}{" "}
                FUELHH half-hours and {coverage.forecastHours}/
                {coverage.expectedHours} WINDFOR hours. Metrics use matched
                periods only.
              </span>
              {missing > 0 && (
                <span className="missing-list">
                  Missing actual hours:{" "}
                  {coverage.missingActualHours.length
                    ? coverage.missingActualHours
                        .map((t) => t.slice(11, 16))
                        .join(", ")
                    : "none"}
                  . Missing forecast hours:{" "}
                  {coverage.missingForecastHours.length
                    ? coverage.missingForecastHours
                        .map((t) => t.slice(11, 16))
                        .join(", ")
                    : "none"}
                  .
                </span>
              )}
            </div>
          )}

          <div className="chart-wrap">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(232,242,236,0.08)" />
                <XAxis dataKey="hour" stroke="#9bb5a8" tick={{ fontSize: 12 }} />
                <YAxis
                  stroke="#9bb5a8"
                  tick={{ fontSize: 12 }}
                  width={56}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f1c18",
                    border: "1px solid rgba(232,242,236,0.15)",
                    borderRadius: 10,
                  }}
                  formatter={(value, name) => [
                    value == null ? "—" : `${Number(value).toLocaleString()} MW`,
                    name,
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="Decision-time forecast"
                  stroke="#5ec8ff"
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual wind (hourly mean)"
                  stroke="#3dd68c"
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="rule">
            {briefing.methodology?.decisionRule ?? meta?.decisionCutoff?.rule}{" "}
            Units are MW. WINDFOR is hourly; FUELHH is 30-minute; we match on
            hourly <code>startTime</code> and average the two half-hours in each
            clock hour. {briefing.methodology?.scopeNote}
          </p>
        </>
      )}
    </section>
  );
}
