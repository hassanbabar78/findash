import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function MarketOverview() {
  const [liveData, setLiveData] = useState({
    BTCUSDT: { price: "---", change: "0.00", isUp: true },
    ETHUSDT: { price: "---", change: "0.00", isUp: true },
  });

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/ethusdt@ticker`);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setLiveData(prev => ({
        ...prev,
        [msg.data.s]: {
          price: parseFloat(msg.data.c).toLocaleString(),
          change: parseFloat(msg.data.P).toFixed(2),
          isUp: parseFloat(msg.data.P) >= 0
        }
      }));
    };
    return () => ws.close();
  }, []);

  return (
    <section className="py-24 border-t border-border">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Overview</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            The market at a glance
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid gap-6">
            <BigChart 
              label="BTC / USD · 24H" 
              price={liveData.BTCUSDT.price} 
              change={liveData.BTCUSDT.change} 
              isUp={liveData.BTCUSDT.isUp}
              symbol="BTCUSDT"
            />
            <BigChart 
              label="ETH / USD · 24H" 
              price={liveData.ETHUSDT.price} 
              change={liveData.ETHUSDT.change} 
              isUp={liveData.ETHUSDT.isUp}
              symbol="ETHUSDT"
            />
          </div>

          <div className="grid gap-6">
            <StatsCard label="Total Market Cap" value="$2.58T" sub="+2.1% today" />
            <StatsCard label="BTC Dominance" value="53.4%" sub="+0.1%" />
            <StatsCard label="24h Volume" value="$84.3B" sub="+5.2%" />
            <StatsCard label="Active Coins" value="14,205" sub="Live on-chain" />
          </div>
        </div>
      </div>
    </section>
  );
}

function BigChart({ label, price, change, isUp, symbol }) {
  const [paths, setPaths] = useState({ line: "", area: "" });

  useEffect(() => {
    fetch(`/binance-api/api/v3/klines?symbol=${symbol}&interval=1h&limit=24`)
      .then(res => res.json())
      .then(data => {
        const prices = data.map(d => parseFloat(d));
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const range = max - min || 1;

        const points = prices.map((p, i) => {
          const x = (i / (prices.length - 1)) * 400;
          const y = 140 - ((p - min) / range) * 100; // Centers it in the 160px height
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        });

        const linePath = points.join(" ");
        setPaths({
          line: linePath,
          area: `${linePath} L 400 160 L 0 160 Z`
        });
      });
  }, [symbol]);

  return (
    <motion.div className="rounded-2xl border border-border bg-card/50 p-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold mt-1 tabular-nums">
            ${price} <span className={isUp ? "text-emerald-500" : "text-rose-500"}>{isUp ? "+" : ""}{change}%</span>
          </div>
        </div>
      </div>
      <div className="h-44 mt-4 relative">
        <svg viewBox="0 0 400 160" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id={`grad-${symbol}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity="0.2" />
              <stop offset="100%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path d={paths.area} fill={`url(#grad-${symbol})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
          <motion.path 
            d={paths.line} 
            fill="none" 
            stroke={isUp ? "#10b981" : "#f43f5e"} 
            strokeWidth="2" 
            initial={{ pathLength: 0 }} 
            animate={{ pathLength: 1 }} 
            transition={{ duration: 1.5 }}
          />
        </svg>
      </div>
    </motion.div>
  );
}

function StatsCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-6">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}