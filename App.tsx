import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Star, Play, Settings, RefreshCcw, ArrowRight, Home, Brain, Volume2, VolumeX } from 'lucide-react';

// Services & Types
import { generateProblem } from './utils/mathLogic';
import { generateMathStory } from './services/geminiService';
import { Difficulty, GameMode, MathProblem, Operation, StoryData } from './types';

// Components
import Button from './components/Button';
import Visualizer from './components/Visualizer';
import StoryPlayer from './components/StoryPlayer';

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<'HOME' | 'GAME'>('HOME');
  const [mode, setMode] = useState<GameMode>(GameMode.PRACTICE);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');

  // Audio effects (Simulated with Audio API if needed, but relying on visual pop currently)
  const [soundEnabled, setSoundEnabled] = useState(true);

  // --- Logic ---

  const playSound = (type: 'correct' | 'wrong' | 'pop') => {
    if (!soundEnabled) return;
    // Simple oscillator beeps for feedback without external assets
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      // Pop
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }
  };

  const initGame = useCallback(async (selectedMode: GameMode, selectedDiff: Difficulty) => {
    setMode(selectedMode);
    setDifficulty(selectedDiff);
    setScore(0);
    setStreak(0);
    setView('GAME');
    await nextQuestion(selectedMode, selectedDiff);
  }, []);

  const nextQuestion = async (currentMode: GameMode, currentDiff: Difficulty) => {
    setFeedbackStatus('IDLE');
    setUserAnswer('');
    const problem = generateProblem(currentDiff);
    setCurrentProblem(problem);

    if (currentMode === GameMode.STORY) {
      setLoadingStory(true);
      setStoryData(null);
      const story = await generateMathStory(problem);
      setStoryData(story);
      setLoadingStory(false);
    } else {
      setStoryData(null);
    }
  };

  const handleNumberClick = (num: number) => {
    if (feedbackStatus !== 'IDLE') return;
    playSound('pop');
    if (userAnswer.length < 3) {
      setUserAnswer(prev => prev + num.toString());
    }
  };

  const handleBackspace = () => {
    if (feedbackStatus !== 'IDLE') return;
    setUserAnswer(prev => prev.slice(0, -1));
  };

  const checkAnswer = () => {
    if (!currentProblem) return;
    const val = parseInt(userAnswer);

    if (val === currentProblem.answer) {
      // Correct
      setFeedbackStatus('CORRECT');
      setScore(s => s + 10);
      setStreak(s => s + 1);
      playSound('correct');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#818cf8', '#34d399', '#f472b6', '#fbbf24']
      });
      
      // Delay before next question
      setTimeout(() => {
        nextQuestion(mode, difficulty);
      }, 2500);

    } else {
      // Wrong
      setFeedbackStatus('WRONG');
      setStreak(0);
      playSound('wrong');
      
      // Reset feedback allowing retry
      setTimeout(() => {
        setFeedbackStatus('IDLE');
        setUserAnswer('');
      }, 1500);
    }
  };

  // --- Render Helpers ---

  const renderHome = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md w-full mx-auto p-6 flex flex-col gap-8 items-center"
    >
      <header className="text-center mb-4">
        <h1 className="text-5xl font-bold text-indigo-600 mb-2 drop-shadow-sm tracking-tight">趣智数学</h1>
        <p className="text-indigo-400 text-lg">快乐学加减，聪明每一天！</p>
      </header>

      <div className="w-full grid gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-lg border-4 border-indigo-100">
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500"/> 难度选择
          </h2>
          <div className="flex gap-2 justify-center">
            {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  difficulty === d 
                    ? 'bg-indigo-500 text-white shadow-md scale-105' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {d === 'EASY' ? '初级 (10)' : d === 'MEDIUM' ? '中级 (20)' : '高级 (100)'}
              </button>
            ))}
          </div>
        </div>

        <Button 
          size="xl" 
          onClick={() => initGame(GameMode.PRACTICE, difficulty)}
          className="w-full shadow-indigo-200"
          icon={<Play className="w-8 h-8" />}
        >
          开始练习
        </Button>

        <Button 
          size="xl" 
          variant="secondary"
          onClick={() => initGame(GameMode.STORY, difficulty)}
          className="w-full shadow-purple-200 !text-purple-600 !border-purple-200 hover:!bg-purple-50"
          icon={<Brain className="w-8 h-8" />}
        >
          魔法故事模式
          <span className="ml-2 text-xs bg-purple-100 px-2 py-1 rounded-full text-purple-600 font-bold">AI</span>
        </Button>
      </div>

      <div className="absolute top-4 right-4">
         <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-full bg-white/50 hover:bg-white text-indigo-600 transition">
           {soundEnabled ? <Volume2 size={24}/> : <VolumeX size={24}/>}
         </button>
      </div>
    </motion.div>
  );

  const renderGame = () => (
    <motion.div 
      className="max-w-2xl w-full mx-auto p-4 flex flex-col h-full justify-between"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header Bar */}
      <div className="flex justify-between items-center mb-4 bg-white/60 backdrop-blur-sm p-3 rounded-2xl sticky top-0 z-20">
        <button onClick={() => setView('HOME')} className="p-2 rounded-xl hover:bg-indigo-100 text-indigo-600">
          <Home />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-yellow-500 font-bold text-xl bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-100">
            <Star className="fill-current" size={20} />
            <span>{score}</span>
          </div>
          <div className="text-indigo-400 font-bold text-sm">
            连对: {streak} 🔥
          </div>
        </div>
      </div>

      {/* Main Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] relative pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProblem?.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="w-full flex flex-col items-center"
          >
            {/* Feedback Overlay */}
            {feedbackStatus === 'CORRECT' && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="fixed inset-0 bg-green-100/80 backdrop-blur-sm z-50 flex items-center justify-center flex-col"
              >
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1.5 }} 
                  className="text-8xl mb-6"
                >
                  🎉
                </motion.div>
                <h2 className="text-5xl font-bold text-green-600 drop-shadow-sm">太棒了！</h2>
              </motion.div>
            )}
             {feedbackStatus === 'WRONG' && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="fixed inset-0 bg-red-100/80 backdrop-blur-sm z-50 flex items-center justify-center flex-col"
              >
                <motion.div 
                  animate={{ x: [-10, 10, -10, 10, 0] }}
                  className="text-8xl mb-6"
                >
                  🤔
                </motion.div>
                <h2 className="text-4xl font-bold text-red-500 drop-shadow-sm">再试一次哦</h2>
              </motion.div>
            )}

            {/* Content */}
            {currentProblem && (
              <div className="flex flex-col items-center w-full">
                
                {mode === GameMode.STORY ? (
                  <div className="w-full mb-6">
                    {loadingStory ? (
                      <div className="w-full aspect-[16/9] bg-purple-50 rounded-3xl flex flex-col items-center justify-center gap-4 border-4 border-purple-100">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-purple-500"></div>
                        <p className="text-purple-400 font-bold animate-pulse">魔法老师正在思考...</p>
                      </div>
                    ) : storyData ? (
                      <StoryPlayer problem={currentProblem} story={storyData} />
                    ) : null}
                  </div>
                ) : (
                   /* Practice Mode Visuals */
                   <div className="mb-8 w-full bg-white p-6 rounded-[2.5rem] shadow-lg border-[6px] border-indigo-100">
                     <div className="flex justify-center gap-8 mb-4 opacity-80">
                       <Visualizer count={currentProblem.num1} colorClass="text-indigo-400" />
                       {currentProblem.operation === Operation.ADD && (
                          <Visualizer count={currentProblem.num2} colorClass="text-pink-400" />
                       )}
                     </div>
                   </div>
                )}

                {/* Equation Display */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl px-8 py-4 shadow-sm mb-8 border border-white/50">
                  <div className="flex items-center gap-4 text-5xl md:text-7xl font-bold text-slate-700 font-mono tracking-wider">
                    <span className="text-indigo-500">{currentProblem.num1}</span>
                    <span className="text-gray-300">
                      {currentProblem.operation === Operation.ADD ? '+' : '-'}
                    </span>
                    <span className="text-pink-500">{currentProblem.num2}</span>
                    <span className="text-gray-300">=</span>
                    <div className={`min-w-[1.5em] h-[1.2em] border-b-4 border-dashed flex items-center justify-center rounded-lg transition-colors ${
                      userAnswer ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-gray-300 text-gray-300'
                    }`}>
                      {userAnswer || '?'}
                    </div>
                  </div>
                </div>

                {/* Interactive Numpad */}
                <div className="grid grid-cols-5 gap-2 md:gap-3 w-full max-w-md">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleNumberClick(num)}
                      className="aspect-square bg-white border-b-4 border-indigo-100 rounded-2xl shadow-sm text-2xl font-bold text-indigo-600 hover:bg-indigo-50 active:bg-indigo-200 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center"
                    >
                      {num}
                    </button>
                  ))}
                  <button 
                    onClick={handleBackspace}
                    className="col-span-2 bg-red-50 border-b-4 border-red-100 rounded-2xl text-red-400 hover:bg-red-100 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center font-bold"
                  >
                    删除
                  </button>
                   <Button 
                    onClick={checkAnswer}
                    disabled={!userAnswer || feedbackStatus !== 'IDLE'}
                    variant="success"
                    className="col-span-3 !text-xl !py-0"
                  >
                    提交答案 <ArrowRight className="ml-1 w-5 h-5"/>
                  </Button>
                </div>

              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="fixed bottom-4 right-4 z-10">
         <button 
          onClick={() => nextQuestion(mode, difficulty)} 
          className="bg-white/80 backdrop-blur p-3 rounded-full shadow text-gray-400 hover:text-indigo-500 transition"
          title="跳过"
        >
          <RefreshCcw size={20} />
         </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#e0f2fe] overflow-hidden relative selection:bg-indigo-200 font-[Fredoka]">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 text-indigo-200/30 animate-bounce duration-[3000ms]">
          <Star size={60} />
        </div>
        <div className="absolute bottom-20 right-10 text-blue-200/30 animate-pulse duration-[4000ms]">
          <Brain size={80} />
        </div>
        <div className="absolute top-1/3 right-1/4 text-pink-200/30 animate-spin duration-[10000ms]">
          <Settings size={50} />
        </div>
      </div>

      <div className="z-10 w-full h-full flex flex-col overflow-y-auto">
         {view === 'HOME' ? renderHome() : renderGame()}
      </div>
    </div>
  );
};

export default App;