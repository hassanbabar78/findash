import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


export default function StockDetailView({ symbol, onBack }) {
  const [timeframe, setTimeframe] = useState('1D');
  const [price, setPrice] = useState(178.45);
  const [change, setChange] = useState(1.23);
  const [changePercent, setChangePercent] = useState(0.69);

  const chartData = Array.from({ length: 100 }, (_, i) => ({
    time: i,
    price: 175 + Math.random() * 10,
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      const priceChange = (Math.random() - 0.5) * 2;
      setPrice(prev => prev + priceChange);
      setChange(prev => prev + priceChange);
      setChangePercent(prev => prev + (Math.random() - 0.5) * 0.1);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span className="font-['Inter']">Back to Markets</span>
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-['Sora']">{symbol}</h1>
              <span className="px-3 py-1 bg-card border border-border rounded-full font-['Inter'] text-muted-foreground">
                NASDAQ
              </span>
            </div>
            <p className="font-['Inter'] text-muted-foreground">Apple Inc.</p>
          </div>

          <div className="text-right">
            <motion.p
              className="font-['JetBrains_Mono'] text-foreground mb-1"
              key={price}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ${price.toFixed(2)}
            </motion.p>
            <div className="flex items-center justify-end gap-1">
              {change >= 0 ? (
                <TrendingUp size={16} className="text-foreground" />
              ) : (
                <TrendingDown size={16} className="text-[#6B7280]" />
              )}
              <span
                className={`font-['JetBrains_Mono'] ${
                  change >= 0 ? 'text-foreground' : 'text-[#6B7280]'
                }`}
              >
                {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {['1D', '1W', '1M', '1Y', 'ALL'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg font-['Inter'] transition-all ${
                timeframe === tf
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-[#181818] border border-border'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="time" stroke="#9CA3AF" hide />
              <YAxis stroke="#9CA3AF" domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111111',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono',
                }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#FFFFFF"
                strokeWidth={2}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-['Sora'] mb-6">Key Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-['Inter'] text-muted-foreground">Market Cap</span>
                <span className="font-['JetBrains_Mono'] text-foreground">$2.8T</span>
              </div>
              <div className="flex justify-between">
                <span className="font-['Inter'] text-muted-foreground">Volume</span>
                <span className="font-['JetBrains_Mono'] text-foreground">45.2M</span>
              </div>
              <div className="flex justify-between">
                <span className="font-['Inter'] text-muted-foreground">P/E Ratio</span>
                <span className="font-['JetBrains_Mono'] text-foreground">28.45</span>
              </div>
              <div className="flex justify-between">
                <span className="font-['Inter'] text-muted-foreground">52 Week High</span>
                <span className="font-['JetBrains_Mono'] text-foreground">$198.23</span>
              </div>
              <div className="flex justify-between">
                <span className="font-['Inter'] text-muted-foreground">52 Week Low</span>
                <span className="font-['JetBrains_Mono'] text-foreground">$124.17</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-['Sora'] mb-6">About</h3>
            <p className="font-['Inter'] text-muted-foreground leading-relaxed">
              Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and Wearables, Home and Accessories.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
