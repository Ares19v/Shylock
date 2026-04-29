function SourceCard({ title, data, type }) {
  const sentiment = data?.sentiment;
  const count = type === 'reddit'
    ? data?.post_count
    : type === 'news'
    ? data?.article_count
    : data?.message_count;

  const available = data?.available !== false;

  const label = sentiment?.label || 'NEUTRAL';
  const labelClass = label === 'BULLISH' ? 'badge-bullish' : label === 'BEARISH' ? 'badge-bearish' : 'badge-neutral';
  const sourceClass = `source-${type}`;

  return (
    <div className="card card-sm" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className={`feed-item-source ${sourceClass}`}>{title}</span>
        {available && sentiment && (
          <span className={`badge ${labelClass}`}>{label}</span>
        )}
      </div>

      {!available ? (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          {data?.error || 'API key not configured'}
        </p>
      ) : !sentiment ? (
        <div className="skeleton" style={{ height: 40 }} />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Bar label="Bullish" value={sentiment.bullish} color="var(--gold)" />
            <Bar label="Neutral" value={sentiment.neutral} color="var(--flat)" />
            <Bar label="Bearish" value={sentiment.bearish} color="var(--down)" />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {count} {type === 'news' ? 'articles' : 'posts'} analysed
          </div>
        </>
      )}
    </div>
  );
}

function Bar({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 44, fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
      <div className="progress-bar" style={{ flex: 1 }}>
        <div
          className="progress-fill"
          style={{ width: `${(value * 100).toFixed(1)}%`, background: color }}
        />
      </div>
      <span style={{ width: 32, fontSize: 10, color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
}

export default function SourceBreakdown({ sources }) {
  if (!sources) {
    return (
      <div className="row">
        {['Reddit', 'News', 'StockTwits'].map((s) => (
          <div key={s} className="card card-sm skeleton" style={{ height: 120 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="row">
      <SourceCard title="Reddit" data={sources.reddit} type="reddit" />
      <SourceCard title="News" data={sources.news} type="news" />
      <SourceCard title="StockTwits" data={sources.stocktwits} type="stocktwits" />
    </div>
  );
}
