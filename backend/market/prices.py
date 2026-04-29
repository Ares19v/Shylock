"""
Market data and technical indicators via yfinance.
No API key required.
"""
import yfinance as yf
import pandas as pd

try:
    import ta
    TA_AVAILABLE = True
except ImportError:
    TA_AVAILABLE = False

PERIOD_MAP = {
    "1D": ("5d", "15m"),
    "1W": ("1mo", "1d"),
    "1M": ("3mo", "1d"),
    "3M": ("6mo", "1d"),
    "6M": ("1y", "1wk"),
    "1Y": ("2y", "1wk"),
}

SECTOR_ETFS = {
    "Technology": "XLK",
    "Healthcare": "XLV",
    "Finance": "XLF",
    "Energy": "XLE",
    "Consumer": "XLY",
    "Industrials": "XLI",
    "Materials": "XLB",
    "Utilities": "XLU",
}


def get_price_history(ticker: str, timeframe: str = "1W") -> dict:
    """Returns OHLCV price history formatted for Recharts."""
    period, interval = PERIOD_MAP.get(timeframe, ("1mo", "1d"))
    try:
        stock = yf.Ticker(ticker.upper())
        hist = stock.history(period=period, interval=interval)
        if hist.empty:
            return {"available": False, "data": [], "error": "No price data found"}

        data = [
            {
                "date": str(idx.date()) if hasattr(idx, "date") else str(idx),
                "close": round(float(row["Close"]), 2),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "volume": int(row["Volume"]),
            }
            for idx, row in hist.iterrows()
        ]
        return {"available": True, "data": data, "ticker": ticker.upper()}
    except Exception as e:
        return {"available": False, "data": [], "error": str(e)}


def get_technicals(ticker: str) -> dict:
    """Returns RSI, MACD signal, and volatility for a ticker."""
    try:
        stock = yf.Ticker(ticker.upper())
        hist = stock.history(period="6mo", interval="1d")
        if hist.empty or len(hist) < 30:
            return {"rsi": None, "macd_signal": None, "volatility": None}

        close = hist["Close"]

        if TA_AVAILABLE:
            rsi = ta.momentum.RSIIndicator(close, window=14).rsi().iloc[-1]
            macd_obj = ta.trend.MACD(close, window_slow=26, window_fast=12, window_sign=9)
            macd_line = macd_obj.macd().iloc[-1]
            signal_line = macd_obj.macd_signal().iloc[-1]
            bb = ta.volatility.BollingerBands(close, window=20, window_dev=2)
            bb_pct = bb.bollinger_pband().iloc[-1]
        else:
            # Fallback: manual RSI
            delta = close.diff()
            gain = delta.clip(lower=0).rolling(14).mean()
            loss = (-delta.clip(upper=0)).rolling(14).mean()
            rs = gain / loss
            rsi = float(100 - (100 / (1 + rs.iloc[-1])))
            macd_line, signal_line, bb_pct = 0, -1, 0.5  # neutral defaults

        macd_signal = "BULLISH_CROSS" if macd_line > signal_line else "BEARISH_CROSS"
        volatility = "High" if bb_pct > 0.8 or bb_pct < 0.2 else "Stable"

        # Current price info
        info = {}
        try:
            info = stock.fast_info
        except Exception:
            pass

        current_price = round(float(close.iloc[-1]), 2)
        prev_close = round(float(close.iloc[-2]), 2) if len(close) > 1 else current_price
        change_1d = round((current_price - prev_close) / prev_close, 4) if prev_close else 0

        return {
            "rsi": round(float(rsi), 2),
            "macd_signal": macd_signal,
            "volatility": volatility,
            "current_price": current_price,
            "change_1d": change_1d,
            "market_cap": getattr(info, "market_cap", None),
        }
    except Exception as e:
        return {"rsi": None, "macd_signal": None, "volatility": None, "error": str(e)}


def get_company_info(ticker: str) -> dict:
    """Returns company name and basic info."""
    try:
        stock = yf.Ticker(ticker.upper())
        info = stock.info
        return {
            "name": info.get("longName") or info.get("shortName") or ticker.upper(),
            "sector": info.get("sector", "Unknown"),
            "industry": info.get("industry", "Unknown"),
            "country": info.get("country", "Unknown"),
            "website": info.get("website", ""),
            "description": (info.get("longBusinessSummary") or "")[:300],
        }
    except Exception:
        return {"name": ticker.upper(), "sector": "Unknown", "industry": "Unknown"}


def get_sector_prices() -> dict:
    """Returns 1-month price change % for each sector ETF."""
    results = {}
    for sector, etf in SECTOR_ETFS.items():
        try:
            stock = yf.Ticker(etf)
            hist = stock.history(period="1mo", interval="1d")
            if len(hist) >= 2:
                change = (hist["Close"].iloc[-1] - hist["Close"].iloc[0]) / hist["Close"].iloc[0]
                results[sector] = {"etf": etf, "change_1m": round(float(change), 4)}
            else:
                results[sector] = {"etf": etf, "change_1m": 0.0}
        except Exception:
            results[sector] = {"etf": etf, "change_1m": 0.0}
    return results
