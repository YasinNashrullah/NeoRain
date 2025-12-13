import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Home, BarChart2, User, MessageCircle,
  Heart, LogOut, BrainCircuit, Sparkles, Zap, Target
} from 'lucide-react';

// data statis
const menuItems = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'tracker', label: 'Mood Tracker', icon: Heart },
  { id: 'action-plan', label: 'Action Plan', icon: Target },
  { id: 'chat', label: 'Chat AI', icon: MessageCircle },
  { id: 'profile', label: 'Profiles', icon: User },
];

const springTransition = {
  type: "spring",
  stiffness: 400,
  damping: 30
};

// background animasi
const BackgroundBlobs = React.memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
    <motion.div
      className="absolute top-10 -left-10 w-64 h-64 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full blur-3xl transform-gpu"
      animate={{
        scale: [1, 1.2, 1],
        x: [0, 20, 0],
        y: [0, -20, 0],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      style={{ willChange: "transform" }}
    />
    <motion.div
      className="absolute bottom-20 -right-10 w-56 h-56 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-full blur-3xl transform-gpu"
      animate={{
        scale: [1, 1.3, 1],
        x: [0, -30, 0],
        y: [0, 20, 0],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      style={{ willChange: "transform" }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-br from-pink-600/10 to-purple-600/10 rounded-full blur-2xl transform-gpu"
      animate={{
        scale: [1, 1.5, 1],
        rotate: [0, 180, 360],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      style={{ willChange: "transform" }}
    />
  </div>
));

// component utama
const Sidebar = ({ activeTab, setActiveTab, onLogout, userData }) => {

  // Memoize URL gambar agar tidak dihitung ulang tiap render
  const profileImage = useMemo(() => {
    return userData?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.name || 'User'}`;
  }, [userData?.photo_url, userData?.name]);

  return (
    <div className="hidden md:flex flex-col w-72 h-screen bg-[#0a0a12] relative overflow-hidden">

      {/* Render Background Terpisah */}
      <BackgroundBlobs />

      {/* Container */}
      <div className="relative z-10 flex flex-col h-full px-5 py-6">

        {/* Logo */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="relative w-12 h-12 flex items-center justify-center transform-gpu"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={springTransition}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 rounded-3xl blur-lg opacity-70 animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 rounded-3xl flex items-center justify-center shadow-2xl border border-purple-500/20">
                <Sparkles className="w-6 h-6 text-purple-300" strokeWidth={2.5} />
              </div>
            </motion.div>
            <div>
              <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text leading-none">
                NeoRain
              </h1>
              <p className="text-[11px] text-slate-500 font-semibold tracking-wide mt-0.5">Mental Health AI</p>
            </div>
          </div>
        </motion.div>

        {/* Analysis AI Button */}
        <motion.div
          className="mb-6 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.button
            onClick={() => setActiveTab('analyze')}
            className="rounded-[1.5rem] relative w-full group overflow-visible outline-none transform-gpu"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ ...springTransition, damping: 17 }}
          >
            {activeTab === 'analyze' && (
              <>
                <motion.div
                  layoutId="activeNavBorder"
                  className="absolute -inset-1 rounded-[2rem] opacity-60 blur-sm z-0"
                  style={{
                    background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6)',
                    backgroundSize: '200% 100%'
                  }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 30 }}
                />
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-[#1e1b4b]/80 rounded-[1.5rem] border border-purple-500/50 z-0"
                  transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 30 }}
                />
              </>
            )}

            {/* Static CSS for blur instead of animating heavily */}
            <div className="absolute -inset-3 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 opacity-50 blur-2xl group-hover:opacity-80 transition-opacity duration-500 rounded-[2rem]" />

            <motion.div
              className={`relative bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 backdrop-blur-xl shadow-2xl overflow-hidden transform-gpu ${activeTab === 'analyze'
                ? 'shadow-[0_0_40px_rgba(168,85,247,0.6)]'
                : ''
                }`}
              animate={{
                borderRadius: ["50% 50% 45% 55%/50% 50% 50% 50%", "45% 55% 50% 50%/55% 45% 50% 50%", "50% 50% 45% 55%/50% 50% 50% 50%"],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ borderRadius: "50% 50% 45% 55%/50% 50% 50% 50%", willChange: "border-radius" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 blur-sm"></div>

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
                      <p className="text-base font-black text-white leading-none">Analyze AI</p>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ willChange: "transform" }}
                      >
                        <Zap className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" />
                      </motion.div>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
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

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto space-y-2 px-2 scrollbar-hide">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
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
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 0%'],
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-[#1e1b4b]/50 rounded-xl border border-purple-500/30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </>
                )}

                <div className={`relative flex items-center gap-3 px-5 rounded-xl transition-all duration-200 ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}>

                  <item.icon
                    className={`w-[18px] h-[18px] transition-all duration-300 ${isActive
                      ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                      : 'group-hover:text-purple-400'
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
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,1)]" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Profile card */}
        <div className="mt-6 pt-6 border-t border-purple-500/10">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
            <img
              src={profileImage}
              alt="Profile"
              className="w-10 h-10 rounded-full bg-slate-800 border border-purple-500/20 object-cover"
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{userData?.name || 'Pengguna'}</p>
              <p className="text-[11px] text-slate-500 truncate">{userData?.email || ''}</p>
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