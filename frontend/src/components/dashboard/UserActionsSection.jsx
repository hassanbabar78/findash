import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRightLeft, ArrowDownToLine, ArrowUpFromLine, Wallet } from 'lucide-react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Dummy Candlestick Data
const generateCandleData = () => {
  const data = [];
  let currentPrice = 64000;
  for (let i = 0; i < 90; i++) {
    const open = currentPrice;
    const close = open + (Math.random() - 0.5) * 1000;
    const high = Math.max(open, close) + Math.random() * 500;
    const low = Math.min(open, close) - Math.random() * 500;
    
    data.push({
      time: `Day ${i + 1}`,
      open,
      close,
      high,
      low,
      isBullish: close > open,
      // For recharts stacked bars hack if not using custom shape:
      bottomRange: [low, Math.min(open, close)],
      bodyRange: [Math.min(open, close), Math.max(open, close)],
      topRange: [Math.max(open, close), high]
    });
    currentPrice = close;
  }
  return data;
};

// Custom shape for candlestick body and wicks
const CandlestickShape = (props) => {
  const { x, y, width, height, low, high, open, close } = props;
  const isBullish = close > open;
  const color = isBullish ? 'white' : '#6B7280'; // White or Gray to match theme
  
  // Calculate relative positions for wicks
  // Since Recharts passes calculated y and height based on the dataKey, we have to map the actual values
  // We'll just draw a simple rect and a line through it
  
  // Actually, standard recharts doesn't easily map all 4 values to a single shape's y scale without extra work.
  // We'll use a simplified custom shape based on the full data object.
  const data = props.payload;
  if (!data) return null;
  
  // yAxis scale mapping logic would normally go here, but a simpler approach is using composed chart 
  // with error bars, or drawing paths. For simplicity, we'll draw a rectangle for the body.
  
  return (
    <g>
      <rect 
        x={x} 
        y={y} 
        width={width} 
        height={Math.max(height, 2)} 
        fill={color} 
        rx={2}
      />
    </g>
  );
};

export default function UserActionsSection() {
  const [balance, setBalance] = useState(45231.89);
  const [depositAmount, setDepositAmount] = useState('');
  
  const [fromAmount, setFromAmount] = useState('');
  const [fromCrypto, setFromCrypto] = useState('BTC');
  const [toCrypto, setToCrypto] = useState('ETH');
  
  const [chartData] = useState(generateCandleData());

  const conversionRates = {
    'BTC-ETH': 15.2,
    'ETH-BTC': 0.065,
    'BTC-SOL': 450.5,
    'SOL-BTC': 0.0022,
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!isNaN(amount) && amount > 0) {
      setBalance(prev => prev + amount);
      setDepositAmount('');
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(depositAmount);
    if (!isNaN(amount) && amount > 0 && amount <= balance) {
      setBalance(prev => prev - amount);
      setDepositAmount('');
    }
  };

  const convertedAmount = () => {
    const amt = parseFloat(fromAmount);
    if (isNaN(amt)) return '0.00';
    if (fromCrypto === toCrypto) return amt.toFixed(2);
    
    const rate = conversionRates[`${fromCrypto}-${toCrypto}`];
    if (rate) return (amt * rate).toFixed(4);
    return 'N/A';
  };

  return (
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Balance Card */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                <Wallet size={20} />
              </div>
              <h3 className="font-['Sora'] text-gray-300">Total Balance</h3>
            </div>
            <p className="text-4xl font-['JetBrains_Mono'] font-bold text-white mb-2">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-green-400 font-['Inter'] flex items-center gap-1">
              <ArrowUpFromLine size={14} /> +$1,234.50 Today
            </p>
          </div>
        </div>

        {/* Deposit/Withdraw Card */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative">
          <h3 className="font-['Sora'] text-gray-300 mb-4">Quick Transfer</h3>
          <div className="flex bg-[#1a1a1a] border border-white/10 rounded-lg p-1 mb-4">
            <span className="text-gray-400 pl-4 py-2">$</span>
            <input 
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-white font-['JetBrains_Mono'] focus:outline-none px-2 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleDeposit}
              className="flex items-center justify-center gap-2 bg-white text-black py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <ArrowDownToLine size={16} /> Deposit
            </button>
            <button 
              onClick={handleWithdraw}
              className="flex items-center justify-center gap-2 bg-[#1a1a1a] text-white border border-white/10 py-2 rounded-lg font-medium hover:bg-[#222] transition-colors"
            >
              <ArrowUpFromLine size={16} /> Withdraw
            </button>
          </div>
        </div>

        {/* Conversion Card */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative">
          <h3 className="font-['Sora'] text-gray-300 mb-4">Convert</h3>
          
          <div className="flex gap-2 mb-2">
            <div className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg flex overflow-hidden">
              <input 
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-white font-['JetBrains_Mono'] px-4 py-2 focus:outline-none min-w-0"
              />
              <select 
                value={fromCrypto}
                onChange={(e) => setFromCrypto(e.target.value)}
                className="bg-transparent text-white font-bold px-2 py-2 border-l border-white/10 focus:outline-none"
              >
                <option value="BTC" className="bg-black">BTC</option>
                <option value="ETH" className="bg-black">ETH</option>
                <option value="SOL" className="bg-black">SOL</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <div className="bg-[#111] p-1 rounded-full border border-white/10">
              <ArrowRightLeft size={16} className="text-gray-400 transform rotate-90" />
            </div>
          </div>

          <div className="flex gap-2 mt-2 mb-4">
            <div className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg flex overflow-hidden opacity-80">
              <input 
                type="text"
                readOnly
                value={convertedAmount()}
                className="w-full bg-transparent text-gray-400 font-['JetBrains_Mono'] px-4 py-2 focus:outline-none min-w-0"
              />
              <select 
                value={toCrypto}
                onChange={(e) => setToCrypto(e.target.value)}
                className="bg-transparent text-white font-bold px-2 py-2 border-l border-white/10 focus:outline-none"
              >
                <option value="ETH" className="bg-black">ETH</option>
                <option value="BTC" className="bg-black">BTC</option>
                <option value="SOL" className="bg-black">SOL</option>
              </select>
            </div>
          </div>
          
        </div>
      </div>

      {/* Candlestick Chart Section */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full">
        <h3 className="font-['Sora'] text-white mb-6">Market Movements (Simulated)</h3>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#6b7280" 
                tick={{fill: '#6b7280', fontSize: 12}}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                stroke="#6b7280" 
                tick={{fill: '#6b7280', fontSize: 12}}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                itemStyle={{ color: 'white' }}
                formatter={(value) => `$${Number(value).toFixed(2)}`}
              />
              {/* Simplification: using Bar for the body of the candle */}
              <Bar 
                dataKey="bodyRange" 
                shape={<CandlestickShape />} 
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
