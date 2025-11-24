import React from 'react';
import { motion } from 'framer-motion';

interface VisualizerProps {
  count: number;
  emoji?: string;
  colorClass?: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ count, emoji = '●', colorClass = 'text-indigo-400' }) => {
  // Limit visualizer for performance and readability on large numbers
  const displayCount = Math.min(count, 20); 
  const isLarge = count > 20;

  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto my-4">
      {Array.from({ length: displayCount }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.05, type: "spring" }}
          className={`text-2xl md:text-3xl select-none ${colorClass}`}
        >
          {emoji}
        </motion.div>
      ))}
      {isLarge && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="flex items-center justify-center text-gray-400 font-bold text-xl"
        >
          + {count - 20} 更多...
        </motion.div>
      )}
    </div>
  );
};

export default Visualizer;
