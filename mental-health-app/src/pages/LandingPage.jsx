import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  Sparkles, ChevronDown, Activity, Home, Heart, Target, MessageCircle, User,
  Flame, Quote, ArrowRight, CloudRain, Smile, Wind, Zap, Frown
} from 'lucide-react';

const LandingPage = ({ onLogin, onRegister }) => {
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
    <div className="relative min-h-screen w-full bg-slate-950 text-white font-sans selection:bg-pink-500 selection:text-white">

      {/* optimized background - static grid & glow instead of moving blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* base dark color */}
        <div className="absolute inset-0 bg-slate-950"></div>

        {/* lightweight grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* static top glow */}
        <div className="absolute left-0 right-0 top-[-10%] h-[500px] w-full bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>

        {/* static bottom glow */}
        <div className="absolute right-0 bottom-[-10%] h-[400px] w-[600px] bg-indigo-900/10 blur-[100px] rounded-full pointer-events-none"></div>
      </div>

      {/* top progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 origin-left z-[100]" style={{ scaleX }} />

      {/* navbar */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/90 backdrop-blur-md border-b border-white/5 py-3' : 'bg-transparent py-5'}`}>
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('main')}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">NeoRain</span>
          </div>

          {/* desktop menu */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-sm">
            {['main', 'features', 'technology'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 capitalize ${activeSection === item ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white'
                  }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* mobile & desktop buttons */}
          <div className="flex items-center gap-3">
            <button onClick={onLogin} className="hidden sm:block px-5 py-2 rounded-full text-sm font-bold text-slate-300 hover:text-white transition-colors">
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
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-7xl font-black mb-6 leading-tight tracking-tight text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400">Mental Health</span>mu, sangatlah berarti
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Platform komprehensif untuk memantau, mengevaluasi, dan meningkatkan kesehatan mentalmu dengan dukungan AI dan analisis mendalam.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <button onClick={onRegister} className="w-40 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-pink-500/20">
                Sign In
              </button>
              <button onClick={onLogin} className="w-40 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-colors">
                Log In
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 cursor-pointer text-slate-500 hover:text-white transition-colors"
            onClick={() => scrollToSection('features')}
          >
            <ChevronDown className="w-10 h-10" />
          </motion.div>
        </section>

        {/* features section */}
        <section id="features" className="py-24 px-6 bg-slate-950/50">
          <div className="max-w-7xl mx-auto">

            <motion.div initial="hidden" whileInView="visible" viewport={{ margin: "-50px", once: true }} variants={fadeInUp} className="text-center mb-20 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Fitur unggulan yang membantumu</h2>
              <p className="text-lg text-slate-400">Fitur kami dirancang untuk memberdayakanmu di setiap langkah perjalanan kesehatan mentalmu.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* left visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
                className="aspect-[4/3] bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-[30px] shadow-2xl flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-0"></div>

                {/* --- HIGH FIDELITY MOCK DASHBOARD --- */}
                <div className="relative z-10 w-[94%] h-[88%] bg-[#0a0a12] rounded-2xl border border-white/10 shadow-2xl flex overflow-hidden font-sans">

                  {/* Mock Sidebar */}
                  <div className="w-16 md:w-20 bg-[#0a0a12] border-r border-white/5 flex flex-col items-center py-5 gap-6">
                    {/* Logo */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>

                    {/* Nav Items */}
                    <div className="flex flex-col gap-4 w-full px-2">
                      {/* Active Item (Home) */}
                      <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-purple-500/30 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-purple-500/10 blur-md rounded-xl"></div>
                        <Home className="w-5 h-5 text-indigo-300 relative z-10" />
                      </div>

                      <div className="w-full aspect-square rounded-xl flex items-center justify-center opacity-50"><Heart className="w-5 h-5 text-slate-400" /></div>
                      <div className="w-full aspect-square rounded-xl flex items-center justify-center opacity-50"><Target className="w-5 h-5 text-slate-400" /></div>
                    </div>

                    <div className="mt-auto mb-2 w-8 h-8 rounded-full bg-slate-800 border border-white/10"></div>
                  </div>

                  {/* Mock Content Area */}
                  <div className="flex-1 bg-slate-950 p-5 flex flex-col gap-5 relative overflow-hidden">
                    {/* Background Glows (Simulated) */}
                    <div className="absolute top-[-20%] left-[-10%] w-[200px] h-[200px] bg-purple-600/10 blur-[80px]"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[200px] h-[200px] bg-indigo-600/10 blur-[80px]"></div>

                    {/* Header */}
                    <div className="flex justify-between items-center relative z-10">
                      <div>
                        <div className="h-2 w-20 bg-slate-800 rounded-full mb-2"></div>
                        <div className="h-5 w-32 bg-slate-700/50 rounded-md"></div>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-slate-800/50 border border-white/5 flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 relative z-10">
                      {/* Stat 1: Depression */}
                      <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                          <div className="h-1.5 w-10 bg-slate-700 rounded-full"></div>
                        </div>
                        <div className="text-xl font-bold text-white mb-1">Low</div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: "30%" }} transition={{ duration: 1 }} className="h-full bg-pink-500"></motion.div>
                        </div>
                      </div>
                      {/* Stat 2: Anxiety */}
                      <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <div className="h-1.5 w-12 bg-slate-700 rounded-full"></div>
                        </div>
                        <div className="text-xl font-bold text-white mb-1">Mild</div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: "45%" }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-purple-500"></motion.div>
                        </div>
                      </div>
                      {/* Stat 3: Stress */}
                      <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          <div className="h-1.5 w-8 bg-slate-700 rounded-full"></div>
                        </div>
                        <div className="text-xl font-bold text-white mb-1">Safe</div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: "20%" }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-indigo-500"></motion.div>
                        </div>
                      </div>
                    </div>

                    {/* Main Chart Area */}
                    <div className="flex-1 bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-white/5 rounded-xl p-4 flex flex-col justify-end relative z-10">
                      <div className="absolute top-4 left-4 flex gap-2">
                        <div className="h-2 w-16 bg-slate-700 rounded-full"></div>
                        <div className="h-2 w-8 bg-slate-800 rounded-full"></div>
                      </div>

                      {/* Colorful Chart Bars */}
                      <div className="flex items-end justify-between h-[80px] gap-2 px-2">
                        {[40, 70, 50, 90, 60, 80, 45].map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: "10%" }}
                            whileInView={{ height: `${h}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className={`w-full rounded-t-lg bg-gradient-to-t ${i % 2 === 0 ? 'from-purple-600 to-pink-500' : 'from-indigo-600 to-purple-500'} opacity-80`}
                          ></motion.div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Floating Live Badge */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute bottom-8 -right-4 bg-slate-900 border border-green-500/20 px-4 py-2 rounded-xl shadow-xl shadow-green-500/10 z-20 flex items-center gap-3"
                >
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-50"></div>
                  </div>
                  <div className="text-xs font-bold text-white">Live Preview</div>
                </motion.div>
              </motion.div>

              {/* right content */}
              <motion.div
                initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  Pahami Pikiranmu dengan <span className="text-pink-500">DASS-21</span> & Analisis AI
                </h3>

                <div className="flex gap-4">
                  <div className="mt-1 min-w-[24px]"><div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">1</div></div>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    Mulailah dengan mengikuti <strong>DASS-21 Assessment</strong>. Alat tes psikologi yang valid secara ilmiah untuk mengukur tiga kondisi emosional utama: <span className="text-white font-semibold">Depresi, Kecemasan, dan Stres</span>. Cepat, pribadi, dan terpercaya.
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 min-w-[24px]"><div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-bold">2</div></div>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    Setelah selesai, <strong>AI kami akan menganalisis jawabanmu</strong> secara instan. Bukan sekadar angka membingungkan, kamu akan mendapatkan dashboard visual yang jelas untuk melacak progresmu dari waktu ke waktu.
                  </p>
                </div>

                <div className="pt-4">
                  <button onClick={onRegister} className="text-pink-400 font-bold hover:text-pink-300 flex items-center gap-2 transition-colors">
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
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Didukung Psikologi Klinis & AI Modern</h2>
              <p className="text-lg text-slate-400">
                Kami menggabungkan standar asesmen psikologis seperti DASS dengan kecerdasan buatan untuk memberikan pemahaman kesehatan mental yang lebih akurat, personal, dan mudah dipahami.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* card 1 */}
              <motion.div
                whileHover={{ y: -5 }} transition={{ duration: 0.2 }}
                className="p-10 rounded-[30px] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px]"></div>
                <h3 className="text-xl font-bold mb-4 text-white">Analisis Mental Health dengan DASS</h3>
                <p className="text-slate-300 leading-relaxed text-base">
                  Menggunakan Depression Anxiety Stress Scale (DASS) yang tervalidasi secara ilmiah untuk menilai tingkat stres, kecemasan, dan depresi secara objektif dan terukur. Hasil analisis dirancang agar aman dan mudah dipahami.
                </p>
              </motion.div>

              {/* card 2 */}
              <motion.div
                whileHover={{ y: -5 }} transition={{ duration: 0.2 }}
                className="p-10 rounded-[30px] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[50px]"></div>
                <h3 className="text-xl font-bold mb-4 text-white">Wawasan Lebih Dalam dengan Chatbot AI</h3>
                <p className="text-slate-300 leading-relaxed text-base">
                  Chatbot AI kami membantu menerjemahkan hasil asesmen menjadi penjelasan yang lembut, personal, dan mudah dimengerti. AI memberikan rekomendasi langkah awal dan saran manajemen stres berdasarkan datamu.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* footer */}
        <footer className="py-20 text-center border-t border-white/5 bg-slate-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-center items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">NeoRain</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white max-w-2xl mx-auto">Ambil langkah kecil menuju kesehatan mental yang lebih baik bersama NeoRain.</h2>
            <button onClick={onRegister} className="px-10 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-pink-500/20 transition-all mb-12">
              Mulai Sekarang
            </button>
            <p className="text-slate-500 text-sm">© 2025 NeoRain AI. Crafted for mental wellness.</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default LandingPage;