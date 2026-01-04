import React, { useState, useEffect } from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BrainCircuit, Zap,
    Calendar as CalendarIcon, ChevronLeft, ChevronRight,
    Activity, TrendingUp, TrendingDown, FileText, Loader2, MessageCircle
} from 'lucide-react';
import { api } from '../../utils/api';
import Skeleton from '../ui/Skeleton';

const AnalysisTab = ({ userData, onChatRequest, onNavigate }) => {
    const [allHistory, setAllHistory] = useState([]);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    // Data Load
    useEffect(() => {
        const loadData = async () => {
            if (userData?.uid) {
                const history = await api.getAssessmentHistory(userData.uid);
                setAllHistory(history);
                if (history.length > 0) {
                    setSelectedAssessment(history[0]);
                    setSelectedDate(new Date(history[0].created_at));
                }
            }
            setLoading(false);
        };
        loadData();
    }, [userData]);

    // AI & Helpers
    const getAIReport = (data) => {
        if (!data || !data.ai_analysis) return null;
        try {
            return typeof data.ai_analysis === 'string' ? JSON.parse(data.ai_analysis) : data.ai_analysis;
        } catch (e) { return null; }
    };

    const getSeverity = (score, type) => {
        const limits = { depression: [9, 13, 20, 27], anxiety: [7, 9, 14, 19], stress: [14, 18, 25, 33] };
        const limit = limits[type];
        if (score <= limit[0]) return { label: 'Normal', color: 'text-green-500 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/20', border: 'border-green-200 dark:border-green-500/50' };
        if (score <= limit[1]) return { label: 'Ringan', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-500/20', border: 'border-yellow-200 dark:border-yellow-500/50' };
        if (score <= limit[2]) return { label: 'Sedang', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/20', border: 'border-orange-200 dark:border-orange-500/50' };
        if (score <= limit[3]) return { label: 'Parah', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/20', border: 'border-red-200 dark:border-red-500/50' };
        return { label: 'Sangat Parah', color: 'text-red-700 dark:text-red-500', bg: 'bg-red-200 dark:bg-red-500/20', border: 'border-red-300 dark:border-red-500/50' };
    };

    const logsOnSelectedDate = allHistory.filter(log =>
        new Date(log.created_at).toDateString() === selectedDate.toDateString()
    );

    const chartData = selectedAssessment ? [
        { subject: 'Depression', A: selectedAssessment.depression_score, fullMark: 42 },
        { subject: 'Anxiety', A: selectedAssessment.anxiety_score, fullMark: 42 },
        { subject: 'Stress', A: selectedAssessment.stress_score, fullMark: 42 },
    ] : [];

    const aiData = getAIReport(selectedAssessment);

    // Calendar Helper
    const renderCalendar = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);

        for (let day = 1; day <= daysInMonth; day++) {
            const thisDate = new Date(year, month, day);
            thisDate.setHours(0, 0, 0, 0);

            const hasLog = allHistory.some(log => new Date(log.created_at).setHours(0, 0, 0, 0) === thisDate.getTime());
            const isSelected = thisDate.getTime() === new Date(selectedDate).setHours(0, 0, 0, 0);

            let bgClass = "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5";
            if (isSelected) bgClass = "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/50";
            else if (hasLog) bgClass = "bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-white border border-slate-300 dark:border-white/20 font-semibold";

            days.push(
                <button
                    key={day}
                    onClick={() => setSelectedDate(thisDate)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs relative transition-all ${bgClass}`}
                >
                    {day}
                    {hasLog && !isSelected && <div className="absolute bottom-0.5 w-1 h-1 bg-green-500 dark:bg-green-400 rounded-full shadow-[0_0_5px_rgba(74,222,128,0.8)]"></div>}
                </button>
            );
        }
        return days;
    };

    // Skeleton Loading Component
    const AnalysisSkeleton = () => (
        <div className="w-full min-h-full pb-20 fade-in">
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
                {/* 1. Score Cards Skeleton */}
                <div className="order-3 lg:order-1 lg:col-span-3 flex flex-col gap-4 h-full">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-2xl border border-slate-200 dark:border-white/10 p-5 h-[120px] flex flex-col justify-between bg-white/50 dark:bg-slate-900/50">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-12" />
                            </div>
                            <Skeleton className="h-4 w-16 self-end" />
                        </div>
                    ))}
                </div>

                {/* 2. Radar Chart Skeleton */}
                <div className="order-4 lg:order-2 lg:col-span-5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[30px] p-6 h-[350px]">
                    <Skeleton className="h-4 w-32 mx-auto mb-8" />
                    <Skeleton className="h-60 w-60 rounded-full mx-auto" />
                </div>

                {/* 3. Calendar Skeleton */}
                <div className="order-1 lg:order-3 lg:col-span-4 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[30px] p-6 h-full flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-24" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-6 rounded" />
                            <Skeleton className="h-6 w-6 rounded" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-32 mx-auto" />
                    <div className="grid grid-cols-7 gap-3 mt-2">
                        {[...Array(35)].map((_, i) => (
                            <Skeleton key={i} className="h-8 w-8 rounded-full" />
                        ))}
                    </div>
                </div>

                {/* 4. Trend Chart Skeleton */}
                <div className="order-5 lg:order-4 lg:col-span-8 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[30px] p-6 min-h-[350px]">
                    <Skeleton className="h-6 w-48 mb-6" />
                    <Skeleton className="h-[250px] w-full rounded-2xl" />
                </div>

                {/* 5. History List Skeleton */}
                <div className="order-2 lg:order-5 lg:col-span-4 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[30px] p-4 min-h-[400px] flex flex-col gap-4">
                    <Skeleton className="h-6 w-40 mx-auto mb-2" />
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                    ))}
                </div>

                {/* 6. AI Summary Skeleton */}
                <div className="order-6 lg:order-6 lg:col-span-6 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[30px] p-6 min-h-[200px] flex flex-col gap-4">
                    <Skeleton className="h-6 w-40" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-8 w-40 mt-auto" />
                </div>

                {/* 7. Insight Skeleton */}
                <div className="order-7 lg:order-7 lg:col-span-6 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[30px] p-6 min-h-[200px] flex flex-col gap-4">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-4 w-1/2 ml-auto" />
                </div>
            </div>
        </div>
    );

    if (loading) return <AnalysisSkeleton />;

    if (!loading && allHistory.length === 0) return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 min-h-[400px]">
            <div className="max-w-md w-full bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900/50 dark:to-slate-900/50 border border-white/60 dark:border-white/10 rounded-[30px] p-8 shadow-xl dark:shadow-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-100 dark:border-indigo-500/20">
                        <BrainCircuit className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Belum Ada Data Analisis</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                        Mulai analisis sekarang untuk mengetahui kondisi kesehatan mentalmu!
                    </p>
                    <button
                        onClick={() => onNavigate('analyze')}
                        className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 font-bold text-white transition-all duration-300 bg-indigo-600 rounded-full hover:bg-indigo-500 hover:scale-105 shadow-lg shadow-indigo-500/30 overflow-hidden w-full"
                    >
                        <span className="relative flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Mulai Analisis AI
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <motion.div
            key="analysis"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full min-h-full text-white"
        >
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">

                {/* 1. Score Cards (Desktop: #1, Row 1 Left) */}
                <div className="order-3 lg:order-1 lg:col-span-3 flex flex-col gap-4 h-full">
                    <AnimatePresence mode="wait">
                        {selectedAssessment && (
                            <motion.div
                                key={selectedAssessment.id + "-scores"}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col gap-4 h-full"
                            >
                                {[
                                    { label: "Depression", score: selectedAssessment.depression_score, type: "depression" },
                                    { label: "Anxiety", score: selectedAssessment.anxiety_score, type: "anxiety" },
                                    { label: "Stress", score: selectedAssessment.stress_score, type: "stress" },
                                ].map((item) => {
                                    const stat = getSeverity(item.score, item.type);
                                    return (
                                        <div key={item.label} className={`relative overflow-hidden rounded-2xl flex-1 shadow-sm group border ${stat.border} ${stat.bg}`}>
                                            <div className="relative z-10 p-5 flex flex-col justify-between h-full">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-lg font-bold italic tracking-wider text-slate-800 dark:text-white">{item.label}</h3>
                                                    <span className="text-3xl font-black text-slate-800 dark:text-white">{item.score}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-xs font-bold italic ${stat.color}`}>{stat.label}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. Radar Chart (Desktop: #2, Row 1 Center) */}
                <div className="order-4 lg:order-2 lg:col-span-5 bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900/50 dark:to-slate-900/50 border border-white/60 dark:border-white/10 rounded-[30px] p-6 shadow-sm dark:shadow-2xl relative overflow-hidden min-h-[350px]">
                    <div className="absolute top-0 left-0 w-full h-full bg-indigo-500/5 rounded-full blur-3xl"></div>
                    <div className="w-full h-full relative z-10">
                        <h3 className="text-slate-500 dark:text-slate-400 font-bold text-center mb-2 absolute top-0 w-full text-sm uppercase tracking-widest">Analisis Grafik</h3>
                        <AnimatePresence mode="wait">
                            {selectedAssessment && (
                                <motion.div
                                    key={selectedAssessment.id + "-chart"}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-full h-[300px]"
                                >
                                    <ResponsiveContainer width="100%" height={300} minWidth={0}>
                                        <RadarChart cx="50%" cy="55%" outerRadius="80%" data={chartData}>
                                            <PolarGrid stroke="#94a3b8" strokeOpacity={0.3} />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: "bold" }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 42]} tick={false} axisLine={false} />
                                            <Radar name="Skor" dataKey="A" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.4} />
                                            <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 3. Calendar (Desktop: #3, Row 1 Right) */}
                <div className="order-1 lg:order-3 lg:col-span-4 bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900/50 dark:to-slate-900/50 border border-white/60 dark:border-white/10 rounded-[30px] p-6 text-slate-800 dark:text-white shadow-sm dark:shadow-xl h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-md md:text-lg">Kalender</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="text-md text-center font-bold mb-4 text-slate-600 dark:text-slate-300">
                        {selectedDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}
                    </div>
                    <div className="grid grid-cols-7 text-center mb-2 text-[10px] text-slate-500 font-bold uppercase">
                        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (<div key={d}>{d}</div>))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 place-items-center">
                        {renderCalendar()}
                    </div>
                </div>

                {/* 4. Trends of Mental Health (Desktop: #4, Row 2 Left) */}
                <div className="order-5 lg:order-4 lg:col-span-8 bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900/50 dark:to-slate-900/50 border border-white/60 dark:border-white/10 rounded-[30px] p-6 shadow-sm dark:shadow-xl relative overflow-hidden min-h-[350px]">
                    <div className="absolute top-0 right-0 w-full h-full bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 relative z-10">
                        <TrendingUp className="w-5 h-5 text-blue-500" /> Tren Kesehatan Mental
                    </h3>

                    <div className="w-full h-[250px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[...allHistory].reverse().slice(-7)}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                                <XAxis
                                    dataKey="created_at"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    tickMargin={10}
                                />
                                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 42]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="stress_score" name="Stress" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="anxiety_score" name="Cemas" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="depression_score" name="Depresi" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 5. Analysis History (Desktop: #5, Row 2 Right) */}
                <div className="order-2 lg:order-5 lg:col-span-4 bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900/50 dark:to-slate-900/50 border border-white/60 dark:border-white/10 rounded-[30px] p-3 shadow-sm dark:shadow-xl h-full min-h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white my-2 text-center capitalize flex items-center justify-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Riwayat Analisis
                    </h3>

                    <div className="w-full py-3 flex-1 overflow-y-auto space-y-2 scrollbar-hide">
                        {logsOnSelectedDate.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">
                                <p className="text-sm">Tidak ada data pada tanggal ini.</p>
                            </div>
                        ) : (
                            logsOnSelectedDate.map((log) => {
                                const isActive = selectedAssessment?.id === log.id;
                                return (
                                    <motion.button
                                        key={log.id}
                                        onClick={() => setSelectedAssessment(log)}
                                        className="relative w-[95%] p-2 rounded-2xl group outline-none"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isActive && (
                                            <>
                                                <motion.div
                                                    layoutId="activeHistoryBorder"
                                                    className="absolute -inset-0.5 rounded-xl opacity-60 blur-sm"
                                                    style={{ background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6)', backgroundSize: '200% 100%' }}
                                                    animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                />
                                                <motion.div
                                                    layoutId="activeHistoryBg"
                                                    className="absolute inset-0 bg-white dark:bg-[#1e1b4b]/50 rounded-xl border border-purple-200 dark:border-purple-500/30 shadow-sm"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                />
                                            </>
                                        )}
                                        <div className={`relative flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${isActive ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                                            <div>
                                                <p className={`text-left text-[14px] font-bold mb-1 transition-colors ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    {new Date(log.created_at).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                                                </p>
                                                <div className="flex gap-2">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${isActive ? 'bg-indigo-100 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                                        Stress: {log.stress_score}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className={`text-xs font-medium ${isActive ? 'text-cyan-600 dark:text-cyan-300' : 'text-slate-400 dark:text-slate-500'}`}>
                                                    {new Date(log.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                                {isActive && (
                                                    <motion.div className="relative" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,1)]" />
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 6. AI Summary Report (Desktop: #6, Row 3 Left) */}
                <div className="order-6 lg:order-6 lg:col-span-6 bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900/50 dark:to-slate-900/50 border border-white/60 dark:border-white/10 rounded-[30px] p-6 shadow-sm dark:shadow-xl relative overflow-hidden flex flex-col justify-between">
                    <h3 className="text-md font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-indigo-500" /> Ringkasan AI
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        "{aiData?.summary || "Tidak ada ringkasan tersedia."}"
                    </p>
                    <button
                        onClick={() => onChatRequest(selectedAssessment)}
                        className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
                    >
                        <MessageCircle className="w-3 h-3" />
                        Tanya detail ke AI
                    </button>
                    {/* Background Decor */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                </div>

                {/* 7. Insight Performance (Desktop: #7, Row 3 Right) */}
                <div className="order-7 lg:order-7 lg:col-span-6 bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900/50 dark:to-slate-900/50 border border-white/60 dark:border-white/10 rounded-[30px] p-6 shadow-sm dark:shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-20 h-20 bg-green-500/10 rounded-full blur-xl"></div>
                    <h3 className="text-md font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-500" /> Insight Performa
                    </h3>

                    {(() => {
                        const currentIndex = allHistory.findIndex(h => h.id === selectedAssessment?.id);
                        const prevAssessment = allHistory[currentIndex + 1];

                        if (!prevAssessment || !selectedAssessment) {
                            return <p className="text-slate-500 text-sm">Ini adalah analisis pertamamu. Lakukan lebih banyak tes untuk melihat perbandingan!</p>;
                        }

                        const stressDiff = selectedAssessment.stress_score - prevAssessment.stress_score;
                        const better = stressDiff < 0;

                        return (
                            <div className="space-y-2">
                                <div className={`p-3 rounded-xl border ${better ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20' : 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        {better ? <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" /> : <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
                                        <span className={`text-xs font-bold ${better ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>
                                            {better ? 'Progres Positif!' : 'Perlu Perhatian'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        Skor stres kamu {better ? 'turun' : 'naik'} <span className="font-bold">{Math.abs(stressDiff)} poin</span> dibanding sesi sebelumnya.
                                    </p>
                                </div>
                                <p className="text-xs text-slate-400 italic">
                                    *Dibandingkan dengan {new Date(prevAssessment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </p>
                            </div>
                        );
                    })()}
                </div>

            </div>
        </motion.div>
    );
};

export default AnalysisTab;
