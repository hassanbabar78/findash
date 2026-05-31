// ─── server.js ────────────────────────────────────────────────────────────────
// Findash Backend — Express server
// Fetches real data → passes to AI agent → returns structured JSON
//
// Routes:
//   POST /api/trading-analysis   → Trading signal with strategy
//   POST /api/portfolio-guidance → Portfolio allocation & DCA advice
//   POST /api/news-sentiment     → News analysis & sentiment
// ─────────────────────────────────────────────────────────────────────────────

import "dotenv/config";
import express from "express";
import cors from "cors";

import {
  fetchCoinData,
  fetchOHLC,
  fetchNews,
  fetchFearGreed,
  fetchMultiplePrices,
  fetchGlobalStats,
} from "./dataFetchers.js";

import {
  runTradingAnalysis,
  runPortfolioAnalysis,
  runNewsAnalysis,
} from "./aiAgent.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST"],
  credentials: true,
}));

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "Findash API running", version: "1.0.0" });
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 1 — POST /api/trading-analysis
//
// req.body: {
//   strategy: "ICT" | "SMC" | "Price Action" | "Fibonacci" | "Moving Average" | "Custom"
//   coin: "BTC"  (optional, defaults to BTC)
//   customStrategyText: "my strategy..." (only when strategy = "Custom")
// }
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/trading-analysis", async (req, res) => {
  try {
    const { strategy, coin = "BTC", customStrategyText } = req.body;

    if (!strategy) {
      return res.status(400).json({ error: "strategy is required" });
    }

    console.log(`[Trading] Analyzing ${coin} with ${strategy} strategy...`);

    // Fetch all real data in parallel (fast — ~1-2 seconds)
    const [coinData, ohlcData, news, fearGreed] = await Promise.all([
      fetchCoinData(coin),
      fetchOHLC(coin),
      fetchNews(coin),
      fetchFearGreed(),
    ]);

    if (!coinData) {
      return res.status(404).json({
        error: `Could not find coin "${coin}". Try using the full name like "bitcoin" or symbol "BTC".`
      });
    }

    // Run AI analysis with real data
    const result = await runTradingAnalysis({
      coinData,
      ohlcData,
      news,
      fearGreed,
      strategy,
      customStrategyText,
      coin,
    });

    console.log(`[Trading] Done — Signal: ${result.signal} | Confidence: ${result.confidence}%`);
    res.json(result);

  } catch (err) {
    console.error("[Trading] Error:", err.message);
    res.status(500).json({ error: "Analysis failed", details: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 2 — POST /api/portfolio-guidance
//
// req.body: {
//   totalCapital: "10000"
//   currentHoldings: "BTC: 0.1, ETH: 2, SOL: 5"
//   riskAppetite: "Medium"
//   userTradingHistory: "optional free text"
// }
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/portfolio-guidance", async (req, res) => {
  try {
    const {
      totalCapital,
      currentHoldings,
      riskAppetite = "Medium",
      userTradingHistory,
    } = req.body;

    if (!totalCapital) {
      return res.status(400).json({ error: "totalCapital is required" });
    }

    console.log(`[Portfolio] Analyzing portfolio — Capital: $${totalCapital}, Risk: ${riskAppetite}`);

    // Extract coin symbols from holdings string to fetch their prices
    const holdingCoins = extractCoinsFromHoldings(currentHoldings);

    // Fetch real prices + global stats in parallel
    const [prices, globalStats] = await Promise.all([
      holdingCoins.length ? fetchMultiplePrices(holdingCoins) : Promise.resolve({}),
      fetchGlobalStats(),
    ]);

    const result = await runPortfolioAnalysis({
      totalCapital,
      currentHoldings,
      riskAppetite,
      tradingHistory: userTradingHistory,
      prices,
      globalStats,
    });

    console.log(`[Portfolio] Done — Guide generated`);
    res.json(result);

  } catch (err) {
    console.error("[Portfolio] Error:", err.message);
    res.status(500).json({ error: "Portfolio analysis failed", details: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 3 — POST /api/news-sentiment
//
// req.body: {
//   coin: "Bitcoin" | "BTC" | "ethereum" etc.
// }
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/news-sentiment", async (req, res) => {
  try {
    const { coin } = req.body;

    if (!coin) {
      return res.status(400).json({ error: "coin is required" });
    }

    console.log(`[News] Analyzing sentiment for ${coin}...`);

    // Fetch news, price, and fear/greed in parallel
    const [news, coinData, fearGreed] = await Promise.all([
      fetchNews(coin),
      fetchCoinData(coin),
      fetchFearGreed(),
    ]);

    const result = await runNewsAnalysis({ coin, news, coinData, fearGreed });

    console.log(`[News] Done — Sentiment: ${result.overallSentiment}`);
    res.json(result);

  } catch (err) {
    console.error("[News] Error:", err.message);
    res.status(500).json({ error: "News analysis failed", details: err.message });
  }
});

// ── Helper — Extract coin symbols from holdings string ────────────────────────
function extractCoinsFromHoldings(holdingsStr) {
  if (!holdingsStr) return [];
  return holdingsStr
    .split(",")
    .map(part => part.split(":")[0]?.trim().toUpperCase())
    .filter(Boolean);
}

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n Findash Backend running on http://localhost:${PORT}`);
  console.log(`   GROQ_API_KEY: ${process.env.GROQ_API_KEY ? " Set" : " Missing — set in .env"}`);
  console.log(`   CRYPTOPANIC:  ${process.env.CRYPTOPANIC_API_KEY ? " Set" : " Not set — news will be skipped"}`);
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}\n`);
});
