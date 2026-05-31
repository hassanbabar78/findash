import { useState, useEffect } from "react";
import { motion } from "framer-motion";
export function MiniSparkline({ symbol, isUp }) {
  const [path, setPath] = useState("");

  useEffect(() => {
    // Use the proxy for REST calls
    fetch(`/binance-api/api/v3/klines?symbol=${symbol}&interval=1h&limit=24`)
      .then(res => res.json())
      .then(data => {
        const prices = data.map(d => parseFloat(d));
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const range = max - min || 1;

        const points = prices.map((p, i) => {
          const x = (i / (prices.length - 1)) * 140;
          const y = 50 - ((p - min) / range) * 40; // 40px height within 50px viewbox
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        });
        setPath(points.join(" "));
      });
  }, [symbol]);

  return (
    <svg viewBox="0 0 140 50" className="w-full h-full" preserveAspectRatio="none">
      <motion.path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className={isUp ? "text-emerald-500" : "text-rose-500"}
      />
    </svg>
  );
}