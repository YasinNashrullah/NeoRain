import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle, AlertCircle, BrainCircuit } from 'lucide-react';
import { api } from '../utils/api';
import { config } from '../utils/config';

// --- DATA PERTANYAAN (DASS-21) ---
const questions = [
  { id: 1, type: 'S', text: "Saya merasa susah untuk beristirahat" },
  { id: 2, type: 'A', text: "Saya merasa mulut saya kering" },
  { id: 3, type: 'D', text: "Saya merasa tidak ada hal yang positif di masa depan" },
  { id: 4, type: 'A', text: "Saya mengalami kesulitan bernapas (misal: terengah-engah)" },
  { id: 5, type: 'D', text: "Saya merasa sedih dan tertekan" },
  { id: 6, type: 'S', text: "Saya cenderung bereaksi berlebihan terhadap situasi" },
  { id: 7, type: 'A', text: "Saya merasa gemetar (misal: pada tangan)" },
  { id: 8, type: 'S', text: "Saya merasa sulit untuk bersantai" },
  { id: 9, type: 'A', text: "Saya berada dalam situasi yang membuat saya cemas berlebih" },
  { id: 10, type: 'D', text: "Saya merasa tidak ada harapan" },
  { id: 11, type: 'S', text: "Saya merasa mudah gelisah" },
  { id: 12, type: 'S', text: "Saya merasa sulit untuk mentoleransi gangguan" },
  { id: 13, type: 'D', text: "Saya merasa sedih dan murung" },
  { id: 14, type: 'S', text: "Saya tidak bisa memaklumi hal apapun yang menghalangi saya" },
  { id: 15, type: 'A', text: "Saya merasa panik" },
  { id: 16, type: 'D', text: "Saya kehilangan minat pada segala hal" },
  { id: 17, type: 'D', text: "Saya merasa tidak berharga sebagai seseorang" },
  { id: 18, type: 'S', text: "Saya merasa mudah tersinggung" },
  { id: 19, type: 'A', text: "Saya menyadari detak jantung saya walau tidak habis olahraga" },
  { id: 20, type: 'A', text: "Saya merasa takut tanpa alasan yang jelas" },
  { id: 21, type: 'D', text: "Saya merasa hidup ini tidak berarti" },
];

const options = [
  { val: 0, label: "Tidak Sesuai", desc: "Tidak pernah terjadi" },
  { val: 1, label: "Kadang-kadang", desc: "Jarang terjadi" },
  { val: 2, label: "Sering", desc: "Cukup sering terjadi" },
  { val: 3, label: "Sangat Sering", desc: "Hampir selalu terjadi" },
];

const Analyze = ({ userData, onFinish }) => {
  const [step, setStep] = useState('intro'); // intro, quiz, processing
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleAnswer = (val) => {
    setAnswers({ ...answers, [questions[currentQ].id]: val });
    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 200);
    } else {
      finishQuiz();
    }
  };

  // --- FUNGSI UTAMA: HITUNG SKOR & PANGGIL AI ---
  const finishQuiz = async () => {
    setStep('processing');

    // 1. Hitung Skor Manual (DASS-21)
    let d = 0, a = 0, s = 0;
    questions.forEach(q => {
      const val = answers[q.id] || 0;
      if (q.type === 'D') d += val;
      if (q.type === 'A') a += val;
      if (q.type === 'S') s += val;
    });

    // Skor DASS-21 dikali 2 untuk menyamai DASS-42
    const scores = { depression: d * 2, anxiety: a * 2, stress: s * 2 };

    try {
      const { apiKey, baseUrl, model } = config.gemini;

      if (!apiKey) {
        throw new Error("API Key (VITE_GEMINI_API_KEY) missing. Please add it to .env");
      }

      const prompt = `
        Bertindaklah sebagai Psikolog Klinis.
        User memiliki skor DASS-21:
        - Depresi: ${scores.depression}
        - Kecemasan: ${scores.anxiety}
        - Stres: ${scores.stress}
        
        Tugas: Berikan analisis dalam format JSON murni.
        
        Format JSON wajib seperti ini:
        {
          "summary": "Kalimat penenang singkat (maks 2 kalimat).",
          "factors": "Dugaan faktor penyebab umum (bahasa halus).",
          "actions": ["Saran aksi 1", "Saran aksi 2", "Saran aksi 3"],
          "education": "Info edukatif singkat."
        }
        Gunakan Bahasa Indonesia yang santai tapi profesional.
      `;

      // 2. Request ke Google Gemini API
      const response = await fetch(`${baseUrl}/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API Error ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error("Invalid Gemini Response Structure");
      }

      const rawText = data.candidates[0].content.parts[0].text;
      console.log("Raw AI Response:", rawText);

      let aiAnalysis;
      try {
        aiAnalysis = JSON.parse(rawText);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        // Fallback (Rare with Native JSON)
        aiAnalysis = {
          summary: "Analisis selesai. Skor kamu telah direkam.",
          factors: "Tidak dapat memuat detail faktor saat ini.",
          actions: ["Istirahat yang cukup", "Konsultasi profesional jika perlu"],
          education: "Kesehatan mental sama pentingnya dengan kesehatan fisik."
        };
      }

      // 4. Simpan ke Database Laravel
      const payload = {
        firebase_uid: userData?.uid,
        depression_score: scores.depression,
        anxiety_score: scores.anxiety,
        stress_score: scores.stress,
        ai_analysis: aiAnalysis // Kirim object JSON
      };

      await api.saveAssessment(payload);

      // 5. Selesai & Pindah Halaman
      setTimeout(() => {
        onFinish();
      }, 1000);

    } catch (error) {
      console.error("CRITICAL ERROR:", error);
      alert(`Gagal memproses: ${error.message}. Cek Console untuk detail.`);
      setStep('intro'); // Reset ke awal agar user bisa coba lagi
    }
  };

  return (
    <div className="w-full h-full bg-slate-950 text-white flex flex-col relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,_rgba(88,28,135,0.2)_0%,_transparent_70%)] pointer-events-none"></div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">

        <AnimatePresence mode='wait'>
          {/* 1. INTRO SCREEN */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/30">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Cek Kesehatan Mentalmu</h1>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Kuesioner ini menggunakan metode <strong>DASS-21</strong> dibantu <strong>AI</strong> untuk memberikan saran yang personal.
              </p>
              <button
                onClick={() => setStep('quiz')}
                className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 mx-auto"
              >
                Mulai Tes <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* 2. QUIZ SCREEN */}
          {step === 'quiz' && (
            <motion.div
              key="quiz"
              className="w-full max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Pertanyaan {currentQ + 1}</span>
                  <span>dari {questions.length}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="min-h-[120px] mb-8 flex items-center justify-center text-center">
                <h2 className="text-2xl md:text-3xl font-bold leading-snug">
                  {questions[currentQ].text}
                </h2>
              </div>

              {/* Options */}
              <div className="grid gap-4">
                {options.map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => handleAnswer(opt.val)}
                    className="w-full p-5 rounded-2xl bg-slate-900 border border-white/10 hover:bg-purple-600 hover:border-purple-500 transition-all group text-left flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-lg text-white group-hover:text-white">{opt.label}</div>
                      <div className="text-sm text-slate-500 group-hover:text-purple-200">{opt.desc}</div>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-slate-600 group-hover:border-white group-hover:bg-white/20"></div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* 3. PROCESSING SCREEN */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <BrainCircuit className="absolute inset-0 m-auto w-10 h-10 text-purple-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold mb-2">AI Sedang Menganalisa...</h2>
              <p className="text-slate-400">Menyusun laporan kesehatan mentalmu.</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Analyze;