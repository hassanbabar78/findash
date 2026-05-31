import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

export function Sparkline({ symbol = "BTCUSDT" }) {
  const [prices, setPrices] = useState([]);
  const width = 400;
  const height = 160;
const upperSymbol = symbol.toUpperCase(); // "BTCUSDT"
  useEffect(() => {
    // Fetch last 24 hours of data (1h intervals)
    fetch(`/binance-api/api/v3/klines?symbol=${upperSymbol}&interval=1h&limit=24`)
      .then((res) => res.json())
      .then((data) => {
        // Index 4 is the 'Close' price in the Binance response array
        const closePrices = data.map((d) => parseFloat(d));
        setPrices(closePrices);
      });
  }, [symbol]);

  // Transform price data into SVG coordinates
  const pathData = useMemo(() => {
    if (prices.length === 0) return "";

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;

    return prices.map((price, i) => {
      const x = (i / (prices.length - 1)) * width;
      // Invert Y because SVG 0 is at the top
      const y = height - ((price - min) / range) * height;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  }, [prices]);

  if (!pathData) return null;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="fadeLine" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.2" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* The Area Fill */}
      <motion.path
        d={`${pathData} L ${width} ${height} L 0 ${height} Z`}
        fill="url(#fadeLine)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      {/* The Main Line */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="white"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
    </svg>
  );
}