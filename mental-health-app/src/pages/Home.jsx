import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CloudRain, Sun, Moon, MapPin,
  Smile, Frown, Zap, Wind, Cloud,
  ArrowRight, MessageCircle
} from 'lucide-react';

const Home = ({ userData, currentMood, setCurrentMood }) => {
  const [timeGreeting, setTimeGreeting] = useState('Pagi');
  const [weather, setWeather] = useState({ temp: 28, condition: 'Cerah', icon: Sun });
  const displayMood = currentMood === 'default' ? 'calm' : currentMood;

  const moods = [
    { id: 'happy', label: 'Happy', icon: Smile, color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500/50' },
    { id: 'calm', label: 'Calm', icon: Wind, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/50' },
    { id: 'manic', label: 'Manic', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' },
    { id: 'angry', label: 'Angry', icon: Frown, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/50' },
    { id: 'sad', label: 'Sad', icon: CloudRain, color: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/50' },
  ];

  // Logic Realtime Waktu & Cuaca
  useEffect(() => {
    const updateTime = () => {
      const hours = new Date().getHours();
      if (hours >= 5 && hours < 11) setTimeGreeting('Selamat Pagi');
      else if (hours >= 11 && hours < 15) setTimeGreeting('Selamat Siang');
      else if (hours >= 15 && hours < 18) setTimeGreeting('Selamat Sore');
      else setTimeGreeting('Selamat Malam');

      // Simulasi Cuaca berdasarkan jam
      if (hours > 18 || hours < 6) setWeather({ temp: 24, condition: 'Cerah', icon: Moon });
      else setWeather({ temp: 30, condition: 'Panas', icon: Sun });
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col">

      {/* Ambient Glow */}
      <motion.div
        animate={{
          background: `radial-gradient(circle at 50% 0%, ${displayMood === 'happy' ? '#ec4899' :
              displayMood === 'angry' ? '#ea580c' :
                displayMood === 'manic' ? '#eab308' :
                  '#6366f1'
            } 0%, transparent 70%)`
        }}
        className="absolute top-0 left-0 w-full h-[500px] opacity-20 blur-3xl pointer-events-none transition-colors duration-1000 z-0"
      />

      <div className="flex-1 overflow-y-auto pb-24 relative z-10 scrollbar-hide">

        {/* header */}
        <div className="px-6 pt-8 pb-3 flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-xs mb-1">{timeGreeting},</p>
            <h1 className="text-2xl font-bold text-white leading-none capitalize">{userData?.name || "Bahlul"}</h1>
            {userData && (
              <span className="text-[10px] text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-500/20 mt-2 inline-block">
                {userData.role}
              </span>
            )}
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <weather.icon className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold text-white">{weather.temp}°C</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-slate-500 text-[10px]">
              <MapPin className="w-3 h-3" /> Yogyakarta
            </div>
          </div>
        </div>

        {/* mood scanner */}
        <div className="px-6 mb-6">
          <h2 className="text-slate-300 text-sm font-medium mb-1">Mood Scanner</h2>

          {/* container scroll */}
          <div className="flex gap-3 overflow-x-auto py-4 pb-4 -mx-6 px-6 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {moods.map((m) => (
              <button
                key={m.id}
                onClick={() => setCurrentMood(m.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 min-w-[70px] ${displayMood === m.id
                    ? `bg-white/10 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105`
                    : 'bg-transparent border-transparent opacity-50 hover:opacity-100'
                  }`}
              >
                <m.icon className={`w-6 h-6 ${m.color}`} />
                <span className="text-[10px] text-slate-300">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* recommendation card */}
        <div className="px-6 mb-6">
          <motion.div
            key={displayMood}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl p-6 border border-white/10 group"
          >
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-[10px] font-bold px-2 py-1 rounded text-white">
                  AI RECOMMENDATION
                </div>
                <ArrowRight className="w-5 h-5 text-white/50 group-hover:translate-x-1 transition-transform" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {displayMood === 'angry' ? "Dinginkan Kepala" :
                  displayMood === 'manic' ? "Salurkan Energimu" :
                    displayMood === 'happy' ? "Abadikan Momen" : "Tetap Fokus"}
              </h3>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                {displayMood === 'angry' ? `Terdeteksi stres tinggi. Coba teknik napas 4-7-8 sekarang.` :
                  displayMood === 'calm' ? "Mood yang pas untuk produktif. Lanjutkan tugas codingmu." :
                    "Tulis jurnal singkat tentang apa yang membuatmu merasa begini."}
              </p>

              <button className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-slate-200 transition-colors">
                Mulai Analisis
              </button>
            </div>
          </motion.div>
        </div>

        {/* quick action */}
        <div className="px-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex items-center gap-3 hover:bg-slate-800 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">Curhat AI</h4>
                <p className="text-xs text-slate-500">24/7 Ready</p>
              </div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex items-center gap-3 hover:bg-slate-800 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <CloudRain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">Sleep Sound</h4>
                <p className="text-xs text-slate-500">Hujan & Petir</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;