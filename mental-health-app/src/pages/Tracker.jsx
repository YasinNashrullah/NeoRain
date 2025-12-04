import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smile, Wind, Zap, Frown, CloudRain,
  Calendar as CalendarIcon, BarChart2, Clock, Trophy,
  Edit3, Star, ChevronLeft, ChevronRight
} from 'lucide-react';
import { api } from '../utils/api';

const Tracker = ({ userData }) => {
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // State Data
  const [historyLogs, setHistoryLogs] = useState([]); // Semua history (untuk Kalender)
  const [weeklyLogs, setWeeklyLogs] = useState([]);   // Data Mingguan (untuk List Detail)
  
  // State Kalender
  const [currentDate, setCurrentDate] = useState(new Date());

  // Config Mood
  const moods = [
    { id: 'happy', label: 'Happy', icon: Smile, color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500/50', shadow: 'shadow-pink-500/30', solid: 'bg-pink-500' },
    { id: 'calm', label: 'Calm', icon: Wind, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', shadow: 'shadow-cyan-500/30', solid: 'bg-cyan-500' },
    { id: 'manic', label: 'Manic', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', shadow: 'shadow-yellow-500/30', solid: 'bg-yellow-500' },
    { id: 'angry', label: 'Angry', icon: Frown, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/50', shadow: 'shadow-orange-500/30', solid: 'bg-orange-500' },
    { id: 'sad', label: 'Sad', icon: CloudRain, color: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/50', shadow: 'shadow-indigo-500/30', solid: 'bg-indigo-500' },
  ];

  // --- FETCH DATA ---
  const fetchData = async () => {
    if (userData?.uid) {
      // Kita ambil semua history untuk keperluan Kalender
      const allData = await api.getMoods(userData.uid);
      setHistoryLogs(allData);

      // Jika tab Weekly, ambil khusus data mingguan
      if (activeTab === 'weekly') {
        const weeklyData = await api.getWeeklyMoods(userData.uid);
        setWeeklyLogs(weeklyData);
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
      await fetchData(); 
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

  // Filter: Hanya ambil log hari ini
  const todayLogs = historyLogs.filter(log => {
    const logDate = new Date(log.created_at).toDateString();
    const today = new Date().toDateString();
    return logDate === today;
  });

  // --- CALENDAR LOGIC ---
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month); // 0 = Sunday
    
    const days = [];
    // Padding for empty days
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }

    // Render Days
    for (let day = 1; day <= daysInMonth; day++) {
      // Cek apakah ada log di tanggal ini
      const dateString = new Date(year, month, day).toDateString();
      const logsForDay = historyLogs.filter(log => new Date(log.created_at).toDateString() === dateString);
      const hasLog = logsForDay.length > 0;
      
      // Ambil warna mood terakhir di hari itu
      let dayStyle = "text-slate-400 hover:bg-white/5";
      let dotColor = null;

      if (hasLog) {
        const lastMood = logsForDay[0].mood; // Ambil mood terbaru
        const config = getMoodConfig(lastMood);
        dayStyle = `text-white font-bold ${config.bg} border ${config.border}`;
        dotColor = config.solid;
      }

      // Highlight Hari Ini
      const isToday = new Date().toDateString() === dateString;
      if (isToday && !hasLog) dayStyle = "bg-white/10 text-white border border-white/20";

      days.push(
        <div key={day} className="flex flex-col items-center justify-center h-10 w-10 relative">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer ${dayStyle}`}>
            {day}
          </div>
          {/* Dot Indicator jika ada mood */}
          {hasLog && (
            <div className={`absolute bottom-0 w-1 h-1 rounded-full ${dotColor}`}></div>
          )}
        </div>
      );
    }
    return days;
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  return (
    <div className="w-full h-full bg-slate-950 text-white flex flex-col relative overflow-hidden">

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-indigo-900/20 blur-[100px] pointer-events-none"></div>

      {/* HEADER & TABS */}
      <div className="px-6 pt-8 pb-4 relative z-10 flex-none">
        <h1 className="text-2xl font-bold text-center mb-6">Mood Tracker</h1>

        {/* Tabs - Desktop Friendly (Max Width) */}
        <div className="max-w-5xl mx-auto bg-slate-900 p-2 rounded-2xl flex relative border border-white/5">
          {['daily', 'weekly', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 mx-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              {tab === 'daily' && <Edit3 className="w-4 h-4" />}
              {tab === 'weekly' && <CalendarIcon className="w-4 h-4" />}
              {tab === 'stats' && <BarChart2 className="w-4 h-4" />}
              <span className="capitalize">{tab === 'daily' ? 'Daily' : tab === 'weekly' ? 'Weekly' : 'Statistics'}</span>
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
        <div className="max-w-5xl mx-auto h-full"> {/* Container Desktop */}
          
          <AnimatePresence mode='wait'>

            {/* --- TAB HARIAN (DAILY) --- */}
            {activeTab === 'daily' && (
              <motion.div
                key="daily"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full"
              >
                {/* KOLOM KIRI: INPUT CARD */}
                <div className="space-y-6">
                  <div className="bg-slate-900 border border-white/10 rounded-[30px] p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h2 className="text-sm text-slate-400 mb-1">Bagaimana Perasaanmu hari ini</h2>
                      <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2 capitalize">
                        {userData?.name || "Pengguna"} ? <span className="text-yellow-400">✨</span>
                      </h1>
                      
                      {/* Mood Selector */}
                      <div className="flex gap-3 overflow-x-auto py-4 pb-4 -mx-6 px-6 scrollbar-hide md:grid md:grid-cols-5 md:gap-4 md:mx-0 md:px-0 md:overflow-visible">
                        {moods.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelectedMood(m.id)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 min-w-[70px] ${selectedMood === m.id
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
                          className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none resize-none h-24"
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
                </div>

                {/* KOLOM KANAN: TODAY'S HISTORY */}
                <div className="bg-slate-900/50 border border-white/10 rounded-[30px] p-6 h-fit">
                  <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    Riwayat Hari Ini <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{todayLogs.length}</span>
                  </h3>
                  
                  {todayLogs.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                      <Clock className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                      <p className="text-xs">Belum ada mood tercatat hari ini.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todayLogs.map((log) => {
                        const config = getMoodConfig(log.mood);
                        return (
                          <div key={log.id} className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-slate-900">
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
                  )}
                </div>
              </motion.div>
            )}

            {/* --- TAB MINGGUAN (WEEKLY / CALENDAR) --- */}
            {activeTab === 'weekly' && (
              <motion.div
                key="weekly"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* KOLOM KIRI: SUMMARY & CALENDAR */}
                <div className="space-y-6">
                  {/* 1. AWARD CARD */}
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[30px] p-6 text-center relative overflow-hidden shadow-xl shadow-indigo-900/50">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/30 shadow-lg">
                        <Star className="w-6 h-6 text-yellow-300 fill-current" />
                      </div>
                      <h2 className="text-lg font-bold text-white mb-1">Weekly Summary</h2>
                      <p className="text-xs text-indigo-100 bg-white/10 inline-block px-3 py-1 rounded-full border border-white/10">
                        "Tetap konsisten mencatat moodmu! ✨"
                      </p>
                    </div>
                  </div>

                  {/* 2. CALENDAR WIDGET */}
                  <div className="bg-slate-900 border border-white/10 rounded-[30px] p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-white">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="flex gap-2">
                        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white/10 rounded-full"><ChevronLeft className="w-4 h-4" /></button>
                        <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white/10 rounded-full"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </div>
                    
                    {/* Days Header */}
                    <div className="grid grid-cols-7 text-center mb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} className="text-[10px] text-slate-500 uppercase font-bold">{d}</div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 place-items-center">
                      {renderCalendar()}
                    </div>
                  </div>
                </div>

                {/* KOLOM KANAN: DETAILED LIST */}
                <div className="bg-slate-900 border border-white/10 rounded-[30px] p-6 h-fit">
                  <h3 className="text-sm font-bold text-slate-300 mb-4">Detail Minggu Ini</h3>
                  
                  {weeklyLogs.length === 0 ? (
                    <p className="text-center text-xs text-slate-500 py-4">Belum ada data minggu ini.</p>
                  ) : (
                    <div className="space-y-6">
                      {/* Grouping Logic inline for simplicity */}
                      {Object.entries(
                        weeklyLogs.reduce((acc, log) => {
                          const date = formatDate(log.created_at);
                          if (!acc[date]) acc[date] = [];
                          acc[date].push(log);
                          return acc;
                        }, {})
                      ).map(([date, logs]) => (
                        <div key={date}>
                          <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider sticky top-0 bg-slate-900 py-1 z-10">{date}</h4>
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
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STATS PLACEHOLDER */}
            {activeTab === 'stats' && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-slate-500"
              >
                <BarChart2 className="w-16 h-16 mb-4 opacity-50" />
                <h2 className="text-xl font-bold">Statistik Bulanan</h2>
                <p className="text-sm">Fitur ini akan segera hadir dengan grafik yang detail.</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Tracker;