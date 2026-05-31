// ─── aiAgent.js ───────────────────────────────────────────────────────────────
// The AI brain. Uses Groq (free) with Llama 3.3 70B.
// Receives real market data, builds a rich prompt, returns structured JSON.
//
// Get your free Groq key at https://console.groq.com — takes 2 minutes.
// ─────────────────────────────────────────────────────────────────────────────

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// The model — Llama 3.3 70B on Groq is free, fast, and excellent for reasoning
const MODEL = "llama-3.3-70b-versatile";

// ── Helper: call Groq and parse JSON response ─────────────────────────────────
async function askAI(systemPrompt, userPrompt) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.3,      // Lower = more consistent/factual, less creative
    max_tokens: 1200,
    response_format: { type: "json_object" }, // Forces valid JSON output
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
  });

  const raw = response.choices[0]?.message?.content || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    // Fallback if somehow JSON is malformed
    return { error: "Could not parse AI response", raw };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 1 — Trading Analysis
// Input:  real price data + OHLC + news + fear/greed + strategy
// Output: { signal, explanation, reasoning, riskLevel, sentimentSummary, confidence }
// ─────────────────────────────────────────────────────────────────────────────
export async function runTradingAnalysis({ coinData, ohlcData, news, fearGreed, strategy, customStrategyText, coin }) {
  const systemPrompt = `You are a professional crypto trading analyst with deep expertise in technical analysis.
You receive REAL live market data and must provide accurate, data-driven trading signals.
Always respond with a valid JSON object only. No markdown, no explanation outside JSON.
Be specific — reference the actual numbers in your reasoning.

Response format:
{
  "signal": "Buy" | "Sell" | "Hold",
  "confidence": number between 0-100,
  "explanation": "2-3 sentence plain English summary referencing actual price",
  "reasoning": "Detailed technical reasoning. Must reference specific numbers from the data.",
  "riskLevel": "Low" | "Medium" | "High" | "Very High",
  "sentimentSummary": "Summary of market sentiment based on news and fear/greed",
  "keyLevels": { "support": number_or_null, "resistance": number_or_null },
  "timeframe": "Short-term (24-48h)" | "Mid-term (1-2 weeks)" | "Long-term (1+ month)"
}`;

  const strategyText = strategy === "Custom"
    ? `Custom strategy: ${customStrategyText}`
    : strategy;

  const ohlcSummary = ohlcData
    ? ohlcData.map(c => `${c.date}: O=${c.open} H=${c.high} L=${c.low} C=${c.close}`).join(" | ")
    : "OHLC data unavailable";

  const newsSummary = Array.isArray(news) ? news.join("\n  - ") : "No news available";

  const userPrompt = `Analyze ${coin} using the ${strategyText} strategy.

═══ LIVE MARKET DATA ═══
Coin: ${coinData?.name} (${coinData?.symbol})
Current Price: $${coinData?.currentPrice?.toLocaleString()}
24h Change: ${coinData?.priceChange24h}%
7d Change: ${coinData?.priceChange7d}%
30d Change: ${coinData?.priceChange30d}%
24h High: $${coinData?.high24h?.toLocaleString()}
24h Low: $${coinData?.low24h?.toLocaleString()}
Market Cap: $${(coinData?.marketCap / 1e9)?.toFixed(2)}B
24h Volume: $${(coinData?.totalVolume / 1e9)?.toFixed(2)}B
ATH: $${coinData?.ath?.toLocaleString()} (${coinData?.athChangePercentage}% from ATH)

═══ 7-DAY OHLC (last 10 candles) ═══
${ohlcSummary}

═══ MARKET SENTIMENT ═══
Fear & Greed Index: ${fearGreed?.value}/100 — "${fearGreed?.classification}"

═══ LATEST NEWS ═══
  - ${newsSummary}

Based on ALL this real data, apply ${strategyText} analysis and give your trading signal.
Reference specific price levels and data points in your reasoning.`;

  return askAI(systemPrompt, userPrompt);
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 2 — Portfolio Guidance
// Input:  user holdings, real current prices, risk appetite
// Output: { investmentGuide, allocations, dcaAdvice, riskyCoins, safeCoins, ... }
// ─────────────────────────────────────────────────────────────────────────────
export async function runPortfolioAnalysis({ totalCapital, currentHoldings, riskAppetite, tradingHistory, prices, globalStats }) {
  const systemPrompt = `You are a professional crypto portfolio manager and financial advisor.
You receive a user's real portfolio data with current USD values and must provide actionable guidance.
Always respond with a valid JSON object only. No markdown. Be specific with numbers.

Response format:
{
  "investmentGuide": "2-3 sentence overview with specific dollar amounts",
  "allocations": [{ "asset": "BTC", "pct": 40, "reason": "one line reason" }],
  "amountToInvestNow": "specific dollar amount with reasoning",
  "amountForDCA": "specific dollar amount to keep for DCA",
  "dcaAdvice": "specific DCA strategy with amounts and frequency",
  "riskyCoins": ["COIN1", "COIN2"],
  "safeCoins": ["BTC", "ETH"],
  "capitalManagement": "how to split the total capital",
  "warning": "any important risk warning or null"
}`;

  // Calculate real USD value of each holding
  const holdingsWithValues = parseHoldings(currentHoldings, prices);
  const totalHoldingsValue = holdingsWithValues.reduce((sum, h) => sum + (h.usdValue || 0), 0);

  const holdingsSummary = holdingsWithValues.map(h =>
    `${h.symbol}: ${h.amount} units = $${h.usdValue?.toLocaleString()} (${h.change24h}% 24h)`
  ).join("\n  ");

  const globalSummary = globalStats
    ? `Total Crypto Market Cap: $${(globalStats.totalMarketCapUsd / 1e12)?.toFixed(2)}T | BTC Dom: ${globalStats.btcDominance}% | 24h Change: ${globalStats.marketCapChangePercentage24h}%`
    : "Global stats unavailable";

  const userPrompt = `Analyze this portfolio and provide investment guidance.

═══ USER PORTFOLIO ═══
Total Capital Available: $${Number(totalCapital).toLocaleString()}
Current Holdings Value: ~$${totalHoldingsValue.toLocaleString()}
Risk Appetite: ${riskAppetite}
Trading History: ${tradingHistory || "Not provided"}

═══ CURRENT HOLDINGS (with live prices) ═══
  ${holdingsSummary || "No holdings provided"}

═══ GLOBAL MARKET ═══
${globalSummary}

Provide specific, actionable portfolio guidance. Use exact dollar amounts. 
Consider current market conditions in your recommendations.`;

  return askAI(systemPrompt, userPrompt);
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 3 — News & Sentiment Analysis
// Input:  real news headlines + price data + fear/greed
// Output: { overallSentiment, summary, trendingNews, signals, ... }
// ─────────────────────────────────────────────────────────────────────────────
export async function runNewsAnalysis({ coin, news, coinData, fearGreed }) {
  const systemPrompt = `You are a crypto market intelligence analyst specializing in sentiment analysis.
You analyze real news headlines and market data to detect market mood and key signals.
Always respond with a valid JSON object only. No markdown.

Response format:
{
  "overallSentiment": "Highly Bullish" | "Bullish" | "Neutral" | "Bearish" | "Highly Bearish",
  "sentimentScore": number from -100 (most bearish) to +100 (most bullish),
  "summary": "2-3 sentences describing current market situation with specific context",
  "trendingNews": ["summarized headline 1", "summarized headline 2", "...up to 5"],
  "signals": ["Whale Accumulation" | "ETF News" | "Regulatory Risk" | "Institutional Buying" | "Exchange Listing" | "Protocol Upgrade" | "Partnership" | "FUD" | "FOMO" | "Bearish Divergence"],
  "whaleActivity": "detected whale activity or null",
  "keyEvent": "most impactful single event or null",
  "shortTermOutlook": "1-2 sentences on what to watch in next 24-48h"
}`;

  const newsSummary = Array.isArray(news) && news.length
    ? news.join("\n  - ")
    : "No recent news available";

  const userPrompt = `Analyze the market sentiment for ${coin}.

═══ LIVE PRICE DATA ═══
${coin}: $${coinData?.currentPrice?.toLocaleString()} | 24h: ${coinData?.priceChange24h}% | 7d: ${coinData?.priceChange7d}%
Volume: $${(coinData?.totalVolume / 1e9)?.toFixed(2)}B | Market Cap: $${(coinData?.marketCap / 1e9)?.toFixed(2)}B

═══ FEAR & GREED INDEX ═══
${fearGreed?.value}/100 — "${fearGreed?.classification}"

═══ LATEST NEWS HEADLINES ═══
  - ${newsSummary}

Based on the news headlines, price action, and sentiment indicators, 
provide a comprehensive sentiment analysis for ${coin}.
Identify the most important signals and what they mean for traders.`;

  return askAI(systemPrompt, userPrompt);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — Parse holdings string into structured data
// "BTC: 0.1, ETH: 2, SOL: 5" → [{ symbol, amount, usdValue, change24h }]
// ─────────────────────────────────────────────────────────────────────────────
function parseHoldings(holdingsStr, prices) {
  if (!holdingsStr || !prices) return [];

  const COIN_TO_GECKO = {
    BTC: "bitcoin", ETH: "ethereum", SOL: "solana", BNB: "binancecoin",
    XRP: "ripple", ADA: "cardano", DOGE: "dogecoin", AVAX: "avalanche-2",
    DOT: "polkadot", LINK: "chainlink", MATIC: "matic-network", LTC: "litecoin",
  };

  return holdingsStr.split(",").map(part => {
    const [sym, amt] = part.trim().split(":").map(s => s.trim());
    if (!sym || !amt) return null;
    const symbol = sym.toUpperCase();
    const amount = parseFloat(amt) || 0;
    const geckoId = COIN_TO_GECKO[symbol] || symbol.toLowerCase();
    const priceData = prices[geckoId];
    const usdValue = priceData ? priceData.usd * amount : 0;
    const change24h = priceData?.usd_24h_change?.toFixed(2) || "N/A";
    return { symbol, amount, usdValue: Math.round(usdValue), change24h };
  }).filter(Boolean);
}
