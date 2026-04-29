import httpx
from datetime import datetime

TIMEFRAME_MAP = {"1D": "day", "1W": "week", "1M": "month", "3M": "month", "6M": "year", "1Y": "year"}
SUBREDDITS = "wallstreetbets+stocks+investing+StockMarket+options"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept": "application/json",
}


def fetch_reddit_posts(ticker: str, timeframe: str = "1W") -> dict:
    """
    Uses Reddit's public JSON search API — no API key required.
    Rate limit: ~60 req/min for unauthenticated requests (plenty for our use).
    """
    time_filter = TIMEFRAME_MAP.get(timeframe, "week")
    url = f"https://www.reddit.com/r/{SUBREDDITS}/search.json"
    params = {
        "q": ticker.upper(),
        "sort": "relevance",
        "t": time_filter,
        "limit": 60,
        "restrict_sr": "true",
        "type": "link",
    }

    try:
        r = httpx.get(url, params=params, headers=HEADERS, timeout=12.0, follow_redirects=True)
        if r.status_code == 429:
            return {"available": False, "post_count": 0, "posts": [], "error": "Reddit rate limit — try again shortly"}
        if r.status_code != 200:
            return {"available": False, "post_count": 0, "posts": [], "error": f"Reddit returned HTTP {r.status_code}"}

        data = r.json()
        children = data.get("data", {}).get("children", [])

        posts = []
        for child in children:
            p = child.get("data", {})
            title = p.get("title", "")
            selftext = p.get("selftext", "")
            # Only include posts that mention the ticker
            combined = f"{title} {selftext}".upper()
            if ticker.upper() not in combined:
                continue
            posts.append({
                "text": f"{title}. {selftext[:300]}".strip(),
                "url": f"https://reddit.com{p.get('permalink', '')}",
                "score": p.get("score", 0),
                "timestamp": datetime.utcfromtimestamp(p.get("created_utc", 0)).isoformat(),
                "source": "reddit",
                "subreddit": p.get("subreddit", ""),
            })

        posts.sort(key=lambda x: x["score"], reverse=True)
        return {"available": True, "post_count": len(posts), "posts": posts[:30]}

    except Exception as e:
        return {"available": False, "post_count": 0, "posts": [], "error": str(e)}

