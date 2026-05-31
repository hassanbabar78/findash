import { LayoutDashboard, TrendingUp, Briefcase, Star, BarChart3, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export default function MobileNav({ activeView, setActiveView }) {
  const menuItems = [
    { id: 'hero', icon: LayoutDashboard },
    { id: 'markets', icon: TrendingUp },
    { id: 'portfolio', icon: Briefcase },
    { id: 'watchlist', icon: Star },
    { id: 'analytics', icon: BarChart3 },
    { id: 'settings', icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`p-3 rounded-lg ${
                isActive ? 'text-foreground bg-[#181818]' : 'text-muted-foreground'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <Icon size={20} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
