import os
import httpx
from datetime import datetime, timedelta

TIMEFRAME_DAYS = {"1D": 1, "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365}


def _fetch_newsapi(query: str, days: int) -> list:
    api_key = os.getenv("NEWSAPI_KEY")
    if not api_key:
        return []
    from_date = (datetime.now() - timedelta(days=min(days, 30))).strftime("%Y-%m-%d")
    try:
        r = httpx.get(
            "https://newsapi.org/v2/everything",
            params={"q": query, "language": "en", "sortBy": "publishedAt",
                    "pageSize": 25, "from": from_date, "apiKey": api_key},
            timeout=10.0,
        )
        articles = r.json().get("articles", [])
        return [
            {
                "text": f"{a.get('title','')}. {a.get('description','') or ''}".strip()[:400],
                "url": a.get("url", ""),
                "source": "news",
                "publisher": a.get("source", {}).get("name", ""),
                "timestamp": a.get("publishedAt", ""),
            }
            for a in articles if a.get("title")
        ]
    except Exception:
        return []


def _fetch_finnhub(ticker: str, days: int) -> list:
    api_key = os.getenv("FINNHUB_KEY")
    if not api_key:
        return []
    from_date = (datetime.now() - timedelta(days=min(days, 30))).strftime("%Y-%m-%d")
    to_date = datetime.now().strftime("%Y-%m-%d")
    try:
        import finnhub
        client = finnhub.Client(api_key=api_key)
        news = client.company_news(ticker.upper(), _from=from_date, to=to_date)
        return [
            {
                "text": f"{a.get('headline','')}. {a.get('summary','') or ''}".strip()[:400],
                "url": a.get("url", ""),
                "source": "news",
                "publisher": a.get("source", "Finnhub"),
                "timestamp": datetime.utcfromtimestamp(a.get("datetime", 0)).isoformat(),
            }
            for a in (news or [])[:20] if a.get("headline")
        ]
    except Exception:
        return []


def fetch_news_articles(ticker: str, company_name: str = "", timeframe: str = "1W") -> dict:
    days = TIMEFRAME_DAYS.get(timeframe, 7)
    query = f"{ticker} stock {company_name}".strip()

    newsapi_articles = _fetch_newsapi(query, days)
    finnhub_articles = _fetch_finnhub(ticker, days)

    # Merge + deduplicate by URL
    seen = set()
    articles = []
    for a in newsapi_articles + finnhub_articles:
        if a["url"] not in seen:
            seen.add(a["url"])
            articles.append(a)

    available = bool(os.getenv("NEWSAPI_KEY") or os.getenv("FINNHUB_KEY"))
    return {
        "available": available,
        "article_count": len(articles),
        "articles": articles[:30],
        "error": None if available else "NEWSAPI_KEY / FINNHUB_KEY not set",
    }
