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
    formatTime,
    selectedTags,
    setSelectedTags,
    activities
}) => {
    const toggleTag = (tagId) => {
        if (selectedTags.includes(tagId)) {
            setSelectedTags(selectedTags.filter(id => id !== tagId));
        } else {
            setSelectedTags([...selectedTags, tagId]);
        }
    };
    return (
        <motion.div
            key="daily"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-5"
        >
            {/* Input Card */}
            <div className="lg:col-span-7 space-y-8 h-fit">
                <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-8 shadow-sm dark:shadow-2xl relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-3">
                            Apa yang kamu rasakan? <span className="text-xl">✨</span>
                        </h2>

                        {/* container scroll */}
                        <div className="flex gap-2 overflow-x-auto py-4 pb-4 -mx-6 px-6 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {moods.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setSelectedMood(m.id)}
                                    className={`relative flex-1 min-w-[85px] mx-1 my-2 flex flex-col items-center justify-center gap-3 py-4 rounded-2xl border transition-all duration-300 group ${selectedMood === m.id
                                        ? `${m.bg} ${m.border} shadow-md scale-105`
                                        : 'bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:scale-[1.02]'
                                        }`}
                                >
                                    <div className={`p-2 rounded-full transition-colors duration-300 ${selectedMood === m.id ? 'bg-white/60 dark:bg-white/10 shadow-sm' : 'bg-transparent group-hover:bg-white/50'}`}>
                                        <m.icon className={`w-8 h-8 md:w-10 md:h-10 transition-transform duration-300 ${m.color} ${selectedMood === m.id ? 'scale-110' : ''}`} />
                                    </div>

                                    <span className={`text-[10px] md:text-xs font-bold transition-colors ${selectedMood === m.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700'}`}>
                                        {m.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Activity Selector */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 block">Sedang memikirkan...</label>
                            <div className="flex flex-wrap gap-3">
                                {activities.map((activity) => {
                                    const isSelected = selectedTags?.includes(activity.id);
                                    return (
                                        <button
                                            key={activity.id}
                                            onClick={() => toggleTag(activity.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isSelected
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/30 shadow-lg'
                                                : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
                                                }`}
                                        >
                                            <activity.icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                                            {activity.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 mb-6 border border-slate-200 dark:border-white/5 focus-within:border-indigo-500/50 transition-colors">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                                <Edit3 className="w-4 h-4" /> Catatan Tambahan (Opsional)
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Ceritakan perasaanmu..."
                                className="w-full bg-transparent text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none resize-none h-32"
                            />
                        </div>

                        <button
                            onClick={handleSaveMood}
                            disabled={isSaving || !selectedMood}
                            className={`w-full py-3 rounded-2xl font-bold text-[16px] shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${isSaving || !selectedMood
                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'
                                }`}
                        >
                            {isSaving ? "Menyimpan..." : "Simpan Mood"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Today History */}
            <div className="md:w-auto lg:col-span-5 flex flex-col h-[500px] lg:h-0 lg:min-h-full">
                <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900/50 dark:to-slate-900/50 border border-white/60 dark:border-white/10 rounded-[30px] p-6 h-full backdrop-blur-md flex flex-col">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6 flex items-center justify-between">
                        Mood Hari Ini <span className="bg-slate-100 dark:bg-white/10 px-3 py-1 rounded-full text-sm text-slate-600 dark:text-slate-300">{todayLogs.length}</span>
                    </h3>

                    {todayLogs.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-60">
                            <Clock className="w-12 h-12 mb-3" />
                            <p>Belum ada mood yang tercatat.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            {todayLogs.map((log) => {
                                const config = getMoodConfig(log.mood);
                                return (
                                    <div key={log.id} className="relative group">
                                        {/* Content */}
                                        <div className={`p-3 m-1 rounded-3xl border ${config.border} ${config.bg} relative overflow-hidden transition-all hover:scale-[1.02] shadow-sm`}>
                                            <div className="flex items-start gap-4 relative z-10">
                                                <div className="w-10 h-10 rounded-2xl bg-white/40 dark:bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                    <config.icon className="w-5 h-5 text-slate-700 dark:text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-sm font-bold text-slate-800 dark:text-white capitalize">{config.label}</span>
                                                        <span className="text-[10px] bg-white/50 dark:bg-black/20 px-2 py-1 rounded-lg text-slate-600 dark:text-white/70 font-mono">
                                                            {formatTime(log.created_at)}
                                                        </span>
                                                    </div>

                                                    {/* Tags if any */}
                                                    {log.activities && log.activities.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mb-2">
                                                            {log.activities.map(tagId => {
                                                                const act = activities.find(a => a.id === tagId);
                                                                if (!act) return null;
                                                                return (
                                                                    <span key={tagId} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-white/40 dark:bg-black/20 text-slate-700 dark:text-white/80">
                                                                        <act.icon className="w-3 h-3" /> {act.label}
                                                                    </span>
                                                                )
                                                            })}
                                                        </div>
                                                    )}

                                                    {log.note && (
                                                        <p className="text-xs text-slate-600 dark:text-white/90 italic bg-white/30 dark:bg-black/10 p-2 rounded-xl">
                                                            "{log.note}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </motion.div >
    );
};

export default DailyTab;
