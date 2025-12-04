import React from 'react';
import { motion } from 'framer-motion';
import {
  Home, BarChart2, User, MessageCircle,
  Heart, LogOut, BrainCircuit, Sparkles, Zap
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, userData, currentTheme }) => {

  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'tracker', label: 'Mood Tracker', icon: Heart },
    { id: 'stats', label: 'Statistics', icon: BarChart2 },
    { id: 'chat', label: 'Chat AI', icon: MessageCircle },
    { id: 'profile', label: 'Profiles', icon: User },
  ];

  // Konfigurasi animasi transisi (geser)
  const springTransition = {
    type: "spring",
    stiffness: 400,
    damping: 30
  };

  return (
    <div className={`hidden md:flex flex-col w-72 h-screen ${currentTheme?.sidebarBg || 'bg-[#0a0a12]'} relative overflow-hidden transition-colors duration-700`}>

      {/* Animated Blob Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 -left-10 w-64 h-64 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 -right-10 w-56 h-56 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-br from-pink-600/10 to-purple-600/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* === CONTENT CONTAINER === */}
      <div className="relative z-10 flex flex-col h-full px-5 py-6">

        {/* === HEADER LOGO === */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 flex items-center justify-center group">
              {/* Logo Border - Static Glow */}
              <div className="absolute inset-0 rounded-2xl border-2 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] group-hover:border-purple-500/60 transition-all duration-500" />

              <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black leading-none">
                <span className={`text-transparent bg-gradient-to-r ${currentTheme?.primary || 'from-pink-400 via-purple-400 to-cyan-400'} bg-clip-text transition-all duration-700`}>
                  NeoRain
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 font-semibold tracking-wide mt-0.5">Mental Health AI</p>
            </div>
          </div>
        </motion.div>

        {/* === HERO FEATURE: ANALYZE AI (Organic Blob Shape) === */}
        <motion.div
          className="mb-8 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.button
            onClick={() => setActiveTab('analyze')}
            className="rounded-[1.5rem] relative w-full group overflow-visible outline-none"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {activeTab === 'analyze' && (
              <>
                {/* Active Border Glow (Shared Transition) */}
                <motion.div
                  layoutId="activeNavBorder"
                  className="absolute -inset-1 rounded-[2rem] opacity-60 blur-sm z-0"
                  style={{
                    background: currentTheme?.activeBorder || 'linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6)',
                    backgroundSize: '200% 100%'
                  }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 30 }}
                />
                {/* Active Background (Shared Transition) */}
                <motion.div
                  layoutId="activeNav"
                  className={`absolute inset-0 ${currentTheme?.activeBg || 'bg-[#1e1b4b]/80'} rounded-[1.5rem] border border-purple-500/50 z-0 transition-colors duration-700`}
                  transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 30 }}
                />
              </>
            )}

            {/* Animated Glow Blob */}
            <motion.div
              className="absolute -inset-3 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 opacity-50 blur-2xl group-hover:opacity-80 transition-opacity duration-500"
              animate={{
                borderRadius: ["60% 40% 30% 70%/60% 30% 70% 40%", "40% 60% 70% 30%/40% 70% 30% 60%", "60% 40% 30% 70%/60% 30% 70% 40%"],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              style={{ borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%" }}
            />

            {/* Main Card with Organic Shape */}
            <motion.div
              className={`relative bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 backdrop-blur-xl shadow-2xl overflow-hidden ${activeTab === 'analyze'
                  ? `shadow-[0_0_40px_${currentTheme?.glowColor || 'rgba(168,85,247,0.6)'}]`
                  : ''
                }`}
              animate={{
                borderRadius: ["50% 50% 45% 55%/50% 50% 50% 50%", "45% 55% 50% 50%/55% 45% 50% 50%", "50% 50% 45% 55%/50% 50% 50% 50%"],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ borderRadius: "50% 50% 45% 55%/50% 50% 50% 50%" }}
            >
              {/* Inner Border Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 blur-sm"></div>

              {/* Content */}
              <div className="relative px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Floating Icon */}
                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, 5, 0, -5, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full blur-xl opacity-70"></div>
                    <div className="relative p-3 bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 shadow-2xl"
                      style={{ borderRadius: "45% 55% 50% 50%/50% 60% 40% 50%" }}>
                      <BrainCircuit className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                  </motion.div>

                  {/* Text */}
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-black text-white leading-none">Analyze AI</p>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Zap className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" />
                      </motion.div>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      Start AI Diagnosis Now
                    </p>
                  </div>
                </div>

                {/* Pulsing Indicator */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 bg-gradient-to-br from-pink-400 to-purple-500 shadow-lg shadow-purple-500/50"
                  style={{ borderRadius: "50% 50% 40% 60%" }}
                />
              </div>

              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
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
                    style={{ left: `${30 + i * 20}%`, top: "50%" }}
                  />
                ))}
              </>
            )}
          </motion.button>
        </motion.div>

        {/* === NAVIGATION MENU === */}
        <div className="flex-1 overflow-y-auto space-y-2 px-2">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            Navigation
          </p>

          {menuItems.map((item, index) => {
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="relative w-full group outline-none"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Active Background & Border */}
                {isActive && (
                  <>
                    {/* Border Glow - Animasi Sekali (Swipe) */}
                    <motion.div
                      layoutId="activeNavBorder"
                      className="absolute -inset-0.5 rounded-xl opacity-60 blur-sm"
                      style={{
                        background: currentTheme?.activeBorder || 'linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6)',
                        backgroundSize: '200% 100%'
                      }}
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 0%'], // Swipe sekali
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }} // Stop setelah 0.8s
                    />
                    {/* Solid Background */}
                    <motion.div
                      layoutId="activeNav"
                      className={`absolute inset-0 ${currentTheme?.activeBg || 'bg-[#1e1b4b]/50'} rounded-xl border border-purple-500/30 transition-colors duration-700`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </>
                )}

                {/* Button Content */}
                <div className={`relative flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}>

                  {/* Icon */}
                  <item.icon
                    className={`w-[18px] h-[18px] transition-all duration-300 ${isActive
                        ? `${currentTheme?.accent || 'text-cyan-400'} drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]`
                        : 'group-hover:text-purple-400'
                      }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>

                  {/* Active Indicator Dot */}
                  {isActive && (
                    <motion.div
                      className="ml-auto relative"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(34,211,238,1)] ${currentTheme?.accent ? currentTheme.accent.replace('text-', 'bg-') : 'bg-cyan-400'}`} />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* === PROFILE CARD === */}
        <div className="mt-6 pt-6 border-t border-purple-500/10">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.name || 'User'}`}
              alt="User"
              className="w-10 h-10 rounded-full bg-slate-800 border border-purple-500/20"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{userData?.name || 'Pengguna'}</p>
              <p className="text-[11px] text-slate-500 truncate">user@mail.com</p>
            </div>
            <button onClick={onLogout} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;