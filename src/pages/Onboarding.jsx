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
    <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center relative overflow-hidden font-sans">

      {/* Background Blobs Global */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full md:h-auto md:max-w-2xl bg-slate-950 md:bg-white/5 md:backdrop-blur-xl md:border md:border-white/10 md:rounded-[2.5rem] md:shadow-2xl relative z-10 overflow-hidden flex flex-col"
      >
        <div className="p-8 md:p-12 flex flex-col h-full">

          {/* Header */}
          <div className="mb-8 md:mb-10">
            {/* Progress Bar */}
            <div className="flex gap-2 mb-8">
              {questions.map((_, idx) => (
                <div key={idx} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${idx <= step ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`}></div>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-300">Personalisasi AI</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight text-white">Mari saling<br className="md:hidden" /> mengenal.</h1>
            <p className="text-slate-400 text-sm md:text-base">Bantu kami menyesuaikan pengalamanmu agar lebih relevan.</p>
          </div>

          {/* Questions Area */}
          <div className="flex-1 flex flex-col justify-center pb-4 md:pb-0">
            <AnimatePresence mode='wait'>
              <motion.div
                key={step}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <h2 className="text-xl md:text-2xl font-semibold mb-6 text-white">{questions[step].question}</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {questions[step].options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSelect(opt)}
                      className="w-full p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-indigo-600/20 hover:border-indigo-500/50 hover:shadow-lg text-left transition-all flex justify-between items-center group active:scale-[0.98]"
                    >
                      <span className="text-slate-200 font-medium group-hover:text-white">{opt}</span>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-colors flex-shrink-0 ml-2">
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;