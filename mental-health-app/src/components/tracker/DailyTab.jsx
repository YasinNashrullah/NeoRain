import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Clock } from 'lucide-react';

const DailyTab = ({
    moods,
    selectedMood,
    setSelectedMood,
    note,
    setNote,
    isSaving,
    handleSaveMood,
    todayLogs,
    getMoodConfig,
    formatTime
}) => {
    return (
        <motion.div
            key="daily"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full"
        >
            {/* Input Card */}
            <div className="lg:col-span-7 space-y-8">
                <div className="bg-slate-900 border border-white/10 rounded-[30px] p-8 shadow-2xl relative overflow-hidden h-full flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                            How are you feeling? <span className="text-xl">✨</span>
                        </h2>

                        {/* container scroll */}
                        <div className="flex gap-4 overflow-x-auto py-4 pb-4 -mx-6 px-6 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {moods.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setSelectedMood(m.id)}
                                    className={`flex flex-col items-center gap-2 p-6 rounded-2xl border transition-all duration-300 min-w-[80px] md:min-w-[100px] ${selectedMood === m.id
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
                            className={`w-full py-3 rounded-2xl font-bold text-[16px] shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${isSaving || !selectedMood
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
                                                <p className="text-xs text-white/90 mt-2 line-clamp-2 ml-2 flex italic">
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
    );
};

export default DailyTab;
