import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Search, Star, TrendingUp, TrendingDown, Trash2, Briefcase } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { auth, db } from '../../firebase/firebase';
import { collection, onSnapshot, doc, deleteDoc, getDocs } from 'firebase/firestore';

export default function WatchlistView() {
  const [watchlist, setWatchlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubWatch = onSnapshot(collection(db, 'users', user.uid, 'watchlist'), (watchSnap) => {
      const unsubPort = onSnapshot(collection(db, 'users', user.uid, 'portfolio'), async (portSnap) => {
        
        // 1. Get favorited symbols
        const watchSymbols = watchSnap.docs.map(doc => doc.data());
        
        // 2. Get owned symbols (amount > 0) and build holding map
        const portfolioMap = {};
        const ownedSymbols = [];
        portSnap.forEach(doc => {
          const data = doc.data();
          if (data.amount > 0) {
            portfolioMap[data.symbol] = data.amount;
            ownedSymbols.push({ symbol: data.symbol, name: data.name });
          }
        });

        // 3. Merge them, keeping unique symbols
        const combinedMap = new Map();
        watchSymbols.forEach(s => combinedMap.set(s.symbol, s));
        ownedSymbols.forEach(s => combinedMap.set(s.symbol, s));
        
        const symbols = Array.from(combinedMap.values());

        const enrichedData = await Promise.all(symbols.map(async (coin) => {
        try {
          // Fetch 24h ticker for price and change
          const tickerRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${coin.symbol}USDT`);
          const tickerData = await tickerRes.json();
          
          // Fetch klines for sparkline (last 24 hours, 1h intervals)
          const klinesRes = await fetch(`https://api.binance.com/api/v3/klines?symbol=${coin.symbol}USDT&interval=1h&limit=24`);
          const klinesData = await klinesRes.json();

          const sparklineData = klinesData.map(d => ({ value: parseFloat(d[4]) }));

          return {
            ...coin,
            price: parseFloat(tickerData.lastPrice || 0),
            changePercent: parseFloat(tickerData.priceChangePercent || 0),
            sparklineData,
            holding: portfolioMap[coin.symbol] || 0
          };
        } catch (e) {
          console.error(`Error fetching watchlist data for ${coin.symbol}`, e);
          return { ...coin, price: 0, changePercent: 0, sparklineData: [], holding: 0 };
        }
      }));

      setWatchlist(enrichedData);
      setLoading(false);
      });
      return () => unsubPort();
    });

    return () => unsubWatch();
  }, []);

  const handleRemove = async (symbol) => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'watchlist', symbol));
  };

  const filteredWatchlist = watchlist.filter(item => 
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-8 text-foreground animate-pulse">Loading Watchlist...</div>;

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8 flex-1 overflow-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <h2 className="font-['Sora'] text-foreground m-0">Watchlist</h2>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search watchlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground font-['Inter'] focus:outline-none focus:border-[rgba(255,255,255,0.2)]"
            />
          </div>
        </div>

        {filteredWatchlist.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Star size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="font-['Sora'] text-foreground text-xl mb-2">Your Watchlist is Empty</h3>
            <p className="font-['Inter'] text-muted-foreground">Search for coins in the sidebar and click the Star icon to track them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWatchlist.map((item, index) => (
              <motion.div
                key={item.symbol}
                className="bg-card border border-border rounded-2xl p-6 hover:bg-[#181818] transition-all relative group"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <button 
                  onClick={() => handleRemove(item.symbol)}
                  className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                  title="Remove from Watchlist"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <Star size={20} className="text-yellow-400 fill-yellow-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-['JetBrains_Mono'] text-foreground font-bold text-lg">{item.symbol}</p>
                      {item.holding > 0 && (
                        <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded text-xs text-muted-foreground font-['JetBrains_Mono']">
                          <Briefcase size={12} /> {item.holding.toLocaleString(undefined, {maximumFractionDigits:4})}
                        </div>
                      )}
                    </div>
                    <p className="font-['Inter'] text-muted-foreground text-sm">{item.name}</p>
                  </div>
                </div>

                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="font-['JetBrains_Mono'] text-foreground text-2xl mb-1">
                      ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </p>
                    <div className="flex items-center gap-1">
                      {item.changePercent >= 0 ? <TrendingUp size={14} className="text-foreground" /> : <TrendingDown size={14} className="text-[#6B7280]" />}
                      <span className={`font-['JetBrains_Mono'] ${item.changePercent >= 0 ? 'text-foreground' : 'text-[#6B7280]'}`}>
                        {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-16 mt-4">
                  {item.sparklineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={item.sparklineData}>
                        <YAxis domain={['dataMin', 'dataMax']} hide />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={item.changePercent >= 0 ? '#FFFFFF' : '#6B7280'}
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="size-full flex items-center justify-center text-muted-foreground text-sm font-['Inter']">No chart data</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
