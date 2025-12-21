import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CloudRain, Sun, Moon, MapPin,
  Smile, Frown, Zap, Wind, Cloud,
  ArrowRight, MessageCircle, Quote, Activity, Heart,
  Flame, Music
} from 'lucide-react';
import { checkStreak } from '../utils/gamification';
import { api } from '../utils/api';

// static data constants
const moods = [
  { id: 'happy', label: 'Happy', icon: Smile, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-500/20', border: 'border-pink-200 dark:border-pink-500/50' },
  { id: 'calm', label: 'Calm', icon: Wind, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-500/20', border: 'border-cyan-200 dark:border-cyan-500/50' },
  { id: 'manic', label: 'Manic', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-500/20', border: 'border-yellow-200 dark:border-yellow-500/50' },
  { id: 'angry', label: 'Angry', icon: Frown, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-500/20', border: 'border-orange-200 dark:border-orange-500/50' },
  { id: 'sad', label: 'Sad', icon: CloudRain, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-500/20', border: 'border-indigo-200 dark:border-indigo-500/50' },
];

const quotesData = {
  happy: [
    "Nikmati bahagiamu, tapi jangan lupa simpan sedikit cahayanya.",
    "Senyummu hari ini adalah bukti kekuatanmu.",
    "Kebahagiaan bukan tujuan, tapi cara menjalani hidup."
  ],
  calm: [
    "Di dalam ketenangan, kamu akan menemukan jawaban.",
    "Bernapaslah. Kamu aman. Kamu cukup.",
    "Istirahat adalah bagian dari produktivitas."
  ],
  sad: [
    "Tidak apa-apa untuk tidak baik-baik saja.",
    "Air mata adalah cara hatimu berbicara.",
    "Luka ini nyata, tapi begitu juga kekuatanmu."
  ],
  angry: [
    "Di balik amarahmu, mungkin ada lelah yang minta dipeluk.",
    "Api amarah bisa membakar atau menghangatkan. Pilih bijak.",
    "Tarik napas dalam. Jangan biarkan emosi sesaat merusak."
  ],
  manic: [
    "Pelan-pelan. Kamu tidak harus menyelesaikan dunia hari ini.",
    "Satu langkah kecil lebih berharga daripada seribu langkah di pikiran.",
    "Pijakkan kakimu ke bumi. Rasakan napasmu."
  ]
};

// shared css classes
const cardBaseStyle = "bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[30px] p-6 relative overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300";
const hoverCardStyle = "cursor-pointer transition-all hover:shadow-md dark:hover:bg-white/5 hover:bg-white/90";

const containerVars = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const Home = ({ userData, currentMood, setCurrentMood, onStartAnalysis, onNavigate, onVerifyHistory, lastAssessment }) => {
  const [timeGreeting, setTimeGreeting] = useState('Pagi');
  const [streak, setStreak] = useState(0);
  const [isPlayingRain, setIsPlayingRain] = useState(false);
  const [gratitudeText, setGratitudeText] = useState('');

  const rainAudioRef = useRef(new Audio('/rain.mp3'));

  const displayMood = currentMood === 'default' ? 'calm' : currentMood;

  // audio logic
  useEffect(() => {
    rainAudioRef.current.loop = true;
    return () => {
      rainAudioRef.current.pause();
    };
  }, []);

  const toggleRain = () => {
    if (isPlayingRain) {
      rainAudioRef.current.pause();
    } else {
      rainAudioRef.current.play().catch(e => console.log("Audio play failed", e));
    }
    setIsPlayingRain(!isPlayingRain);
  };

  // time and streak logic
  useEffect(() => {
    const updateTime = () => {
      const hours = new Date().getHours();
      if (hours >= 5 && hours < 11) setTimeGreeting('Good Morning');
      else if (hours >= 11 && hours < 15) setTimeGreeting('Good Afternoon');
      else if (hours >= 15 && hours < 18) setTimeGreeting('Good Evening');
      else setTimeGreeting('Good Night');
    };
    updateTime();

    const initStreak = async () => {
      if (userData?.uid) {
        try {
          const gamification = await api.getGamification(userData.uid);
          const lastLogin = gamification?.last_login || new Date(Date.now() - 86400000).toISOString();
          const currentStreak = gamification?.streak || 0;
          const newStreak = checkStreak(lastLogin, currentStreak);
          setStreak(newStreak);
          await api.saveGamification(userData.uid, {
            ...gamification,
            streak: newStreak,
            last_login: new Date().toISOString()
          });
        } catch (e) {
          console.error("Failed to sync streak", e);
        }
      }
    };
    initStreak();
  }, [userData]);

  // dynamic content logic
  const isNegativeMood = ['angry', 'sad'].includes(displayMood);
  const recTitle = isNegativeMood ? "Butuh Teman Cerita?" : "Jaga Kesehatan Mentalmu";
  const recDesc = isNegativeMood
    ? "Perasaanmu valid. Jangan dipendam sendiri. Cek kondisimu sekarang."
    : "Lakukan pengecekan rutin untuk mengetahui kondisi mentalmu saat ini.";

  const recBtnText = "Mulai Analisis";
  const recAction = onStartAnalysis;

  const selectedQuote = useMemo(() => {
    const moodQuotes = quotesData[displayMood] || quotesData.calm;
    return moodQuotes[Math.floor(Math.random() * moodQuotes.length)];
  }, [displayMood]);

  return (
    <motion.div
      initial="hidden" animate="visible" variants={containerVars}
      className="w-full pb-32 md:pb-6 px-4 md:px-6 pt-6"
    >

      {/* header section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{timeGreeting},</p>
          <h1 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white capitalize tracking-tight">
            {userData?.name?.split(' ')[0] || "Teman"}
          </h1>
        </div>

        {/* streak widget */}
        <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 backdrop-blur-md md:px-6 md:py-4 py-2 px-4 rounded-full shadow-sm">
          <div className="p-1.5 bg-orange-100 dark:bg-orange-500/20 rounded-full">
            <Flame className="md:w-6 md:h-6 w-5 h-5 text-orange-500 animate-pulse" />
          </div>
          <div className="text-right">
            <p className="text-slate-800 dark:text-white font-bold mb-1 xl:mb-1.5 text-sm leading-none">{streak} Day</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider">Streak Login</p>
          </div>
        </div>
      </div>

      {/* quote banner */}
      <motion.div variants={itemVars} className="mb-8">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-100 dark:border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-sm dark:shadow-lg">
          <Quote className="absolute top-4 right-4 w-12 h-12 text-indigo-200 dark:text-white/5 rotate-12" />
          <p className="text-base md:text-lg text-indigo-900 dark:text-slate-200 italic relative z-10 font-serif leading-relaxed">
            "{selectedQuote}"
          </p>
          <p className="text-xs text-indigo-400 dark:text-slate-500 mt-4 font-bold tracking-wider">— Neo</p>
        </div>
      </motion.div>

      {/* main grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

        {/* mood scanner card */}
        <motion.div variants={itemVars} className={`md:col-span-2 ${cardBaseStyle}`}>
          <div className="flex items-center justify-between w-full overflow-x-auto pb-2 scrollbar-hide gap-2">
            {moods.map((m) => (
              <button
                key={m.id}
                onClick={() => setCurrentMood(m.id)}
                className={`relative flex-1 min-w-[80px] mx-2 my-2 flex flex-col items-center justify-center gap-3 py-4 rounded-2xl border transition-all duration-300 group ${displayMood === m.id
                  ? `${m.bg} ${m.border} shadow-md scale-105`
                  : 'bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:scale-[1.02]'
                  }`}
              >
                <div className={`p-2 rounded-full transition-colors duration-300 ${displayMood === m.id ? 'bg-white/60 dark:bg-white/10 shadow-sm' : 'bg-transparent group-hover:bg-white/50'}`}>
                  <m.icon className={`w-8 h-8 md:w-10 md:h-10 transition-transform duration-300 ${m.color} ${displayMood === m.id ? 'scale-110' : ''}`} />
                </div>

                <span className={`text-[10px] md:text-xs font-bold transition-colors ${displayMood === m.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700'}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* main action card */}
        <motion.div variants={itemVars} className={`row-span-2 ${cardBaseStyle} group flex flex-col justify-between`}>
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 transition-colors duration-500 ${isNegativeMood ? 'bg-orange-500' : 'bg-green-500'}`}></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-[10px] font-bold px-2 py-1 rounded text-white">
                AI RECOMMENDATION
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 dark:text-white/50 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{recTitle}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {recDesc}
            </p>
          </div>

          <button
            onClick={recAction}
            className="relative z-10 w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
          >
            {recBtnText}
          </button>
        </motion.div>

        {/* gratitude journal */}
        <motion.div variants={itemVars} className={`md:col-span-1 lg:col-span-2 ${cardBaseStyle}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-pink-100 dark:bg-pink-500/20 rounded-full text-pink-500"><Heart className="w-4 h-4" /></div>
            <h4 className="text-slate-800 dark:text-white font-bold text-sm">Gratitude Journal</h4>
          </div>
          <div className="relative">
            <input
              type="text"
              value={gratitudeText}
              onChange={(e) => setGratitudeText(e.target.value)}
              placeholder="Satu hal yang kamu syukuri hari ini..."
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-4 text-slate-800 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50 focus:bg-white dark:focus:bg-white/10 transition-all"
            />
          </div>
        </motion.div>

        {/* quick tools */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <motion.div variants={itemVars} onClick={() => onNavigate('chat')} className={`cursor-pointer rounded-[25px] p-5 flex flex-col gap-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/40 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/5 transition-all group shadow-sm dark:shadow-none`}>
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-800 dark:text-white font-medium text-sm">Cerita AI</h4>
              <p className="text-[10px] text-slate-500">Teman cerita 24/7</p>
            </div>
          </motion.div>

          <motion.div variants={itemVars} onClick={toggleRain} className={`cursor-pointer rounded-[25px] p-5 flex flex-col gap-3 border transition-all shadow-sm dark:shadow-none ${isPlayingRain ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-200 dark:border-blue-500/50' : 'bg-white/60 dark:bg-slate-900/60 border-white/40 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/5'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isPlayingRain ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-500 dark:text-blue-400'}`}>
              {isPlayingRain ? <span className="animate-pulse">❚❚</span> : <CloudRain className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-slate-800 dark:text-white font-medium text-sm">Sleep Sound</h4>
              <p className="text-[10px] text-slate-500">{isPlayingRain ? 'Playing...' : 'Hujan & Petir'}</p>
            </div>
          </motion.div>
        </div>

        {/* breathing widget */}
        <motion.div variants={itemVars} className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-white/40 to-white/60 dark:from-indigo-900/20 dark:to-purple-900/20 backdrop-blur-md border border-white/40 dark:border-white/5 p-6 flex items-center justify-between shadow-sm dark:shadow-none">
          <div className="relative z-10">
            <h4 className="text-slate-800 dark:text-white font-bold mb-1">Tarik Napas</h4>
            <p className="text-xs text-slate-500 max-w-[120px]">Ikuti lingkaran ini untuk menenangkan pikiranmu.</p>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full animate-ping opacity-20"></div>
            <div className="w-10 h-10 bg-indigo-500 rounded-full animate-[pulse_4s_ease-in-out_infinite] shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
          </div>
        </motion.div>

        {/* last statistics */}
        {lastAssessment && (
          <motion.div variants={itemVars} className={`md:col-span-2 lg:col-span-1 ${cardBaseStyle} flex items-center justify-between ${hoverCardStyle} hover:border-slate-300 dark:hover:border-white/20`} onClick={onVerifyHistory}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-slate-800 dark:text-white text-sm font-bold">Terakhir Dicek</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(lastAssessment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Stress Level</span>
              <span className={`text-sm font-bold ${lastAssessment.stress_score > 14 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                {lastAssessment.stress_score > 14 ? 'Tinggi' : 'Normal'}
              </span>
            </div>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
};

export default Home;