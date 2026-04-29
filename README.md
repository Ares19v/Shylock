# Shylock — Market Sentiment Intelligence

![Build Status](https://img.shields.io/github/actions/workflow/status/Ares19v/Shylock/ci.yml?branch=main)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

**Shylock** is a professional-grade Market Sentiment Intelligence platform designed to aggregate and analyze financial sentiment from multiple sources (Reddit, News, StockTwits) in real-time. It leverages advanced NLP to provide actionable directional stock signals.

## Features
- **Real-time Data Ingestion:** Scrapes live data from Reddit, News APIs, and StockTwits.
- **FinBERT NLP Analysis:** Utilizes the state-of-the-art `ProsusAI/finbert` model for highly accurate financial sentiment classification.
- **Institutional Aesthetic UI:** A clean, minimalist React frontend inspired by Bloomberg Terminals.
- **Directional Signals:** Computes rule-based weighted scores using aggregated sentiment and technical indicators (RSI/MACD via `yfinance`).

## Tech Stack
- **Backend:** Python, FastAPI, HuggingFace (`transformers`, `torch`), `yfinance`
- **Frontend:** React, Vite, Tailwind CSS, Recharts
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions

## Installation (Windows)

1. **Quick Start:** 
   Run `INSTALL.bat` to automatically set up the Python virtual environment and install Node modules.
2. **Launch:** 
   Run `Run_Project.bat` to boot the FastAPI backend (Port 8001) and React frontend (Port 5173).
3. **Teardown:**
   Run `UNINSTALL.bat` to cleanly remove the virtual environment and node modules.

## Deployment (Docker)

To deploy the full stack via Docker:

```bash
docker-compose up --build -d
```
The application will be available at `http://localhost:5173`.

## Configuration
Add your API keys to `backend/.env`:
- `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET`
- `NEWSAPI_KEY`
- `FINNHUB_KEY`
- `GROQ_API_KEY` (Optional: for AI synthesis)

*(Note: The UI features graceful fallbacks and will run perfectly even if keys are missing).*

## License
MIT License. See [LICENSE](LICENSE) for more information.
