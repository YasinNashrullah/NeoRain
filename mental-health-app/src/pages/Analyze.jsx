import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle, AlertCircle, BrainCircuit } from 'lucide-react';
import { api } from '../utils/api';
import { config } from '../utils/config';
import { useToast } from '../components/ui/ToastProvider';

// data pertanyaan dass-21
const questions = [
  { id: 1, type: 'S', text: "Saya sulit untuk ditenangkan" },
  { id: 2, type: 'A', text: "Saya merasa mulut saya kering" },
  { id: 3, type: 'D', text: "Saya tidak dapat merasakan perasaan yang positif" },
  { id: 4, type: 'A', text: "Saya mengalami kesulitan bernafas (misalnya: sering terengah-engah meski tidak melakukan aktivitas fisik sebelumnya)" },
  { id: 5, type: 'D', text: "Saya sulit mendapatkan semangat untuk melakukan sesuatu" },
  { id: 6, type: 'S', text: "Saya cenderung bereaksi berlebihan terhadap suatu situasi" },
  { id: 7, type: 'A', text: "Saya mengalami gemetaran pada tangan" },
  { id: 8, type: 'S', text: "Saya merasakan menggunakan banyak energi untuk cemas" },
  { id: 9, type: 'A', text: "Saya merasa khawatir terhadap situasi dimana saya mungkin menjadi panik dan mempermalukan diri sendiri" },
  { id: 10, type: 'D', text: "Saya merasa tidak memiliki masa depan" },
  { id: 11, type: 'S', text: "Saya merasa semakin gelisah" },
  { id: 12, type: 'S', text: "Saya sulit untuk bersantai" },
  { id: 13, type: 'D', text: "Saya merasa sedih dan murung" },
  { id: 14, type: 'S', text: "Saya sulit untuk sabar dalam menghadapi gangguan terhadap hal yang sedang saya lakukan" },
  { id: 15, type: 'A', text: "Saya mudah menjadi panik" },
  { id: 16, type: 'D', text: "Saya tidak antusias terhadap sesuatu" },
  { id: 17, type: 'D', text: "Saya merasa tidak berharga" },
  { id: 18, type: 'S', text: "Saya merasa bahwa diri saya menjadi marah karena hal-hal sepele" },
  { id: 19, type: 'A', text: "Saya menyadari perubahan detak jantung, walaupun tidak sehabis melakukan aktivitas fisik (misalnya: merasa detak jantung meningkat atau melemah)" },
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
  const toast = useToast();
  const [step, setStep] = useState('intro'); // intro, quiz, processing
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = (val) => {
    setAnswers({ ...answers, [questions[currentQ].id]: val });
    // Auto-advance removed to favor manual "Lanjut" button for better control
    // if (currentQ < questions.length - 1) {
    //   setTimeout(() => setCurrentQ(currentQ + 1), 200);
    // }
  };

  // fungsi utama hitung skor panggil ai
  const finishQuiz = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setStep('processing');

    // hitung skor manual dass-21
    let d = 0, a = 0, s = 0;
    questions.forEach(q => {
      const val = answers[q.id] || 0;
      if (q.type === 'D') d += val;
      if (q.type === 'A') a += val;
      if (q.type === 'S') s += val;
    });

    // skor dass-21 dikali 2 untuk menyamai dass-42
    const scores = { depression: d * 2, anxiety: a * 2, stress: s * 2 };

    try {
      const { apiKey, baseUrl, model } = config.gemini;

      if (!apiKey) {
        throw new Error("API Key (VITE_GEMINI_API_KEY) missing. Please add it to .env");
      }

      // fetch contextual data moods gamification
      let moodContext = "Belum ada data mood.";
      let streakContext = "Belum ada streak.";

      if (userData?.uid) {
        try {
          const [moods, gamification] = await Promise.all([
            api.getMoods(userData.uid),
            api.getGamification(userData.uid)
          ]);

          // process moods last 7 days
          if (moods && moods.length > 0) {
            const recentMoods = moods.slice(0, 10).map(m => m.mood).join(", ");
            moodContext = `Riwayat Mood Terakhir: ${recentMoods}`;
          }

          // process gamification
          if (gamification) {
            streakContext = `Streak saat ini: ${gamification.streak || 0} hari.`;
          }
        } catch (err) {
          console.warn("Failed to fetch context data", err);
        }
      }

      const prompt = `
        Role: Psikolog Klinis Gen Z.
        User Data:
        - DASS-21: Depresi ${scores.depression}, Cemas ${scores.anxiety}, Stres ${scores.stress}.
        - Context: ${moodContext}. ${streakContext}.
        
        Task: JSON Analysis.
        
        Actions Rule:
        - 5 Self-Care steps.
        - NO prefixes (e.g. "Journaling:").
        - Descriptive, warm, persuasive sentences.
        - Language: Indonesian, chill, relatable, "cool".

        JSON Format:
        {
          "summary": "Validating & calming summary (max 2 sentences).",
          "factors": "Possible causes (student life, overthinking, etc).",
          "actions": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5"],
          "education": "Short insightful fact."
        }
      `;

      // request ke google gemini api
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
        // clean markdown code blocks if present
        const cleanText = rawText.replace(/```json|```/g, '').trim();
        aiAnalysis = JSON.parse(cleanText);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        // fallback rare with native json
        aiAnalysis = {
          summary: "Analisis selesai. Skor kamu telah direkam.",
          factors: "Tidak dapat memuat detail faktor saat ini.",
          actions: ["Istirahat yang cukup", "Konsultasi profesional jika perlu"],
          education: "Kesehatan mental sama pentingnya dengan kesehatan fisik."
        };
      }

      // simpan ke firestore
      const payload = {
        firebase_uid: userData?.uid,
        depression_score: scores.depression,
        anxiety_score: scores.anxiety,
        stress_score: scores.stress,
        ai_analysis: aiAnalysis // Kirim object JSON
      };

      const result = await api.saveAssessment(payload);
      if (!result) {
        throw new Error("Gagal menyimpan data ke server via API.");
      }

      // opsional simpan juga ke chat agar muncul di riwayat chat
      try {
        await api.saveChat({
          firebase_uid: userData?.uid,
          message: `Halo, ini hasil analisis kesehatan mentalmu:\n\n"${aiAnalysis.summary}"\n\nSaran: ${aiAnalysis.actions[0]}. Ceritakan lebih lanjut jika kamu mau.`,
          sender: 'ai',
          is_analysis: true
        });
      } catch (chatError) {
        console.warn("Gagal auto-save ke chat (non-critical):", chatError);
      }

      // selesai pindah halaman
      setTimeout(() => {
        onFinish();
      }, 1000);

    } catch (error) {
      console.error("CRITICAL ERROR:", error);
      toast.error(`Gagal memproses: ${error.message}.`);
      setStep('intro');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-0 w-full h-auto bg-[linear-gradient(0deg,#EEF1FF_0%,#D2DAFF_29%,#AAC4FF_66%,#B1B2FF_100%)] dark:bg-none dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col relative overflow-hidden">
      {/* background glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,_rgba(88,28,135,0.2)_0%,_transparent_70%)] pointer-events-none"></div>

      <div className="flex-1 w-full overflow-y-auto relative z-10 pb-32 md:pb-0">
        <div className="min-h-[85vh] flex flex-col items-center justify-center p-6">
          <AnimatePresence mode='wait'>
            {/* intro screen */}
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-md text-center mx-auto"
              >
                <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/30">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-4 text-slate-800 dark:text-white">Cek Kesehatan Mentalmu</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  Kuesioner ini menggunakan metode <strong>DASS-21</strong> dibantu <strong>AI</strong> untuk memberikan saran yang personal.
                </p>
                <button
                  onClick={() => setStep('quiz')}
                  className="bg-white dark:bg-white text-indigo-600 dark:text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-50 dark:hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 mx-auto shadow-lg shadow-indigo-500/10"
                >
                  Mulai Tes <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* quiz screen */}
            {step === 'quiz' && (
              <motion.div
                key="quiz"
                className="w-full max-w-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* progress bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span>Pertanyaan {currentQ + 1}</span>
                    <span>dari {questions.length}</span>
                  </div>
                  <div className="h-2 bg-white/50 dark:bg-slate-800 rounded-full overflow-hidden border border-white/20 dark:border-transparent">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* question card */}
                <div className="min-h-[120px] mb-8 flex items-center justify-center text-center">
                  <h2 className="text-2xl md:text-3xl font-bold leading-snug text-slate-800 dark:text-white">
                    {questions[currentQ].text}
                  </h2>
                </div>

                {/* options */}
                <div className="grid gap-4 mb-8">
                  {options.map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => handleAnswer(opt.val)}
                      className={`w-full p-5 rounded-2xl border transition-all group text-left flex items-center justify-between shadow-sm
                        ${answers[questions[currentQ].id] === opt.val
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-white/60 dark:bg-slate-900 border-white/40 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-slate-800 hover:border-purple-300'
                        }`}
                    >
                      <div>
                        <div className={`font-bold text-lg transition-colors ${answers[questions[currentQ].id] === opt.val ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{opt.label}</div>
                        <div className={`text-sm transition-colors ${answers[questions[currentQ].id] === opt.val ? 'text-purple-100' : 'text-slate-500 dark:text-slate-500'}`}>{opt.desc}</div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center
                        ${answers[questions[currentQ].id] === opt.val
                          ? 'border-white bg-white/20'
                          : 'border-slate-300 dark:border-slate-600'
                        }`}>
                        {answers[questions[currentQ].id] === opt.val && <div className="w-3 h-3 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => currentQ > 0 && setCurrentQ(currentQ - 1)}
                    disabled={currentQ === 0 || isSubmitting}
                    className="flex-1 py-4 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={() => {
                      if (currentQ < questions.length - 1) {
                        setCurrentQ(currentQ + 1);
                      } else {
                        finishQuiz();
                      }
                    }}
                    disabled={answers[questions[currentQ].id] === undefined || isSubmitting}
                    className="flex-1 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                  >
                    {currentQ === questions.length - 1 ? (
                      isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Memproses...
                        </>
                      ) : 'Selesai'
                    ) : 'Lanjut'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* processing screen */}
            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-white/30 dark:border-slate-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <BrainCircuit className="absolute inset-0 m-auto w-10 h-10 text-purple-600 dark:text-purple-400 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">AI Sedang Menganalisa...</h2>
                <p className="text-slate-500 dark:text-slate-400">Menyusun laporan kesehatan mentalmu.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Analyze;