import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Activity, Users } from 'lucide-react';


export default function QuickStats() {
  const [stats, setStats] = useState([
    {
      label: 'Total Market Cap',
      value: '$2.8T',
      change: '+2.34%',
      icon: DollarSign,
      isPositive: true,
    },
    {
      label: 'Trading Volume',
      value: '$142.5B',
      change: '+5.67%',
      icon: Activity,
      isPositive: true,
    },
    {
      label: 'Active Traders',
      value: '1.2M',
      change: '-0.45%',
      icon: Users,
      isPositive: false,
    },
    {
      label: 'Top Gainer',
      value: 'TSLA',
      change: '+8.23%',
      icon: TrendingUp,
      isPositive: true,
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev =>
        prev.map(stat => ({
          ...stat,
          change: `${stat.isPositive ? '+' : '-'}${(Math.random() * 10).toFixed(2)}%`,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 md:px-8 py-12 bg-background pb-20 md:pb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="bg-card border border-border rounded-lg p-6 hover:bg-[#181818] transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-[#181818] rounded-lg">
                  <Icon size={20} className="text-foreground" />
                </div>
                <motion.span
                  className={`font-['JetBrains_Mono'] ${
                    stat.isPositive ? 'text-foreground' : 'text-[#6B7280]'
                  }`}
                  key={stat.change}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {stat.change}
                </motion.span>
              </div>
              <p className="font-['Inter'] text-muted-foreground mb-2">{stat.label}</p>
              <p className="font-['JetBrains_Mono'] text-foreground">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
