"""
Direction Signal Predictor
Combines FinBERT sentiment + RSI + MACD into a directional signal.
No ML training — rule-based weighted scoring. Honest and explainable.
"""

TIMEFRAME_CONFIDENCE_DECAY = {
    "1D": 1.00,
    "1W": 0.90,
    "1M": 0.75,
    "3M": 0.60,
    "6M": 0.45,
    "1Y": 0.30,
}


def _sentiment_score(sentiment: dict) -> float:
    """Maps sentiment to a score in [-1, 1]."""
    if not sentiment:
        return 0.0
    return sentiment.get("bullish", 0.0) - sentiment.get("bearish", 0.0)


def _rsi_score(rsi: float | None) -> float:
    """RSI: oversold (<30) = bullish signal, overbought (>70) = bearish."""
    if rsi is None:
        return 0.0
    if rsi < 30:
        return 0.5
    if rsi < 45:
        return 0.2
    if rsi > 70:
        return -0.5
    if rsi > 55:
        return -0.2
    return 0.0


def _macd_score(macd_signal: str | None) -> float:
    if macd_signal == "BULLISH_CROSS":
        return 0.3
    if macd_signal == "BEARISH_CROSS":
        return -0.3
    return 0.0


def compute_direction_signal(
    overall_sentiment: dict,
    technicals: dict,
    timeframe: str = "1W",
) -> dict:
    """
    Returns {signal: 'UP'|'FLAT'|'DOWN', confidence: float, timeframe: str, reasoning: str}
    """
    # Weighted score: 60% sentiment, 25% RSI, 15% MACD
    sent_score = _sentiment_score(overall_sentiment)
    rsi_score = _rsi_score(technicals.get("rsi"))
    macd_score = _macd_score(technicals.get("macd_signal"))

    raw_score = (sent_score * 0.60) + (rsi_score * 0.25) + (macd_score * 0.15)

    # Apply timeframe decay (longer horizon = less confidence)
    decay = TIMEFRAME_CONFIDENCE_DECAY.get(timeframe, 0.60)
    confidence = min(abs(raw_score) * decay, 0.95)

    if raw_score > 0.10:
        signal = "UP"
    elif raw_score < -0.10:
        signal = "DOWN"
    else:
        signal = "FLAT"

    # Build reasoning string
    sent_label = overall_sentiment.get("label", "NEUTRAL")
    rsi_val = technicals.get("rsi")
    rsi_str = f"RSI {rsi_val:.1f}" if rsi_val else "RSI N/A"
    reasoning = (
        f"Sentiment: {sent_label} ({sent_score:+.2f}) | "
        f"{rsi_str} | MACD: {technicals.get('macd_signal', 'N/A')} | "
        f"Timeframe decay: {int(decay*100)}%"
    )

    return {
        "signal": signal,
        "confidence": round(confidence, 4),
        "raw_score": round(raw_score, 4),
        "timeframe": timeframe,
        "reasoning": reasoning,
    }
