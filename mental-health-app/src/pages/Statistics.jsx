import React, { useState, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, HeartPulse, Zap, AlertTriangle, CheckCircle2, 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, BookOpen, Target
} from 'lucide-react';
import { api } from '../utils/api';

const Statistics = ({ userData }) => {
  const [allHistory, setAllHistory] = useState([]); // Semua data dari DB
  const [selectedDate, setSelectedDate] = useState(new Date()); // Tanggal yang dipilih di kalender
  const [selectedAssessment, setSelectedAssessment] = useState(null); // Data spesifik yang ditampilkan
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const loadData = async () => {
      if (userData?.uid) {
        const history = await api.getAssessmentHistory(userData.uid);
        setAllHistory(history);
        
        // Default: Tampilkan data paling baru (jika ada)
        if (history.length > 0) {
          setSelectedAssessment(history[0]);
          setSelectedDate(new Date(history[0].created_at));
        }
      }
      setLoading(false);
    };
    loadData();
  }, [userData]);

  // --- 2. HELPERS & LOGIC ---

  // Filter history berdasarkan tanggal yang dipilih di kalender
  const logsOnSelectedDate = allHistory.filter(log => 
    new Date(log.created_at).toDateString() === selectedDate.toDateString()
  );

  const getSeverity = (score, type) => {
    const limits = {
      depression: [9, 13, 20, 27],
      anxiety: [7, 9, 14, 19],
      stress: [14, 18, 25, 33]
    };
    const limit = limits[type];
    if (score <= limit[0]) return { label: 'Normal', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
    if (score <= limit[1]) return { label: 'Ringan', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
    if (score <= limit[2]) return { label: 'Sedang', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
    if (score <= limit[3]) return { label: 'Parah', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    return { label: 'Sangat Parah', color: 'text-red-600', bg: 'bg-red-600/10', border: 'border-red-600/20' };
  };

  // Generator Laporan Detail
  const generateReport = (data) => {
    if (!data) return null;
    const { depression_score: d, anxiety_score: a, stress_score: s } = data;
    
    let summary = "Kondisi mentalmu stabil.";
    let actions = ["Pertahankan pola tidur yang baik.", "Tetap terhubung dengan teman."];
    let education = "Kesehatan mental adalah bagian penting dari kehidupan. Menjaga keseimbangan emosi membantu produktivitas.";

    if (d > 20 || a > 14 || s > 25) {
      summary = "Terdeteksi tingkat tekanan yang signifikan.";
      actions = [
        "Segera hubungi konselor kampus atau psikolog profesional.",
        "Jangan memendam perasaan sendiri, cerita ke orang terpercaya.",
        "Gunakan fitur 'Panic Button' jika merasa tidak terkendali."
      ];
      education = "Tingkat stres atau kecemasan yang tinggi dapat mempengaruhi fisik. Penting untuk mencari bantuan profesional sedini mungkin.";
    } else if (d > 13 || a > 9 || s > 18) {
      summary = "Kamu sedang mengalami tekanan tingkat sedang.";
      actions = [
        "Lakukan teknik pernapasan 4-7-8 (Cek menu Tracker).",
        "Kurangi kafein dan begadang.",
        "Tulis jurnal untuk meluapkan pikiran (Cek menu Tracker)."
      ];
      education = "Stres moderat wajar terjadi saat banyak tugas, namun perlu dikelola agar tidak menjadi burnout.";
    }

    return { summary, actions, education };
  };

  // calender
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
      
      // Cek apakah ada history di tanggal ini
      const hasLog = allHistory.some(log => new Date(log.created_at).setHours(0,0,0,0) === thisDate.getTime());
      const isSelected = thisDate.getTime() === new Date(selectedDate).setHours(0,0,0,0);

      days.push(
        <button 
          key={day} 
          onClick={() => setSelectedDate(thisDate)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs relative transition-all ${
            isSelected ? 'bg-indigo-600 text-white font-bold shadow-lg' : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          {day}
          {hasLog && !isSelected && <div className="absolute bottom-0.5 w-1 h-1 bg-green-400 rounded-full"></div>}
        </button>
      );
    }
    return days;
  };

  // RENDER UTAMA
  if (loading) return <div className="p-10 text-center text-slate-500">Memuat data...</div>;

  if (allHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <BrainCircuit className="w-20 h-20 text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Belum Ada Data</h2>
        <p className="text-slate-400 mb-6">Lakukan tes di menu "Analyze" terlebih dahulu.</p>
      </div>
    );
  }

  const report = generateReport(selectedAssessment);
  const depStat = selectedAssessment ? getSeverity(selectedAssessment.depression_score, 'depression') : {};
  const anxStat = selectedAssessment ? getSeverity(selectedAssessment.anxiety_score, 'anxiety') : {};
  const strStat = selectedAssessment ? getSeverity(selectedAssessment.stress_score, 'stress') : {};

  // Data Chart dengan Label Angka
  const chartData = selectedAssessment ? [
    { subject: 'Depresi', A: selectedAssessment.depression_score, fullMark: 42 },
    { subject: 'Kecemasan', A: selectedAssessment.anxiety_score, fullMark: 42 },
    { subject: 'Stres', A: selectedAssessment.stress_score, fullMark: 42 },
  ] : [];

  return (
    <div className="w-full h-full bg-slate-950 text-white overflow-y-auto scrollbar-hide pb-24">
      <div className="max-w-7xl mx-auto p-4 md:p-8 h-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Kalender dan list riwayat */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            
            {/* 1. Calendar Widget */}
            <div className="bg-slate-900 border border-white/10 rounded-[30px] p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white">{selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <div className="flex gap-1">
                  <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))} className="p-1 hover:bg-white/10 rounded"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))} className="p-1 hover:bg-white/10 rounded"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center mb-2 text-[10px] text-slate-500 font-bold uppercase">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 place-items-center">
                {renderCalendar()}
              </div>
            </div>

            {/* 2. History List (Multiple per day) */}
            <div className="bg-slate-900 border border-white/10 rounded-[30px] p-6 flex-1 min-h-[300px]">
              <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">
                Riwayat: {selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
              </h3>
              
              <div className="space-y-3 overflow-y-auto max-h-[400px] scrollbar-hide">
                {logsOnSelectedDate.length === 0 ? (
                  <p className="text-slate-600 text-xs text-center py-10">Tidak ada tes pada tanggal ini.</p>
                ) : (
                  logsOnSelectedDate.map((log) => (
                    <button
                      key={log.id}
                      onClick={() => setSelectedAssessment(log)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                        selectedAssessment?.id === log.id 
                          ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/50' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className={`w-3 h-3 ${selectedAssessment?.id === log.id ? 'text-indigo-200' : 'text-slate-500'}`} />
                          <span className={`text-xs font-bold ${selectedAssessment?.id === log.id ? 'text-white' : 'text-slate-300'}`}>
                            {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </span>
                        </div>
                        <p className={`text-[10px] ${selectedAssessment?.id === log.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                          Skor Stres: {log.stress_score}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${selectedAssessment?.id === log.id ? 'text-white' : 'text-slate-600 group-hover:text-white'}`} />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* === KOLOM KANAN: DETAIL RESULT === */}
          <div className="lg:col-span-8">
            {selectedAssessment ? (
              <motion.div 
                key={selectedAssessment.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                
                {/* 1. Header Detail */}
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Laporan Analisis</h2>
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                      <CalendarIcon className="w-3 h-3" /> {new Date(selectedAssessment.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                      <Clock className="w-3 h-3" /> {new Date(selectedAssessment.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">ID Tes</span>
                    <p className="font-mono text-indigo-400">#{selectedAssessment.id}</p>
                  </div>
                </div>

                {/* 2. Chart & Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Radar Chart */}
                  <div className="md:col-span-5 bg-slate-900 border border-white/10 rounded-[30px] p-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                    <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-3xl"></div>
                    <div className="w-full h-[250px] relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 42]} tick={false} axisLine={false} />
                          <Radar name="Skor" dataKey="A" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.4} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                            itemStyle={{ color: '#8b5cf6' }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Score Cards */}
                  <div className="md:col-span-7 grid grid-cols-1 gap-3">
                    {[
                      { label: 'Depresi', score: selectedAssessment.depression_score, stat: depStat, icon: HeartPulse },
                      { label: 'Kecemasan', score: selectedAssessment.anxiety_score, stat: anxStat, icon: Zap },
                      { label: 'Stres', score: selectedAssessment.stress_score, stat: strStat, icon: AlertTriangle },
                    ].map((item, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border ${item.stat.border} ${item.stat.bg} flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl bg-slate-950/20 ${item.stat.color}`}>
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${item.stat.color}`}>{item.label}</p>
                            <p className="text-xs text-white/60">{item.stat.label}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">{item.score}</p>
                          <p className="text-[10px] text-white/40">/ 42</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. DETAIL LAPORAN (Action Plan & Education) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Rencana Aksi */}
                  <div className="bg-slate-900 border border-white/10 rounded-[30px] p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                      <Target className="w-5 h-5 text-green-400" /> Rencana Aksi
                    </h3>
                    <ul className="space-y-3 relative z-10">
                      {report.actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Edukasi & Insight */}
                  <div className="bg-slate-900 border border-white/10 rounded-[30px] p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                      <BookOpen className="w-5 h-5 text-blue-400" /> Edukasi & Insight
                    </h3>
                    <div className="relative z-10">
                      <p className="text-sm text-slate-300 leading-relaxed mb-4">
                        "{report.summary}"
                      </p>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <p className="text-xs text-slate-400 italic">
                          💡 {report.education}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 border-2 border-dashed border-slate-800 rounded-[30px]">
                <p>Pilih riwayat di sebelah kiri untuk melihat detail.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Statistics;