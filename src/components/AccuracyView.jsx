import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AccuracyView({ accuracy, onSelectDay }) {
  if (!accuracy) {
    return <div className="status">Loading accuracy…</div>;
  }

  const chartData = accuracy.daily.map((d) => ({
    day: d.deliveryDate.slice(8),
    full: d.deliveryDate,
    mae: d.maeMw,
    bias: d.biasMw,
    n: d.n ?? d.matchedHours,
  }));

  const overall = accuracy.overall;
  const coverage = accuracy.coverage;
  const methodology = accuracy.methodology;
  const gaps = coverage?.daysWithGaps?.length ?? 0;
  const coveragePct =
    coverage?.coveragePct ??
    (coverage?.expectedMatchedHours
      ? Math.round(
          (1000 * coverage.matchedHours) / coverage.expectedMatchedHours
        ) / 10
      : null);

  return (
    <section className="panel">
      <h2>January 2026 forecast accuracy</h2>
      <p className="sub">
        Decision-time wind forecast versus complete historical outturn for each
        January delivery day. Metrics use matched hourly periods only.
      </p>

      {overall && (
        <div className="metrics">
          <div className="metric">
            <span>Overall MAE</span>
            <strong>{overall.maeMw.toLocaleString()}</strong>
            <em>MW · mean |forecast − actual|</em>
          </div>
          <div className="metric">
            <span>Overall RMSE</span>
            <strong>{overall.rmseMw.toLocaleString()}</strong>
            <em>MW</em>
          </div>
          <div className="metric">
            <span>Overall bias</span>
            <strong>
              {overall.biasMw > 0 ? "+" : ""}
              {overall.biasMw.toLocaleString()}
            </strong>
            <em>MW · mean (forecast − actual)</em>
          </div>
          <div className="metric">
            <span>Matched coverage</span>
            <strong>
              {coverage?.matchedHours}/{coverage?.expectedMatchedHours}
            </strong>
            <em>
              {coveragePct != null ? `${coveragePct}%` : ""} of 31 × 24 hours
              {gaps === 0 ? " · no gaps" : ` · ${gaps} days with gaps`}
              {coverage?.actualHalfHourRows != null
                ? ` · from ${coverage.actualHalfHourRows.toLocaleString()} half-hour actuals`
                : ""}
            </em>
          </div>
        </div>
      )}

      <h3 className="chart-title">Daily MAE (MW)</h3>
      <p className="chart-caption">
        Each bar is that delivery day’s mean absolute error across its matched
        hours (typically 24). Click a bar to open the briefing for that day.
      </p>

      <div className="chart-wrap">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(232,242,236,0.08)" />
            <XAxis
              dataKey="day"
              stroke="#9bb5a8"
              tick={{ fontSize: 11 }}
              label={{
                value: "Delivery day (January 2026)",
                position: "insideBottom",
                offset: -2,
                fill: "#9bb5a8",
                fontSize: 11,
              }}
            />
            <YAxis
              stroke="#9bb5a8"
              tick={{ fontSize: 12 }}
              width={56}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              label={{
                value: "MAE (MW)",
                angle: -90,
                position: "insideLeft",
                fill: "#9bb5a8",
                fontSize: 11,
              }}
            />
            <Tooltip
              contentStyle={{
                background: "#0f1c18",
                border: "1px solid rgba(232,242,236,0.15)",
                borderRadius: 10,
              }}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.full
                  ? `Delivery ${payload[0].payload.full}`
                  : ""
              }
              formatter={(value, _name, item) => [
                `${Number(value).toLocaleString()} MW`,
                `Daily MAE (n=${item?.payload?.n ?? "—"} hours)`,
              ]}
            />
            <Bar
              dataKey="mae"
              name="Daily MAE (MW)"
              fill="#3dd68c"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={(data) => data?.full && onSelectDay(data.full)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="rule">
        {accuracy.decisionRule} {methodology?.aggregation} Bias is{" "}
        {methodology?.biasDefinition ??
          "mean(forecast − actual); positive means over-forecast."}{" "}
        Wind error alone does not determine buy volume.
      </p>
    </section>
  );
}
