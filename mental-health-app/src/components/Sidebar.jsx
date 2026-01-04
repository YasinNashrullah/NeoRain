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
const Sidebar = ({ activeTab, setActiveTab, onLogout, userData, theme, toggleTheme, currentMood }) => {

  // Mood Configuration (Consistent with BottomNav)
  const moodConfig = {
    happy: {
      // Gradients for animation
      primaryGradient: 'linear-gradient(135deg, #ec4899, #a855f7, #6366f1)', // pink-500, purple-500, indigo-500
      activeGradient: 'linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6)',
      iconBgGradient: 'linear-gradient(135deg, #ec4899, #9333ea, #4f46e5)',
      iconGlowGradient: 'linear-gradient(135deg, #ec4899, #9333ea)',

      // Text Gradients (CSS class for clip-text)
      textGradientClass: 'from-pink-600 via-purple-500 to-indigo-600 dark:from-pink-300 dark:via-purple-300 dark:to-indigo-300',

      // Borders & Colors
      activeBorder: 'border-pink-500 dark:border-pink-400',
      iconColor: 'text-pink-500',
      glow: 'shadow-[0_0_8px_rgba(236,72,153,1)]',
      dropShadow: 'drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]',
      bgGlow: 'bg-pink-500',
      analyzeBtn: {
        border: 'border-pink-500 dark:border-pink-400',
        smallIcon: 'text-pink-500',
        dot: 'linear-gradient(135deg, #f472b6, #a855f7)'
      }
    },
    sad: {
      primaryGradient: 'linear-gradient(135deg, #6366f1, #3b82f6, #06b6d4)', // indigo-500, blue-500, cyan-500
      activeGradient: 'linear-gradient(90deg, #6366f1, #3b82f6, #06b6d4)',
      iconBgGradient: 'linear-gradient(135deg, #6366f1, #2563eb, #0891b2)',
      iconGlowGradient: 'linear-gradient(135deg, #6366f1, #2563eb)',

      textGradientClass: 'from-indigo-600 via-blue-500 to-cyan-600 dark:from-indigo-300 dark:via-blue-300 dark:to-cyan-300',

      activeBorder: 'border-indigo-500 dark:border-indigo-400',
      iconColor: 'text-indigo-500',
      glow: 'shadow-[0_0_8px_rgba(99,102,241,1)]',
      dropShadow: 'drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]',
      bgGlow: 'bg-indigo-500',
      analyzeBtn: {
        border: 'border-indigo-500 dark:border-indigo-400',
        smallIcon: 'text-indigo-500',
        dot: 'linear-gradient(135deg, #818cf8, #3b82f6)'
      }
    },
    angry: {
      primaryGradient: 'linear-gradient(135deg, #f97316, #ef4444, #f43f5e)', // orange-500, red-500, rose-500
      activeGradient: 'linear-gradient(90deg, #f97316, #ef4444, #f43f5e)',
      iconBgGradient: 'linear-gradient(135deg, #f97316, #dc2626, #e11d48)',
      iconGlowGradient: 'linear-gradient(135deg, #f97316, #dc2626)',

      textGradientClass: 'from-orange-600 via-red-500 to-rose-600 dark:from-orange-300 dark:via-red-300 dark:to-rose-300',

      activeBorder: 'border-orange-500 dark:border-orange-400',
      iconColor: 'text-orange-500',
      glow: 'shadow-[0_0_8px_rgba(249,115,22,1)]',
      dropShadow: 'drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]',
      bgGlow: 'bg-orange-500',
      analyzeBtn: {
        border: 'border-orange-500 dark:border-orange-400',
        smallIcon: 'text-orange-500',
        dot: 'linear-gradient(135deg, #fb923c, #ef4444)'
      }
    },
    calm: {
      primaryGradient: 'linear-gradient(135deg, #06b6d4, #14b8a6, #10b981)', // cyan-500, teal-500, emerald-500
      activeGradient: 'linear-gradient(90deg, #06b6d4, #14b8a6, #10b981)',
      iconBgGradient: 'linear-gradient(135deg, #06b6d4, #0d9488, #059669)',
      iconGlowGradient: 'linear-gradient(135deg, #06b6d4, #0d9488)',

      textGradientClass: 'from-cyan-600 via-teal-500 to-emerald-600 dark:from-cyan-300 dark:via-teal-300 dark:to-emerald-300',

      activeBorder: 'border-cyan-500 dark:border-cyan-400',
      iconColor: 'text-cyan-500',
      glow: 'shadow-[0_0_8px_rgba(6,182,212,1)]',
      dropShadow: 'drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]',
      bgGlow: 'bg-cyan-500',
      analyzeBtn: {
        border: 'border-cyan-500 dark:border-cyan-400',
        smallIcon: 'text-cyan-500',
        dot: 'linear-gradient(135deg, #22d3ee, #14b8a6)'
      }
    },
    energetic: {
      primaryGradient: 'linear-gradient(135deg, #eab308, #f59e0b, #f97316)', // yellow-500, amber-500, orange-500
      activeGradient: 'linear-gradient(90deg, #eab308, #f59e0b, #f97316)',
      iconBgGradient: 'linear-gradient(135deg, #eab308, #d97706, #ea580c)',
      iconGlowGradient: 'linear-gradient(135deg, #eab308, #d97706)',

      textGradientClass: 'from-yellow-600 via-amber-500 to-orange-600 dark:from-yellow-300 dark:via-amber-300 dark:to-orange-300',

      activeBorder: 'border-yellow-500 dark:border-yellow-400',
      iconColor: 'text-yellow-500',
      glow: 'shadow-[0_0_8px_rgba(234,179,8,1)]',
      dropShadow: 'drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]',
      bgGlow: 'bg-yellow-500',
      analyzeBtn: {
        border: 'border-yellow-500 dark:border-yellow-400',
        smallIcon: 'text-yellow-500',
        dot: 'linear-gradient(135deg, #facc15, #f59e0b)'
      }
    }
  };

  const activeStyle = moodConfig[currentMood] || moodConfig.sad;

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
              <motion.div
                className="absolute inset-0 rounded-3xl blur-lg opacity-70 animate-pulse"
                animate={{ background: 'linear-gradient(135deg, #ec4899, #a855f7, #6366f1)' }}
                transition={{ duration: 1 }}
              />
              <motion.div
                className="relative w-full h-full rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 overflow-hidden"
                animate={{ background: 'linear-gradient(135deg, #ec4899, #a855f7, #6366f1)' }}
                transition={{ duration: 1 }}
              >
                <img
                  src={logo}
                  alt="NeoRain Logo"
                  className="w-24 h-24 object-contain brightness-0 invert drop-shadow-md"
                />
              </motion.div>
            </motion.div>
            <div>
              <motion.h1
                className="text-2xl font-black text-transparent bg-gradient-to-r from-pink-600 via-purple-500 to-indigo-600 dark:from-pink-300 dark:via-purple-300 dark:to-indigo-300 bg-clip-text leading-none bg-[length:200%_auto]"
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
                        <p className="text-base font-black dark:text-white text-slate-800 leading-none">Analisis AI</p>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{ willChange: "transform" }}
                        >
                          <Zap className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" />
                        </motion.div>
                      </div>
                      <p className="text-xs dark:text-slate-400 text-slate-500 font-medium">
                        Mulai Diagnosis Sekarang
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
                        background: activeStyle.activeGradient,
                        backgroundSize: '200% 100%'
                      }}
                      transition={smoothTransition}
                    />
                    <motion.div
                      layoutId="activeNav"
                      className={`absolute inset-0 dark:bg-[#1e1b4b]/50 bg-white/60 rounded-xl border ${activeStyle.activeBorder} border-white/50`}
                      transition={smoothTransition}
                    />
                  </>
                )}

                <div className={`relative flex items-center gap-3 px-5 rounded-xl transition-all duration-200 ${isActive ? 'dark:text-white text-slate-900' : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}>

                  <item.icon
                    className={`w-[18px] h-[18px] transition-all duration-300 ${isActive
                      ? `${activeStyle.iconColor} ${activeStyle.dropShadow}`
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
                      <div className={`w-1.5 h-1.5 ${activeStyle.bgGlow} rounded-full ${activeStyle.glow}`} />
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