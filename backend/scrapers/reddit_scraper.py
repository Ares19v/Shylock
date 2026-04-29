import os
import praw
from datetime import datetime

TIMEFRAME_MAP = {"1D": "day", "1W": "week", "1M": "month", "3M": "month", "6M": "year", "1Y": "year"}
SUBREDDITS = ["wallstreetbets", "stocks", "investing", "StockMarket", "options"]


def _get_client():
    cid = os.getenv("REDDIT_CLIENT_ID")
    secret = os.getenv("REDDIT_CLIENT_SECRET")
    if not cid or not secret:
        return None
    return praw.Reddit(
        client_id=cid, client_secret=secret,
        user_agent="shylock-bot/1.0", check_for_async=False
    )


def fetch_reddit_posts(ticker: str, timeframe: str = "1W") -> dict:
    reddit = _get_client()
    if not reddit:
        return {"available": False, "post_count": 0, "posts": [], "error": "REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET not set"}

    try:
        time_filter = TIMEFRAME_MAP.get(timeframe, "week")
        sub = reddit.subreddit("+".join(SUBREDDITS))
        raw = list(sub.search(query=ticker, time_filter=time_filter, sort="relevance", limit=60))

        posts = []
        for p in raw:
            text = f"{p.title} {p.selftext}"
            if ticker.upper() not in text.upper():
                continue
            posts.append({
                "text": f"{p.title}. {p.selftext[:300]}".strip(),
                "url": f"https://reddit.com{p.permalink}",
                "score": p.score,
                "timestamp": datetime.utcfromtimestamp(p.created_utc).isoformat(),
                "source": "reddit",
                "subreddit": str(p.subreddit),
            })

        posts.sort(key=lambda x: x["score"], reverse=True)
        return {"available": True, "post_count": len(posts), "posts": posts[:30]}

    except Exception as e:
        return {"available": False, "post_count": 0, "posts": [], "error": str(e)}
