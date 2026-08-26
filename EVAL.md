# EVAL — Delphi

> **Evaluation Date:** 2026-05-29
> **Evaluator:** Automated Portfolio Review
> **Maturity Level:** MVP

---

## 1. Project Purpose & Problem Statement

Delphi is a real-time financial market sentiment intelligence platform that aggregates signals from Reddit, financial news (NewsAPI), and Finnhub, runs them through a domain-specific NLP model (FinBERT), and surfaces actionable directional signals — Bullish, Bearish, or Neutral — for any given ticker. It targets retail traders and finance enthusiasts who want to synthesize social media sentiment with technical indicators without paying for Bloomberg Terminal access.

The system goes beyond raw sentiment by computing a weighted composite directional signal that incorporates FinBERT sentiment (60%), RSI momentum (25%), and MACD trend (15%). This hybrid approach — transformer NLP + classical technical analysis — is a meaningful differentiator from simpler "Twitter sentiment" tools.

---

## 2. Technical Architecture

Delphi is a FastAPI/React microservice stack with a clear backend domain separation:

**Backend (FastAPI, Python 3.10+)**:
- `scrapers/` — Reddit (public JSON API, no auth required as fallback), NewsAPI, and Finnhub data ingestion via `httpx`.
- `sentiment/` — `ProsusAI/FinBERT` inference pipeline via HuggingFace `transformers` + `torch`. FinBERT scores each article/post as Bullish/Bearish/Neutral with a confidence score.
- `market/` — `yfinance` for live price data; `ta` (Technical Analysis library) computes RSI and MACD.
- `predictor/` — weighted signal aggregation (60/25/15 weighting) → directional recommendation.
- Stock screener covers 50+ tickers across 7 sectors.

**Frontend (React 18 + Vite 8)**:
- Recharts for price/sentiment charts.
- jsPDF + html2canvas for PDF dashboard export.
- `react-markdown` for the Groq AI Assistant chatbot responses.
- Watchlist persisted in browser localStorage.
- Trade Journal: private markdown notes stored in localStorage — no server persistence needed.
- Demo auth via localStorage (explicitly acknowledged as demo-only).

**Infrastructure**: Docker Compose (backend Python + frontend Nginx), GitHub Actions CI/CD, `INSTALL.bat`/`Run_Project.bat` automation.

---

## 3. Model/Algorithm Details

**FinBERT (`ProsusAI/FinBERT`)**: A BERT-base model fine-tuned on financial phrasebank and financial news corpus. Compared to general-purpose BERT or TextBlob, FinBERT correctly handles financial jargon ("bearish divergence," "headwinds," "short squeeze") that would confuse general sentiment models. Three-class output (Bullish/Neutral/Bearish) is appropriate for trading signal generation.

**Technical Indicators**:
- RSI (Relative Strength Index) — 14-period standard; values <30 oversold (bullish), >70 overbought (bearish).
- MACD — 12/26/9 standard; signal line crossover direction contributes to the signal.

