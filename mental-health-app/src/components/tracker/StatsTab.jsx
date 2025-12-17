import React from 'react';
import { motion } from 'framer-motion';
import {
    Activity, MessageSquare, Target, Flame, Calendar as CalendarIcon, Sun, Moon, Star,
    BarChart2, TrendingUp, CloudRain, Smile
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatsTab = ({
    statsRange,
    setStatsRange,
    statsData,
    onNavigate,
    getMoodConfig
}) => {
    return (
        <motion.div
            key="stats"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
            {/* Top Row: Controls, Wellness, Chat */}
            <div className="lg:col-span-4 bg-slate-900/50 border border-white/10 rounded-[30px] p-6 flex flex-col items-center justify-center text-center">
                <div className="w-full">
                    <h3 className="text-lg font-bold text-white mb-1">Mood Stats</h3>
                    <p className="text-xs text-slate-400 mb-6">Select time range</p>

                    <div className="bg-white/5 justify-center p-1 rounded-2xl flex gap-1 w-full">
                        {['daily', 'weekly', 'monthly'].map(r => (
                            <button
                                key={r}
                                onClick={() => setStatsRange(r)}
                                className={`flex - 1 min - w - 0 py - 2 rounded - xl text - [10px] sm: text - xs font - bold capitalize transition - all duration - 300 truncate ${statsRange === r ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'} `}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 bg-slate-900/50 border border-white/10 rounded-[30px] p-6 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/5"></div>
                <div className="relative z-10 text-center">
                    <div className="flex items-center gap-2 justify-center text-slate-400 mb-2">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Wellness Score</span>
                    </div>
                    <div className="relative inline-flex items-center justify-center">
                        <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * (statsData?.wellness_score || 0) / 100)} className="text-indigo-500 transition-all duration-1000 ease-out" />
                        </svg>
                        <span className="absolute text-2xl font-bold text-white">{statsData?.wellness_score || 0}</span>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 bg-slate-900/50 border border-white/10 rounded-[30px] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <h3 className="text-lg font-bold text-white mb-1 relative z-10">AI Chat</h3>
                <p className="text-[10px] text-slate-400 mb-4 relative z-10">Analyze your mood with AI</p>
                <button
                    onClick={() => onNavigate && onNavigate('chat')}
                    className="relative z-10 bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-white text-sm font-bold cursor-pointer active:scale-95"
                >
                    <MessageSquare className="w-4 h-4" /> Chat Now
                </button>
            </div>

            {/* Middle Row: Chart */}
            <div className="lg:col-span-12 bg-slate-900/50 border border-white/10 rounded-[30px] p-6 min-h-[300px]">
                <h3 className="text-sm font-bold text-white mb-6">Statistics</h3>
                <div className="h-[250px] w-full" style={{ minHeight: '250px' }}>
                    {statsData?.trend?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={statsData.trend}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis hide domain={[0, 6]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#818cf8' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500">
                            <BarChart2 className="w-10 h-10 mb-2 opacity-50" />
                            <p className="text-xs">Not enough data to display chart</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Smart Insights Section */}
            {statsData?.insights?.length > 0 && (
                <div className="lg:col-span-12 bg-slate-900/50 border border-white/10 rounded-[30px] p-6">
                    <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-400" /> Smart Insights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {statsData.insights.map((insight, idx) => {
                            const iconMap = { Flame, Calendar: CalendarIcon, Sun, Moon, Target, Activity, TrendingUp, CloudRain, Smile: Star }; // Mapped Smile to Star for generic or import Smile if needed.
                            // Actually I should import Smile.
                            const Icon = iconMap[insight.icon] || Star;
                            return (
                                <div key={idx} className={`p-4 rounded-2xl bg-white/5 flex items-center gap-4 hover:bg-white/10 transition-all cursor-default group`}>
                                    <div className={`w - 12 h - 12 rounded - xl bg - white / 10 flex items - center justify - center group - hover: scale - 110 transition - transform`}>
                                        <Icon className={`w - 6 h - 6 ${insight.color} `} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Insight</span>
                                        <span className="text-sm font-bold text-white">{insight.text}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Bottom Row: KPI Cards */}
            <div className="lg:col-span-4 bg-slate-900/50 border border-white/10 rounded-[30px] p-6 flex flex-col justify-between h-[180px]">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase">Average Mood</span>
                    <TrendingUp className="w-3 h-3" />
                </div>
                <div>
                    <h2 className="text-4xl font-bold text-white">{statsData?.average_score || "0.0"}<span className="text-lg text-slate-500">/5</span></h2>
                    <p className="text-[10px] text-slate-500 mt-2 font-bold">Based on {statsRange} data</p>
                </div>
            </div>

            <div className="lg:col-span-4 bg-slate-900/50 border border-white/10 rounded-[30px] p-6 flex flex-col justify-between h-[180px]">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase">Total Mood</span>
                </div>
                <div className="text-center">
                    <h2 className="text-5xl font-bold text-white">{statsData?.total_logs || 0}</h2>
                    <p className="text-[10px] text-slate-500 mt-2 font-bold">Entries recorded</p>
                </div>
            </div>

            <div className="lg:col-span-4 bg-slate-900/50 border border-white/10 rounded-[30px] p-6 flex flex-col justify-between h-[180px] relative overflow-hidden">
                <div className="flex items-center gap-2 text-slate-400 mb-2 relative z-10">
                    <span className="text-xs font-bold uppercase">Most Frequent</span>
                </div>
                <div className="flex flex-col items-center justify-center relative z-10">
                    {statsData?.most_frequent_mood ? (
                        <>
                            {(() => {
                                const m = getMoodConfig(statsData.most_frequent_mood);
                                return (
                                    <>
                                        <div className={`w - 16 h - 16 rounded - 2xl ${m.bg} flex items - center justify - center mb - 2 ${m.shadow} shadow - lg`}>
                                            <m.icon className={`w - 8 h - 8 ${m.color} `} />
                                        </div>
                                        <span className={`text - sm font - bold capitalize ${m.color} `}>{m.label}</span>
                                    </>
                                );
                            })()}
                        </>
                    ) : (
                        <span className="text-slate-500 text-xs">No data</span>
                    )}
                </div>
            </div>

        </motion.div>
    );
};

export default StatsTab;
