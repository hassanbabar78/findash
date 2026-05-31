import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { auth, db } from '../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import './effects.css';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import LiveTicker from './LiveTicker';
import HeroSection from './HeroSection';
import QuickStats from './QuickStats';
import MarketsView from './MarketsView';
import PortfolioView from './PortfolioView';
import WatchlistView from './WatchlistView';
import AnalyticsView from './AnalyticsView';
import SettingsView from './SettingsView';
import AdminDashboard from './AdminDashboard';
import UserActionsSection from './UserActionsSection';
import MarketPage from './MarketPage';
import { AIChatbot } from '../chatbot/AIChatbot';

export default function Dashboard() {
  const [activeView, setActiveView] = useState('hero');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        } else {
          setRole('user'); // Default fallback
        }
      } else {
        navigate('/auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-background text-foreground noise-texture">
        <div className="animate-pulse text-xl font-['Sora']">Loading Dashboard...</div>
      </div>
    );
  }

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="size-full flex bg-background text-foreground overflow-hidden noise-texture">
      <Sidebar activeView={activeView} setActiveView={setActiveView} setSelectedCoin={setSelectedCoin} />

      <div className="flex-1 flex flex-col overflow-auto">
        <LiveTicker />

        <div className="flex-1 overflow-auto">
          {activeView === 'hero' && (
            <>
              <UserActionsSection />
            </>
          )}
          {activeView === 'markets' && <MarketsView />}
          {activeView === 'portfolio' && <PortfolioView />}
          {activeView === 'watchlist' && <WatchlistView />}
          {activeView === 'analytics' && <AnalyticsView />}
          {activeView === 'settings' && <SettingsView />}
          {activeView === 'market-page' && <MarketPage coin={selectedCoin} />}
          {/* <AIChatbot /> */}
        </div>

      </div>

      <MobileNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
}