# PREP — Shylock (From-Scratch Study Guide)

Welcome to the ultimate developer study guide for **Shylock**! This guide is designed to take a beginner from zero to fully understanding the design, technology stack, and engineering choices behind a multi-source financial sentiment intelligence engine.

---

## 1. Concept & Overview
Shylock is a **sentiment intelligence platform** that combines:
1. **Natural Language Processing (NLP)**: Scanning live text data (Reddit, NewsAPI, Finnhub) using **FinBERT** to classify sentiment as Bullish, Bearish, or Neutral.
2. **Technical Analysis (TA)**: Fetching live prices and calculating classic indicators like **RSI** (Relative Strength Index) and **MACD** (Moving Average Convergence Divergence).
3. **Decision Fusion (Composite Scoring)**: Aggregating NLP + TA into a single weighted directional recommendation (60% Sentiment, 25% RSI, 15% MACD).

---

## 2. Natural Language Processing with FinBERT

### What is FinBERT?
* General language models (like basic BERT or generic sentiment analyzers) often fail at financial language. For example:
  * *"The stock price broke support and tanked"* is negative.
  * *"We beat expectations but faced headwind"* has complex nuance.
  * *"Active short squeeze"* is highly bullish in modern trading contexts but sounds negative (squeeze/short) to a generic model.
* **FinBERT** (`ProsusAI/FinBERT`) is a specialized NLP model based on Google's BERT architecture, fine-tuned on **Financial PhraseBank** and financial news corpora. It is highly optimized to classify text into:
  - **Bullish (Positive)**
  - **Bearish (Negative)**
  - **Neutral**

### How FinBERT Works in Shylock
1. **Tokenization**: Breaking down sentences into subwords (WordPiece tokenization).
2. **Transformer Inference**: Passing tokens through self-attention layers to represent the semantic context.
3. **Sentiment Classification**: Outputting logits for `[Positive, Negative, Neutral]`, passed through a `Softmax` function to get a probability distribution (confidence scores).

---

## 3. Technical Indicators Explained

To supplement sentiment with real-world market momentum, Shylock calculates two vital indicators using the `ta` library:

### 1. Relative Strength Index (RSI)
* **Definition**: A momentum oscillator that measures the speed and change of price movements, ranging from 0 to 100.
* **Formula**:
  $$RSI = 100 - \frac{100}{1 + RS}$$
  Where $RS = \frac{\text{Average Gain of } N \text{ days}}{\text{Average Loss of } N \text{ days}}$ (standard $N = 14$).
* **Trading Interpretation**:
  * **RSI > 70**: Overbought (Asset is potentially overvalued; Bearish signal).
  * **RSI < 30**: Oversold (Asset is potentially undervalued; Bullish signal).
  * **RSI 30 to 70**: Neutral zone.

### 2. Moving Average Convergence Divergence (MACD)
* **Definition**: A trend-following momentum indicator showing the relationship between two moving averages of a security’s price.
* **Formula**:
  * **MACD Line**: $EMA_{12}(Price) - EMA_{26}(Price)$
  * **Signal Line**: $EMA_9(MACD \text{ Line})$
  * **MACD Histogram**: $MACD \text{ Line} - \text{Signal Line}$
* **Trading Interpretation**:
  * **MACD Line crosses above Signal Line**: Bullish Crossover.
  * **MACD Line crosses below Signal Line**: Bearish Crossover.

---

## 4. Decision Fusion (Composite Scoring Engine)

Shylock aggregates qualitative (NLP) and quantitative (TA) metrics into a final **Directional Signal**:

$$\text{Composite Score} = 0.60 \times (\text{Sentiment Score}) + 0.25 \times (\text{RSI Score}) + 0.15 \times (\text{MACD Score})$$

* **Sentiment Score (60%)**: Scaled from -1 (fully Bearish) to +1 (fully Bullish).
* **RSI Score (25%)**: Oversold triggers positive/Bullish momentum; overbought triggers negative/Bearish momentum.
* **MACD Score (15%)**: Computed from line crossover direction and histogram sign.
* **Final Thresholds**:
  * $\ge +0.25$: **Bullish** Recommendation
  * $\le -0.25$: **Bearish** Recommendation
  * Otherwise: **Neutral** Recommendation

---

## 5. System & API Architecture (FastAPI + React)

```
                     ┌──────────────────┐
                     │   React Client   │
                     └────────┬─────────┘
                              │ HTTP Requests
                              ▼
                     ┌──────────────────┐
                     │   FastAPI App    │
                     └────────┬─────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Reddit/NewsAPI  │ │  yfinance (TA)   │ │  FinBERT Model   │
│  (Data Scrapers) │ │ (Market Data)    │ │ (Inference GPU/  │
│                  │ │                  │ │  CPU Pipeline)   │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### Backend Microservices
* **`backend/scrapers/`**: Asynchronous scrapers fetching Reddit RSS/public endpoints, Finnhub, and NewsAPI using `httpx`.
* **`backend/sentiment/`**: PyTorch and HuggingFace pipelines. Caches the model locally on first boot to speed up subsequent queries.
* **`backend/market/`**: Fetches standard price candles via `yfinance` and calculates RSI and MACD.
* **`backend/predictor/`**: Houses the weighted composite logic to render recommendations.
* **`backend/main.py`**: Declares FastAPI endpoints with automatic Swagger documentation (`http://localhost:8001/docs`).

### Frontend UI Features
* **Interactive Charts**: Interactive charts built with React + Vite and **Recharts** visualizing historical price and sentiment overlays.
* **Watchlist**: Tracks favorite stock tickers in browser `localStorage`.
* **Trade Journal**: Local markdown editor that saves trading plans and reviews locally, prioritizing security and user privacy.
* **Groq Chatbot**: Uses `Llama-3.3-70B` via Groq Cloud API to act as an on-demand market explainer/helper.

---

## 6. Exercises & Challenges for Beginners

1. **Backtesting Validation**: Implement a small Python script in `backend/predictor/backtest.py` that takes past historical headlines from a week ago, computes the Shylock signal, and measures if buying/selling on the signal would have yielded a profit relative to holding.
2. **FinBERT Caching**: Write a caching decorator in FastAPI that stores sentiment classifications inside an in-memory dictionary or Redis, preventing duplicate GPU/CPU cycles on the exact same news articles.
3. **True JWT Authentication**: Replace the mock `localStorage` login system with FastAPI `OAuth2` with Password flow + `jose` JWT tokens to protect user watchlist/portfolio preferences securely.
