import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export default function MarketsView() {
  const [stocks, setStocks] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = collection(db, 'coins');
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const coinData = [];
      snapshot.forEach((doc) => {
        coinData.push({ id: doc.id, ...doc.data() });
      });

      // Fetch live 24h ticker data for all listed coins from Binance
      const updatedStocks = await Promise.all(coinData.map(async (coin) => {
        try {
          const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${coin.symbol}USDT`);
          if (res.ok) {
            const data = await res.json();
            return {
              ...coin,
              price: parseFloat(data.lastPrice),
              changePercent: parseFloat(data.priceChangePercent),
              volume: parseFloat(data.volume).toLocaleString(undefined, {maximumFractionDigits:0}),
              highPrice: parseFloat(data.highPrice),
              lowPrice: parseFloat(data.lowPrice),
            };
          }
        } catch (e) {
          console.error(`Error fetching ticker for ${coin.symbol}`, e);
        }
        return {
          ...coin,
          price: 0, changePercent: 0, volume: '0', highPrice: 0, lowPrice: 0
        };
      }));

      // Sort and calculate Gainers/Losers
      const validStocks = updatedStocks.filter(s => s.price > 0);
      const sortedByChange = [...validStocks].sort((a, b) => b.changePercent - a.changePercent);
      
      setTopGainers(sortedByChange.filter(s => s.changePercent > 0).slice(0, 3)); // Top 3 positive
      
      // For losers, we want the most negative first
      const losers = sortedByChange.filter(s => s.changePercent < 0).reverse();
      setTopLosers(losers.slice(0, 3)); // Top 3 negative

      setStocks(validStocks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-8 text-foreground animate-pulse">Loading Live Market Data...</div>;
  }

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8 flex-1 overflow-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="font-['Sora'] mb-8 text-foreground">Market Overview</h2>

        {/* Top Movers Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Gainers */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-['Sora'] text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-400" /> Top Gainers
            </h3>
            {topGainers.length === 0 ? <p className="text-muted-foreground font-['Inter']">No gainers today.</p> : null}
            <div className="space-y-4">
              {topGainers.map((coin, i) => (
                <div key={coin.symbol} className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-['JetBrains_Mono'] w-4">{i+1}</span>
                    <span className="text-foreground font-['JetBrains_Mono'] font-bold">{coin.symbol}</span>
                    <span className="text-muted-foreground text-sm hidden sm:inline">{coin.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground font-['JetBrains_Mono']">${coin.price.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:6})}</p>
                    <p className="text-green-400 font-['JetBrains_Mono'] text-sm">+{coin.changePercent.toFixed(2)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Losers */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-['Sora'] text-foreground mb-4 flex items-center gap-2">
              <TrendingDown className="text-red-400" /> Top Losers
            </h3>
            {topLosers.length === 0 ? <p className="text-muted-foreground font-['Inter']">No losers today.</p> : null}
            <div className="space-y-4">
              {topLosers.map((coin, i) => (
                <div key={coin.symbol} className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-['JetBrains_Mono'] w-4">{i+1}</span>
                    <span className="text-foreground font-['JetBrains_Mono'] font-bold">{coin.symbol}</span>
                    <span className="text-muted-foreground text-sm hidden sm:inline">{coin.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground font-['JetBrains_Mono']">${coin.price.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:6})}</p>
                    <p className="text-red-400 font-['JetBrains_Mono'] text-sm">{coin.changePercent.toFixed(2)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Full Market Table */}
        <h3 className="font-['Sora'] text-foreground mb-4">All Listed Assets</h3>
        <div className="bg-card border border-border rounded-lg overflow-hidden overflow-x-auto">
          <div className="grid grid-cols-6 gap-4 p-4 border-b border-border bg-background min-w-[800px]">
            <p className="font-['Inter'] text-muted-foreground text-sm">Symbol</p>
            <p className="font-['Inter'] text-muted-foreground text-sm">Name</p>
            <p className="font-['Inter'] text-muted-foreground text-right text-sm">Price</p>
            <p className="font-['Inter'] text-muted-foreground text-right text-sm">24h Change</p>
            <p className="font-['Inter'] text-muted-foreground text-right text-sm">24h High</p>
            <p className="font-['Inter'] text-muted-foreground text-right text-sm">24h Volume</p>
          </div>

          {stocks.map((stock, index) => (
            <motion.div
              key={stock.symbol}
              className="grid grid-cols-6 gap-4 p-4 border-b border-border hover:bg-[#181818] transition-all cursor-pointer min-w-[800px]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-2">
                <span className="font-['JetBrains_Mono'] text-foreground font-bold">{stock.symbol}</span>
              </div>
              <p className="font-['Inter'] text-[#D1D5DB] truncate">{stock.name}</p>
              <p className="font-['JetBrains_Mono'] text-foreground text-right">
                ${stock.price.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:6})}
              </p>
              <div className="flex items-center justify-end gap-1">
                {stock.changePercent >= 0 ? (
                  <TrendingUp size={16} className="text-foreground" />
                ) : (
                  <TrendingDown size={16} className="text-[#6B7280]" />
                )}
                <span className={`font-['JetBrains_Mono'] ${stock.changePercent >= 0 ? 'text-foreground' : 'text-[#6B7280]'}`}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
              <p className="font-['JetBrains_Mono'] text-muted-foreground text-right">
                ${stock.highPrice.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:6})}
              </p>
              <p className="font-['JetBrains_Mono'] text-muted-foreground text-right">
                {stock.volume}
              </p>
            </motion.div>
          ))}
          
          {stocks.length === 0 && (
            <div className="p-8 text-center text-muted-foreground font-['Inter']">No assets listed by Admin yet.</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
