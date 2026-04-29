export default function SectorHeatmap({ heatmap }) {
  if (!heatmap) {
    return (
      <div className="card">
        <span className="label">Sector Heatmap · 1M Price Change</span>
        <div className="heatmap-grid" style={{ marginTop: 12 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton heatmap-cell" style={{ height: 56 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span className="label" style={{ marginBottom: 0 }}>Sector Heatmap · 1M Price Change</span>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>ETF-based · cached 30min</span>
      </div>
      <div className="heatmap-grid">
        {heatmap.map((cell) => {
          const pct = (cell.change_1m * 100).toFixed(1);
          const sign = cell.change_1m >= 0 ? '+' : '';
          const cellClass = `heatmap-cell heatmap-cell-${cell.label.toLowerCase()}`;
          const valClass = `heatmap-cell-val heatmap-val-${cell.label.toLowerCase()}`;

          return (
            <div key={cell.sector} className={cellClass} title={cell.etf}>
              <span className="heatmap-cell-name">{cell.sector}</span>
              <span className={valClass}>{sign}{pct}%</span>
              <span style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 2 }}>{cell.etf}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        {[
          { label: 'Bullish (>3%)', color: 'var(--up)' },
          { label: 'Neutral', color: 'var(--flat)' },
          { label: 'Bearish (<−3%)', color: 'var(--down)' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'var(--text-muted)' }}>
            <span className="dot" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
