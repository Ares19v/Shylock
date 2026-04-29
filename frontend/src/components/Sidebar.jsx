import { BarChart3, TrendingUp, Globe, Layers } from 'lucide-react';

const NAV = [
  { icon: BarChart3, label: 'Analysis' },
  { icon: TrendingUp, label: 'Signals' },
  { icon: Globe, label: 'Sector Map' },
  { icon: Layers, label: 'Feed' },
];

export default function Sidebar({ active, onNav }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>SHYLOCK</h1>
        <p>Sentiment Intelligence</p>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className={`nav-item ${active === label ? 'active' : ''}`}
            onClick={() => onNav(label)}
          >
            <Icon size={14} />
            <span>{label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Powered by FinBERT · yfinance</p>
        <p style={{ marginTop: 4 }}>Not financial advice</p>
      </div>
    </aside>
  );
}
