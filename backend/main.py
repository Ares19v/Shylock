import os
import json
import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel

from scrapers.reddit_scraper import fetch_reddit_posts
from scrapers.news_scraper import fetch_news_articles
from scrapers.stocktwits_scraper import fetch_stocktwits
from sentiment.finbert import analyze_sentiment, compute_velocity
from predictor.direction import compute_direction_signal
from market.prices import get_price_history, get_technicals, get_company_info, get_sector_prices
from market.screener import run_screener

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Delphi Sentiment Engine", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
executor = ThreadPoolExecutor(max_workers=6)

# In-memory cache for sector heatmap (refreshed every 30 min)
_sector_cache: dict = {}
_sector_cache_ts: float = 0


def _run(fn, *args):
    """Helper: run sync function in thread executor."""
    loop = asyncio.get_event_loop()
    return loop.run_in_executor(executor, fn, *args)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}


@app.get("/analyze/{ticker}")
async def analyze(ticker: str, timeframe: str = "1W"):
    ticker = ticker.upper()
    logger.info(f"Analyzing {ticker} / timeframe={timeframe}")

    # --- Parallel data fetch ---
    reddit_fut = _run(fetch_reddit_posts, ticker, timeframe)
    news_fut = _run(fetch_news_articles, ticker, "", timeframe)
    stocktwits_fut = _run(fetch_stocktwits, ticker)
    price_fut = _run(get_price_history, ticker, timeframe)
    tech_fut = _run(get_technicals, ticker)
    info_fut = _run(get_company_info, ticker)

    reddit, news, stocktwits, price_data, technicals, company = await asyncio.gather(
        reddit_fut, news_fut, stocktwits_fut, price_fut, tech_fut, info_fut
    )

    # --- Sentiment analysis ---
    reddit_texts = [p["text"] for p in reddit.get("posts", [])]
    news_texts = [a["text"] for a in news.get("articles", [])]
    st_texts = [m["text"] for m in stocktwits.get("posts", [])]

    reddit_sentiment = analyze_sentiment(reddit_texts) if reddit_texts else None
    news_sentiment = analyze_sentiment(news_texts) if news_texts else None
    st_sentiment = analyze_sentiment(st_texts) if st_texts else None

    # --- Overall sentiment (weighted average) ---
    all_texts = reddit_texts + news_texts + st_texts
    overall_sentiment = analyze_sentiment(all_texts) if all_texts else {
        "bullish": 0.0, "bearish": 0.0, "neutral": 1.0, "label": "NEUTRAL", "text_count": 0
    }

    # --- Sentiment velocity (older vs newer posts) ---
    mid = len(all_texts) // 2
    velocity = compute_velocity(all_texts[:mid], all_texts[mid:]) if len(all_texts) >= 4 else {"change": 0.0, "trend": "STABLE"}

    # --- Direction signal ---
    direction = compute_direction_signal(overall_sentiment, technicals, timeframe)

    # --- Build unified feed (top 20 posts sorted by sentiment extremity) ---
    all_posts = (
        reddit.get("posts", []) +
        news.get("articles", []) +
        stocktwits.get("posts", [])
    )
    feed = all_posts[:20]  # Already sorted by score/relevance per scraper

    return {
        "ticker": ticker,
        "company": company,
        "timeframe": timeframe,
        "overall_sentiment": overall_sentiment,
        "velocity": velocity,
        "direction": direction,
        "technicals": technicals,
        "sources": {
            "reddit": {**reddit, "sentiment": reddit_sentiment, "posts": reddit.get("posts", [])[:5]},
            "news": {**news, "sentiment": news_sentiment, "articles": news.get("articles", [])[:5]},
            "stocktwits": {**stocktwits, "sentiment": st_sentiment, "posts": stocktwits.get("posts", [])[:5]},
        },
        "feed": feed,
        "price": price_data,
    }


@app.get("/price-history/{ticker}")
async def price_history(ticker: str, timeframe: str = "1W"):
    data = await _run(get_price_history, ticker.upper(), timeframe)
    return data


@app.get("/sector-heatmap")
async def sector_heatmap():
    import time
    global _sector_cache, _sector_cache_ts

    # Serve cache if fresh (< 30 min)
    if _sector_cache and (time.time() - _sector_cache_ts) < 1800:
        return _sector_cache

    sector_prices = await _run(get_sector_prices)

    # Build heatmap: use price 1M change as proxy for sentiment
    heatmap = []
    for sector, data in sector_prices.items():
        change = data.get("change_1m", 0.0)
        if change > 0.03:
            label = "BULLISH"
        elif change < -0.03:
            label = "BEARISH"
        else:
            label = "NEUTRAL"
        heatmap.append({
            "sector": sector,
            "etf": data.get("etf"),
            "change_1m": change,
            "label": label,
        })

    _sector_cache = {"heatmap": heatmap}
    _sector_cache_ts = __import__("time").time()
    return _sector_cache


