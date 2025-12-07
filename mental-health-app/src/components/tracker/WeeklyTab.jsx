import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2, Filter } from 'lucide-react';

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
    return (
        <motion.div
            key="weekly"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
            <div className="lg:col-span-7 space-y-6">

                {/* calendar */}
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

            {/* filter list */}
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
    );
};

export default WeeklyTab;
