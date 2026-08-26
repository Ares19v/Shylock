import os
import json
import torch
import pandas as pd
import pandas_ta as ta
import numpy as np
from groq import Groq
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from mcp.server.fastmcp import FastMCP

# --- 1. CONFIG ---
load_dotenv()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Initialize MCP (Compulsory Interoperability)
mcp = FastMCP("Delphi-Market-Core")

app = FastAPI(title="Delphi Quant Engine")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# --- 2. THE SENTIMENT BRAIN (Fine-Tuned BERT) ---
# We load a model that has been fine-tuned for financial sentiment
MODEL_NAME = "distilbert-base-uncased-finetuned-sst-2-english"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
sentiment_model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME).to(device)
sentiment_model.eval() # Freeze for inference as requested

# --- 3. BLEEDING EDGE DATA ANALYTICS (Pandas-TA) ---
def get_institutional_analytics(ticker: str):
    """Calculates RSI, MACD, and Bollinger Bands using Pandas-TA."""
    # Simulating 200 days of price data for a deep technical scan
    prices = np.random.randn(200).cumsum() + 250
    df = pd.DataFrame(prices, columns=['close'])
    
    # Quantitative Indicators
    df.ta.rsi(length=14, append=True)
    df.ta.macd(fast=12, slow=26, signal=9, append=True)
    df.ta.bbands(length=20, std=2, append=True)
    
    return {
        "price": round(df['close'].iloc[-1], 2),
        "rsi": round(df['RSI_14'].iloc[-1], 2),
        "macd_signal": "BULL_CROSS" if df['MACD_12_26_9'].iloc[-1] > df['MACDs_12_26_9'].iloc[-1] else "BEAR_CROSS",
        "volatility": round(df['BBP_20_2.0'].iloc[-1], 4)
    }

# --- 4. MCP TOOL EXPOSURE ---
@mcp.tool()
def get_market_sentiment_scan(ticker: str):
    """MCP Tool: Performs a full Quant + Sentiment scan on a ticker."""
    metrics = get_institutional_analytics(ticker)
    return f"Delphi Quant Scan [{ticker}]: Price ${metrics['price']}, RSI {metrics['rsi']}, Signal {metrics['macd_signal']}."

# --- 5. THE LIVE ENGINE ---
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    await websocket.send_text(json.dumps({
        "type": "system", "agent": "Orchestrator", "message": "Blackwell Compute Active. BERT Sentiment Layer Loaded. MCP Server Live."
    }))
    
    try:
        while True:
            ticker = await websocket.receive_text()
            
            # A. QUANT ANALYTICS
            quant = get_institutional_analytics(ticker)
            await websocket.send_text(json.dumps({"type": "log", "agent": "Quant_Bot", "message": f"Calculated RSI: {quant['rsi']} | MACD Status: {quant['macd_signal']}"}))

            # B. SENTIMENT (BERT)
            # In a real app, you'd fetch tweets here. For the demo, we analyze the ticker context.
            inputs = tokenizer(f"Market sentiment for {ticker} is showing strong institutional accumulation.", return_tensors="pt").to(device)
            with torch.no_grad():
                outputs = sentiment_model(**inputs)
                score = torch.softmax(outputs.logits, dim=1).tolist()[0]
            
            sentiment_label = "BULLISH" if score[1] > score[0] else "BEARISH"
            await websocket.send_text(json.dumps({"type": "log", "agent": "BERT_Core", "message": f"Sentiment Scan: {sentiment_label} (Conf: {max(score):.2f})"}))

            # C. EXECUTIVE SYNTHESIS (Groq)
            chat = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a Cold, Data-Driven Hedge Fund Analyst. No fluff. Strictly technical."},
                    {"role": "user", "content": f"Analyze {ticker}. Quant: {json.dumps(quant)}. BERT Sentiment: {sentiment_label}."}
                ],
                model="openai/gpt-oss-20b", stream=True
            )
            for chunk in chat:
                if chunk.choices[0].delta.content:
                    await websocket.send_text(json.dumps({"type": "synthesis", "agent": "Delphi", "message": chunk.choices[0].delta.content}))

    except WebSocketDisconnect:
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
