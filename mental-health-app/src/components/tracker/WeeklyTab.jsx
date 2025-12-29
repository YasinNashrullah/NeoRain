import React from 'react';
import { motion } from 'framer-motion';
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight,
    Trash2, Filter, Clock
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

    const filteredLogs = groupLogsByDate(filteredWeeklyLogs);
    const displayDays = Object.entries(filteredLogs);

    return (
        <motion.div
            key="weekly"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            // items start ensures columns do not stretch vertically
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-0 items-start"
        >
            {/* left column calendar */}
            <div className="lg:col-span-7">
                <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-6 lg:p-8 shadow-sm dark:shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <CalendarIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                                <span className="capitalize">
                                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </span>
                            </h3>
                            <div className="flex gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-xl border border-white/20">
                                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm"><ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" /></button>
                                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm"><ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 text-center mb-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
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
            <div className="lg:col-span-5 self-stretch">
                <div className="bg-gradient-to-b from-white/95 to-slate-50/95 dark:from-slate-900 dark:to-slate-900/95 border border-white/60 dark:border-white/10 rounded-[30px] flex flex-col shadow-sm dark:shadow-xl overflow-hidden h-full max-h-[500px] lg:max-h-full">

                    {/* header */}
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-white/5 backdrop-blur-sm shrink-0">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <h3 className="text-base font-bold text-slate-800 dark:text-white">Timeline</h3>
                        </div>
                    </div>

                    {/* content list scrollable */}
                    <div className="flex-grow overflow-y-auto scrollbar-hide custom-scrollbar">
                        {displayDays.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10 opacity-60">
                                <Filter className="w-10 h-10 mb-2" />
                                <p className="text-sm">No activity found.</p>
                            </div>
                        ) : (
                            <div className="p-6 space-y-8">
                                {displayDays.map(([date, logs]) => (
                                    <div key={date}>
                                        <div className="flex items-center gap-3 mb-4 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-2 z-10 -mx-2 px-2 rounded-lg">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                                            <h4 className="text-xs font-black text-slate-500 dark:text-indigo-300 uppercase tracking-widest leading-none">
                                                {date}
                                            </h4>
                                            <div className="h-px bg-slate-100 dark:bg-white/10 flex-1"></div>
                                        </div>

                                        <div className="space-y-3 pl-2">
                                            {logs.map((log) => {
                                                const config = getMoodConfig(log.mood);
                                                return (
                                                    <motion.div
                                                        key={log.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className={`group relative p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${config.bg} ${config.border} bg-white dark:bg-slate-800/40`}
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            {/* Icon Container */}
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:rotate-12 ${config.color.replace('text-', 'bg-').replace('500', '100')} dark:bg-white/10`}>
                                                                <config.icon className={`w-5 h-5 ${config.color}`} />
                                                            </div>

                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <h5 className="font-bold text-slate-800 mr-2 dark:text-white text-sm capitalize">
                                                                        {config.label}
                                                                    </h5>
                                                                    <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-white/50 dark:border-white/5">
                                                                        {formatTime(log.created_at)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-2">
                                                                    "{log.note || 'No notes added'}"
                                                                </p>
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
                    {/* fade effect at bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none"></div>
                </div>
            </div>
        </motion.div>
    );
};

export default WeeklyTab;
