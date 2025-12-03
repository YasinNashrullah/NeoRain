import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';

const Onboarding = ({ onFinish }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 'role',
      question: "Apa statusmu saat ini?",
      options: ["Mahasiswa Baru", "Pejuang Skripsi", "Anak Organisasi", "Kupu-kupu (Kuliah Pulang)"]
    },
    {
      id: 'struggle',
      question: "Apa tantangan terbesarmu?",
      options: ["Susah Tidur (Insomnia)", "Overthinking Tugas", "Homesick / Kesepian", "Keuangan Menipis"]
    },
    {
      id: 'goal',
      question: "Apa goal utamamu pakai apps ini?",
      options: ["Ingin Teman Curhat", "Ingin Tidur Teratur", "Manajemen Stres", "Sekadar Iseng"]
    }
  ];

  const handleSelect = (option) => {
    const newAnswers = { ...answers, [questions[step].id]: option };
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      onFinish(newAnswers);
    }
  };

  return (
    // FIX: Gunakan w-full h-full absolute inset-0 agar tidak ada celah
    <div className="absolute inset-0 w-full h-full bg-slate-950 text-white flex flex-col overflow-hidden z-50">
      
      {/* Background Blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-8 pt-16">
        
        {/* Header */}
        <div className="mb-8">
          {/* Progress Bar */}
          <div className="flex gap-2 mb-6">
            {questions.map((_, idx) => (
              <div key={idx} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${idx <= step ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`}></div>
            ))}
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-300">Personalisasi AI</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2 leading-tight">Mari saling<br/>mengenal.</h1>
          <p className="text-slate-400 text-sm">Bantu kami menyesuaikan pengalamanmu.</p>
        </div>

        {/* Questions Area */}
        <div className="flex-1 flex flex-col justify-center pb-10">
          <AnimatePresence mode='wait'>
            <motion.div
              key={step}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <h2 className="text-xl font-semibold mb-6 text-white">{questions[step].question}</h2>
              <div className="space-y-3">
                {questions[step].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className="w-full p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-indigo-600/20 hover:border-indigo-500/50 hover:shadow-lg text-left transition-all flex justify-between items-center group active:scale-[0.98]"
                  >
                    <span className="text-slate-200 font-medium group-hover:text-white">{opt}</span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;