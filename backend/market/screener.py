"""Curated ticker universe and screening logic for Delphi."""
import pandas as pd
import yfinance as yf

TICKER_UNIVERSE = {
    "Technology":  ["AAPL", "MSFT", "GOOGL", "META", "NVDA", "AMD", "INTC", "ORCL", "CRM", "ADBE", "QCOM"],
    "Finance":     ["JPM", "BAC", "GS", "MS", "BLK", "V", "MA", "AXP", "C", "WFC"],
    "Healthcare":  ["JNJ", "UNH", "PFE", "ABBV", "MRK", "LLY", "TMO", "ABT"],
    "Energy":      ["XOM", "CVX", "COP", "SLB", "EOG", "PSX", "VLO"],
    "Consumer":    ["AMZN", "TSLA", "NKE", "MCD", "SBUX", "HD", "WMT", "COST"],
    "Industrials": ["CAT", "BA", "GE", "RTX", "HON", "UPS"],
    "ETF":         ["SPY", "QQQ", "IWM", "VTI", "GLD"],
}

ALL_TICKERS = [t for tickers in TICKER_UNIVERSE.values() for t in tickers]
TICKER_TO_SECTOR = {t: s for s, tickers in TICKER_UNIVERSE.items() for t in tickers}


def _rsi(series: pd.Series, period: int = 14) -> float:
    if len(series) < period + 1:
        return 50.0
    delta = series.diff().dropna()
    gain = delta.clip(lower=0).rolling(period).mean().iloc[-1]
    loss = (-delta.clip(upper=0)).rolling(period).mean().iloc[-1]
    if loss == 0:
        return 100.0
    return round(100 - (100 / (1 + gain / loss)), 1)


def _signal(rsi: float, chg: float) -> str:
    if rsi < 30:
        return "OVERSOLD"
    if rsi > 70:
        return "OVERBOUGHT"
    if chg > 1.5:
        return "BULLISH"
    if chg < -1.5:
        return "BEARISH"
    return "NEUTRAL"


def run_screener(sector: str = None, signal: str = None) -> list:
    """Batch-fetch 1-month daily closes for the universe, compute RSI + signal, return filtered list."""
    tickers = TICKER_UNIVERSE.get(sector, ALL_TICKERS) if sector else ALL_TICKERS

    raw = yf.download(
        tickers, period="1mo", interval="1d",
        progress=False, auto_adjust=True, group_by="ticker",
    )

    results = []
    for ticker in tickers:
        try:
            if len(tickers) == 1:
                closes = raw["Close"].dropna()
            else:
                closes = raw[ticker]["Close"].dropna() if ticker in raw else pd.Series(dtype=float)

            if len(closes) < 3:
                continue

            cur = float(closes.iloc[-1])
            prev = float(closes.iloc[-2])
            chg = round(((cur - prev) / prev) * 100, 2) if prev else 0.0
            rsi_val = _rsi(closes)
            sig = _signal(rsi_val, chg)

            if signal and sig != signal.upper():
                continue

            results.append({
                "ticker": ticker,
                "sector": TICKER_TO_SECTOR.get(ticker, "Unknown"),
                "price": round(cur, 2),
                "change_1d": chg,
                "rsi": rsi_val,
                "signal": sig,
            })
        except Exception:
            continue

    results.sort(key=lambda x: abs(x["change_1d"]), reverse=True)
    return results
