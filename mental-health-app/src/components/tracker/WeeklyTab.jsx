import React from 'react';
import { motion } from 'framer-motion';
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight,
    Trash2, Filter, Clock, Briefcase, BookOpen, Users,
    Moon, Utensils, Dumbbell, Coffee, Car
} from 'lucide-react';

const WeeklyTab = ({
    currentDate,
    changeMonth,
    renderCalendar,
    dateRange,
    setDateRange,
    filteredWeeklyLogs,
    groupLogsByDate,
    getMoodConfig,
    formatTime
}) => {

    const activities = [
        { id: 'work', label: 'Kerja', icon: Briefcase },
        { id: 'study', label: 'Belajar', icon: BookOpen },
        { id: 'family', label: 'Keluarga', icon: Users },
        { id: 'sleep', label: 'Tidur', icon: Moon },
        { id: 'eat', label: 'Makan', icon: Utensils },
        { id: 'sport', label: 'Olahraga', icon: Dumbbell },
        { id: 'relax', label: 'Santai', icon: Coffee },
        { id: 'travel', label: 'Jalan-jalan', icon: Car },
    ];

    const filteredLogs = groupLogsByDate(filteredWeeklyLogs);
    const displayDays = Object.entries(filteredLogs);

    return (
        <motion.div
            key="weekly"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            // items start ensures columns do not stretch vertically
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-0 items-start mb-5"
        >
            {/* left column calendar */}
            <div className="lg:col-span-7">
                <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-6 lg:p-8 shadow-sm dark:shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <CalendarIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                                <span className="capitalize">
                                    {currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                                </span>
                            </h3>
                            <div className="flex gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-xl border border-white/20">
                                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm"><ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" /></button>
                                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm"><ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 text-center mb-4">
                            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                                <div key={d} className="text-xs text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-widest">{d}</div>
                            ))}
                        </div>

                        {/* calendar grid natural height */}
                        <div className="grid grid-cols-7 gap-2 md:gap-3">
                            {renderCalendar()}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/5 flex flex-wrap gap-4 justify-between items-center text-xs text-slate-400">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span>Recorded</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                    <span>Selected</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* right column timeline */}
            <div className="lg:col-span-5 flex flex-col h-[500px] lg:h-0 lg:min-h-full">
                <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-6 shadow-sm dark:shadow-xl flex flex-col h-full overflow-hidden">

                    {/* header */}
                    <div className="flex justify-between items-center mb-6 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-xl">
                                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Riwayat Mingguan</h3>
                        </div>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                            {filteredWeeklyLogs.length} Data
                        </span>
                    </div>

                    {/* content list scrollable */}
                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {displayDays.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10 opacity-60">
                                <Filter className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
                                <p className="text-sm font-medium">Belum ada aktivitas minggu ini.</p>
                            </div>
                        ) : (
                            <div className="space-y-8 pb-4">
                                {displayDays.map(([date, logs]) => (
                                    <div key={date} className="relative">
                                        {/* Sticky Date Header */}
                                        <div className="flex items-center gap-3 mb-4 sticky top-0 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md py-3 z-10 -mx-2 px-2 rounded-xl shadow-sm border-b border-slate-50 dark:border-slate-800">
                                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/10 dark:ring-indigo-400/10"></div>
                                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                {date}
                                            </h4>
                                        </div>

                                        <div className="space-y-3 pl-3 relative border-l-2 border-slate-100 dark:border-slate-800 ml-1.5 dashed-border">
                                            {logs.map((log) => {
                                                const config = getMoodConfig(log.mood);
                                                return (
                                                    <motion.div
                                                        key={log.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className={`group relative p-4 rounded-2xl border transition-all duration-300 hover:translate-x-1 ${config.bg} ${config.border} bg-white dark:bg-slate-800/50 shadow-sm`}
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            {/* Icon Container */}
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${config.color.replace('text-', 'bg-').replace('500', '100')} dark:bg-white/5`}>
                                                                <config.icon className={`w-6 h-6 ${config.color}`} />
                                                            </div>

                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start mb-1.5">
                                                                    <h5 className="font-bold text-slate-800 dark:text-white text-base capitalize">
                                                                        {config.label}
                                                                    </h5>
                                                                    <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-md bg-white/60 dark:bg-black/20">
                                                                        {formatTime(log.created_at)}
                                                                    </span>
                                                                </div>

                                                                {log.activities && log.activities.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                                        {log.activities.map(tagId => {
                                                                            const act = activities.find(a => a.id === tagId);
                                                                            if (!act) return null;
                                                                            return (
                                                                                <span key={tagId} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-white/50 dark:bg-black/20 text-slate-600 dark:text-slate-400 capitalize border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                                                                                    <act.icon className="w-3 h-3" />
                                                                                    {act.label}
                                                                                </span>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}

                                                                {log.note && (
                                                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic opacity-80 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
                                                                        "{log.note}"
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default WeeklyTab;
