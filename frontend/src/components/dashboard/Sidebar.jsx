import { LayoutDashboard, TrendingUp, Briefcase, Star, BarChart3, Settings, LogOut, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebase';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

export default function Sidebar({ activeView, setActiveView, setSelectedCoin }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [coins, setCoins] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [watchlistSet, setWatchlistSet] = useState(new Set());

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'coins'), (snapshot) => {
      const fetchedCoins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoins(fetchedCoins);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const unsubWatch = onSnapshot(collection(db, 'users', user.uid, 'watchlist'), (snapshot) => {
        const set = new Set(snapshot.docs.map(doc => doc.id));
        setWatchlistSet(set);
      });
      return () => unsubWatch();
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = coins.filter(coin => 
        coin.symbol.toLowerCase().includes(lowerQuery) || 
        coin.name.toLowerCase().includes(lowerQuery)
      );
      setSearchResults(filtered);
    }
  }, [searchQuery, coins]);

  const handleSelectCoin = (coin) => {
    setSelectedCoin(coin);
    setActiveView('market-page');
    setSearchQuery('');
    setIsFocused(false);
  };

  const handleToggleWatchlist = async (e, coin) => {
    e.stopPropagation(); // Prevent opening MarketPage
    const user = auth.currentUser;
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'watchlist', coin.symbol);
    if (watchlistSet.has(coin.symbol)) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, {
        symbol: coin.symbol,
        name: coin.name
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  const menuItems = [
    { id: 'hero', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'markets', label: 'Markets', icon: TrendingUp },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'watchlist', label: 'Watchlist', icon: Star },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="hidden md:flex w-64 h-screen bg-background border-r border-border flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="font-['Sora'] tracking-tight mb-6">FinDash</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <div className={`flex items-center gap-2 px-3 py-2 bg-card border rounded-lg transition-colors ${isFocused ? 'border-white/30' : 'border-border'}`}>
            <Search size={16} className="text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search coins..."
              className="w-full bg-transparent text-sm text-foreground focus:outline-none font-['Inter']"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />
          </div>
          
          {/* Search Dropdown */}
          <AnimatePresence>
            {isFocused && searchResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg overflow-hidden z-50 shadow-2xl"
              >
                {searchResults.map(coin => (
                  <div 
                    key={coin.id}
                    className="px-4 py-3 hover:bg-[#1a1a1a] cursor-pointer flex justify-between items-center border-b border-border last:border-0"
                    onClick={() => handleSelectCoin(coin)}
                  >
                    <div>
                      <span className="text-foreground font-['JetBrains_Mono'] font-bold mr-2">{coin.symbol}</span>
                      <span className="text-muted-foreground text-xs font-['Inter']">{coin.name}</span>
                    </div>
                    <button 
                      onClick={(e) => handleToggleWatchlist(e, coin)}
                      className="p-1 hover:bg-primary/10 rounded"
                    >
                      <Star size={14} className={watchlistSet.has(coin.symbol) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all relative ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-[#181818]'
              }`}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              {isActive && (
                <motion.div
                  className="absolute left-0 w-0.5 h-8 bg-primary rounded-r"
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={20} />
              <span className="font-['Inter']">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} />
          <span className="font-['Inter']">Logout</span>
        </button>
      </div>
    </div>
  );
}
