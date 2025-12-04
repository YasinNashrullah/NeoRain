import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smile, Wind, Zap, Frown, CloudRain,
  Calendar as CalendarIcon, BarChart2, Clock, Trophy,
  Edit3, ChevronLeft, ChevronRight, Filter, Trash2, Star
} from 'lucide-react';
import { api } from '../utils/api';

const Tracker = ({ userData }) => {
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // --- STATE DATA ---
  const [historyLogs, setHistoryLogs] = useState([]); // Data Harian (Semua)
  const [weeklyLogs, setWeeklyLogs] = useState([]);   // Data Mingguan (Raw)

  // --- STATE CALENDAR & FILTER ---
  const [currentDate, setCurrentDate] = useState(new Date()); // Bulan yang dilihat
  const [dateRange, setDateRange] = useState({ start: null, end: null }); // Range Filter

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
      const allData = await api.getMoods(userData.uid);
      setHistoryLogs(allData);
      setWeeklyLogs(allData);
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

  // Helper: Grouping Data Mingguan berdasarkan Tanggal (UNTUK LIST DETAIL)
  const groupLogsByDate = (logs) => {
    return logs.reduce((acc, log) => {
      const date = formatDate(log.created_at);
      if (!acc[date]) acc[date] = [];
      acc[date].push(log);
      return acc;
    }, {});
  };

  // Filter: Hanya ambil log hari ini (Untuk Tab Daily)
  const todayLogs = historyLogs.filter(log => {
    const logDate = new Date(log.created_at).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    return logDate === today;
  });

  // --- CALENDAR LOGIC ---
  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    clickedDate.setHours(0, 0, 0, 0);

    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      setDateRange({ start: clickedDate, end: null });
    } else {
      if (clickedDate < dateRange.start) {
        setDateRange({ start: clickedDate, end: dateRange.start });
      } else {
        setDateRange({ ...dateRange, end: clickedDate });
      }
    }
  };

  // Filter Data Mingguan Berdasarkan Range Kalender
  const filteredWeeklyLogs = weeklyLogs.filter(log => {
    if (!dateRange.start) return true;

    const logDate = new Date(log.created_at);
    logDate.setHours(0, 0, 0, 0);

    if (dateRange.end) {
      return logDate >= dateRange.start && logDate <= dateRange.end;
    }
    return logDate.getTime() === dateRange.start.getTime();
  });

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);

    for (let day = 1; day <= daysInMonth; day++) {
      const thisDate = new Date(year, month, day);
      thisDate.setHours(0, 0, 0, 0);

      const hasLog = historyLogs.some(log => {
        const logDate = new Date(log.created_at);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === thisDate.getTime();
      });

      const isStart = dateRange.start && thisDate.getTime() === dateRange.start.getTime();
      const isEnd = dateRange.end && thisDate.getTime() === dateRange.end.getTime();
      const isInRange = dateRange.start && dateRange.end && thisDate > dateRange.start && thisDate < dateRange.end;

      let bgClass = "hover:bg-white/10 text-slate-400";
      if (isStart || isEnd) bgClass = "bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 scale-110 z-10 font-bold";
      else if (isInRange) bgClass = "bg-indigo-500/20 text-indigo-200";
      else if (hasLog) bgClass = "bg-white/5 text-white border border-white/20 font-semibold";

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-10 w-10 md:h-12 md:w-full rounded-xl flex flex-col items-center justify-center text-sm transition-all relative ${bgClass}`}
        >
          {day}
          {hasLog && !isStart && !isEnd && (
            <span className="absolute bottom-1 w-1 h-1 bg-green-400 rounded-full shadow-[0_0_5px_rgba(74,222,128,0.8)]"></span>
          )}
        </button>
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
      <div className="md:px-9 px-6 pt-8 pb-4 relative z-10 flex-none">
        <div className="w-full mx-auto bg-white/5 p-1.5 rounded-2xl flex relative border border-white/10 backdrop-blur-md shadow-xl">
          {['daily', 'weekly', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:mx-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${activeTab === tab ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <span className="capitalize">{tab === 'daily' ? 'Daily' : tab === 'weekly' ? 'Weekly' : 'Statistics'}</span>
            </button>
          ))}
          <motion.div
            layoutId="activeTab"
            className="absolute top-1.5 bottom-1.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30"
            initial={false}
            animate={{
              left: activeTab === 'daily' ? '0.5%' : activeTab === 'weekly' ? '33.8%' : '67.1%',
              width: '32.5%'
            }}
          />
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 scrollbar-hide relative z-10">
        {/* WRAPPER AGAR TIDAK TERLALU LEBAR DI DESKTOP */}
        <div className="max-w-6xl mx-auto h-full">

          <AnimatePresence mode='wait'>

            {/* ====== TAB HARIAN (DAILY) ====== */}
            {activeTab === 'daily' && (
              <motion.div
                key="daily"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full"
              >
                {/* Input Card */}
                <div className="md: lg:col-span-7 space-y-8">
                  <div className="bg-slate-900 border border-white/10 rounded-[30px] p-8 shadow-2xl relative overflow-hidden h-full flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                        How are you feeling? <span className="text-2xl">✨</span>
                      </h2>

                      {/* container scroll */}
                      <div className="flex gap-3 overflow-x-auto py-4 pb-4 -mx-6 px-6 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {moods.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelectedMood(m.id)}
                            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-300 min-w-[80px] ${selectedMood === m.id
                                ? `bg-white/10 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105`
                                : 'bg-transparent border-transparent opacity-50 hover:opacity-100'
                              }`}
                          >
                            <m.icon className={`w-8 h-8 ${m.color}`} />
                            <span className="text-[10px] text-slate-300">{m.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="bg-slate-800/50 rounded-3xl p-6 mb-6 border border-white/5 focus-within:border-indigo-500/50 transition-colors">
                        <label className="text-xs font-bold text-slate-400 mb-3 block flex items-center gap-2">
                          <Edit3 className="w-4 h-4" /> Add Notes (Optional)
                        </label>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="How do you feel right now?"
                          className="w-full bg-transparent text-1 text-white placeholder-slate-600 focus:outline-none resize-none h-32"
                        />
                      </div>

                      <button
                        onClick={handleSaveMood}
                        disabled={isSaving || !selectedMood}
                        className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${isSaving || !selectedMood
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'
                          }`}
                      >
                        {isSaving ? "Saving..." : "Catat Mood"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Today History */}
                <div className="md:w-auto lg:col-span-5 flex flex-col h-full">
                  <div className="bg-white/5 border border-white/10 rounded-[30px] p-6 h-full backdrop-blur-md">
                    <h3 className="text-sm font-bold text-white mb-6 flex items-center justify-between">
                      Mood Today <span className="bg-white/10 px-3 py-1 rounded-full text-sm">{todayLogs.length}</span>
                    </h3>

                    {todayLogs.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                        <Clock className="w-12 h-12 mb-3" />
                        <p>No mood recorded yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 overflow-y-auto max-h-[600px] scrollbar-hide pr-2">
                        {todayLogs.map((log) => {
                          const config = getMoodConfig(log.mood);
                          return (
                            <div key={log.id} className={`p-4 rounded-3xl border ${config.border} ${config.bg} relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
                              <div className="flex items-start gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                  <config.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <span className="text-sm font-bold text-white capitalize">{config.label}</span>
                                    <span className="text-[10px] text-white/70 bg-black/20 px-2 py-1 rounded-lg">
                                      {formatTime(log.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-white/90 mt-2 line-clamp-2 italic">
                                    "{log.note || 'No notes'}"
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ====== TAB MINGGUAN (CALENDAR & FILTER) ====== */}
            {activeTab === 'weekly' && (
              <motion.div
                key="weekly"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* KOLOM KIRI: CALENDAR (col-span-7) */}
                <div className="lg:col-span-7 space-y-6">

                  {/* 2. CALENDAR WIDGET */}
                  <div className="bg-slate-900 border border-white/10 rounded-[30px] p-8 min-h-[500px]">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-indigo-400" />
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronRight className="w-5 h-5" /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 text-center mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-xs text-slate-500 uppercase font-bold tracking-wider">{d}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2 md:gap-4">
                      {renderCalendar()}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-xs text-slate-400">
                      <p>Click a date to filter details.</p>
                      <div className="flex gap-4">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_5px_rgba(74,222,128,0.8)]"></div> Recorded</span>
                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-indigo-600 rounded-full"></div> Selected</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KOLOM KANAN: FILTERED LIST (STYLE LAMA YANG KAMU SUKA) */}
                <div className="lg:col-span-5 flex flex-col h-full">
                  <div className="bg-slate-900 border border-white/10 rounded-[30px] p-6 h-fit min-h-[500px]">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-white">Detail Minggu Ini</h3>
                      {dateRange.start && (
                        <button
                          onClick={() => setDateRange({ start: null, end: null })}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 px-3 py-1 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Reset Filter
                        </button>
                      )}
                    </div>

                    {filteredWeeklyLogs.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60 h-64">
                        <Filter className="w-12 h-12 mb-3" />
                        <p>No logs found for selected date.</p>
                      </div>
                    ) : (
                      <div className="space-y-6 overflow-y-auto max-h-[600px] scrollbar-hide">
                        {/* MENGGUNAKAN LOGIKA GROUPING BY DATE */}
                        {Object.entries(groupLogsByDate(filteredWeeklyLogs)).map(([date, logs]) => (
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
                </div>
              </motion.div>
            )}

            {/* STATS PLACEHOLDER */}
            {activeTab === 'stats' && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-slate-500 min-h-[500px]"
              >
                <BarChart2 className="w-20 h-20 mb-4 opacity-50" />
                <h2 className="text-2xl font-bold text-white">Statistics</h2>
                <p className="text-sm">Coming Soon</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Tracker;