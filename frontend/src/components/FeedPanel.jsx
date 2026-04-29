import { ExternalLink } from 'lucide-react';

const SOURCE_LABELS = { reddit: 'Reddit', news: 'News', stocktwits: 'StockTwits' };

function FeedItem({ item }) {
  const { text, source, url, timestamp, subreddit, publisher } = item;
  const meta = subreddit ? `r/${subreddit}` : publisher || source;
  const date = timestamp ? new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  return (
    <div className="feed-item">
      <div className="feed-item-meta">
        <span className={`feed-item-source source-${source}`}>
          {SOURCE_LABELS[source] || source}
        </span>
        {meta && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{meta}</span>}
        {date && <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>{date}</span>}
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', lineHeight: 1 }}>
            <ExternalLink size={10} />
          </a>
        )}
      </div>
      <p className="feed-item-text">{text?.slice(0, 200)}{text?.length > 200 ? '...' : ''}</p>
    </div>
  );
}

export default function FeedPanel({ feed }) {
  if (!feed) {
    return (
      <div className="card" style={{ height: 300 }}>
        <span className="label">Source Feed</span>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div className="skeleton" style={{ width: 80, height: 10, marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 32 }} />
          </div>
        ))}
      </div>
    );
  }

  if (!feed.length) {
    return (
      <div className="card">
        <span className="label">Source Feed</span>
        <div className="empty-state" style={{ padding: 24 }}>
          <p>No posts found for this ticker in the selected timeframe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="label" style={{ marginBottom: 0 }}>Source Feed</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{feed.length} items</span>
      </div>
      <div style={{ overflowY: 'auto', maxHeight: 360 }}>
        {feed.map((item, i) => <FeedItem key={i} item={item} />)}
      </div>
    </div>
  );
}
