import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smile, Wind, Zap, Frown, CloudRain,
  Calendar, BarChart2, Clock, Trophy,
  Edit3
} from 'lucide-react';
import { api } from '../utils/api';

const Tracker = ({ userData }) => {
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // STATE BARU: Untuk menyimpan history dari Database
  const [historyLogs, setHistoryLogs] = useState([]);

  // Data Mood (UI Config)
  const moods = [
    { id: 'happy', label: 'Happy', icon: Smile, color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500/50', shadow: 'shadow-pink-500/30' },
    { id: 'calm', label: 'Calm', icon: Wind, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', shadow: 'shadow-cyan-500/30' },
    { id: 'manic', label: 'Manic', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', shadow: 'shadow-yellow-500/30' },
    { id: 'angry', label: 'Angry', icon: Frown, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/50', shadow: 'shadow-orange-500/30' },
    { id: 'sad', label: 'Sad', icon: CloudRain, color: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/50', shadow: 'shadow-indigo-500/30' },
  ];

  // FETCH DATA SAAT KOMPONEN DIBUKA
  const fetchHistory = async () => {
    if (userData?.uid) {
      const data = await api.getMoods(userData.uid);
      setHistoryLogs(data);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userData]);

  // FUNGSI SIMPAN KE DATABASE
  const handleSaveMood = async () => {
    if (!selectedMood) return alert("Pilih mood dulu ya!");
    setIsSaving(true);

    const payload = {
      firebase_uid: userData?.uid,
      mood: selectedMood,
      note: note,
    };

    try {
      // Kirim ke Laravel
      await api.saveMood(payload);

      // Reset Form
      setNote('');
      setSelectedMood(null);

      // Refresh History agar data baru muncul
      await fetchHistory();

      alert("Mood berhasil disimpan ke Database!");
    } catch (error) {
      alert("Gagal menyimpan mood. Cek koneksi server.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper untuk mendapatkan config icon berdasarkan ID mood
  const getMoodConfig = (moodId) => {
    return moods.find(m => m.id === moodId) || moods[0];
  };

  // Helper Format Waktu (created_at Laravel -> Jam WIB)
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  return (
    <div className="w-full h-full bg-slate-950 text-white flex flex-col relative overflow-hidden">

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-indigo-900/20 blur-[100px] pointer-events-none"></div>

      {/* HEADER & TABS */}
      <div className="px-6 pt-8 pb-4 relative z-10">
        <h1 className="text-2xl font-bold text-center mb-6">Mood Tracker</h1>

        <div className="bg-slate-900 p-1.5 rounded-2xl flex relative border border-white/5">
          {['daily', 'weekly', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
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

          {activeTab === 'daily' && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* INPUT CARD */}
              <div className="bg-slate-900 border border-white/10 rounded-[30px] p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                  <h2 className="text-sm text-slate-400 mb-1">Bagaimana Perasaanmu hari ini</h2>
                  <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2 capitalize">
                    {userData?.name || "Pengguna"} ? <span className="text-yellow-400">✨</span>
                  </h1>
                  <p className="text-xs text-slate-500 mb-4">Ayo catat mood harianmu</p>

                  {/* MOOD SELECTOR SCROLLABLE */}
                  <div className="flex gap-3 overflow-x-auto py-4 pb-4 -mx-6 px-6 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

                  {/* Input Catatan */}
                  <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 border border-white/5 focus-within:border-indigo-500/50 transition-colors mt-2">
                    <label className="text-xs font-bold text-slate-400 mb-2 block flex items-center gap-2">
                      <Edit3 className="w-3 h-3" /> Tambah catatan (opsional)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Apa yang membuatmu merasa seperti ini?"
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

              {/* REAL HISTORY LIST FROM DATABASE */}
              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                  Riwayat Mood <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{historyLogs.length}</span>
                </h3>

                {historyLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">Belum ada data mood.</p>
                ) : (
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
                )}
              </div>
            </motion.div>
          )}

          {activeTab !== 'daily' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-slate-500"
            >
              <p>Fitur {activeTab} akan mengambil data dari MySQL.</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Tracker;