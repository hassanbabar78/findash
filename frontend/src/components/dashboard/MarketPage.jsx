import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ResponsiveContainer, ComposedChart, LineChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Star } from 'lucide-react';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp, deleteDoc, onSnapshot } from 'firebase/firestore';

const CandlestickShape = (props) => {
  const { x, y, width, height, open, close } = props;
  const isBullish = close > open;
  const color = isBullish ? 'white' : '#6B7280';
  return (
    <g>
      <rect x={x} y={y} width={width} height={Math.max(height, 2)} fill={color} rx={2} />
    </g>
  );
};

export default function MarketPage({ coin }) {
  const [chartData, setChartData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [interval, setIntervalState] = useState('1h');
  const [chartType, setChartType] = useState('candle');
  const [loading, setLoading] = useState(true);

  // Trading State
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeMessage, setTradeMessage] = useState({ text: '', type: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [userPortfolioAmount, setUserPortfolioAmount] = useState(0);
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  useEffect(() => {
    if (!coin) return;
    
    const fetchMarketData = async () => {
      setLoading(true);
      try {
        const symbol = `${coin.symbol}USDT`.toUpperCase();
        
        // Fetch Live Price
        const priceRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        if (!priceRes.ok) throw new Error('Binance API error');
        const priceData = await priceRes.json();
        setCurrentPrice(parseFloat(priceData.price));

        // Fetch Candles
        const klinesRes = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`);
        const klinesData = await klinesRes.json();
        
        const formattedData = klinesData.map(d => {
          const open = parseFloat(d[1]);
          const high = parseFloat(d[2]);
          const low = parseFloat(d[3]);
          const close = parseFloat(d[4]);
          const date = new Date(d[0]);
          return {
            time: interval === '1d' ? date.toLocaleDateString() : date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            open, close, high, low,
            bodyRange: [Math.min(open, close), Math.max(open, close)],
            value: close // for line chart
          };
        });
        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching Binance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [coin, interval]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !coin) return;

    // Fetch user's current holdings
    const fetchPortfolio = async () => {
      const docRef = doc(db, 'users', user.uid, 'portfolio', coin.symbol);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserPortfolioAmount(docSnap.data().amount);
      } else {
        setUserPortfolioAmount(0);
      }
    };
    fetchPortfolio();

    // Listen to watchlist status
    const watchRef = doc(db, 'users', user.uid, 'watchlist', coin.symbol);
    const unsubWatch = onSnapshot(watchRef, (docSnap) => {
      setIsWatchlisted(docSnap.exists());
    });

    return () => unsubWatch();
  }, [coin, isProcessing]);

  const handleToggleWatchlist = async () => {
    const user = auth.currentUser;
    if (!user || !coin) return;
    const docRef = doc(db, 'users', user.uid, 'watchlist', coin.symbol);
    if (isWatchlisted) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, { symbol: coin.symbol, name: coin.name });
    }
  };

  const handleTrade = async (type) => {
    const amount = parseFloat(tradeAmount);
    if (isNaN(amount) || amount <= 0) {
      setTradeMessage({ text: 'Enter a valid amount', type: 'error' });
      return;
    }

    if (type === 'sell' && amount > userPortfolioAmount) {
      setTradeMessage({ text: 'Insufficient balance to sell', type: 'error' });
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setIsProcessing(true);
    setTradeMessage({ text: '', type: '' });

    try {
      const totalCost = amount * currentPrice;
      const portfolioRef = doc(db, 'users', user.uid, 'portfolio', coin.symbol);
      const portSnap = await getDoc(portfolioRef);

      let newAmount, newTotalSpent, newAvgPrice;

      if (type === 'buy') {
        if (portSnap.exists()) {
          const data = portSnap.data();
          newAmount = data.amount + amount;
          newTotalSpent = (data.totalSpent || 0) + totalCost;
          newAvgPrice = newTotalSpent / newAmount;
        } else {
          newAmount = amount;
          newTotalSpent = totalCost;
          newAvgPrice = currentPrice;
        }
      } else {
        // Sell
        const data = portSnap.data();
        newAmount = data.amount - amount;
        // Keep avg price same on sell, just reduce total spent proportionally
        newAvgPrice = data.avgPrice;
        newTotalSpent = newAmount * newAvgPrice;
      }

      // Update Portfolio
      if (newAmount > 0) {
        await setDoc(portfolioRef, {
          symbol: coin.symbol,
          name: coin.name,
          amount: newAmount,
          totalSpent: newTotalSpent,
          avgPrice: newAvgPrice,
          lastUpdated: serverTimestamp()
        });
      } else {
        // If sold everything, can delete or set to 0. Set to 0 to keep history.
        await setDoc(portfolioRef, {
          symbol: coin.symbol,
          name: coin.name,
          amount: 0,
          totalSpent: 0,
          avgPrice: 0,
          lastUpdated: serverTimestamp()
        });
      }

      // Record Transaction
      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        symbol: coin.symbol,
        type: type,
        amount: amount,
        price: currentPrice,
        total: totalCost,
        date: serverTimestamp()
      });

      setTradeMessage({ text: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${amount} ${coin.symbol}`, type: 'success' });
      setTradeAmount('');
    } catch (error) {
      console.error("Trade error:", error);
      setTradeMessage({ text: 'Transaction failed', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!coin) {
    return <div className="p-8 text-muted-foreground">Please select a coin from the search bar.</div>;
  }

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8 flex flex-col md:flex-row gap-6 max-w-[1600px] mx-auto w-full">
      {/* Left Column: Chart & Info */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-['Sora'] text-3xl text-foreground m-0">{coin.name} ({coin.symbol})</h1>
                <button 
                  onClick={handleToggleWatchlist}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border ${isWatchlisted ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-[#1a1a1a] border-border text-muted-foreground hover:text-foreground'}`}
                  title="Toggle Watchlist"
                >
                  <Star size={18} className={isWatchlisted ? "fill-yellow-400" : ""} />
                  <span className="text-sm font-['Inter'] font-semibold">{isWatchlisted ? "Favorited" : "Add to Favorites"}</span>
                </button>
              </div>
              <p className="font-['JetBrains_Mono'] text-2xl text-muted-foreground mt-2">
                ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-border">
                {['1h', '4h', '1d'].map(tf => (
                  <button 
                    key={tf}
                    onClick={() => setIntervalState(tf)}
                    className={`px-3 py-1 text-sm rounded-md font-['Inter'] transition-colors ${interval === tf ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-border">
                <button 
                  onClick={() => setChartType('candle')}
                  className={`px-3 py-1 text-sm rounded-md font-['Inter'] transition-colors ${chartType === 'candle' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Candles
                </button>
                <button 
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 text-sm rounded-md font-['Inter'] transition-colors ${chartType === 'line' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Line
                </button>
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full">
            {loading ? (
              <div className="size-full flex items-center justify-center text-muted-foreground font-['Inter'] animate-pulse">Loading Chart Data...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'candle' ? (
                  <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="#6b7280" tick={{fill: '#6b7280', fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis domain={['auto', 'auto']} stroke="#6b7280" tick={{fill: '#6b7280', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }} itemStyle={{ color: 'white' }} formatter={(val) => `$${val}`} />
                    <Bar dataKey="bodyRange" shape={<CandlestickShape />} isAnimationActive={false} />
                  </ComposedChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 10, right: 0, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="#6b7280" tick={{fill: '#6b7280', fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis domain={['auto', 'auto']} stroke="#6b7280" tick={{fill: '#6b7280', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }} itemStyle={{ color: 'white' }} formatter={(val) => `$${val}`} />
                    <Line type="monotone" dataKey="value" stroke="white" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* History & Background Info */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-['Sora'] text-xl mb-4 text-foreground">About {coin.name}</h3>
          <p className="font-['Inter'] text-muted-foreground leading-relaxed">
            {coin.name} is a digital asset listed on major exchanges. This section represents the project's background, history, and technical fundamentals. In a fully robust production app, this would query a rich-text API such as CoinGecko to display detailed descriptions, market cap rankings, and historical project milestones. For now, track its real-time Binance data above and execute trades on the right!
          </p>
        </div>
      </div>

      {/* Right Column: Trading Panel */}
      <div className="w-full md:w-[400px] flex flex-col gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 sticky top-6">
          <h3 className="font-['Sora'] text-xl mb-6 text-foreground">Trade {coin.symbol}</h3>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm font-['Inter'] mb-2">
              <span className="text-muted-foreground">Available to Sell</span>
              <span className="text-foreground font-['JetBrains_Mono']">{userPortfolioAmount} {coin.symbol}</span>
            </div>
          </div>

          <div className="flex bg-[#1a1a1a] border border-border rounded-lg p-1 mb-6">
            <input 
              type="number"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-foreground font-['JetBrains_Mono'] focus:outline-none px-4 py-3"
            />
            <span className="text-muted-foreground px-4 py-3 border-l border-border font-bold">{coin.symbol}</span>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-sm font-['Inter'] mb-2">
              <span className="text-muted-foreground">Estimated Total Cost</span>
              <span className="text-foreground font-['JetBrains_Mono']">
                ${(parseFloat(tradeAmount || 0) * currentPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleTrade('buy')}
              disabled={isProcessing || currentPrice === 0}
              className="py-3 rounded-lg font-['Inter'] font-semibold bg-primary text-primary-foreground hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Buy
            </button>
            <button 
              onClick={() => handleTrade('sell')}
              disabled={isProcessing || currentPrice === 0 || userPortfolioAmount === 0}
              className="py-3 rounded-lg font-['Inter'] font-semibold bg-[#1a1a1a] text-foreground border border-border hover:bg-[#222] transition-colors disabled:opacity-50"
            >
              Sell
            </button>
          </div>

          {tradeMessage.text && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-lg text-sm font-['Inter'] ${tradeMessage.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
            >
              {tradeMessage.text}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
