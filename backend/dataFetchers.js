// ─── dataFetchers.js ──────────────────────────────────────────────────────────
// Fetches REAL market data from free APIs.
// CoinGecko  → prices, OHLC, market stats   (no key needed)
// CryptoPanic → latest news headlines        (free key needed)
// Alternative.me → Fear & Greed index        (no key needed)
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";

// Map common ticker symbols to CoinGecko coin IDs
const COIN_ID_MAP = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana", BNB: "binancecoin",
  XRP: "ripple", ADA: "cardano", DOGE: "dogecoin", AVAX: "avalanche-2",
  DOT: "polkadot", LINK: "chainlink", TON: "the-open-network",
  PEPE: "pepe", MATIC: "matic-network", LTC: "litecoin", SHIB: "shiba-inu",
  UNI: "uniswap", ATOM: "cosmos", NEAR: "near", APT: "aptos",
  OP: "optimism", ARB: "arbitrum", SUI: "sui",
};

// Resolve coin name/symbol to CoinGecko ID
function resolveCoinId(coin) {
  if (!coin) return "bitcoin";
  const upper = coin.toUpperCase().trim();
  if (COIN_ID_MAP[upper]) return COIN_ID_MAP[upper];
  // If not in map, try lowercase directly (e.g. user typed "bitcoin")
  return coin.toLowerCase().trim();
}

// ── 1. CoinGecko — Price + Market Stats ──────────────────────────────────────
export async function fetchCoinData(coin) {
  const coinId = resolveCoinId(coin);
  try {
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}`,
      {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
        },
        timeout: 8000,
      }
    );

    const md = data.market_data;
    return {
      id: data.id,
      symbol: data.symbol?.toUpperCase(),
      name: data.name,
      currentPrice: md.current_price?.usd,
      priceChange24h: md.price_change_percentage_24h?.toFixed(2),
      priceChange7d: md.price_change_percentage_7d?.toFixed(2),
      priceChange30d: md.price_change_percentage_30d?.toFixed(2),
      high24h: md.high_24h?.usd,
      low24h: md.low_24h?.usd,
      marketCap: md.market_cap?.usd,
      totalVolume: md.total_volume?.usd,
      circulatingSupply: md.circulating_supply,
      ath: md.ath?.usd,
      athChangePercentage: md.ath_change_percentage?.usd?.toFixed(2),
      description: data.description?.en?.slice(0, 300) || "",
    };
  } catch (err) {
    console.error(`[CoinGecko] Failed to fetch ${coin}:`, err.message);
    return null;
  }
}

// ── 2. CoinGecko — 7-Day OHLC Data ───────────────────────────────────────────
export async function fetchOHLC(coin) {
  const coinId = resolveCoinId(coin);
  try {
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc`,
      { params: { vs_currency: "usd", days: 7 }, timeout: 8000 }
    );
    // data = [[timestamp, open, high, low, close], ...]
    // Return last 10 candles as readable strings for the AI prompt
    return data.slice(-10).map(([ts, o, h, l, c]) => ({
      date: new Date(ts).toLocaleDateString(),
      open: o, high: h, low: l, close: c,
    }));
  } catch (err) {
    console.error(`[CoinGecko OHLC] Failed:`, err.message);
    return null;
  }
}

// ── 3. CryptoPanic — Latest News Headlines ───────────────────────────────────
export async function fetchNews(coin) {
  const apiKey = process.env.CRYPTOPANIC_API_KEY;
  if (!apiKey) {
    // Return gracefully without crashing if no key
    return ["No CryptoPanic API key set — news unavailable"];
  }
  try {
    const symbol = coin.toUpperCase().replace("BITCOIN","BTC").replace("ETHEREUM","ETH");
    const { data } = await axios.get("https://cryptopanic.com/api/v1/posts/", {
      params: {
        auth_token: apiKey,
        currencies: symbol,
        kind: "news",
        public: true,
      },
      timeout: 8000,
    });
    return (data.results || []).slice(0, 8).map(
      (n) => `${n.title} [${n.votes?.positive || 0}👍 ${n.votes?.negative || 0}👎]`
    );
  } catch (err) {
    console.error(`[CryptoPanic] Failed:`, err.message);
    return ["Could not fetch news at this time"];
  }
}

// ── 4. Alternative.me — Fear & Greed Index ───────────────────────────────────
export async function fetchFearGreed() {
  try {
    const { data } = await axios.get("https://api.alternative.me/fng/", {
      timeout: 5000,
    });
    const item = data.data?.[0];
    return {
      value: item?.value,
      classification: item?.value_classification,
      // e.g. { value: "72", classification: "Greed" }
    };
  } catch (err) {
    console.error(`[FearGreed] Failed:`, err.message);
    return { value: "N/A", classification: "Unknown" };
  }
}

// ── 5. CoinGecko — Multiple Coin Prices (for portfolio) ──────────────────────
export async function fetchMultiplePrices(coins) {
  // coins = ["BTC", "ETH", "SOL"] etc.
  const ids = coins.map(resolveCoinId).join(",");
  try {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: { ids, vs_currencies: "usd", include_24hr_change: true },
        timeout: 8000,
      }
    );
    return data; // { bitcoin: { usd: 67284, usd_24h_change: 2.1 }, ... }
  } catch (err) {
    console.error(`[CoinGecko Multi] Failed:`, err.message);
    return {};
  }
}

// ── 6. CoinGecko — Global Market Stats ───────────────────────────────────────
export async function fetchGlobalStats() {
  try {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/global",
      { timeout: 8000 }
    );
    const d = data.data;
    return {
      totalMarketCapUsd: d.total_market_cap?.usd,
      totalVolumeUsd: d.total_volume?.usd,
      btcDominance: d.market_cap_percentage?.btc?.toFixed(1),
      ethDominance: d.market_cap_percentage?.eth?.toFixed(1),
      marketCapChangePercentage24h: d.market_cap_change_percentage_24h_usd?.toFixed(2),
      activeCryptocurrencies: d.active_cryptocurrencies,
    };
  } catch (err) {
    console.error(`[CoinGecko Global] Failed:`, err.message);
    return null;
  }
}