@app.websocket("/ws/{client_id}")
async def websocket_synthesis(websocket: WebSocket, client_id: str):
    """Streaming Groq synthesis for a given analysis payload."""
    await websocket.accept()
    await websocket.send_text(json.dumps({
        "type": "system", "message": "Delphi Synthesis Engine connected."
    }))

    try:
        while True:
            raw = await websocket.receive_text()
            payload = json.loads(raw)
            ticker = payload.get("ticker", "")
            direction = payload.get("direction", {})
            sentiment = payload.get("overall_sentiment", {})
            technicals = payload.get("technicals", {})
            timeframe = payload.get("timeframe", "1W")

            prompt = (
                f"Asset: {ticker} | Timeframe: {timeframe}\n"
                f"Sentiment: {sentiment.get('label')} "
                f"(Bullish {sentiment.get('bullish',0):.0%}, Bearish {sentiment.get('bearish',0):.0%})\n"
                f"Signal: {direction.get('signal')} @ {direction.get('confidence',0):.0%} confidence\n"
                f"RSI: {technicals.get('rsi')} | MACD: {technicals.get('macd_signal')} | "
                f"Volatility: {technicals.get('volatility')}\n"
                f"Reasoning: {direction.get('reasoning')}\n\n"
                f"Write a concise 3-sentence executive briefing for a sophisticated investor. "
                f"Be direct, data-driven, and end with a clear risk note."
            )

            chat = groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a cold, precise financial analyst. No fluff."},
                    {"role": "user", "content": prompt},
                ],
                model="openai/gpt-oss-20b",
                stream=True,
            )

            for chunk in chat:
                content = chunk.choices[0].delta.content
                if content:
                    await websocket.send_text(json.dumps({"type": "synthesis", "chunk": content}))

            await websocket.send_text(json.dumps({"type": "done"}))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_text(json.dumps({"type": "error", "message": str(e)}))


# ─── Quick endpoint (price + technicals only, no scraping) ───────────────────
@app.get("/quick/{ticker}")
async def quick(ticker: str):
    ticker = ticker.upper()
    tech, company = await asyncio.gather(_run(get_technicals, ticker), _run(get_company_info, ticker))
    return {"ticker": ticker, "company": company, "technicals": tech}


# ─── Screener ─────────────────────────────────────────────────────────────────
_screener_cache: dict = {}
_screener_cache_ts: float = 0

@app.get("/screener")
async def screener(sector: str = None, signal: str = None):
    import time
    global _screener_cache_ts
    cache_key = f"{sector}:{signal}"
    if _screener_cache.get(cache_key) and (time.time() - _screener_cache_ts) < 1800:
        return _screener_cache[cache_key]
    results = await _run(run_screener, sector, signal)
    payload = {"results": results}
    _screener_cache[cache_key] = payload
    _screener_cache_ts = time.time()
    return payload


# ─── Compare ──────────────────────────────────────────────────────────────────
@app.get("/compare/{t1}/{t2}")
async def compare(t1: str, t2: str, timeframe: str = "1W"):
    t1, t2 = t1.upper(), t2.upper()

    async def _full(ticker):
        reddit_fut  = _run(fetch_reddit_posts, ticker, timeframe)
        news_fut    = _run(fetch_news_articles, ticker, "", timeframe)
        st_fut      = _run(fetch_stocktwits, ticker)
        price_fut   = _run(get_price_history, ticker, timeframe)
        tech_fut    = _run(get_technicals, ticker)
        info_fut    = _run(get_company_info, ticker)
        reddit, news, stocktwits, price_data, technicals, company = await asyncio.gather(
            reddit_fut, news_fut, st_fut, price_fut, tech_fut, info_fut
        )
        all_texts = [p["text"] for p in reddit.get("posts", [])] + [a["text"] for a in news.get("articles", [])]
        overall_sentiment = analyze_sentiment(all_texts) if all_texts else {"bullish": 0.0, "bearish": 0.0, "neutral": 1.0, "label": "NEUTRAL", "text_count": 0}
        direction = compute_direction_signal(overall_sentiment, technicals, timeframe)
        return {"ticker": ticker, "company": company, "overall_sentiment": overall_sentiment,
                "technicals": technicals, "direction": direction, "price": price_data, "timeframe": timeframe}

    a, b = await asyncio.gather(_full(t1), _full(t2))
    return {"a": a, "b": b}


# ─── AI Chat ──────────────────────────────────────────────────────────────────
class ChatMsg(BaseModel):
    role: str
    content: str

class ChatReq(BaseModel):
    messages: List[ChatMsg]

SYSTEM_PROMPT = """You are Delphi AI, the intelligent assistant for the Delphi Financial Intelligence platform.
Help users understand: the platform features (Analysis, Watchlist, Screener, Compare, Journal), how sentiment analysis works, how to interpret RSI/MACD signals, and basic financial concepts.
Be concise and professional. Keep responses under 150 words unless detail is needed.
Do NOT give specific investment advice. Always note Delphi is for informational purposes only."""

@app.post("/chat")
async def chat(req: ChatReq):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += [{"role": m.role, "content": m.content} for m in req.messages]
    response = groq_client.chat.completions.create(
        messages=messages,
        model="openai/gpt-oss-20b",
        max_tokens=300,
    )
    return {"reply": response.choices[0].message.content}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
