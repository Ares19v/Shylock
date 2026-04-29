"""
FinBERT Sentiment Analysis Pipeline
Model: ProsusAI/finbert — pre-trained on financial text, zero training needed.
Loaded once at module import and reused for all requests.
"""
from transformers import pipeline
import logging

logger = logging.getLogger(__name__)

_finbert = None


def _load_model():
    global _finbert
    if _finbert is None:
        logger.info("Loading FinBERT model (first run may download ~500MB)...")
        _finbert = pipeline(
            "text-classification",
            model="ProsusAI/finbert",
            top_k=None,          # return all 3 label scores
            truncation=True,
            max_length=512,
        )
        logger.info("FinBERT loaded successfully.")
    return _finbert


def _aggregate_scores(results: list[list[dict]]) -> dict:
    """Average scores across all texts."""
    totals = {"positive": 0.0, "negative": 0.0, "neutral": 0.0}
    count = len(results)
    if count == 0:
        return {"bullish": 0.0, "bearish": 0.0, "neutral": 1.0, "label": "NEUTRAL", "text_count": 0}

    for result in results:
        for item in result:
            label = item["label"].lower()
            if label == "positive":
                totals["positive"] += item["score"]
            elif label == "negative":
                totals["negative"] += item["score"]
            else:
                totals["neutral"] += item["score"]

    bullish = totals["positive"] / count
    bearish = totals["negative"] / count
    neutral = totals["neutral"] / count

    if bullish > bearish and bullish > neutral:
        label = "BULLISH"
    elif bearish > bullish and bearish > neutral:
        label = "BEARISH"
    else:
        label = "NEUTRAL"

    return {
        "bullish": round(bullish, 4),
        "bearish": round(bearish, 4),
        "neutral": round(neutral, 4),
        "label": label,
        "text_count": count,
    }


def analyze_sentiment(texts: list[str]) -> dict:
    """
    Run FinBERT on a list of texts.
    Returns aggregated {bullish, bearish, neutral, label, text_count}.
    """
    if not texts:
        return {"bullish": 0.0, "bearish": 0.0, "neutral": 1.0, "label": "NEUTRAL", "text_count": 0}

    model = _load_model()

    # Clean + truncate texts (FinBERT handles token truncation, but trim chars first)
    cleaned = [t[:800] for t in texts if t and t.strip()]
    if not cleaned:
        return {"bullish": 0.0, "bearish": 0.0, "neutral": 1.0, "label": "NEUTRAL", "text_count": 0}

    # Batch inference (batch_size=16 for memory efficiency)
    results = model(cleaned, batch_size=16, truncation=True, max_length=512)
    return _aggregate_scores(results)


def compute_velocity(early_texts: list[str], late_texts: list[str]) -> dict:
    """
    Computes sentiment velocity: compare older posts vs newer posts.
    Returns {change: float, trend: 'ACCELERATING'|'DECELERATING'|'STABLE'}.
    """
    if not early_texts or not late_texts:
        return {"change": 0.0, "trend": "STABLE"}

    early_sentiment = analyze_sentiment(early_texts)
    late_sentiment = analyze_sentiment(late_texts)

    early_score = early_sentiment["bullish"] - early_sentiment["bearish"]
    late_score = late_sentiment["bullish"] - late_sentiment["bearish"]
    change = round(late_score - early_score, 4)

    if change > 0.05:
        trend = "ACCELERATING"
    elif change < -0.05:
        trend = "DECELERATING"
    else:
        trend = "STABLE"

    return {"change": change, "trend": trend}
