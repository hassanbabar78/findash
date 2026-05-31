// hooks/useBinancePrice.ts
import { useState, useEffect } from 'react';

export function useBinancePrice(symbol = 'btcusdt') {
  const [data, setData] = useState({
    price: "0.00",
    change: "0.00",
    high: "0.00",
    open: "0.00",
    volume: "0.00"
  });

  useEffect(() => {
    // Binance WebSocket for 24hr ticker stats
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setData({
        price: parseFloat(msg.c).toLocaleString(undefined, { minimumFractionDigits: 2 }),
        change: parseFloat(msg.P).toFixed(2),
        high: parseFloat(msg.h).toLocaleString(),
        open: parseFloat(msg.o).toLocaleString(),
        volume: (parseFloat(msg.q) / 1000000000).toFixed(1) + "B" // Convert to Billions
      });
    };

    return () => ws.close();
  }, [symbol]);

  return data;
}