**Composite Signal**: The 60/25/15 weighting is empirically motivated (sentiment-heavy, which is the platform's differentiator) but not backed by backtesting data. This is the intellectually honest caveat that should be stated clearly in any real trading context.

**Groq Llama-3.3-70B Chatbot**: Used as a platform explainer/assistant, not for signal generation. This is the right use — LLMs should explain signals, not generate them.

---

## 4. Strengths

- **FinBERT is the right model choice** — domain-specific financial sentiment is a real problem that general models fail at. Using `ProsusAI/FinBERT` shows research awareness.
- **Multi-source aggregation** — combining Reddit, NewsAPI, and Finnhub gives volume of signals that single-source approaches lack.
- **Graceful API key fallbacks** — Reddit works without auth; the system operates with partial API key sets. Good DX.
- **50+ ticker stock screener** across 7 sectors — breadth of coverage is meaningful for portfolio-level analysis.
- **Compare mode** — side-by-side sentiment + technical analysis for two tickers is a valuable differentiator.
- **PDF export** — timestamped dashboard PDF export is a useful finishing feature.
- **Docker + CI/CD** — proper production deployment infrastructure.
- **No server-side trade journal** — deliberately keeping journal notes in localStorage respects user privacy; no sensitive trading notes transmitted.

---

## 5. Limitations & Known Gaps

- **No backtesting** — the 60/25/15 signal weighting is not validated against historical data. Without backtesting, the "directional signal" is an opinion, not a validated indicator. This needs an explicit disclaimer.
- **localStorage auth** — the README acknowledges this is demo auth. A real deployment would need proper JWT/session auth.
- **FinBERT runs on CPU** — HuggingFace inference is slow on CPU for real-time use cases. With 50+ tickers × multiple articles per ticker, a full screener pass could take minutes.
- **Reddit API rate limits** — the public JSON API fallback is aggressive rate-limited; heavy usage will trigger 429s with no retry/backoff visible in the README.
- **NewsAPI free tier limits** — 100 requests/day on the free tier; a full screener pass could exhaust this in one session.
- **No real-time price streaming** — yfinance fetches are on-demand, not WebSocket-pushed. The "real-time" label in the README is generous.
- **Trade journal is ephemeral** — localStorage is cleared on browser data wipe; no export or sync for journal entries.

---

## 6. Code Quality Assessment

**Structure**: Strong domain separation — `scrapers/`, `sentiment/`, `market/`, `predictor/` is a clean decomposition. Frontend with `pages/`, `components/`, `hooks/` follows React project conventions.

**Documentation**: README is concise and functional. API key table with free tier links is helpful. Architecture is implied by the project structure table rather than explicitly diagrammed.

**Tests**: CI exists (GitHub Actions badge in README). No test suite is documented explicitly.

**Docker**: Backend Dockerfile + frontend Dockerfile in `docker-compose.yml`. Proper Nginx in production pattern.

**Security**: API keys in `.env`; `.gitignore` excludes secrets. localStorage auth is explicitly a demo limitation.

---

## 7. Maturity Breakdown

| Dimension | Score | Notes |
|-----------|-------|-------|
| Functionality | 8/10 | Full pipeline works; CPU inference speed is a concern |
| Code Quality | 7/10 | Good structure; test suite not documented |
| Documentation | 7/10 | Functional README; lacks backtesting disclaimer |
| Scalability | 5/10 | API rate limits, CPU inference, no real-time streaming |
| Security | 6/10 | Demo auth is the main gap |
| **Overall** | **6.6/10** | Impressive feature set; performance and validation gaps |

---

## 8. Suggested Next Steps

1. **Add signal backtesting** — implement a simple historical backtest (e.g., compute the composite signal for AAPL/TSLA/NVDA over 6 months using yfinance historical data + FinBERT on archived news headlines) and report the accuracy/return vs. benchmark. Even a simple win rate would transform the platform from "demo signal" to "validated signal."
2. **Implement FinBERT batch caching** — cache FinBERT inference results by article URL/hash with a TTL (e.g., 1 hour). This reduces repeat inference costs on the same articles and would make the screener fast enough to use in practice.
3. **Add a proper auth system** — replace localStorage with JWT-based authentication (bcrypt + FastAPI oauth2). The backend infrastructure is already FastAPI, making this a relatively small addition.

---

## 9. Verdict

Delphi is the most feature-rich project in the portfolio and demonstrates impressive scope: FinBERT NLP, technical indicator computation (RSI/MACD), multi-source data aggregation, stock screening, compare mode, a Groq chatbot, and a PDF export — all in one system. The model selection (FinBERT) shows domain research awareness that sets it apart from generic sentiment demos. The critical gap is the absence of any backtesting or validation that the composite signal actually has predictive value; without this disclaimer, the "directional signal" feature carries implicit trading advice connotations that need to be managed carefully.

---
<p align="center">Made by Devansh Tyagi @ 2026</p>
