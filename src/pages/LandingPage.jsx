import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  Sparkles, ChevronDown, Activity, Home, Heart, Target, MessageCircle, User,
  Flame, Quote, ArrowRight, CloudRain, Smile, Wind, Zap, Frown, Sun, Moon, BrainCircuit
} from 'lucide-react';
import logo from '../assets/neorain-logo-svg.svg';

// Reusable Animated Logo Component matching Sidebar.jsx
const AnimatedLogo = ({ className = "w-10 h-10", imgClassName = "w-[200%] h-[200%]" }) => (
  <motion.div
    className={`relative ${className} flex items-center justify-center transform-gpu`}
    whileHover={{ scale: 1.1, rotate: 180 }}
    transition={{ duration: 0.8, type: "spring" }}
  >
    <motion.div
      className="absolute inset-0 rounded-3xl blur-lg opacity-70 animate-pulse"
      animate={{ backgroundImage: 'linear-gradient(135deg, #ec4899, #a855f7, #6366f1)' }}
      transition={{ duration: 1 }}
    />
    <motion.div
      className="relative w-full h-full rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 overflow-hidden"
      animate={{ backgroundImage: 'linear-gradient(135deg, #ec4899, #a855f7, #6366f1)' }}
      transition={{ duration: 1 }}
    >
      <img
        src={logo}
        alt="NeoRain Logo"
        className={`${imgClassName} object-contain brightness-0 invert drop-shadow-md`}
      />
    </motion.div>
  </motion.div>
);

