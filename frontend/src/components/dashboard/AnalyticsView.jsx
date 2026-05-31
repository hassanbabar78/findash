import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell
} from 'recharts';
import { auth, db } from '../../firebase/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

// Helper to calculate EMA
const calculateEMA = (data, period) => {
  const k = 2 / (period + 1);
  let emaData = [];
  let ema = data[0].close; // Initial EMA is the first close price
  
  data.forEach((d, i) => {
    if (i === 0) {
      emaData.push(ema);
    } else {
      ema = (d.close - ema) * k + ema;
      emaData.push(ema);
    }
  });
  return emaData;
};

// Helper to calculate RSI (14 period)
const calculateRSI = (data, period = 14) => {
  let rsiData = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period && i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsiData.push(50); // Neutral before enough data
      continue;
    }
    const diff = data[i].close - data[i - 1].close;
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
    rsiData.push(rsi);
  }
  return rsiData;
};

export default function AnalyticsView() {
  const [timeframe, setTimeframe] = useState('1M');
  const [portfolio, setPortfolio] = useState([]);
  const [txHistory, setTxHistory] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [coinData, setCoinData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Portfolio and Transactions
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubPort = onSnapshot(collection(db, 'users', user.uid, 'portfolio'), (snapshot) => {
      const active = snapshot.docs.map(d => d.data()).filter(h => h.amount > 0);
      setPortfolio(active);
      if (active.length > 0 && !selectedCoin) {
        setSelectedCoin(active[0].symbol);
      }
    });

    const q = query(collection(db, 'users', user.uid, 'transactions'), orderBy('date', 'desc'));
    const unsubTx = onSnapshot(q, (snapshot) => {
      setTxHistory(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => { unsubPort(); unsubTx(); };
  }, []);

  // Fetch Binance data for Selected Coin
  useEffect(() => {
    if (!selectedCoin) return;
    
    const fetchCoinData = async () => {
      try {
        let interval = '1d';
        let limit = 30;
        if (timeframe === '1W') { interval = '4h'; limit = 42; }
        if (timeframe === '1Y') { interval = '1w'; limit = 52; }
        if (timeframe === 'ALL') { interval = '1M'; limit = 60; }

        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${selectedCoin}USDT&interval=${interval}&limit=${limit}`);
        if (!res.ok) return;
        const data = await res.json();
        
        const parsed = data.map(d => ({
          date: new Date(d[0]).toLocaleDateString(),
          close: parseFloat(d[4]),
          volume: parseFloat(d[5]),
        }));

        // Calculate Indicators
        const rsiArray = calculateRSI(parsed);
        const ema12 = calculateEMA(parsed, 12);
        const ema26 = calculateEMA(parsed, 26);
        
        const finalData = parsed.map((d, i) => {
          const macdLine = ema12[i] - ema26[i];
          return {
            ...d,
            rsi: rsiArray[i],
            macd: macdLine
          };
        });

        setCoinData(finalData);
      } catch (err) {
        console.error("Failed to fetch analytics coin data:", err);
      }
    };
    fetchCoinData();
  }, [selectedCoin, timeframe]);

  // Aggregate Transaction Volume (Last 30 days)
  const txVolumeData = (() => {
    const days = 30;
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      data.push({ date: d.toLocaleDateString(), buyVol: 0, sellVol: 0 });
    }

    txHistory.forEach(tx => {
      if (!tx.date) return;
      const txDate = tx.date.toDate().toLocaleDateString();
      const match = data.find(d => d.date === txDate);
      if (match) {
        if (tx.type === 'buy') match.buyVol += tx.total;
        if (tx.type === 'sell') match.sellVol += tx.total;
      }
    });
    return data;
  })();

  const pieData = portfolio.map(p => ({ name: p.symbol, value: p.totalSpent }));
  const colors = ['#FFFFFF', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563'];

  if (loading) return <div className="p-8 text-foreground animate-pulse">Loading Analytics...</div>;

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8 flex-1 overflow-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        
        <h2 className="font-['Sora'] mb-8 text-foreground">Portfolio Analytics</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Portfolio Allocation */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-['Sora'] mb-4 text-foreground">Asset Allocation (By Invested Capital)</h3>
            <div style={{ width: '100%', height: 250, minWidth: 0 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)' }} formatter={(val) => `$${val.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trading Activity */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-['Sora'] mb-4 text-foreground">Trading Activity (Last 30 Days)</h3>
            <div style={{ width: '100%', height: 250, minWidth: 0 }}>
              <ResponsiveContainer>
                <ComposedChart data={txVolumeData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" stroke="#9CA3AF" hide />
                  <YAxis stroke="#9CA3AF" hide />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)' }} />
                  <Bar dataKey="buyVol" stackId="a" fill="#22c55e" name="Buy Volume ($)" />
                  <Bar dataKey="sellVol" stackId="a" fill="#ef4444" name="Sell Volume ($)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Specific Coin Analytics */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              <h3 className="font-['Sora'] text-foreground m-0">Asset Deep Dive</h3>
              <select 
                value={selectedCoin || ''}
                onChange={(e) => setSelectedCoin(e.target.value)}
                className="bg-[#1a1a1a] border border-border rounded-lg px-3 py-1 text-foreground font-['JetBrains_Mono'] focus:outline-none"
              >
                {portfolio.map(p => <option key={p.symbol} value={p.symbol}>{p.symbol}</option>)}
                {portfolio.length === 0 && <option value="">No Assets</option>}
              </select>
            </div>
            
            <div className="flex gap-2 bg-[#1a1a1a] rounded-lg p-1 border border-border">
              {['1W', '1M', '1Y', 'ALL'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-1 rounded-md text-sm font-['Inter'] transition-colors ${timeframe === tf ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {coinData.length > 0 ? (
            <>
              <h4 className="font-['Inter'] text-muted-foreground mb-2">Price Action</h4>
              <div style={{ width: '100%', height: 250, minWidth: 0, marginBottom: '24px' }}>
                <ResponsiveContainer>
                  <AreaChart data={coinData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" stroke="#6B7280" tick={{fontSize: 12}} tickLine={false} axisLine={false} minTickGap={30} />
                    <YAxis domain={['auto', 'auto']} stroke="#6B7280" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(v)=>`$${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)' }} labelStyle={{ color: '#9CA3AF' }} />
                    <Area type="monotone" dataKey="close" stroke="#FFFFFF" strokeWidth={2} fill="url(#priceGradient)" name="Price" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-['Inter'] text-muted-foreground mb-2">RSI (Relative Strength Index)</h4>
                  <div style={{ width: '100%', height: 150, minWidth: 0 }}>
                    <ResponsiveContainer>
                      <ComposedChart data={coinData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <YAxis domain={[0, 100]} stroke="#6B7280" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)' }} />
                        <Line type="monotone" dataKey="rsi" stroke="#FFFFFF" strokeWidth={1.5} dot={false} name="RSI" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="font-['Inter'] text-muted-foreground mb-2">MACD (Moving Average Convergence Divergence)</h4>
                  <div style={{ width: '100%', height: 150, minWidth: 0 }}>
                    <ResponsiveContainer>
                      <ComposedChart data={coinData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <YAxis stroke="#6B7280" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)' }} />
                        <Bar dataKey="macd" name="MACD">
                          {coinData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.macd >= 0 ? '#FFFFFF' : '#6B7280'} />
                          ))}
                        </Bar>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground font-['Inter']">
              {portfolio.length === 0 ? "Buy some assets to see deep dive analytics." : "Loading asset data..."}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
