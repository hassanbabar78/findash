import { motion } from 'framer-motion'; // or 'motion/react' depending on your version
import { useEffect, useState } from 'react';

const TRACKED_SYMBOLS = ["btcusdt", "ethusdt", "solusdt", "dogeusdt", "bnbusdt", "xrpusdt", "pepeusdt", "avaxusdt"];

export default function LiveTicker() {
  const [tickerData, setTickerData] = useState({});

  useEffect(() => {
    // 1. Initialize WebSocket with multiple streams
    const streams = TRACKED_SYMBOLS.map(s => `${s}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const rawSymbol = msg.data.s; // e.g., "BTCUSDT"
      const symbol = rawSymbol.replace("USDT", "");

      setTickerData((prev) => ({
        ...prev,
        [symbol]: {
          price: parseFloat(msg.data.c),
          change: parseFloat(msg.data.P),
        }
      }));
    };

    return () => ws.close();
  }, []);

  // 2. Map the tracked symbols to their current state or fallback
  const displayItems = TRACKED_SYMBOLS.map(s => {
    const sym = s.toUpperCase().replace("USDT", "");
    const data = tickerData[sym];
    return {
      symbol: sym,
      price: data?.price ?? 0,
      change: data?.change ?? 0,
    };
  });

  // 3. Triple the array to ensure seamless looping for wide screens
  const loop = [...displayItems, ...displayItems, ...displayItems];

  return (
    <div className="overflow-hidden bg-background border-b border-border">
      <motion.div
        className="flex gap-8 py-3 px-4"
        // Adjust the -100% based on content width or use a fixed pixel value
        animate={{ x: [0, "-50%"] }}
        transition={{
          duration: 40, // Slower for readability
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        {loop.map((item, index) => (
          <div key={`${item.symbol}-${index}`} className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-['JetBrains_Mono'] text-foreground font-bold">{item.symbol}</span>
            <span className="font-['JetBrains_Mono'] text-[#D1D5DB]">
              ${item.price === 0 ? "---" : item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`font-['JetBrains_Mono'] ${item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
            >
              {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}