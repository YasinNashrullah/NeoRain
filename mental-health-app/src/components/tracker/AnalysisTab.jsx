import React, { useState, useEffect } from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BrainCircuit, HeartPulse, Zap, AlertTriangle, CheckCircle2,
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock,
    BookOpen, Target, Activity, TrendingUp, TrendingDown, FileText, Loader2, MessageCircle
} from 'lucide-react';
import { api } from '../../utils/api';

const AnalysisTab = ({ userData, onChatRequest, onNavigate }) => {
    const [allHistory, setAllHistory] = useState([]);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    // Data
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

    // AI
    const getAIReport = (data) => {
        if (!data || !data.ai_analysis) return null;
        try {
            return typeof data.ai_analysis === 'string' ? JSON.parse(data.ai_analysis) : data.ai_analysis;
        } catch (e) { return null; }
    };

    const getSeverity = (score, type) => {
        const limits = { depression: [9, 13, 20, 27], anxiety: [7, 9, 14, 19], stress: [14, 18, 25, 33] };
        const limit = limits[type];
        if (score <= limit[0]) return { label: 'Normal', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50' };
        if (score <= limit[1]) return { label: 'Ringan', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' };
        if (score <= limit[2]) return { label: 'Sedang', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/50' };
        if (score <= limit[3]) return { label: 'Parah', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50' };
        return { label: 'Sangat Parah', color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/50' };
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

    // Calendar
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

            let bgClass = "text-slate-400 hover:bg-white/5";
            if (isSelected) bgClass = "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/50";
            else if (hasLog) bgClass = "bg-white/5 text-white border border-white/20 font-semibold";

            days.push(
                <button
                    key={day}
                    onClick={() => setSelectedDate(thisDate)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs relative transition-all ${bgClass}`}
                >
                    {day}
                    {hasLog && !isSelected && <div className="absolute bottom-0.5 w-1 h-1 bg-green-400 rounded-full shadow-[0_0_5px_rgba(74,222,128,0.8)]"></div>}
                </button>
            );
        }
        return days;
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-white/10 p-3 rounded-xl shadow-xl">
                    <p className="text-slate-300 text-xs font-bold mb-1">{payload[0].payload.subject}</p>
                    <p className="text-indigo-400 font-bold text-sm">
                        Skor: {payload[0].value} <span className="text-slate-500 text-[10px]">/ 42</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading)
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-white">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                <p className="text-slate-400 animate-pulse">Memuat data statistik...</p>
            </div>
        );

    if (!loading && allHistory.length === 0)
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 min-h-[400px]">
                <div className="max-w-md w-full bg-slate-900/50 border border-white/10 rounded-[30px] p-8 shadow-2xl text-center relative overflow-hidden">
                    {/* Background Effects */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
                            <BrainCircuit className="w-10 h-10 text-indigo-400" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-3">Belum Ada Data Analisis</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            Kamu belum melakukan analisis kesehatan mental. Yuk, mulai analisis sekarang untuk mengetahui kondisi kesehatan mentalmu!
                        </p>

                        <button
                            onClick={() => onNavigate('analyze')}
                            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 font-bold text-white transition-all duration-300 bg-indigo-600 rounded-full hover:bg-indigo-500 hover:scale-105 shadow-lg shadow-indigo-500/30 overflow-hidden w-full"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
            className="w-full h-full text-white pb-24"
        >
            <div className="space-y-6">
                {/* Layout */}
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">

                    {/* Calendar */}
                    <div className="order-1 lg:col-span-4 lg:order-3 bg-slate-900/50 border border-white/10 rounded-[30px] p-6 text-white shadow-xl h-fit">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-md md:text-lg">Calendar</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
                                    className="p-1 hover:bg-white/10 rounded"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
                                    className="p-1 hover:bg-white/10 rounded"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="text-md text-center font-bold mb-4 text-slate-300">
                            {selectedDate.toLocaleString("default", { month: "long", year: "numeric" })}
                        </div>
                        <div className="grid grid-cols-7 text-center mb-2 text-[10px] text-slate-500 font-bold uppercase">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (<div key={d}>{d}</div>))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 place-items-center">
                            {renderCalendar()}
                        </div>
                    </div>

                    {/* History List */}
                    <div className="order-2 lg:col-span-4 lg:order-5 bg-slate-900/50 border border-white/10 rounded-[30px] p-3 shadow-xl h-fit max-h-[500px] flex flex-col">
                        <h3 className="text-lg font-bold text-white my-2 text-center capitalize flex items-center justify-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-400" /> Analysis History
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
                                                    {/* Border Glow */}
                                                    <motion.div
                                                        layoutId="activeHistoryBorder"
                                                        className="absolute -inset-0.5 rounded-xl opacity-60 blur-sm"
                                                        style={{
                                                            background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6)',
                                                            backgroundSize: '200% 100%'
                                                        }}
                                                        animate={{
                                                            backgroundPosition: ['0% 0%', '100% 0%'],
                                                        }}
                                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                                    />
                                                    {/* Solid Background */}
                                                    <motion.div
                                                        layoutId="activeHistoryBg"
                                                        className="absolute inset-0 bg-[#1e1b4b]/50 rounded-xl border border-purple-500/30"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.2 }}
                                                    />
                                                </>
                                            )}

                                            {/* Content */}
                                            <div className={`relative flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                                                }`}>

                                                {/* Date & Score */}
                                                <div>
                                                    <p className={`text-left text-[14px] font-bold mb-1 transition-colors ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                                        {new Date(log.created_at).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${isActive ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-500'}`}>
                                                            Stress: {log.stress_score}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Time Indicator */}
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-xs font-medium ${isActive ? 'text-cyan-300' : 'text-slate-500'}`}>
                                                        {new Date(log.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                                    </span>

                                                    {isActive && (
                                                        <motion.div
                                                            className="relative"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ type: "spring", stiffness: 500 }}
                                                        >
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

                    {/* Score Cards (Depression/Anxiety/Stress) */}
                    <div className="order-3 lg:col-span-3 lg:order-1 flex flex-col gap-4">
                        <AnimatePresence mode="wait">
                            {selectedAssessment && (
                                <motion.div
                                    key={selectedAssessment.id + "-scores"}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex flex-col gap-4"
                                >
                                    {[
                                        { label: "Depression", score: selectedAssessment.depression_score, type: "depression" },
                                        { label: "Anxiety", score: selectedAssessment.anxiety_score, type: "anxiety" },
                                        { label: "Stress", score: selectedAssessment.stress_score, type: "stress" },
                                    ].map((item) => {
                                        const stat = getSeverity(item.score, item.type);
                                        return (
                                            <div key={item.label} className={`relative overflow-hidden rounded-2xl h-28 shadow-lg group border ${stat.border}`}>
                                                <div className={`absolute inset-0 opacity-20 ${stat.bg.replace("/20", "/40")}`}></div>
                                                <div className="relative z-10 p-5 flex flex-col justify-between h-full">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-lg font-bold italic tracking-wider text-white">{item.label}</h3>
                                                        <span className="text-3xl font-black text-white">{item.score}</span>
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

                    {/* Radar Chart */}
                    <div className="order-4 lg:col-span-5 lg:order-2 bg-slate-900/50 border border-white/10 rounded-[30px] p-6 flex items-center justify-center shadow-2xl relative overflow-hidden min-h-[350px]">
                        <div className="absolute top-0 left-0 w-full h-full bg-indigo-500/5 rounded-full blur-3xl"></div>
                        <div className="w-full h-full relative z-10">
                            <h3 className="text-slate-400 font-bold text-center mb-2 absolute top-0 w-full text-sm uppercase tracking-widest">Chart Analysis</h3>
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
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="55%" outerRadius="80%" data={chartData}>
                                                <PolarGrid stroke="#334155" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: "bold" }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 42]} tick={false} axisLine={false} />
                                                <Radar name="Skor" dataKey="A" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.4} />
                                                <Tooltip content={<CustomTooltip />} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Detail: Action Plan & Insight */}
                    <div className="order-5 lg:col-span-8 lg:order-4 space-y-6">
                        <AnimatePresence mode='wait'>
                            {selectedAssessment && (
                                <motion.div
                                    key={selectedAssessment.id + "-details"}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                    className="space-y-6"
                                >
                                    {/* Action Plan */}
                                    <div className="bg-slate-900/50 border border-white/10 rounded-[30px] p-8 shadow-xl min-h-[250px] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl"></div>
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                                            <Target className="w-6 h-6 text-green-400" /> Action Plan
                                        </h3>
                                        <div className="grid gap-4 relative z-10">
                                            {aiData?.actions?.filter(action =>
                                                !action.toLowerCase().includes("mencari dukungan profesional") &&
                                                !action.toLowerCase().includes("psikolog atau psikiater")
                                            ).map((action, idx) => (
                                                <div key={idx} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                                    <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5 border border-green-500/50">
                                                        {idx + 1}
                                                    </div>
                                                    <p className="text-left text-slate-300 font-medium leading-relaxed">{action}</p>
                                                </div>
                                            )) || <p className="text-slate-500 italic">Tidak ada saran spesifik.</p>}
                                        </div>
                                    </div>

                                    {/* Insight */}
                                    <div className="bg-slate-900/50 border border-white/10 rounded-[30px] p-8 shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
                                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                                            <BookOpen className="w-6 h-6 text-blue-400" /> Insight & Education
                                        </h3>
                                        <div className="space-y-4 relative z-10">
                                            <p className="text-slate-300 text-left p-4 font-medium text-lg leading-relaxed">"{aiData?.summary}"</p>
                                            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                                <p className="text-sm text-left text-blue-200 italic">💡 {aiData?.education}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tombol Tanya AI */}
                                    <div className="flex justify-center pt-4">
                                        <button
                                            onClick={() => onChatRequest(selectedAssessment)}
                                            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 font-bold text-white transition-all duration-300 bg-indigo-600 rounded-full hover:bg-indigo-500 hover:scale-105 shadow-lg shadow-indigo-500/30 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <span className="relative flex items-center gap-2">
                                                <MessageCircle className="w-5 h-5" />
                                                Tanya AI tentang hasil ini
                                            </span>
                                        </button>
                                    </div>

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};

export default AnalysisTab;
