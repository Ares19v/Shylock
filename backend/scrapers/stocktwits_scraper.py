import httpx
from datetime import datetime


def fetch_stocktwits(ticker: str) -> dict:
    """StockTwits public API — no key needed."""
    try:
        url = f"https://api.stocktwits.com/api/2/streams/symbol/{ticker.upper()}.json"
        r = httpx.get(url, timeout=10.0, headers={"User-Agent": "Mozilla/5.0"})
        if r.status_code == 429:
            return {"available": False, "message_count": 0, "posts": [], "error": "Rate limit exceeded"}
        if r.status_code != 200 or not r.text.strip():
            return {"available": False, "message_count": 0, "posts": [], "error": f"StockTwits returned HTTP {r.status_code}"}
        
        try:
            data = r.json()
        except ValueError:
            return {"available": False, "message_count": 0, "posts": [], "error": "Invalid JSON response"}

        messages = data.get("messages", [])
        posts = []
        for m in messages[:50]:
            body = m.get("body", "").strip()
            if not body:
                continue
            # StockTwits provides its own sentiment label
            entities = m.get("entities", {})
            st_sentiment = None
            if entities.get("sentiment"):
                st_sentiment = entities["sentiment"].get("basic")  # 'Bullish' or 'Bearish'

            posts.append({
                "text": body[:400],
                "url": f"https://stocktwits.com/{m.get('user', {}).get('username', '')}/message/{m.get('id', '')}",
                "source": "stocktwits",
                "timestamp": m.get("created_at", ""),
                "st_sentiment": st_sentiment,
                "likes": m.get("likes", {}).get("total", 0),
            })

        return {"available": True, "message_count": len(posts), "posts": posts}

    except Exception as e:
        return {"available": False, "message_count": 0, "posts": [], "error": str(e)}
