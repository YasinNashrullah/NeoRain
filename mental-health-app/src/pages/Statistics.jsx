import React, { useState, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, HeartPulse, Zap, AlertTriangle, CheckCircle2, 
  Calendar as CalendarIcon, ChevronRight, Clock, BookOpen, Target, 
  Activity, TrendingUp, History, FileText
} from 'lucide-react';
import { api } from '../utils/api';

const Statistics = ({ userData }) => {
  const [allHistory, setAllHistory] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (userData?.uid) {
        const history = await api.getAssessmentHistory(userData.uid);
        setAllHistory(history);
        if (history.length > 0) setSelectedAssessment(history[0]);
      }
      setLoading(false);
    };
    loadData();
  }, [userData]);

  // Helper: Parse JSON AI (karena dari DB bentuknya string JSON)
  const getAIReport = (data) => {
    if (!data || !data.ai_analysis) return null;
    try {
      return typeof data.ai_analysis === 'string' 
        ? JSON.parse(data.ai_analysis) 
        : data.ai_analysis;
    } catch (e) {
      return null;
    }
  };

  const getSeverity = (score, type) => {
    const limits = { depression: [9, 13, 20, 27], anxiety: [7, 9, 14, 19], stress: [14, 18, 25, 33] };
    const limit = limits[type];
    if (score <= limit[0]) return { label: 'Normal', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
    if (score <= limit[1]) return { label: 'Ringan', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
    if (score <= limit[2]) return { label: 'Sedang', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
    if (score <= limit[3]) return { label: 'Parah', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    return { label: 'Sangat Parah', color: 'text-red-600', bg: 'bg-red-600/10', border: 'border-red-600/20' };
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Memuat data...</div>;

  const aiData = getAIReport(selectedAssessment);
  const depStat = selectedAssessment ? getSeverity(selectedAssessment.depression_score, 'depression') : {};
  const anxStat = selectedAssessment ? getSeverity(selectedAssessment.anxiety_score, 'anxiety') : {};
  const strStat = selectedAssessment ? getSeverity(selectedAssessment.stress_score, 'stress') : {};

  // Chart Data
  const chartData = selectedAssessment ? [
    { subject: 'Depresi', A: selectedAssessment.depression_score, fullMark: 42 },
    { subject: 'Kecemasan', A: selectedAssessment.anxiety_score, fullMark: 42 },
    { subject: 'Stres', A: selectedAssessment.stress_score, fullMark: 42 },
  ] : [];

  return (
    <div className="w-full h-full bg-slate-950 text-white flex flex-col overflow-hidden">
      
      {/* 1. HEADER & SUMMARY CARDS (Fixed Top) */}
      <div className="flex-none p-6 md:p-8 pb-0">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Ringkasan Statistik</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-pink-600 to-rose-600 p-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase mb-1"><Activity className="w-4 h-4"/> Total Analisis</div>
              <div className="text-3xl font-bold">{allHistory.length}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase mb-1"><History className="w-4 h-4"/> Terakhir</div>
              <div className="text-sm font-medium truncate">{allHistory.length > 0 ? new Date(allHistory[0].created_at).toLocaleDateString() : '-'}</div>
            </div>
            {/* Placeholder Stats */}
            <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1"><TrendingUp className="w-4 h-4"/> Rata-rata Stres</div>
              <div className="text-2xl font-bold text-white">
                {allHistory.length > 0 ? Math.round(allHistory.reduce((a, b) => a + b.stress_score, 0) / allHistory.length) : 0}
              </div>
            </div>
            <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1"><CheckCircle2 className="w-4 h-4"/> Status</div>
              <div className="text-sm font-bold text-green-400">Aktif Memantau</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT (Scrollable Area) */}
      <div className="flex-1 overflow-hidden p-6 md:p-8 pt-4">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* === KOLOM KIRI: LIST RIWAYAT (Scrollable) === */}
          <div className="lg:col-span-4 flex flex-col h-full bg-slate-900 border border-white/10 rounded-[30px] overflow-hidden">
            <div className="p-5 border-b border-white/5 bg-slate-900 sticky top-0 z-10">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Riwayat Analisis
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {allHistory.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-10">Belum ada riwayat.</p>
              ) : (
                allHistory.map((log) => (
                  <button
                    key={log.id}
                    onClick={() => setSelectedAssessment(log)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 group ${
                      selectedAssessment?.id === log.id 
                        ? 'bg-indigo-600 border-indigo-500 shadow-lg' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-xs font-bold ${selectedAssessment?.id === log.id ? 'text-white' : 'text-slate-300'}`}>
                        {new Date(log.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full bg-black/20 ${selectedAssessment?.id === log.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] bg-black/20 px-2 py-1 rounded text-white/80">D: {log.depression_score}</span>
                      <span className="text-[10px] bg-black/20 px-2 py-1 rounded text-white/80">A: {log.anxiety_score}</span>
                      <span className="text-[10px] bg-black/20 px-2 py-1 rounded text-white/80">S: {log.stress_score}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* === KOLOM KANAN: DETAIL REPORT (Scrollable) === */}
          <div className="lg:col-span-8 h-full bg-white text-slate-900 rounded-[30px] overflow-hidden flex flex-col shadow-2xl relative">
            {selectedAssessment ? (
              <>
                {/* Header Report */}
                <div className="p-8 pb-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">Laporan Analisis Mental</h2>
                      <p className="text-slate-500 text-sm mt-1">
                        Dibuat pada {new Date(selectedAssessment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm">
                      ID: #{selectedAssessment.id}
                    </div>
                  </div>
                </div>

                {/* Content Report (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-8 scrollbar-hide">
                  
                  {/* 1. Ringkasan Skor & Chart */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" /> Ringkasan Skor
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                          <span className="text-sm font-medium text-slate-600">Depresi</span>
                          <div className="text-right">
                            <span className="text-lg font-bold text-slate-800 block">{selectedAssessment.depression_score}</span>
                            <span className={`text-[10px] font-bold uppercase ${depStat.color.replace('text-', 'text-')}`}>{depStat.label}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                          <span className="text-sm font-medium text-slate-600">Kecemasan</span>
                          <div className="text-right">
                            <span className="text-lg font-bold text-slate-800 block">{selectedAssessment.anxiety_score}</span>
                            <span className={`text-[10px] font-bold uppercase ${anxStat.color.replace('text-', 'text-')}`}>{anxStat.label}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                          <span className="text-sm font-medium text-slate-600">Stres</span>
                          <div className="text-right">
                            <span className="text-lg font-bold text-slate-800 block">{selectedAssessment.stress_score}</span>
                            <span className={`text-[10px] font-bold uppercase ${strStat.color.replace('text-', 'text-')}`}>{strStat.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Radar Chart */}
                    <div className="h-[250px] bg-slate-50 rounded-2xl relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 42]} tick={false} axisLine={false} />
                          <Radar name="Skor" dataKey="A" stroke="#4f46e5" strokeWidth={3} fill="#6366f1" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 2. AI Analysis Content */}
                  {aiData ? (
                    <>
                      {/* Summary */}
                      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                        <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                          <BrainCircuit className="w-5 h-5" /> Analisis AI
                        </h3>
                        <p className="text-indigo-800 text-sm leading-relaxed">
                          "{aiData.summary}"
                        </p>
                        <div className="mt-4 pt-4 border-t border-indigo-200">
                          <p className="text-xs font-bold text-indigo-500 uppercase mb-1">Faktor Kemungkinan:</p>
                          <p className="text-sm text-indigo-700">{aiData.factors}</p>
                        </div>
                      </div>

                      {/* Action Plan */}
                      <div>
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-600" /> Rencana Aksi Personal
                        </h3>
                        <div className="grid gap-3">
                          {aiData.actions?.map((action, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600 font-bold text-xs">
                                {idx + 1}
                              </div>
                              <p className="text-sm text-slate-600">{action}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Education */}
                      <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                        <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                          <BookOpen className="w-5 h-5" /> Edukasi & Wawasan
                        </h3>
                        <p className="text-orange-800 text-sm leading-relaxed">
                          {aiData.education}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-500 text-sm">
                      Analisis AI tidak tersedia untuk data lama.
                    </div>
                  )}

                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <FileText className="w-16 h-16 mb-4 opacity-20" />
                <p>Pilih riwayat di sebelah kiri untuk melihat detail laporan.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Statistics;