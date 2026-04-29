import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 4,
      padding: '8px 12px',
      fontSize: 11,
      color: 'var(--text-primary)',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.dataKey === 'close' ? `$${p.value.toFixed(2)}` : p.value}
        </div>
      ))}
    </div>
  );
};

export default function PriceChart({ priceData, sentiment, timeframe }) {
  if (!priceData?.data?.length) {
    return (
      <div className="card" style={{ height: 240 }}>
        <span className="label" style={{ marginBottom: 0 }}>Price History</span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            {priceData?.error || 'Loading price data...'}
          </p>
        </div>
      </div>
    );
  }

  const data = priceData.data;
  const prices = data.map((d) => d.close);
  const minPrice = Math.min(...prices) * 0.995;
  const maxPrice = Math.max(...prices) * 1.005;

  const sentimentColor =
    sentiment?.label === 'BULLISH' ? 'rgba(201,168,76,0.08)' :
    sentiment?.label === 'BEARISH' ? 'rgba(201,76,76,0.08)' :
    'rgba(122,118,114,0.08)';

  const lineColor =
    prices[prices.length - 1] >= prices[0] ? 'var(--up)' : 'var(--down)';

  return (
    <div className="card" style={{ padding: '20px 20px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span className="label" style={{ marginBottom: 0 }}>
          Price History · {timeframe}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 10, color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 16, height: 1.5, background: lineColor, display: 'inline-block' }} /> Price
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
          <CartesianGrid
            strokeDasharray="0"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="close"
            name="Price"
            stroke={lineColor}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Sentiment band label */}
      <div style={{
        marginTop: 8,
        padding: '6px 10px',
        background: sentimentColor,
        borderRadius: 3,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 10,
        color: 'var(--text-secondary)',
      }}>
        <span className={`dot dot-${
          sentiment?.label === 'BULLISH' ? 'gold' :
          sentiment?.label === 'BEARISH' ? 'down' : 'flat'
        }`} />
        Current sentiment: {sentiment?.label || 'NEUTRAL'} · {((sentiment?.bullish || 0) * 100).toFixed(0)}% bullish
      </div>
    </div>
  );
}
