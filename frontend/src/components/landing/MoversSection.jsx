import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

function List({ title, data, up }) {
  // If data is empty while loading, show a small skeleton or null
  if (data.length === 0) return <div className="h-[400px] rounded-2xl border border-border bg-card/50 animate-pulse" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl border border-border bg-card/50 p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {title}
        </h3>
        {up ? (
          <ArrowUpRight className="size-4 text-emerald-500" />
        ) : (
          <ArrowDownRight className="size-4 text-rose-500" />
        )}
      </div>
      <ul className="divide-y divide-border">
        {data.map((c, i) => (
          <motion.li
            key={c.symbol}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            className="flex items-center justify-between py-3 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full border border-border bg-secondary/40 grid place-items-center text-xs font-semibold group-hover:bg-foreground group-hover:text-background transition-colors uppercase">
                {c.symbol.slice(0, 2)}
              </div>
              <div>
                <div className="font-medium">{c.symbol.replace("USDT", "")}</div>
                <div className="text-xs text-muted-foreground uppercase">USDT</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium tabular-nums">
                ${parseFloat(c.lastPrice) < 1 
                  ? parseFloat(c.lastPrice).toFixed(6) 
                  : parseFloat(c.lastPrice).toLocaleString()}
              </div>
              <div className={`text-xs tabular-nums font-medium ${up ? "text-emerald-500" : "text-rose-500"}`}>
                {up ? "+" : ""}{parseFloat(c.priceChangePercent).toFixed(2)}%
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export function MoversSection() {
  const [data, setData] = useState({ top: [], bottom: [] });

  useEffect(() => {
    async function fetchMovers() {
      try {
        const response = await fetch("/binance-api/api/v3/ticker/24hr");
        const allTickers = await response.json();

        // Filter: Only USDT pairs, skip "leveraged" tokens (UP/DOWN)
        const usdtPairs = allTickers.filter(
          (t) => t.symbol.endsWith("USDT") && !t.symbol.includes("UP") && !t.symbol.includes("DOWN")
        );

        // Sort by percentage change
        const sorted = usdtPairs.sort((a, b) => 
          parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent)
        );

        setData({
          top: sorted.slice(0, 7),           // Top 7 Gainers
          bottom: sorted.slice(-7).reverse() // Bottom 7 Losers
        });
      } catch (error) {
        console.error("Error fetching movers:", error);
      }
    }

    fetchMovers();
    const interval = setInterval(fetchMovers, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">24h movement</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Top gainers & losers
            </h2>
          </div>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
            View all markets →
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <List title="Gainers" data={data.top} up />
          <List title="Losers" data={data.bottom} up={false} />
        </div>
      </div>
    </section>
  );
}