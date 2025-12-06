import React, { useState, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, HeartPulse, Zap, AlertTriangle, CheckCircle2, 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, 
  BookOpen, Target, Activity, TrendingUp, TrendingDown, FileText
} from 'lucide-react';
import { api } from '../utils/api';

const Statistics = ({ userData }) => {
  const [allHistory, setAllHistory] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
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

  // --- HELPERS ---
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

  // Filter History by Date
  const logsOnSelectedDate = allHistory.filter(log => 
    new Date(log.created_at).toDateString() === selectedDate.toDateString()
  );

  // Metrics
  const totalAnalysis = allHistory.length;
  const maxStress = allHistory.length > 0 ? Math.max(...allHistory.map(h => h.stress_score)) : 0;
  const minStress = allHistory.length > 0 ? Math.min(...allHistory.map(h => h.stress_score)) : 0;

  // Chart Data
  const chartData = selectedAssessment ? [
    { subject: 'Depression', A: selectedAssessment.depression_score, fullMark: 42 },
    { subject: 'Anxiety', A: selectedAssessment.anxiety_score, fullMark: 42 },
    { subject: 'Stress', A: selectedAssessment.stress_score, fullMark: 42 },
  ] : [];

  const aiData = getAIReport(selectedAssessment);

  // --- CALENDAR RENDERER (Style Tracker.jsx) ---
  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); 
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);

    for (let day = 1; day <= daysInMonth; day++) {
      const thisDate = new Date(year, month, day);
      thisDate.setHours(0,0,0,0);
      
      const hasLog = allHistory.some(log => new Date(log.created_at).setHours(0,0,0,0) === thisDate.getTime());
      const isSelected = thisDate.getTime() === new Date(selectedDate).setHours(0,0,0,0);

      // Style mirip Tracker.jsx
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

  // Custom Tooltip untuk Chart
  const CustomTooltip = ({ active, payload, label }) => {
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

  if (loading) return <div className="flex items-center justify-center h-full text-white">Loading data...</div>;

  return (
    <div className="w-full h-full bg-slate-950 text-white overflow-y-auto scrollbar-hide pb-24">
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        
        {/* 1. TOP METRICS BAR */}
        <div className="grid grid-cols-3 gap-4 mb-2">
          <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Total Analisis</p>
              <p className="text-2xl font-bold text-white">{totalAnalysis}</p>
            </div>
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Activity className="w-5 h-5"/></div>
          </div>
          <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Stress Tertinggi</p>
              <p className="text-2xl font-bold text-red-400">{maxStress}</p>
            </div>
            <div className="p-2 bg-red-500/20 rounded-lg text-red-400"><TrendingUp className="w-5 h-5"/></div>
          </div>
          <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Stress Terendah</p>
              <p className="text-2xl font-bold text-green-400">{minStress}</p>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><TrendingDown className="w-5 h-5"/></div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-8">Analysis Your Report</h1>

        {/* 2. MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* --- KOLOM 1: SCORE CARDS (30%) --- */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {[
              { label: 'Depression', score: selectedAssessment?.depression_score || 0, type: 'depression' },
              { label: 'Anxiety', score: selectedAssessment?.anxiety_score || 0, type: 'anxiety' },
              { label: 'Stress', score: selectedAssessment?.stress_score || 0, type: 'stress' },
            ].map((item, idx) => {
              const stat = getSeverity(item.score, item.type);
              return (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative overflow-hidden rounded-2xl h-28 shadow-lg group border ${stat.border}`}
                >
                  {/* Gradient Background Neon */}
                  <div className={`absolute inset-0 opacity-20 ${stat.bg.replace('/20', '/40')}`}></div>
                  
                  <div className="relative z-10 p-5 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold italic tracking-wider text-white">{item.label}</h3>
                      <span className="text-3xl font-black text-white">{item.score}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold italic ${stat.color}`}>{stat.label}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* --- KOLOM 2: RADAR CHART (40%) --- */}
          <div className="lg:col-span-5 bg-slate-900 border border-white/10 rounded-[30px] p-6 flex items-center justify-center shadow-2xl relative overflow-hidden min-h-[350px]">
             {/* Background Glow */}
             <div className="absolute top-0 left-0 w-full h-full bg-indigo-500/5 rounded-full blur-3xl"></div>
             
             <div className="w-full h-full relative z-10">
                <h3 className="text-slate-400 font-bold text-center mb-2 absolute top-0 w-full text-sm uppercase tracking-widest">Chart Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="55%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 42]} tick={false} axisLine={false} />
                    <Radar 
                      name="Skor" 
                      dataKey="A" 
                      stroke="#8b5cf6" 
                      strokeWidth={3} 
                      fill="#8b5cf6" 
                      fillOpacity={0.4} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* --- KOLOM 3: CALENDAR (30%) --- */}
          <div className="lg:col-span-4 bg-slate-900 border border-white/10 rounded-[30px] p-6 text-white shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Calendar</h3>
              <div className="flex gap-1">
                <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))} className="p-1 hover:bg-white/10 rounded"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))} className="p-1 hover:bg-white/10 rounded"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="text-center font-bold mb-4 text-slate-300">
              {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <div className="grid grid-cols-7 text-center mb-2 text-[10px] text-slate-500 font-bold uppercase">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 place-items-center">
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* 3. BOTTOM ROW (DETAILS & HISTORY) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* Action Plan Card (Dark Mode) */}
            <div className="bg-slate-900 border border-white/10 rounded-[30px] p-8 shadow-xl min-h-[250px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <Target className="w-6 h-6 text-green-400" /> Action Plan
              </h3>
              {selectedAssessment ? (
                <div className="grid gap-4 relative z-10">
                  {getAIReport(selectedAssessment)?.actions?.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5 border border-green-500/50">
                        {idx + 1}
                      </div>
                      <p className="text-slate-300 font-medium leading-relaxed">{action}</p>
                    </div>
                  )) || <p className="text-slate-500 italic">Tidak ada saran spesifik.</p>}
                </div>
              ) : (
                <p className="text-slate-500">Pilih data untuk melihat rencana aksi.</p>
              )}
            </div>

            {/* Insight & Education Card (Dark Mode) */}
            <div className="bg-slate-900 border border-white/10 rounded-[30px] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                <BookOpen className="w-6 h-6 text-blue-400" /> Insight & Education
              </h3>
              {selectedAssessment ? (
                <div className="space-y-4 relative z-10">
                  <p className="text-slate-300 font-medium text-lg leading-relaxed">
                    "{getAIReport(selectedAssessment)?.summary}"
                  </p>
                  <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <p className="text-sm text-blue-200 italic">
                      💡 {getAIReport(selectedAssessment)?.education}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">Pilih data untuk melihat insight.</p>
              )}
            </div>

          </div>

          {/* --- RIGHT: HISTORY LIST (4 Cols) --- */}
          <div className="lg:col-span-4 bg-slate-900 border border-white/10 rounded-[30px] p-6 shadow-xl h-full flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 text-center capitalize flex items-center justify-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" /> Analysis History
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide max-h-[500px] pr-2">
              {logsOnSelectedDate.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <p className="text-sm">Tidak ada data pada tanggal ini.</p>
                </div>
              ) : (
                logsOnSelectedDate.map((log) => (
                  <motion.button
                    key={log.id}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAssessment(log)}
                    className={`w-full p-4 rounded-2xl text-left relative overflow-hidden shadow-md transition-all group ${
                      selectedAssessment?.id === log.id 
                        ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-indigo-500' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Active Background Glow */}
                    {selectedAssessment?.id === log.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-100"></div>
                    )}
                    {/* Inactive Background */}
                    {selectedAssessment?.id !== log.id && (
                      <div className="absolute inset-0 bg-slate-800 border border-white/5"></div>
                    )}
                    
                    <div className="relative z-10 flex justify-between items-center text-white">
                      <div>
                        <p className={`text-xs font-bold mb-1 ${selectedAssessment?.id === log.id ? 'text-white' : 'text-slate-400'}`}>
                          {new Date(log.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <div className="flex gap-2">
                           <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-white/90">D: {log.depression_score}</span>
                           <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-white/90">A: {log.anxiety_score}</span>
                           <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-white/90">S: {log.stress_score}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-[10px] font-bold backdrop-blur-sm ${
                          selectedAssessment?.id === log.id ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Statistics;