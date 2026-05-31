import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MiniSparkline } from "@/hooks/MiniSparkline";

// The 4 coins you want to highlight
const FEATURED_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"];

export function FeaturedCoins() {
  const [coinData, setCoinData] = useState({});

  useEffect(() => {
    // 1. Connect WebSocket for live price & 24h change
    const streams = FEATURED_SYMBOLS.map(s => `${s.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const symbol = msg.data.s;
      
      setCoinData((prev) => ({
        ...prev,
        [symbol]: {
          price: parseFloat(msg.data.c).toLocaleString(undefined, { minimumFractionDigits: 2 }),
          change: parseFloat(msg.data.P).toFixed(2),
          isUp: parseFloat(msg.data.P) >= 0,
        }
      }));
    };

    return () => ws.close();
  }, []);

  return (
    <section className="py-24 border-t border-border">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Featured</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Coins to watch
            </h2>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_SYMBOLS.map((symbol, i) => {
            const data = coinData[symbol] || { price: "---", change: "0.00", isUp: true };
            return (
              <motion.div
                key={symbol}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="rounded-xl border border-border bg-card/50 p-5 hover:border-foreground/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-foreground/5 border border-border grid place-items-center font-semibold">
                      {symbol.slice(0, 1)}
                    </div>
                    <div>
                      <div className="font-semibold">{symbol.replace("USDT", "")}</div>
                      <div className="text-xs text-muted-foreground">Binance Spot</div>
                    </div>
                  </div>
                  <span className={`text-xs tabular-nums font-medium ${data.isUp ? "text-emerald-500" : "text-rose-500"}`}>
                    {data.isUp ? "+" : ""}{data.change}%
                  </span>
                </div>

                <div className="mt-4 h-14 -mx-2">
                  {/* We call the real sparkline component here */}
                  <MiniSparkline symbol={symbol} isUp={data.isUp} />
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="font-semibold tabular-nums">${data.price}</div>
                  <div className="text-xs text-muted-foreground uppercase">24h Price</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}