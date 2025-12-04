import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smile, Wind, Zap, Frown, CloudRain,
  Calendar, BarChart2, Clock, Trophy,
  Edit3, Star
} from 'lucide-react';
import { api } from '../utils/api';

const Tracker = ({ userData }) => {
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // State Data
  const [historyLogs, setHistoryLogs] = useState([]); // Data Harian
  const [weeklyLogs, setWeeklyLogs] = useState([]);   // Data Mingguan

  // Config Mood
  const moods = [
    { id: 'happy', label: 'Happy', icon: Smile, color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500/50', shadow: 'shadow-pink-500/30' },
    { id: 'calm', label: 'Calm', icon: Wind, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', shadow: 'shadow-cyan-500/30' },
    { id: 'manic', label: 'Manic', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', shadow: 'shadow-yellow-500/30' },
    { id: 'angry', label: 'Angry', icon: Frown, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/50', shadow: 'shadow-orange-500/30' },
    { id: 'sad', label: 'Sad', icon: CloudRain, color: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/50', shadow: 'shadow-indigo-500/30' },
  ];

  // --- FETCH DATA ---
  const fetchData = async () => {
    if (userData?.uid) {
      if (activeTab === 'daily') {
        const data = await api.getMoods(userData.uid);
        setHistoryLogs(data);
      } else if (activeTab === 'weekly') {
        const data = await api.getWeeklyMoods(userData.uid);
        setWeeklyLogs(data);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [userData, activeTab]);

  // --- SAVE MOOD ---
  const handleSaveMood = async () => {
    if (!selectedMood) return alert("Pilih mood dulu ya!");
    setIsSaving(true);

    const payload = {
      firebase_uid: userData?.uid,
      mood: selectedMood,
      note: note,
    };

    try {
      await api.saveMood(payload);
      setNote('');
      setSelectedMood(null);
      await fetchData(); // Refresh data
      alert("Mood berhasil disimpan!");
    } catch (error) {
      alert("Gagal menyimpan mood.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- HELPERS ---
  const getMoodConfig = (moodId) => moods.find(m => m.id === moodId) || moods[0];
  
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Helper: Grouping Data Mingguan berdasarkan Tanggal
  const groupLogsByDate = (logs) => {
    const groups = {};
    logs.forEach(log => {
      const dateKey = formatDate(log.created_at);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return groups;
  };

  // Helper: Mendapatkan Mood Dominan per Hari (Senin-Minggu)
  const getWeeklySummary = () => {
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    // Logic sederhana: mapping hari ke mood terakhir di hari itu (bisa dikembangkan jadi mood terbanyak)
    return days.map((day, index) => {
      // Cari log yang harinya cocok (index 0 = Senin di logic ini, perlu penyesuaian JS getDay)
      // JS getDay(): 0=Minggu, 1=Senin. Kita sesuaikan.
      const logForDay = weeklyLogs.find(log => {
        let dayNum = new Date(log.created_at).getDay(); // 0-6
        let adjustedDayNum = dayNum === 0 ? 6 : dayNum - 1; // 0=Senin, 6=Minggu
        return adjustedDayNum === index;
      });
      
      return { day, log: logForDay };
    });
  };

  return (
    <div className="w-full h-full bg-slate-950 text-white flex flex-col relative overflow-hidden">

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-indigo-900/20 blur-[100px] pointer-events-none"></div>

      {/* HEADER & TABS */}
      <div className="px-6 pt-8 pb-4 relative z-10">
        <h1 className="text-2xl font-bold text-center mb-6">Mood Tracker</h1>

        <div className="bg-slate-900 p-2 rounded-2xl flex relative border border-white/5">
          {['daily', 'weekly', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 mx-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              {tab === 'daily' && <Calendar className="w-4 h-4" />}
              {tab === 'weekly' && <Trophy className="w-4 h-4" />}
              {tab === 'stats' && <BarChart2 className="w-4 h-4" />}
              <span className="capitalize">{tab === 'daily' ? 'Harian' : tab === 'weekly' ? 'Mingguan' : 'Statistik'}</span>
            </button>
          ))}
          <motion.div
            layoutId="activeTab"
            className="absolute top-1.5 bottom-1.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30"
            initial={false}
            animate={{
              left: activeTab === 'daily' ? '6px' : activeTab === 'weekly' ? '33.3%' : '66.6%',
              width: '31%'
            }}
          />
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide relative z-10">
        <AnimatePresence mode='wait'>

          {/* --- TAB HARIAN --- */}
          {activeTab === 'daily' && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Input Card */}
              <div className="bg-slate-900 border border-white/10 rounded-[30px] p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <h2 className="text-sm text-slate-400 mb-1">Bagaimana Perasaanmu hari ini</h2>
                  <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2 capitalize">
                    {userData?.name || "Pengguna"} ? <span className="text-yellow-400">✨</span>
                  </h1>
                  
                  {/* Mood Selector */}
                  <div className="flex gap-3 overflow-x-auto py-4 pb-4 -mx-6 px-6 scrollbar-hide md:grid md:grid-cols-5 md:gap-6 md:mx-0 md:px-0 md:overflow-visible md:py-8">
                    {moods.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMood(m.id)}
                        className={`bg-red-900 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 min-w-[70px] ${selectedMood === m.id
                            ? `bg-white/10 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105`
                            : 'bg-transparent border-transparent opacity-50 hover:opacity-100'
                          }`}
                      >
                        <m.icon className={`w-6 h-6 ${m.color}`} />
                        <span className="text-[10px] text-slate-300">{m.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Input Note */}
                  <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 border border-white/5 focus-within:border-indigo-500/50 transition-colors mt-2">
                    <label className="text-xs font-bold text-slate-400 mb-2 block flex items-center gap-2">
                      <Edit3 className="w-3 h-3" /> Tambah catatan (opsional)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ceritakan sedikit..."
                      className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none resize-none h-20"
                    />
                  </div>

                  <button
                    onClick={handleSaveMood}
                    disabled={isSaving || !selectedMood}
                    className={`w-full py-4 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${isSaving || !selectedMood
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'
                      }`}
                  >
                    {isSaving ? "Menyimpan..." : "Simpan Mood"}
                  </button>
                </div>
              </div>

              {/* HISTORY LIST */}
              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                  Riwayat Mood <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{historyLogs.length}</span>
                </h3>
                <div className="space-y-3">
                  {historyLogs.map((log) => {
                    const config = getMoodConfig(log.mood);
                    return (
                      <div key={log.id} className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-slate-900/50">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bg}`}>
                          <config.icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-sm font-bold capitalize ${config.color}`}>{config.label}</span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {formatTime(log.created_at)}
                            </span>
                          </div>
                          {log.note && <p className="text-xs text-slate-300 italic">"{log.note}"</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* --- TAB MINGGUAN (SESUAI GAMBAR) --- */}
          {activeTab === 'weekly' && (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* 1. AWARD CARD */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[30px] p-6 text-center relative overflow-hidden shadow-xl shadow-indigo-900/50">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/30 shadow-lg">
                    <Star className="w-6 h-6 text-yellow-300 fill-current" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1">Bright Spark Award</h2>
                  <p className="text-3xl font-bold text-white mb-2">4.2<span className="text-sm text-white/60 font-normal">/5</span></p>
                  <p className="text-xs text-indigo-100 bg-white/10 inline-block px-3 py-1 rounded-full border border-white/10">
                    "Tetap cerah dan stabil, vibes positif! ✨"
                  </p>
                </div>
              </div>

              {/* 2. WEEKLY ROW (Sen-Min) */}
              <div className="bg-slate-900 border border-white/10 rounded-[30px] p-5">
                <h3 className="text-sm font-bold text-slate-300 mb-4">Tracking mood mingguan</h3>
                <div className="flex justify-between items-center">
                  {getWeeklySummary().map((item, idx) => {
                    const config = item.log ? getMoodConfig(item.log.mood) : null;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-medium uppercase">{item.day}</span>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                          config 
                            ? `${config.bg} ${config.border} scale-110` 
                            : 'bg-slate-800 border-white/5 opacity-50'
                        }`}>
                          {config ? <config.icon className={`w-4 h-4 ${config.color}`} /> : <div className="w-2 h-2 bg-slate-600 rounded-full"></div>}
                        </div>
                        {config && <span className="text-[8px] text-slate-400">{config.label}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. DETAIL LIST (Grouped by Date) */}
              <div className="bg-slate-900 border border-white/10 rounded-[30px] p-5">
                <h3 className="text-sm font-bold text-slate-300 mb-4">Detail mood minggu ini</h3>
                
                {weeklyLogs.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-4">Belum ada data minggu ini.</p>
                ) : (
                  Object.entries(groupLogsByDate(weeklyLogs)).map(([date, logs]) => (
                    <div key={date} className="mb-6 last:mb-0">
                      <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">{date}</h4>
                      <div className="space-y-3">
                        {logs.map((log) => {
                          const config = getMoodConfig(log.mood);
                          return (
                            <div key={log.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${config.border} ${config.bg} relative overflow-hidden`}>
                              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <config.icon className={`w-5 h-5 text-white`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-sm font-bold text-white capitalize">{config.label}</span>
                                  <span className="text-[10px] text-white/70 flex items-center gap-1">
                                    {formatTime(log.created_at)}
                                  </span>
                                </div>
                                <p className="text-xs text-white/80 italic">"{log.note || 'Tanpa catatan'}"</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* STATS PLACEHOLDER */}
          {activeTab === 'stats' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-slate-500"
            >
              <BarChart2 className="w-10 h-10 mb-2 opacity-50" />
              <p>Statistik Bulanan (Coming Soon)</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Tracker;