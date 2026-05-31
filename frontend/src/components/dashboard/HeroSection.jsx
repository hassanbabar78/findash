import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import FloatingParticles from './FloatingParticles';

export default function HeroSection() {
  const [chartData, setChartData] = useState(
    Array.from({ length: 50 }, (_, i) => ({
      value: 50 + Math.random() * 50,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev.slice(1), { value: 50 + Math.random() * 50 }];
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[600px] overflow-hidden bg-gradient-to-b from-[#0A0A0A] to-black">
      <FloatingParticles />

      <div className="absolute inset-0 opacity-30">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-card border border-border rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="font-['Inter'] text-[#D1D5DB]">Live Market Data</span>
          </div>

          <h1 className="font-['Sora'] mb-6 tracking-tight max-w-4xl mx-auto">
            Track Markets in Real Time.
          </h1>

          <p className="font-['Inter'] text-muted-foreground mb-8 max-w-2xl mx-auto px-4">
            Advanced analytics, live charts, portfolio tracking, and intelligent market insights in one sleek platform.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center w-full md:w-auto px-4">
            <motion.button
              className="w-full md:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-lg font-['Inter'] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
            <motion.button
              className="w-full md:w-auto px-8 py-3 bg-card text-foreground border border-border rounded-lg font-['Inter'] hover:bg-[#181818] transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Markets
            </motion.button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}
