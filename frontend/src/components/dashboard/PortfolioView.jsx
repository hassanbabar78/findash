import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { auth, db } from '../../firebase/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function PortfolioView() {
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalGain, setTotalGain] = useState(0);
  const [totalGainPercent, setTotalGainPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch Portfolio and Transactions from Firebase
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const portfolioRef = collection(db, 'users', user.uid, 'portfolio');
    const unsubPortfolio = onSnapshot(portfolioRef, async (snapshot) => {
      const activeHoldings = snapshot.docs
        .map(doc => doc.data())
        .filter(h => h.amount > 0);

      // Fetch live prices from Binance for each holding
      const updatedHoldings = await Promise.all(activeHoldings.map(async (holding) => {
        try {
          const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${holding.symbol}USDT`);
          if (res.ok) {
            const data = await res.json();
            const currentPrice = parseFloat(data.price);
            const value = holding.amount * currentPrice;
            const gain = value - holding.totalSpent;
            const gainPercent = holding.totalSpent > 0 ? (gain / holding.totalSpent) * 100 : 0;

            return {
              ...holding,
              currentPrice,
              value,
              gain,
              gainPercent
            };
          }
        } catch (error) {
          console.error(`Failed to fetch price for ${holding.symbol}`, error);
        }
        
        // Fallback if fetch fails
        const value = holding.amount * holding.avgPrice;
        return {
          ...holding,
          currentPrice: holding.avgPrice,
          value: value,
          gain: 0,
          gainPercent: 0
        };
      }));

      setHoldings(updatedHoldings);

      // Calculate totals
      const totalVal = updatedHoldings.reduce((sum, h) => sum + h.value, 0);
      const totalSpent = updatedHoldings.reduce((sum, h) => sum + h.totalSpent, 0);
      const tGain = totalVal - totalSpent;
      const tGainPct = totalSpent > 0 ? (tGain / totalSpent) * 100 : 0;

      setTotalValue(totalVal);
      setTotalGain(tGain);
      setTotalGainPercent(tGainPct);
    });

    const txRef = query(collection(db, 'users', user.uid, 'transactions'), orderBy('date', 'desc'));
    const unsubTx = onSnapshot(txRef, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txs);
      setLoading(false);
    });

    return () => {
      unsubPortfolio();
      unsubTx();
    };
  }, []);

  const pieData = holdings.map(h => ({
    name: h.symbol,
    value: h.value,
  }));

  const colors = ['#FFFFFF', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563'];

  // Dummy performance data for now, since we aren't tracking historical total portfolio value
  const performanceData = Array.from({ length: 30 }, (_, i) => ({
    day: i,
    value: totalValue * 0.8 + Math.random() * (totalValue * 0.4),
  }));

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('My Financial Portfolio', 14, 22);
    
    // Summary
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(`Total Value: $${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, 32);
    doc.text(`Total Gain/Loss: ${totalGain >= 0 ? '+' : ''}$${totalGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, 40);
    doc.text(`Return: ${totalGainPercent >= 0 ? '+' : ''}${totalGainPercent.toFixed(2)}%`, 14, 48);
    
    // Holdings Table
    const tableColumn = ["Symbol", "Name", "Amount", "Avg Price", "Current", "Value", "Gain/Loss"];
    const tableRows = [];

    holdings.forEach(holding => {
      const holdingData = [
        holding.symbol,
        holding.name,
        holding.amount.toLocaleString(undefined, {maximumFractionDigits:4}),
        `$${holding.avgPrice.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`,
        `$${holding.currentPrice.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`,
        `$${holding.value.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`,
        `${holding.gain >= 0 ? '+' : ''}$${holding.gain.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} (${holding.gainPercent.toFixed(2)}%)`
      ];
      tableRows.push(holdingData);
    });

    try {
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 55 }
      });
      doc.save('portfolio_export.pdf');
    } catch (err) {
      console.error("PDF generation error:", err);
    }
  };

  if (loading) {
    return <div className="p-8 text-white animate-pulse">Loading Portfolio...</div>;
  }

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8 flex-1 overflow-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-['Sora'] text-white m-0">Portfolio Dashboard</h2>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-['Inter'] font-semibold hover:bg-gray-200 transition-colors"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <motion.div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-lg p-6" whileHover={{ y: -2 }}>
            <p className="font-['Inter'] text-[#9CA3AF] mb-2">Total Value</p>
            <motion.p className="font-['JetBrains_Mono'] text-white text-2xl" key={totalValue} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </motion.p>
          </motion.div>

          <motion.div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-lg p-6" whileHover={{ y: -2 }}>
            <p className="font-['Inter'] text-[#9CA3AF] mb-2">Total Gain/Loss</p>
            <motion.p className={`font-['JetBrains_Mono'] text-2xl ${totalGain >= 0 ? 'text-white' : 'text-[#6B7280]'}`} key={totalGain} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </motion.p>
          </motion.div>

          <motion.div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-lg p-6" whileHover={{ y: -2 }}>
            <p className="font-['Inter'] text-[#9CA3AF] mb-2">Return</p>
            <motion.p className={`font-['JetBrains_Mono'] text-2xl ${totalGainPercent >= 0 ? 'text-white' : 'text-[#6B7280]'}`} key={totalGainPercent} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
            </motion.p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-lg p-6">
            <h3 className="font-['Sora'] mb-4 text-white">Performance (Simulated)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceData}>
                <XAxis dataKey="day" stroke="#9CA3AF" hide />
                <YAxis stroke="#9CA3AF" hide domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }} labelStyle={{ color: '#9CA3AF' }} />
                <Line type="monotone" dataKey="value" stroke="#FFFFFF" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-lg p-6">
            <h3 className="font-['Sora'] mb-4 text-white">Asset Allocation</h3>
            {holdings.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center flex-wrap gap-4 mt-4">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                      <span className="font-['JetBrains_Mono'] text-[#9CA3AF] text-sm">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500 font-['Inter']">No assets to display</div>
            )}
          </div>
        </div>

        <h3 className="font-['Sora'] mb-4 mt-12 text-white">Current Holdings</h3>
        <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden mb-8">
          <div className="grid grid-cols-7 gap-4 p-4 border-b border-[rgba(255,255,255,0.08)] bg-[#0A0A0A]">
            <p className="font-['Inter'] text-[#9CA3AF] text-sm">Symbol</p>
            <p className="font-['Inter'] text-[#9CA3AF] text-sm">Name</p>
            <p className="font-['Inter'] text-[#9CA3AF] text-right text-sm">Amount</p>
            <p className="font-['Inter'] text-[#9CA3AF] text-right text-sm">Avg Price</p>
            <p className="font-['Inter'] text-[#9CA3AF] text-right text-sm">Current</p>
            <p className="font-['Inter'] text-[#9CA3AF] text-right text-sm">Value</p>
            <p className="font-['Inter'] text-[#9CA3AF] text-right text-sm">Gain/Loss</p>
          </div>

          {holdings.length === 0 ? (
            <div className="p-6 text-center text-gray-500 font-['Inter']">No active holdings. Try buying a coin!</div>
          ) : (
            holdings.map((holding, index) => (
              <motion.div
                key={holding.symbol}
                className="grid grid-cols-7 gap-4 p-4 border-b border-[rgba(255,255,255,0.04)] hover:bg-[#181818] transition-all"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="font-['JetBrains_Mono'] text-white">{holding.symbol}</span>
                <span className="font-['Inter'] text-[#D1D5DB] truncate">{holding.name}</span>
                <span className="font-['JetBrains_Mono'] text-[#9CA3AF] text-right">{holding.amount.toLocaleString(undefined, {maximumFractionDigits:4})}</span>
                <span className="font-['JetBrains_Mono'] text-[#9CA3AF] text-right">${holding.avgPrice.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                <span className="font-['JetBrains_Mono'] text-white text-right">${holding.currentPrice.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                <span className="font-['JetBrains_Mono'] text-white text-right">${holding.value.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                <span className={`font-['JetBrains_Mono'] text-right ${holding.gain >= 0 ? 'text-white' : 'text-[#6B7280]'}`}>
                  {holding.gain >= 0 ? '+' : ''}${holding.gain.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} ({holding.gainPercent.toFixed(2)}%)
                </span>
              </motion.div>
            ))
          )}
        </div>

        <h3 className="font-['Sora'] mb-4 mt-8 text-white">Transaction History</h3>
        <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden">
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-[rgba(255,255,255,0.08)] bg-[#0A0A0A]">
            <p className="font-['Inter'] text-[#9CA3AF] text-sm">Date</p>
            <p className="font-['Inter'] text-[#9CA3AF] text-sm">Type</p>
            <p className="font-['Inter'] text-[#9CA3AF] text-right text-sm">Amount</p>
            <p className="font-['Inter'] text-[#9CA3AF] text-right text-sm">Price</p>
            <p className="font-['Inter'] text-[#9CA3AF] text-right text-sm">Total Cost/Yield</p>
          </div>
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500 font-['Inter']">No transaction history.</div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="grid grid-cols-5 gap-4 p-4 border-b border-[rgba(255,255,255,0.04)] hover:bg-[#181818]">
                <span className="font-['Inter'] text-gray-300 text-sm">{tx.date?.toDate().toLocaleString() || 'Just now'}</span>
                <span className={`font-['Inter'] font-semibold text-sm ${tx.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>{tx.type.toUpperCase()}</span>
                <span className="font-['JetBrains_Mono'] text-white text-right text-sm">{tx.amount} {tx.symbol}</span>
                <span className="font-['JetBrains_Mono'] text-gray-400 text-right text-sm">${tx.price?.toLocaleString()}</span>
                <span className="font-['JetBrains_Mono'] text-white text-right text-sm">${tx.total?.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
