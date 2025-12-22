import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Home, BarChart2, User, MessageCircle,
  Heart, LogOut, BrainCircuit, Sparkles, Zap, Target,
  Sun, Moon
} from 'lucide-react';

import logo from '../assets/neorain-logo-svg.svg';

// static data
const menuItems = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'tracker', label: 'Mood Tracker', icon: Heart },
  { id: 'action-plan', label: 'Action Plan', icon: Target },
  { id: 'chat', label: 'Chat AI', icon: MessageCircle },
  { id: 'profile', label: 'Profiles', icon: User },
];

const smoothTransition = {
  type: "spring",
  stiffness: 80,
  damping: 20
};

// animated background
// BackgroundBlobs removed for performance

// main component
const Sidebar = ({ activeTab, setActiveTab, onLogout, userData, theme, toggleTheme }) => {

  // memoize profile image url
  const profileImage = useMemo(() => {
    return userData?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.name || 'User'}`;
  }, [userData?.photo_url, userData?.name]);

  return (
    <div className={`hidden md:flex flex-col w-72 h-screen relative overflow-hidden transition-all duration-300 border-r
      dark:bg-[#0a0a12] dark:bg-none dark:border-none
      bg-[linear-gradient(0deg,#EEF1FF_0%,#D2DAFF_29%,#AAC4FF_66%,#B1B2FF_100%)] border-none
    `}>

      {/* render separated background */}
      <div className="dark:block hidden absolute inset-0 bg-gradient-to-b from-slate-950 to-[#0a0a12]"></div>

      {/* Container */}
      <div className="relative z-10 flex flex-col h-full px-5 py-6">

        {/* logo */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="relative w-12 h-12 flex items-center justify-center transform-gpu"
              whileHover={{ scale: 1.1, rotate: 180 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 rounded-3xl blur-lg opacity-70 animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 overflow-hidden">
                <img
                  src={logo}
                  alt="NeoRain Logo"
                  className="w-24 h-24 object-contain brightness-0 invert drop-shadow-md"
                />
              </div>
            </motion.div>
            <div>
              <motion.h1
                className="text-2xl font-black text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 dark:from-purple-300 dark:via-pink-300 dark:to-indigo-300 bg-clip-text leading-none bg-[length:200%_auto]"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                NeoRain
              </motion.h1>
              <p className="text-[11px] dark:text-slate-500 text-slate-500 font-semibold tracking-wide mt-0.5">Mental Health AI</p>
            </div>
          </div>
        </motion.div>

        {/* navigation list with analysis button */}
        <div className="flex-1 overflow-y-auto space-y-2 px-2 scrollbar-hide">

          {/* analysis AI button */}
          <motion.div
            className="mb-6 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.button
              onClick={() => setActiveTab('analyze')}
              className="rounded-[1.5rem] relative w-full group outline-none transform-gpu shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={smoothTransition}
            >
              {activeTab === 'analyze' && (
                <>
                  <motion.div
                    layoutId="activeNavBorder"
                    className="absolute -inset-0.5 rounded-[1.6rem] opacity-60 blur-sm z-0"
                    style={{
                      background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6)',
                      backgroundSize: '200% 100%'
                    }}
                    transition={smoothTransition}
                  />
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 dark:bg-[#1e1b4b]/80 bg-white/80 rounded-[1.5rem] z-0"
                    transition={smoothTransition}
                  />
                </>
              )}

              <motion.div
                className={`relative w-full h-full bg-gradient-to-br dark:from-slate-900 dark:via-purple-900/10 dark:to-slate-900 from-white via-purple-50 to-white border-2 dark:border-purple-500/30 border-white/60 p-1 overflow-hidden ${activeTab === 'analyze' ? 'border-purple-500 dark:border-purple-400' : ''}`}
                style={{ borderRadius: "1.5rem" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 blur-sm"></div>

                <div className="relative px-2 py-4 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{
                        y: [0, -8, 0],
                        rotate: [0, 5, 0, -5, 0],
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="relative"
                      style={{ willChange: "transform" }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full blur-xl opacity-70"></div>
                      <div className="relative p-3 bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 shadow-2xl"
                        style={{ borderRadius: "45% 55% 50% 50%/50% 60% 40% 50%" }}>
                        <BrainCircuit className="w-3 h-3 text-white" strokeWidth={2.5} />
                      </div>
                    </motion.div>

                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-base font-black dark:text-white text-slate-800 leading-none">Analyze AI</p>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{ willChange: "transform" }}
                        >
                          <Zap className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" />
                        </motion.div>
                      </div>
                      <p className="text-xs dark:text-slate-400 text-slate-500 font-medium">
                        Start AI Diagnosis Now
                      </p>
                    </div>
                  </div>

                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 bg-gradient-to-br from-pink-400 to-purple-500 shadow-lg shadow-purple-500/50"
                    style={{ borderRadius: "50% 50% 40% 60%" }}
                  />
                </div>

                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                  style={{ willChange: "transform" }}
                />
              </motion.div>

              {/* Floating Particles */}
              {activeTab === 'analyze' && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-purple-400 rounded-full"
                      initial={{ x: 0, y: 0, opacity: 0 }}
                      animate={{
                        x: [0, (i - 1) * 30, 0],
                        y: [0, -40, -60],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                      style={{ left: `${30 + i * 20}%`, top: "50%", willChange: "transform, opacity" }}
                    />
                  ))}
                </>
              )}
            </motion.button>
          </motion.div>

          <p className="px-3 text-[10px] font-bold dark:text-slate-500 text-slate-400 uppercase tracking-widest mb-1">
            Navigation
          </p>

          {menuItems.map((item, index) => {
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="relative w-full h-[40px] align-middle group outline-none"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <>
                    <motion.div
                      layoutId="activeNavBorder"
                      className="absolute -inset-0.5 rounded-xl opacity-60 blur-sm"
                      style={{
                        background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6)',
                        backgroundSize: '200% 100%'
                      }}
                      transition={smoothTransition}
                    />
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 dark:bg-[#1e1b4b]/50 bg-white/60 rounded-xl border dark:border-purple-500/30 border-white/50"
                      transition={smoothTransition}
                    />
                  </>
                )}

                <div className={`relative flex items-center gap-3 px-5 rounded-xl transition-all duration-200 ${isActive ? 'dark:text-white text-slate-900' : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}>

                  <item.icon
                    className={`w-[18px] h-[18px] transition-all duration-300 ${isActive
                      ? 'text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]'
                      : 'group-hover:text-purple-500'
                      }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>

                  {isActive && (
                    <motion.div
                      className="ml-auto relative"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,1)]" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* theme toggle and profile */}
        <div className="mt-6 pt-6 border-t dark:border-purple-500/10 border-white/20">



          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group">
            <img
              src={profileImage}
              alt="Profile"
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border dark:border-purple-500/20 border-white/50 object-cover"
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold dark:text-white text-slate-900 truncate">{userData?.name || 'Pengguna'}</p>
              <p className="text-[11px] text-slate-500 truncate">{userData?.email || ''}</p>
            </div>
            <button onClick={onLogout} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;