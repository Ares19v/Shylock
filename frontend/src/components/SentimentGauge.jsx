/**
 * SVG Arc Gauge — shows bullish/bearish/neutral split.
 * Arc spans 180° (left = bearish, right = bullish, center = neutral).
 */
export default function SentimentGauge({ sentiment }) {
  if (!sentiment) return <GaugeSkeleton />;

  const { bullish = 0, bearish = 0, neutral = 0, label = 'NEUTRAL' } = sentiment;

  // Needle: map bullish-bearish score (-1 to 1) to angle (180° to 0°)
  const score = bullish - bearish;            // -1 to +1
  const needleAngle = 180 - ((score + 1) / 2) * 180; // 180° (left) to 0° (right)

  const r = 70;
  const cx = 90;
  const cy = 85;

  // Arc path helper
  const arc = (startDeg, endDeg, color, opacity = 1) => {
    const toRad = (d) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(180 - startDeg));
    const y1 = cy - r * Math.sin(toRad(180 - startDeg));
    const x2 = cx + r * Math.cos(toRad(180 - endDeg));
    const y2 = cy - r * Math.sin(toRad(180 - endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return (
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        opacity={opacity}
      />
    );
  };

  // Needle
  const nRad = (needleAngle * Math.PI) / 180;
  const nx = cx + 60 * Math.cos(nRad);
  const ny = cy - 60 * Math.sin(nRad);

  const labelColor = label === 'BULLISH' ? 'var(--gold)' : label === 'BEARISH' ? 'var(--down)' : 'var(--flat)';

  return (
    <div className="card gauge-wrap">
      <span className="label">Overall Sentiment</span>
      <svg width={180} height={100} viewBox="0 0 180 100">
        {/* Background arc */}
        {arc(0, 180, 'var(--surface-2)', 1)}
        {/* Bearish zone (left) */}
        {arc(0, bearish * 180, 'var(--down)', 0.8)}
        {/* Neutral zone (middle) */}
        {arc(bearish * 180, (bearish + neutral) * 180, 'var(--flat)', 0.6)}
        {/* Bullish zone (right) */}
        {arc((bearish + neutral) * 180, 180, 'var(--gold)', 0.9)}
        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={nx} y2={ny}
          stroke="var(--text-primary)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={4} fill="var(--text-primary)" />
        {/* Center dot */}
        <circle cx={cx} cy={cy} r={2} fill="var(--bg)" />
      </svg>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 400, color: labelColor, letterSpacing: '0.05em' }}>
          {label}
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Stat label="Bullish" value={bullish} color="var(--gold)" />
          <Stat label="Neutral" value={neutral} color="var(--flat)" />
          <Stat label="Bearish" value={bearish} color="var(--down)" />
        </div>
        <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-muted)' }}>
          {sentiment.text_count} texts analysed
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 14, fontWeight: 400, color }}>{(value * 100).toFixed(0)}%</div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function GaugeSkeleton() {
  return (
    <div className="card gauge-wrap" style={{ gap: 12 }}>
      <div className="skeleton" style={{ width: 80, height: 10, borderRadius: 3 }} />
      <div className="skeleton" style={{ width: 160, height: 80, borderRadius: 3 }} />
      <div className="skeleton" style={{ width: 120, height: 20, borderRadius: 3 }} />
    </div>
  );
}
