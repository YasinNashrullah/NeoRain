import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CloudRain, Sun, Moon, MapPin,
  Smile, Frown, Zap, Wind, Cloud,
  ArrowRight, MessageCircle, Quote, Activity, Heart
} from 'lucide-react';

const Home = ({ userData, currentMood, setCurrentMood, onStartAnalysis, onNavigate, lastAssessment }) => {
  const [timeGreeting, setTimeGreeting] = useState('Pagi');
  const [weather, setWeather] = useState({ temp: 28, condition: 'Cerah', icon: Sun });
  const [isPlayingRain, setIsPlayingRain] = useState(false);
  const [gratitudeText, setGratitudeText] = useState('');

  const rainAudioRef = useRef(new Audio('/rain.mp3'));

  const displayMood = currentMood === 'default' ? 'calm' : currentMood;

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

  // Dynamic Recommendation Logic
  const isNegativeMood = ['angry', 'sad'].includes(displayMood);
  const recTitle = isNegativeMood ? "Butuh Teman Cerita?" : "Jaga Kesehatan Mentalmu";
  const recDesc = isNegativeMood
    ? "Perasaanmu valid. Jangan dipendam sendiri. Ceritakan pada AI sekarang."
    : "Lakukan pengecekan rutin untuk mengetahui kondisi mentalmu saat ini.";
  const recBtnText = isNegativeMood ? "Cerita ke AI" : "Mulai Analisis";
  const recAction = isNegativeMood ? () => onNavigate('chat') : onStartAnalysis;

  // Deep Quotes Data
  const quotesData = {
    happy: [
      "Nikmati bahagiamu, tapi jangan lupa simpan sedikit cahayanya untuk hari yang mendung.",
      "Senyummu hari ini adalah bukti bahwa kamu pernah melewati badai dan bertahan.",
      "Kebahagiaan bukan tujuan, tapi cara kita menjalani perjalanan ini."
    ],
    calm: [
      "Di dalam ketenangan, kamu akan menemukan jawaban yang selama ini bising sembunyikan.",
      "Bernapaslah. Kamu aman. Kamu cukup. Kamu berharga.",
      "Kadang, hal paling produktif yang bisa kamu lakukan adalah beristirahat dan memulihkan diri."
    ],
    sad: [
      "Tidak apa-apa untuk tidak baik-baik saja. Hujan pun perlu turun agar bunga bisa mekar.",
      "Menangislah jika perlu. Air mata adalah cara hatimu berbicara saat bibir tak sanggup menjelaskan.",
      "Luka ini nyata, tapi begitu juga kekuatanmu untuk sembuh. Pelan-pelan saja."
    ],
    angry: [
      "Di balik amarahmu, mungkin ada lelah yang minta dipeluk. Istirahatlah sejenak.",
      "Api amarah bisa membakar hutan, atau menghangatkan rumah. Pilih bagaimana kamu menyalurkannya.",
      "Tarik napas dalam. Jangan biarkan emosi sesaat merusak perjalanan panjangmu."
    ],
    manic: [
      "Pelan-pelan. Kamu tidak harus menyelesaikan dunia hari ini.",
      "Satu langkah kecil lebih berharga daripada seribu langkah dalam pikiran yang tak berujung.",
      "Pijakkan kakimu ke bumi. Rasakan napasmu. Kamu ada di sini, sekarang."
    ]
  };

  const selectedQuote = useMemo(() => {
    const moodQuotes = quotesData[displayMood] || quotesData.calm;
    return moodQuotes[Math.floor(Math.random() * moodQuotes.length)];
  }, [displayMood]);

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

      <div className="flex-1 overflow-y-auto pb-24 relative z-10 scrollbar-hide px-6">

        {/* Header */}
        <div className="pt-8 pb-6 flex justify-between items-start">
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

        {/* Daily Quote (Banner) */}
        <div className="mb-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
            <Quote className="absolute top-4 right-4 w-12 h-12 text-white/5 rotate-12" />
            <p className="text-base text-slate-200 italic relative z-10 font-serif leading-relaxed">
              "{selectedQuote}"
            </p>
            <p className="text-xs text-slate-500 mt-4 font-bold tracking-wider">— Neo</p>
          </div>
        </div>

        {/* Mood Scanner */}
        <div className="mb-8">
          <div className="flex gap-3 overflow-x-auto py-6 scrollbar-hide">
            {moods.map((m) => (
              <button
                key={m.id}
                onClick={() => setCurrentMood(m.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 min-w-[80px] ${displayMood === m.id
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

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column (Focus & Action) */}
          <div className="flex flex-col gap-6">

            {/* Recommendation Card */}
            <motion.div
              key={displayMood}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl p-6 border border-white/10 group min-h-[220px] flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-[10px] font-bold px-2 py-1 rounded text-white">
                    AI RECOMMENDATION
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/50 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{recTitle}</h3>
                <p className="text-sm text-slate-300 mb-6 leading-relaxed">{recDesc}</p>
                <button
                  onClick={recAction}
                  className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
                >
                  {recBtnText}
                </button>
              </div>
            </motion.div>

            {/* Breathing Widget */}
            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/5 rounded-3xl p-6 flex items-center justify-between relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-white font-bold mb-1">Tarik Napas</h4>
                <p className="text-xs text-slate-400 max-w-[150px]">Ikuti lingkaran ini untuk menenangkan pikiranmu.</p>
              </div>
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping opacity-20"></div>
                <div className="w-12 h-12 bg-indigo-500 rounded-full animate-[pulse_4s_ease-in-out_infinite] shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
              </div>
            </div>

          </div>

          {/* Right Column (Tools & Tracking) */}
          <div className="flex flex-col gap-6">

            {/* Gratitude Journal */}
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-pink-500" />
                <h4 className="text-white font-bold text-sm">Gratitude Journal</h4>
              </div>
              <input
                type="text"
                value={gratitudeText}
                onChange={(e) => setGratitudeText(e.target.value)}
                placeholder="Satu hal yang kamu syukuri hari ini..."
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => onNavigate('chat')}
                className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex flex-col gap-3 hover:bg-slate-800 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Cerita AI</h4>
                  <p className="text-xs text-slate-500">Teman cerita 24/7</p>
                </div>
              </div>
              <div
                onClick={toggleRain}
                className={`p-4 rounded-2xl border border-white/5 flex flex-col gap-3 transition-colors cursor-pointer group ${isPlayingRain ? 'bg-blue-900/30 border-blue-500/30' : 'bg-slate-900/50 hover:bg-slate-800'}`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  {isPlayingRain ? <span className="animate-pulse">❚❚</span> : <CloudRain className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Sleep Sound</h4>
                  <p className="text-xs text-slate-500">{isPlayingRain ? 'Playing...' : 'Hujan & Petir'}</p>
                </div>
              </div>
            </div>

            {/* Last Check-in */}
            {lastAssessment && (
              <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold">Terakhir Dicek</h4>
                    <p className="text-xs text-slate-400">
                      {new Date(lastAssessment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Stress Level</span>
                  <span className={`text-sm font-bold ${lastAssessment.stress_score > 14 ? 'text-red-400' : 'text-green-400'}`}>
                    {lastAssessment.stress_score > 14 ? 'Tinggi' : 'Normal'}
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;