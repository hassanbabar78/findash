import { motion } from 'motion/react';

export default function LoadingSkeleton() {
  return (
    <div className="p-8">
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="bg-card border border-border rounded-lg p-6 h-24"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          >
            <div className="h-4 bg-[#181818] rounded w-1/4 mb-3" />
            <div className="h-3 bg-[#181818] rounded w-1/2" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
