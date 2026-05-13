/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QUESTIONS, Question } from './data/questions';
import { User, UserCircle, DoorOpen, Library, GraduationCap, AlertTriangle, Ghost, Sparkles } from 'lucide-react';

type Gender = 'male' | 'female';
type GameState = 'START' | 'GENDER_SELECT' | 'QUIZ' | 'ENDING';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [gender, setGender] = useState<Gender | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<Record<number, string>>({});
  const [isLoopingQ8, setIsLoopingQ8] = useState(false);
  const [showQ24Overlay, setShowQ24Overlay] = useState(false);
  
  // Scoring / Path detection
  const isWokeUp = choices[16] === 'A'; // Question 16: index is 15 (0-based)
  const isLibraryDoor = choices[31] === 'A'; // Question 31: index is 30 (0-based)
  const wentToLibrary = choices[3] === 'A' || choices[26] === 'A' || choices[26] === 'B'; 

  const currentQuestion = QUESTIONS[currentIndex];

  const handleGenderSelect = (g: Gender) => {
    setGender(g);
    setGameState('QUIZ');
  };

  const handleOptionSelect = (optionId: string) => {
    const newChoices = { ...choices, [currentQuestion.id]: optionId };
    setChoices(newChoices);

    if (currentQuestion.id === 8 && !isLoopingQ8) {
      setIsLoopingQ8(true);
      return; // Stay on Q8
    }

    if (currentQuestion.id === 8 && isLoopingQ8) {
      if (optionId !== 'A') return; // Cannot select others in loop
    }

    if (currentQuestion.id === 24) {
      setShowQ24Overlay(true);
      setTimeout(() => {
        setShowQ24Overlay(false);
        setCurrentIndex(currentIndex + 1);
      }, 3500);
      return;
    }

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setGameState('ENDING');
    }
  };

  const getEnding = () => {
    // Priority 1: Woke up (A)
    if (choices[16] === 'A') return 'A';
    // Priority 2: Library Door or Forbidden Section (C)
    if (choices[31] === 'A' || wentToLibrary) return 'C';
    // Default: Classroom Door / Ghost (B)
    return 'B';
  };

  const endingType = getEnding();

  return (
    <div 
      className="min-h-screen w-full flex flex-col bg-[#0a0a0a] text-neutral-300 font-sans overflow-hidden relative"
    >
      {/* Background Glitch Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-64 h-64 border border-red-900 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 border border-red-600 rounded-full blur-[100px] opacity-30"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-red-900/10 rounded-full blur-2xl"></div>
      </div>

      {/* Top Navigation / Status */}
      <div className="w-full h-16 border-b border-neutral-800 flex items-center justify-between px-8 bg-neutral-900/50 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 font-mono">
            System Status: <span className={currentIndex > 28 ? 'text-red-500 animate-pulse' : 'text-green-800'}>
              {currentIndex > 28 ? 'UNSTABLE' : 'STABLE'}
            </span>
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-neutral-400">
            TRAILBLAZER ID: <span className="text-neutral-100">{gender === 'female' ? '灰发的女生' : gender === 'male' ? '灰发的男生' : 'UNKNOWN'}</span>
          </span>
          <div className="w-48 h-1 bg-neutral-800 mt-1 overflow-hidden">
            <motion.div 
              className="h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 overflow-y-auto hide-scrollbar">
        <AnimatePresence mode="wait">
        {gameState === 'START' && (
          <motion.div 
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-8 max-w-lg p-12 bg-neutral-900/40 border border-neutral-800 backdrop-blur-sm relative"
          >
            <div className="absolute top-0 left-0 w-2 h-2 bg-red-900"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-900"></div>
            <h1 className="text-5xl font-light tracking-[0.3em] uppercase text-neutral-100 leading-tight">
              寻常的一天？
            </h1>
            <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest leading-relaxed">
              SIMULATION_V_15.0 // NEUTRAL_ASSESSMENT<br/>
              这只是一个普通的网络情景测试... 对吗？
            </p>
            <button
              onClick={() => setGameState('GENDER_SELECT')}
              className="mt-8 px-12 py-4 bg-transparent border border-neutral-700 hover:border-red-800 text-neutral-300 font-mono text-sm uppercase tracking-widest transition-all hover:bg-neutral-900 group relative overflow-hidden"
            >
              <span className="relative z-10 transition-colors group-hover:text-red-500">INITIATE_TEST</span>
              <div className="absolute inset-0 bg-red-900/5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </button>
          </motion.div>
        )}

        {gameState === 'GENDER_SELECT' && (
          <motion.div 
            key="gender"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-12 max-w-xl"
          >
            <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-neutral-500">请选择你的开拓者性别</h2>
            <div className="flex gap-12 justify-center">
              <button 
                onClick={() => handleGenderSelect('male')}
                className="flex flex-col items-center gap-6 group"
              >
                <div className="p-10 bg-neutral-900/40 border border-neutral-800 group-hover:border-blue-900/50 transition-all relative">
                  <User size={64} className="text-neutral-600 group-hover:text-blue-500 transition-colors" />
                  <div className="absolute top-0 right-0 w-1 h-1 bg-blue-950"></div>
                </div>
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 group-hover:text-blue-400">男生</span>
              </button>
              <button 
                onClick={() => handleGenderSelect('female')}
                className="flex flex-col items-center gap-6 group"
              >
                <div className="p-10 bg-neutral-900/40 border border-neutral-800 group-hover:border-pink-900/50 transition-all relative">
                  <UserCircle size={64} className="text-neutral-600 group-hover:text-pink-500 transition-colors" />
                  <div className="absolute top-0 right-0 w-1 h-1 bg-pink-950"></div>
                </div>
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 group-hover:text-pink-400">女生</span>
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'QUIZ' && (
          <motion.div 
            key={`quiz-${currentIndex}-${isLoopingQ8}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="w-full max-w-2xl relative"
          >
            <div className={`p-8 md:p-12 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-sm shadow-2xl relative overflow-hidden ${currentQuestion.id === 30 ? 'horror-border' : ''} ${currentQuestion.specialEffect === 'glitch' ? 'animate-glitch border-red-900/30' : ''}`}>
              {/* Decorative elements within card */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-950/20 rounded-full blur-2xl rotate-45 pointer-events-none"></div>
              <div className="absolute top-1/2 -right-16 w-32 h-64 bg-red-900/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="mb-8 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                   <span className="px-2 py-0.5 bg-red-950/50 text-red-500 text-[10px] font-mono border border-red-900/50">
                    {currentQuestion.id >= 29 ? `ERR_Q${currentQuestion.id}` : `DATA_Q${currentQuestion.id}`}
                  </span>
                  <span className="text-neutral-500 font-mono text-[10px] uppercase tracking-wider">
                    Progress: {currentIndex + 1} / {QUESTIONS.length} {currentQuestion.specialEffect === 'glitch' && '?'}
                  </span>
                </div>
                <h3 className={`text-2xl md:text-3xl font-light leading-tight tracking-tight text-neutral-100 ${currentQuestion.specialEffect === 'shattered' ? 'shattered-text' : ''}`}>
                  {currentQuestion.id === 8 && isLoopingQ8 
                    ? "你最多闻到哪种味到？" 
                    : currentQuestion.id === 36 
                      ? currentQuestion.content.replace('he/she/', gender === 'male' ? '他' : '她')
                      : currentQuestion.content}
                </h3>
              </div>

              {currentQuestion.id === 30 && <div className="blood-handprint absolute -top-4 -right-4 opacity-40 pointer-events-none" />}

              <div className="grid gap-4">
                {currentQuestion.options.map((opt) => {
                  const isDisabled = currentQuestion.id === 8 && isLoopingQ8 && opt.id !== 'A';
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionSelect(opt.id)}
                      disabled={isDisabled}
                      className={`
                        w-full p-5 rounded-none text-left border transition-all relative group
                        ${isDisabled 
                          ? 'border-neutral-800 text-neutral-700 cursor-not-allowed bg-transparent' 
                          : 'border-neutral-800 bg-neutral-900/40 hover:border-red-800/50 hover:bg-neutral-800/80 text-neutral-400 hover:text-neutral-100'}
                        ${currentQuestion.specialEffect === 'shattered' ? 'skew-x-12 opacity-80' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-serif italic text-lg ${currentQuestion.specialEffect === 'shattered' ? 'shattered-text' : ''}`}>
                          <span className="mr-4 opacity-20 font-mono not-italic text-sm">{opt.id}.</span>
                          {opt.text}
                        </span>
                        <span className="text-[10px] text-neutral-700 opacity-0 group-hover:opacity-100 font-mono tracking-tighter transition-opacity uppercase">
                          {currentQuestion.id > 25 ? 'VOID_ECHO' : 'SELECT_DATA'}
                        </span>
                      </div>
                      {!isDisabled && (
                        <div className="absolute inset-0 border border-red-600/0 group-hover:border-red-600/20 transition-colors pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {showQ24Overlay && (
              <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/60">
                <div className="relative w-full h-full">
                   <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="absolute top-[20%] left-[10%] text-red-700 font-bold text-2xl rotate-[-5deg]">“你作业写完没？”</motion.p>
                   <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0 }} className="absolute top-[35%] right-[15%] text-red-700 font-bold text-xl rotate-[12deg]">“等我一下。”</motion.p>
                   <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-[40%] left-[25%] text-red-700 font-bold text-2xl">“老师来了老师来了。”</motion.p>
                   <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.0 }} className="absolute top-[10%] right-[30%] text-red-700 font-bold text-3xl rotate-[-15deg]">“别笑了。”</motion.p>
                   <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.5 }} className="absolute bottom-[20%] right-[20%] text-red-700 font-bold text-xl">“谁还没走？”</motion.p>
                   <motion.p 
                    initial={{ opacity: 0, scale: 1.2 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ delay: 3.0, duration: 0.5 }} 
                    className="absolute inset-0 flex items-center justify-center text-red-600 font-black text-4xl bg-black/80"
                   >
                    那个人为什么拿着颜料？
                   </motion.p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {gameState === 'ENDING' && (
          <motion.div 
            key="ending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-3xl overflow-y-auto px-4 py-12 hide-scrollbar z-50"
          >
            <div className={`p-8 md:p-12 bg-neutral-950 border border-neutral-800 shadow-2xl relative overflow-hidden`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-neutral-900 overflow-hidden">
                <div className={`h-full opacity-50 ${endingType === 'A' ? 'bg-blue-600' : endingType === 'C' ? 'bg-purple-600' : 'bg-red-600'}`}></div>
              </div>

              {endingType === 'A' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6 text-blue-500">
                    <Sparkles size={40} strokeWidth={1} />
                    <h2 className="text-4xl font-light tracking-tighter uppercase">结局 A：大梦一场</h2>
                  </div>
                  <div className="text-neutral-400 font-sans leading-relaxed space-y-6 text-lg tracking-tight">
                    <p className="first-letter:text-4xl first-letter:font-light first-letter:mr-1 first-letter:text-blue-600">你在病床上惊醒。灰发的{gender === 'female' ? '女孩' : '男生'}用比家属还要悲伤的态度宣告你的痊愈，粉发的女孩似乎收起了什么水母。曾经的学姐坐在不远处，她已经走向了星辰大海，曾经的不治之症也已痊愈，很难看出她在想些什么。</p>
                    <p>十五年过去了。你时常会看着各种纪录片，想象自己当年如果真的留下会发生什么，心里五味杂陈。在两周前，你卑鄙的竞争对手雇佣了忆者把你困在了梦中，让你一遍遍重温当年的惨状，兴许你心底仍然不敢确定，自己真的从当年的灾难中活了下来。在几个冒充医生的愚者前来捣乱之后，你的家人最终选择委托星穹列车来帮忙，他们最终成功地“像拔萝卜一样”给你救了出来。</p>
                    <p className="italic text-neutral-500 border-l border-blue-900/30 pl-4">大家寒暄了几句，没人提起梦中的事情。你非常感谢他们给你留下了一点隐私，主动给开拓者加了60星琼。</p>
                  </div>
                </div>
              )}

              {endingType === 'B' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6 text-red-600">
                    <Ghost size={40} strokeWidth={1} />
                    <h2 className="text-4xl font-light tracking-tighter uppercase">结局 B：幻造种幽灵</h2>
                  </div>
                  <div className="text-neutral-400 font-sans leading-relaxed space-y-6 text-lg tracking-tight">
                    <p className="first-letter:text-4xl first-letter:font-light first-letter:mr-1 first-letter:text-red-700">你终于回到了现实。看见自己半透明的身体，恐怕你不得不承认，自己只是一个被困在记忆中的幻造种罢了。</p>
                    <p>也许你可以开启新的生活了，这真的可能吗，这能被完成吗？由于动静有点大，异常防御部已经赶来了，在他们把你带走登记前，你给帮助你的一行人提供了当年藏的几个宝箱作为感谢（+60星琼）。</p>
                  </div>
                </div>
              )}

              {endingType === 'C' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6 text-purple-500">
                    <Library size={40} strokeWidth={1} />
                    <h2 className="text-4xl font-light tracking-tighter uppercase">结局 C：虚无的疗愈</h2>
                  </div>
                  <div className="text-neutral-400 font-sans leading-relaxed space-y-6 text-lg tracking-tight">
                    <p className="first-letter:text-4xl first-letter:font-light first-letter:mr-1 first-letter:text-purple-700">你恢复了清醒，向眼前的无名客道了谢。是啊，你不知自己早已死去，当年的你实在是物理上的天真的要命。什么东西能吞噬光线和声音，又是什么能让人碰一下也有这种能力？是虚无命途的力量啊！在十五年前的血案中，你不自量力地尝试掌控这股力量，最终只是加快了自己死亡的速度，残存的不甘和执念让你始终没有彻底消散，直到又一轮幻月满盈，高涨的愿力让你这个本来不足以出现的血罪灵重现世间。</p>
                    <p>在你想通的同时，你的身体也随之逐渐消散。要是当年没有留下了就好了。往好处想，你的消散给开拓者爆了一些时尚小垃圾（+60星琼）</p>
                  </div>
                </div>
              )}

              <button 
                onClick={() => window.location.reload()}
                className="mt-16 w-full py-5 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all text-neutral-600 font-mono text-[10px] uppercase tracking-[0.3em] hover:text-neutral-300"
              >
                Terminate_Process_REBOOT
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>

      {/* Bottom Decorative Grid */}
      <div className="w-full h-20 border-t border-neutral-800 flex items-center px-8 bg-neutral-900/40 z-20 shrink-0">
        <div className="grid grid-cols-3 md:grid-cols-6 w-full gap-4">
          <div className="h-10 border border-neutral-800 flex items-center justify-center opacity-40">
            <span className="text-[10px] font-mono text-neutral-600 uppercase">Data_01</span>
          </div>
          <div className={`h-10 border flex items-center justify-center transition-colors ${currentIndex > 20 ? 'border-red-900/50 bg-red-950/10' : 'border-neutral-800 opacity-40'}`}>
            <span className={`text-[10px] font-mono uppercase ${currentIndex > 20 ? 'text-red-700' : 'text-neutral-600'}`}>Red_Skies</span>
          </div>
          <div className="h-10 border border-neutral-800 flex items-center justify-center opacity-40">
            <span className="text-[10px] font-mono text-neutral-600 uppercase">Data_03</span>
          </div>
          <div className="hidden md:flex h-10 border border-neutral-800 items-center justify-center opacity-40">
            <span className="text-[10px] font-mono text-neutral-600 uppercase text-center leading-none">Library_Key<br/>Missing</span>
          </div>
          <div className="hidden md:flex h-10 border border-neutral-800 items-center justify-center opacity-40">
            <span className="text-[10px] font-mono text-neutral-600 uppercase">Data_05</span>
          </div>
          <div className={`h-10 border flex items-center justify-center transition-colors ${currentIndex > 34 ? 'border-green-900/50 bg-green-950/10' : 'border-neutral-800 opacity-40'}`}>
            <span className={`text-[10px] font-mono uppercase ${currentIndex > 34 ? 'text-green-700' : 'text-neutral-600'}`}>Wake_Up</span>
          </div>
        </div>
      </div>

      {/* CSS Stains Overlay */}
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-20 mix-blend-multiply pointer-events-none z-0">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#450a0a" d="M44.7,-76.4C58.3,-69.2,70,-57.9,78.7,-44.6C87.4,-31.3,93.1,-15.7,92.5,-0.3C91.9,15,85.1,30.1,75.4,43.2C65.7,56.3,53.2,67.5,39.1,74.7C25,81.8,9.4,85,-6.3,82.9C-21.9,80.8,-37.6,73.4,-51.1,63.1C-64.6,52.8,-75.9,39.5,-81.8,24.8C-87.7,10.2,-88.2,-5.7,-84.6,-20.9C-80.9,-36.1,-73.2,-50.5,-61.2,-58.3C-49.3,-66.1,-33.1,-67.2,-19,-73.1C-4.8,-79,7.4,-89.7,21.9,-91.1C36.4,-92.5,53.1,-84.6,44.7,-76.4Z" transform="translate(100 100) scale(0.8) rotate(-20)" />
        </svg>
      </div>

      <style>{`
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .animate-glitch {
          animation: glitch 0.2s infinite;
        }
        .blood-handprint {
          width: 240px;
          height: 240px;
          background-color: #5c0000;
          opacity: 0.6;
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M20,50 Q20,20 50,20 Q80,20 80,50 Q80,80 50,80 Q20,80 20,50 M30,30 Q35,10 40,30 M50,25 Q50,5 55,25 M65,30 Q70,10 75,30' fill='black'/%3E%3C/svg%3E");
          mask-size: contain;
          mask-repeat: no-repeat;
          filter: blur(1px) drop-shadow(0 0 5px #7a0000);
          transform: rotate(15deg);
        }
        .horror-border {
          box-shadow: inset 0 0 100px #300000, 0 0 20px #5c0000;
          border-color: #5c0000 !important;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .shattered-text {
          display: inline-block;
          transform: skew(-10deg) rotate(-2deg);
          letter-spacing: -2px;
          filter: blur(0.5px);
        }
      `}</style>
    </div>
  );
}