const LandingPage = ({ onLogin, onRegister, theme, toggleTheme }) => {
  const [activeSection, setActiveSection] = useState('main');
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // scroll listener for navbar style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['main', 'features', 'technology'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // simple entry animation
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#EEF1FF] dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-500">

      {/* smooth mesh gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* blob top left periwinkle */}
        {/* Simple Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30"></div>

        {/* overlay grid for texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* top progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-blue-500 origin-left z-[100]" style={{ scaleX }} />

      {/* navbar */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 dark:bg-slate-950/95 border-b border-white/20 dark:border-white/5 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between relative">

          {/* logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('main')}>
            <AnimatedLogo className="w-10 h-10" />
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white transition-colors">NeoRain</span>
          </div>

          {/* desktop menu */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-full border border-slate-200 dark:border-white/10 shadow-sm transition-colors">
            {['main', 'features', 'technology'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 capitalize ${activeSection === item ? 'text-indigo-600 dark:text-white bg-white/60 dark:bg-white/10 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* buttons */}
          <div className="flex items-center gap-3">
            {/* theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-colors shadow-sm"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-orange-500" />}
            </button>

            <button onClick={onLogin} className="hidden sm:block px-5 py-2 rounded-full text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors">
              Log In
            </button>
            <button onClick={onRegister} className="px-4 py-2 md:px-5 md:py-2 rounded-full bg-pink-600 text-white text-xs md:text-sm font-bold hover:bg-pink-700 transition-all shadow-lg shadow-pink-500/20">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* content container */}
      <div className="relative z-10">

        {/* hero section */}
        <section id="main" className="min-h-screen flex flex-col items-center justify-center pt-20 px-4">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-7xl font-black mb-6 leading-tight tracking-tight text-slate-900 dark:text-white transition-colors">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-500 dark:via-pink-500 dark:to-purple-500">Mental Health</span>mu, sangatlah berarti
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-2xl text-slate-700 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed transition-colors drop-shadow-sm">
              Platform komprehensif untuk memantau, mengevaluasi, dan meningkatkan kesehatan mentalmu dengan dukungan AI dan analisis mendalam.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <button onClick={onRegister} className="w-40 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-pink-500/20">
                Sign Up
              </button>
              <button onClick={onLogin} className="w-40 py-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-lg shadow-indigo-500/5 dark:shadow-none">
                Log In
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute bottom-10 cursor-pointer text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            onClick={() => scrollToSection('features')}
          >
            <ChevronDown className="w-10 h-10" />
          </motion.div>
        </section>

        {/* features section */}
        <section id="features" className="py-24 px-6 bg-transparent transition-colors">
          <div className="max-w-7xl mx-auto">

            <motion.div initial="hidden" whileInView="visible" viewport={{ margin: "-50px", once: true }} variants={fadeInUp} className="text-center mb-20 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white transition-colors">Fitur unggulan yang membantumu</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 transition-colors">Fitur kami dirancang untuk memberdayakanmu di setiap langkah perjalanan kesehatan mentalmu.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* left visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
                className="aspect-[4/3] bg-gradient-to-br from-white/60 to-slate-100/60 dark:from-slate-900 dark:to-slate-800 border border-white/40 dark:border-white/10 rounded-[30px] shadow-2xl flex items-center justify-center relative overflow-hidden transition-colors"
              >
                <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 z-0"></div>

                {/* mock dashboard */}
                <div className="relative z-10 w-[94%] h-[88%] bg-white/80 dark:bg-[#0a0a12] rounded-2xl border border-white/50 dark:border-white/10 shadow-2xl flex overflow-hidden font-sans transition-colors">

                  {/* mock sidebar */}
                  <div className="hidden md:flex w-14 bg-white dark:bg-[#0a0a12] border-r border-slate-200 dark:border-white/5 flex-col items-center py-4 gap-3 transition-colors">
                    <AnimatedLogo className="w-8 h-8" />

                    {/* analyze button */}
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-md opacity-90">
                      <BrainCircuit className="w-4 h-4 text-white" />
                    </div>

                    <div className="w-6 h-[1px] bg-slate-200 dark:bg-white/10 my-0.5"></div>

                    {/* nav items */}
                    <div className="flex flex-col gap-2 w-full px-1.5">
                      {/* active item (home) */}
                      <div className="w-full aspect-square rounded-lg bg-indigo-50/80 dark:bg-indigo-900/20 md:border md:dark:border-purple-500/30 flex items-center justify-center relative group cursor-default">
                        <div className="absolute left-0 w-0.5 h-3 bg-indigo-500 rounded-r-full"></div>
                        <Home className="w-4 h-4 text-indigo-500 dark:text-indigo-300 relative z-10" />
                      </div>

                      {/* inactive items */}
                      {[Heart, Target, MessageCircle, User].map((Icon, i) => (
                        <div key={i} className="w-full aspect-square rounded-lg flex items-center justify-center opacity-40 hover:opacity-100 dark:hover:bg-white/5 hover:bg-slate-100 transition-all cursor-default">
                          <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* mock content area */}
                  <div className="flex-1 bg-slate-50/50 dark:bg-slate-950 p-5 flex flex-col gap-5 relative overflow-hidden overflow-y-auto no-scrollbar transition-colors">

                    {/* header */}
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Good Morning,</p>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white">User</h1>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-slate-900 rounded-full border border-white/40 dark:border-white/10 shadow-sm">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-bold text-slate-700 dark:text-white">3 Days</span>
                      </div>
                    </div>

                    {/* quote card */}
                    <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-100/50 dark:border-white/10 rounded-2xl p-4 relative overflow-hidden">
                      <Quote className="absolute top-2 right-2 w-8 h-8 text-indigo-200 dark:text-white/5 rotate-12" />
                      <p className="text-sm font-serif italic text-indigo-900 dark:text-slate-200 relative z-10">
                        "Senyummu hari ini adalah bukti kekuatanmu. Nikmati prosesnya."
                      </p>
                      <p className="text-[10px] text-indigo-400 dark:text-slate-500 mt-2 font-bold tracking-wider">— Neo</p>
                    </div>

                    {/* mood scanner */}
                    <div className="bg-white/60 dark:bg-slate-900/60 border border-white/60 dark:border-white/10 rounded-2xl p-3 flex justify-between gap-2">
                      {[
                        { icon: Smile, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-500/20', label: 'Happy' },
                        { icon: Wind, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-500/20', label: 'Calm' },
                        { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-500/20', label: 'Manic' },
                        { icon: CloudRain, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-500/20', label: 'Sad' },
                      ].map((m, i) => (
                        <div key={i} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border border-transparent hover:scale-105 transition-transform ${m.bg}`}>
                          <m.icon className={`w-4 h-4 ${m.color}`} />
                          <span className="text-[8px] font-bold text-slate-600 dark:text-slate-300">{m.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* recommendation card */}
                    <div className="flex-1 bg-white/80 dark:bg-slate-900/80 border border-white/60 dark:border-white/10 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
                      <div className="relative z-10">
                        <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 text-[8px] font-bold px-1.5 py-0.5 rounded text-white mb-2">
                          AI RECOMMENDATION
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Jaga Kesehatan Mentalmu</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                          Lakukan pengecekan rutin untuk mengetahui kondisi mentalmu saat ini.
                        </p>
                      </div>
                      <button className="relative z-10 w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
                        Mulai Analisis
                      </button>
                    </div>

                  </div>
                </div>

                {/* floating live badge */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute bottom-8 -right-4 bg-white dark:bg-slate-900 border border-green-500/20 px-4 py-2 rounded-xl shadow-xl shadow-green-500/10 z-20 flex items-center gap-3"
                >
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="absolute inset-0 bg-green-500 rounded-full opacity-50"></div>
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-white">Live Preview</div>
                </motion.div>
              </motion.div>

              {/* right content */}
              <motion.div
                initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight transition-colors">
                  Pahami Pikiranmu dengan <span className="text-pink-500">DASS-21</span> & Analisis AI
                </h3>

                <div className="flex gap-4">
                  <div className="mt-1 min-w-[24px]"><div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">1</div></div>
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                    Mulailah dengan mengikuti <strong>DASS-21 Assessment</strong>. Alat tes psikologi yang valid secara ilmiah untuk mengukur tiga kondisi emosional utama: <span className="text-slate-900 dark:text-white font-semibold">Depresi, Kecemasan, dan Stres</span>. Cepat, pribadi, dan terpercaya.
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 min-w-[24px]"><div className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center text-xs font-bold">2</div></div>
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                    Setelah selesai, <strong>AI kami akan menganalisis jawabanmu</strong> secara instan. Bukan sekadar angka membingungkan, kamu akan mendapatkan dashboard visual yang jelas untuk melacak progresmu dari waktu ke waktu.
                  </p>
                </div>

                <div className="pt-4">
                  <button onClick={onRegister} className="text-pink-500 dark:text-pink-400 font-bold hover:text-pink-400 dark:hover:text-pink-300 flex items-center gap-2 transition-colors">
                    Coba Assessment Sekarang <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* technology section */}
        <section id="technology" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">

            <motion.div initial="hidden" whileInView="visible" viewport={{ margin: "-50px", once: true }} variants={fadeInUp} className="text-center mb-16 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white transition-colors">Didukung Psikologi Klinis & AI Modern</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 transition-colors">
                Kami menggabungkan standar asesmen psikologis seperti DASS dengan kecerdasan buatan untuk memberikan pemahaman kesehatan mental yang lebih akurat, personal, dan mudah dipahami.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* card 1 */}
              <motion.div
                whileHover={{ y: -5 }} transition={{ duration: 0.2 }}
                className="p-10 rounded-[30px] bg-white/40 dark:bg-slate-900 border border-white/40 dark:border-white/10 relative overflow-hidden group shadow-lg dark:shadow-none transition-colors backdrop-blur-sm"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px]"></div>
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white transition-colors">Analisis Mental Health dengan DASS</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base transition-colors">
                  Menggunakan Depression Anxiety Stress Scale (DASS) yang tervalidasi secara ilmiah untuk menilai tingkat stres, kecemasan, dan depresi secara objektif dan terukur. Hasil analisis dirancang agar aman dan mudah dipahami.
                </p>
              </motion.div>

              {/* card 2 */}
              <motion.div
                whileHover={{ y: -5 }} transition={{ duration: 0.2 }}
                className="p-10 rounded-[30px] bg-white/80 dark:bg-slate-900 border border-white/40 dark:border-white/10 relative overflow-hidden group shadow-lg dark:shadow-none transition-colors"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[50px]"></div>
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white transition-colors">Wawasan Lebih Dalam dengan Chatbot AI</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base transition-colors">
                  Chatbot AI kami membantu menerjemahkan hasil asesmen menjadi penjelasan yang lembut, personal, dan mudah dimengerti. AI memberikan rekomendasi langkah awal dan saran manajemen stres berdasarkan datamu.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* footer */}
        <footer className="py-20 text-center border-t border-transparent bg-transparent transition-colors">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-center items-center gap-3 mb-8">
              <AnimatedLogo className="w-10 h-10" />
              <span className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">NeoRain</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-slate-800 dark:text-white max-w-2xl mx-auto transition-colors">Ambil langkah kecil menuju kesehatan mental yang lebih baik bersama NeoRain.</h2>
            <button onClick={onRegister} className="px-10 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-pink-500/20 transition-all mb-12">
              Mulai Sekarang
            </button>
            <p className="text-slate-500 dark:text-slate-500 text-sm">© 2025 NeoRain AI. Crafted for mental wellness.</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default LandingPage;