import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TIMEFRAME_LABELS = {
  '1D': '1 Day',
  '1W': '1 Week',
  '1M': '1 Month',
  '3M': '3 Months',
  '6M': '6 Months',
  '1Y': '1 Year',
};

export default function DirectionSignal({ direction, technicals, velocity }) {
  if (!direction) return <SignalSkeleton />;

  const { signal, confidence, reasoning, timeframe } = direction;

  const config = {
    UP:   { color: 'var(--up)',   bg: 'var(--up-dim)',   Icon: TrendingUp,   label: 'Bullish Signal' },
    DOWN: { color: 'var(--down)', bg: 'var(--down-dim)', Icon: TrendingDown, label: 'Bearish Signal' },
    FLAT: { color: 'var(--flat)', bg: 'var(--flat-dim)', Icon: Minus,        label: 'Neutral Signal' },
  }[signal] || { color: 'var(--flat)', bg: 'var(--flat-dim)', Icon: Minus, label: 'Unknown' };

  const { color, bg, Icon, label } = config;
  const pct = (confidence * 100).toFixed(0);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <span className="label" style={{ marginBottom: 0 }}>Direction Signal · {TIMEFRAME_LABELS[timeframe] || timeframe}</span>

      {/* Main signal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 56, height: 56,
          background: bg,
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={24} color={color} />
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 300, color, letterSpacing: '-0.02em' }}>{signal}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
        </div>
      </div>

      {/* Confidence bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
          <span>Confidence</span>
          <span style={{ color: 'var(--text-secondary)' }}>{pct}%</span>
        </div>
        <div className="progress-bar" style={{ height: 4 }}>
          <div
            className="progress-fill"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Confidence decays for longer timeframes — honest by design
        </div>
      </div>

      <div className="divider" style={{ margin: 0 }} />

      {/* Technicals */}
      {technicals && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <TechStat label="RSI" value={technicals.rsi?.toFixed(1) ?? 'N/A'}
            subtext={technicals.rsi < 30 ? 'Oversold' : technicals.rsi > 70 ? 'Overbought' : 'Neutral'} />
          <TechStat label="MACD" value={technicals.macd_signal === 'BULLISH_CROSS' ? '↑' : '↓'}
            subtext={technicals.macd_signal?.replace('_', ' ')} />
          <TechStat label="Volatility" value={technicals.volatility ?? 'N/A'} subtext="" />
        </div>
      )}

      {/* Velocity */}
      {velocity && (
        <div style={{
          padding: '8px 12px',
          background: 'var(--surface-2)',
          borderRadius: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Sentiment Velocity</span>
          <span style={{
            fontSize: 11,
            color: velocity.trend === 'ACCELERATING' ? 'var(--up)' :
                   velocity.trend === 'DECELERATING' ? 'var(--down)' : 'var(--flat)',
          }}>
            {velocity.trend} {velocity.change > 0 ? `+${(velocity.change * 100).toFixed(1)}%` : `${(velocity.change * 100).toFixed(1)}%`}
          </span>
        </div>
      )}
    </div>
  );
}

function TechStat({ label, value, subtext }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--text-primary)' }}>{value}</span>
      {subtext && <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{subtext}</span>}
    </div>
  );
}

function SignalSkeleton() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="skeleton" style={{ width: 80, height: 10 }} />
      <div className="skeleton" style={{ height: 56 }} />
      <div className="skeleton" style={{ height: 30 }} />
    </div>
  );
}
