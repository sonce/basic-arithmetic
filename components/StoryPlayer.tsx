import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MathProblem, Operation, StoryData } from '../types';
import { Volume2, Timer, RotateCcw, Play } from 'lucide-react';

interface StoryPlayerProps {
  problem: MathProblem;
  story: StoryData;
}

const StoryPlayer: React.FC<StoryPlayerProps> = ({ problem, story }) => {
  const [animationStep, setAnimationStep] = useState<'INITIAL' | 'ACTION'>('INITIAL');
  const [isFinished, setIsFinished] = useState(false);
  const [loopKey, setLoopKey] = useState(0);
  const [progress, setProgress] = useState(0);

  // Animation timing configuration
  const INITIAL_DELAY = 2000; // How long to stay in initial state
  const ACTION_DURATION = 4000; // How long the action takes before showing replay
  const TOTAL_DURATION = INITIAL_DELAY + ACTION_DURATION;

  // Reset whenever the problem changes
  useEffect(() => {
    setLoopKey(0);
  }, [problem]);

  useEffect(() => {
    // Reset state at start of loopKey change
    setAnimationStep('INITIAL');
    setIsFinished(false);
    setProgress(0);

    // Progress bar timer
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + (100 / (TOTAL_DURATION / 100));
      });
    }, 100);

    // Trigger Action Phase
    const actionTimer = setTimeout(() => {
      setAnimationStep('ACTION');
    }, INITIAL_DELAY);

    // Trigger Finish State
    const finishTimer = setTimeout(() => {
      setIsFinished(true);
      clearInterval(progressInterval);
      setProgress(100);
    }, TOTAL_DURATION);

    return () => {
      clearTimeout(actionTimer);
      clearTimeout(finishTimer);
      clearInterval(progressInterval);
    };
  }, [loopKey, TOTAL_DURATION]);

  const handleReplay = () => {
    setLoopKey(prev => prev + 1);
  };

  const speak = () => {
    const u = new SpeechSynthesisUtterance(story.storyText + " " + story.questionText);
    u.lang = 'zh-CN';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  // Limit visible items to prevent DOM explosion on Hard difficulty
  const MAX_ITEMS = 15;
  const displayNum1 = Math.min(problem.num1, MAX_ITEMS);
  // For subtraction, we remove from the initial set. For addition, we add new ones.
  const displayNum2 = Math.min(problem.num2, MAX_ITEMS);

  const isAddition = problem.operation === Operation.ADD;

  // Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemEnterVariant = {
    hidden: { scale: 0, opacity: 0, y: 20 },
    show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' } }
  };

  const itemExitVariant = {
    action: { 
      scale: [1, 1.2, 0], 
      opacity: [1, 1, 0], 
      x: [0, 0, 100], // Fly away to right
      rotate: [0, -10, 45],
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
      
      {/* --- ANIMATION STAGE --- */}
      <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-sky-200 via-sky-100 to-white rounded-3xl border-4 border-white shadow-xl overflow-hidden ring-4 ring-indigo-50 group">
        
        {/* Background Elements */}
        <div className="absolute bottom-0 w-full h-1/3 bg-[#4ade80] rounded-t-[50%] scale-150 translate-y-10 opacity-80"></div>
        <div className="absolute top-4 right-8 text-4xl opacity-40 animate-pulse">☁️</div>
        <div className="absolute top-10 left-10 text-3xl opacity-30 animate-pulse delay-700">☁️</div>

        {/* Timer Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 z-20">
          <motion.div 
            className="h-full bg-indigo-400"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </div>

        {/* Replay Button (Compact Top-Right) */}
        <AnimatePresence>
          {isFinished && (
            <motion.button
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReplay}
              className="absolute top-3 right-3 z-50 bg-white/90 hover:bg-white text-indigo-600 rounded-full px-4 py-2 shadow-lg border-2 border-indigo-100 flex items-center gap-2 font-bold text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              再看一次
            </motion.button>
          )}
        </AnimatePresence>

        {/* Main Scene */}
        <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
          <motion.div 
            key={`scene-${loopKey}`} // Force full re-render on loop
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-wrap justify-center items-center gap-2 md:gap-4"
          >
            
            {/* Initial Items (Group 1) */}
            {Array.from({ length: displayNum1 }).map((_, i) => {
              // Logic for Subtraction: 
              // If animationStep is ACTION, and this index is one of the ones to be removed (last N items)
              const isTargetForRemoval = !isAddition && i >= (displayNum1 - displayNum2);
              
              return (
                <motion.div
                  key={`item-1-${i}`}
                  variants={isTargetForRemoval ? itemExitVariant : itemEnterVariant}
                  animate={isTargetForRemoval && animationStep === 'ACTION' ? 'action' : 'show'}
                  className="text-4xl md:text-6xl select-none cursor-pointer hover:scale-110 transition-transform"
                >
                  {story.emoji}
                </motion.div>
              );
            })}
            
            {problem.num1 > MAX_ITEMS && (
               <div className="text-2xl font-bold text-indigo-500 bg-white/50 px-2 rounded-lg">
                  +{(problem.num1 - MAX_ITEMS)}
               </div>
            )}

            {/* Added Items (Group 2) - Only for Addition */}
            {isAddition && (
              <div className="flex flex-wrap gap-2 md:gap-4 border-l-2 border-dashed border-indigo-300/50 pl-2 md:pl-4">
                 {Array.from({ length: displayNum2 }).map((_, i) => (
                   <motion.div
                    key={`item-2-${i}`}
                    initial={{ scale: 0, opacity: 0, x: -20 }}
                    animate={animationStep === 'ACTION' 
                      ? { scale: 1, opacity: 1, x: 0 } 
                      : { scale: 0, opacity: 0 }
                    }
                    transition={{ delay: i * 0.1, type: 'spring' }}
                    className="text-4xl md:text-6xl select-none"
                   >
                     {story.emoji}
                   </motion.div>
                 ))}
                  {problem.num2 > MAX_ITEMS && animationStep === 'ACTION' && (
                    <div className="text-2xl font-bold text-pink-500 bg-white/50 px-2 rounded-lg">
                        +{(problem.num2 - MAX_ITEMS)}
                    </div>
                  )}
              </div>
            )}

          </motion.div>
        </div>

        {/* Status Indicator */}
        {!isFinished && (
          <div className="absolute top-3 left-3 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-indigo-500 flex items-center gap-1 shadow-sm">
             {animationStep === 'INITIAL' 
               ? (isAddition ? '准备...' : '一开始...') 
               : (isAddition ? '来了来了!' : '走了走了!')
             }
          </div>
        )}
      </div>

      {/* --- SUBTITLES (Caption Card) --- */}
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-2xl p-5 shadow-lg border-b-4 border-gray-100 relative flex items-start gap-4"
      >
        <div className="mt-1 bg-indigo-100 p-2 rounded-full text-indigo-600 shrink-0">
           {isFinished ? <Play size={20} className="fill-indigo-600" /> : <Timer size={20} className="animate-spin"/>}
        </div>
        
        <div className="flex-1">
           <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">数学小故事</h3>
           <p className="text-lg text-slate-700 font-medium leading-relaxed">
             {story.storyText}
           </p>
           <div className="mt-2 text-indigo-600 font-bold flex items-center gap-2 text-lg">
             问题: {story.questionText}
           </div>
        </div>

        <button 
          onClick={speak}
          className="p-3 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors shrink-0"
          aria-label="朗读故事"
        >
          <Volume2 size={24} />
        </button>
      </motion.div>

    </div>
  );
};

export default StoryPlayer;