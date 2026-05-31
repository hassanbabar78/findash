import { useState, useEffect } from "react";

// List of coins you want to track (symbols must be lowercase for WS)
const TRACKED_SYMBOLS = ["btcusdt", "ethusdt", "solusdt", "dogeusdt", "bnbusdt", "xrpusdt", "adausdt", "pepeusdt", "avaxusdt", "linkusdt", "tonusdt", "dotusdt"];

export function Ticker() {
  const [tickerData, setTickerData] = useState({});

  useEffect(() => {
    // 1. Connect to Binance WebSocket for multiple symbols
    const streams = TRACKED_SYMBOLS.map(s => `${s}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const symbol = msg.data.s.replace("USDT", ""); // e.g., "BTC"
      
      setTickerData((prev) => ({
        ...prev,
        [symbol]: {
          price: parseFloat(msg.data.c).toLocaleString(undefined, { 
            minimumFractionDigits: parseFloat(msg.data.c) < 1 ? 6 : 2 
          }),
          change: parseFloat(msg.data.P).toFixed(2),
          isUp: parseFloat(msg.data.P) >= 0
        }
      }));
    };

    return () => ws.close();
  }, []);

  // Use either the real data or your static items as a fallback while loading
  const displayItems = TRACKED_SYMBOLS.map(s => {
    const sym = s.toUpperCase().replace("USDT", "");
    const data = tickerData[sym];
    return {
      sym,
      price: data?.price || "---",
      change: data?.change || "0.00",
      isUp: data ? data.isUp : true
    };
  });

  const loop = [...displayItems, ...displayItems];

  return (
    <div className="relative border-y border-border bg-card/40 overflow-hidden">
      <div className="flex animate-ticker whitespace-nowrap py-3">
        {loop.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-8 text-sm shrink-0">
            <span className="font-semibold tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {item.sym}
            </span>
            <span className="text-muted-foreground tabular-nums">
              ${item.price}
            </span>
            <span className={`flex items-center gap-1 tabular-nums font-medium ${item.isUp ? "text-emerald-500" : "text-rose-500"}`}>
              {item.isUp ? "▲" : "▼"} {item.change}%
            </span>
            <span className="size-1 rounded-full bg-border ml-4" />
          </div>
        ))}
      </div>
      {/* Side gradients for smooth fading */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}