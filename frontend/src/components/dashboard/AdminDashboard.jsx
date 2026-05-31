import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router';
import { LogOut, Trash2, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const [coins, setCoins] = useState([]);
  const [newCoin, setNewCoin] = useState({
    symbol: '',
    name: '',
    price: '',
    volume: '',
    marketCap: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const q = collection(db, 'coins');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const coinData = [];
      snapshot.forEach((doc) => {
        coinData.push({ id: doc.id, ...doc.data() });
      });
      setCoins(coinData);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleAddCoin = async (e) => {
    e.preventDefault();
    if (!newCoin.symbol || !newCoin.name || !newCoin.price) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'coins'), {
        symbol: newCoin.symbol.toUpperCase(),
        name: newCoin.name,
        price: parseFloat(newCoin.price),
        change: 0,
        changePercent: 0,
        volume: newCoin.volume || '0',
        marketCap: newCoin.marketCap || '0'
      });
      setNewCoin({ symbol: '', name: '', price: '', volume: '', marketCap: '' });
    } catch (error) {
      console.error("Error adding coin: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoin = async (id) => {
    if (window.confirm("Are you sure you want to remove this coin?")) {
      try {
        await deleteDoc(doc(db, 'coins', id));
      } catch (error) {
        console.error("Error removing coin: ", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <h1 className="text-3xl font-['Sora'] font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Coin Form */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-['Sora'] mb-6 flex items-center gap-2">
                <Plus size={20} className="text-blue-400" />
                Add New Coin
              </h2>
              <form onSubmit={handleAddCoin} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Symbol (e.g., BTC)</label>
                  <input
                    type="text"
                    required
                    value={newCoin.symbol}
                    onChange={(e) => setNewCoin({...newCoin, symbol: e.target.value})}
                    className="w-full bg-primary/5 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={newCoin.name}
                    onChange={(e) => setNewCoin({...newCoin, name: e.target.value})}
                    className="w-full bg-primary/5 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Initial Price (USD)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newCoin.price}
                    onChange={(e) => setNewCoin({...newCoin, price: e.target.value})}
                    className="w-full bg-primary/5 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Volume (Optional)</label>
                  <input
                    type="text"
                    value={newCoin.volume}
                    onChange={(e) => setNewCoin({...newCoin, volume: e.target.value})}
                    className="w-full bg-primary/5 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 28.5B"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Market Cap (Optional)</label>
                  <input
                    type="text"
                    value={newCoin.marketCap}
                    onChange={(e) => setNewCoin({...newCoin, marketCap: e.target.value})}
                    className="w-full bg-primary/5 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 1.3T"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-foreground font-medium py-3 rounded-lg transition-colors disabled:opacity-50 mt-4"
                >
                  {loading ? 'Adding...' : 'Add Coin'}
                </button>
              </form>
            </div>
          </div>

          {/* Coins List */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h2 className="text-xl font-['Sora']">Listed Coins</h2>
                <span className="bg-primary/10 text-xs px-2 py-1 rounded text-muted-foreground">
                  {coins.length} Total
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#181818] text-muted-foreground text-sm">
                    <tr>
                      <th className="px-6 py-4 font-normal">Symbol</th>
                      <th className="px-6 py-4 font-normal">Name</th>
                      <th className="px-6 py-4 font-normal">Price</th>
                      <th className="px-6 py-4 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {coins.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                          No coins listed yet. Add one from the form.
                        </td>
                      </tr>
                    ) : (
                      coins.map((coin) => (
                        <motion.tr 
                          key={coin.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-primary/[0.02] transition-colors"
                        >
                          <td className="px-6 py-4 font-['JetBrains_Mono'] font-medium">{coin.symbol}</td>
                          <td className="px-6 py-4 text-muted-foreground">{coin.name}</td>
                          <td className="px-6 py-4 font-['JetBrains_Mono']">${Number(coin.price).toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleRemoveCoin(coin.id)}
                              className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded transition-colors inline-flex"
                              title="Remove Coin"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
