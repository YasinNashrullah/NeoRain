import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Sparkles, ChevronDown, Activity } from 'lucide-react';

const LandingPage = ({ onLogin, onRegister }) => {
  const [activeSection, setActiveSection] = useState('main');
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // logika navbar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // animasi
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white font-sans overflow-hidden selection:bg-pink-500 selection:text-white">

      {/* background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#020617]"></div>

        {/* Aurora 1 (Ungu/Biru) */}
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-600/20 rounded-full blur-[120px]"
        />

        {/* Aurora 2 (Pink/Ungu) */}
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/15 rounded-full blur-[120px]"
        />

        {/* Noise texture untuk kesan premium */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      {/* Progress bar di atas layar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 origin-left z-[100]" style={{ scaleX }} />

      {/* navbar */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-3' : 'bg-transparent py-5'}`}>
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('main')}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">NeoRain</span>
          </div>

          {/* Menu Tengah */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md shadow-xl">
            {['main', 'features', 'technology'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 capitalize z-20 ${activeSection === item ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
              >
                {activeSection === item && (
                  <motion.div layoutId="activeNavBg" className="absolute inset-0 bg-white/10 rounded-full" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
                {item}
              </button>
            ))}
          </div>

          {/* Buttons Mobile */}
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

      {/* content */}
      <div className="relative z-10">
        {/* main */}
        <section id="main" className="min-h-screen flex flex-col items-center justify-center pt-20 px-4 relative">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="text-center max-w-4xl mx-auto z-10"
          >
            {/* Headline */}
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-7xl font-black mb-6 leading-tight tracking-tight text-white">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400">Mental Health</span>, matters a lot
            </motion.h1>

            {/* Subheadline */}
            <motion.p variants={fadeInUp} className="text-lg md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              A comprehensive platform to monitor, evaluate, and improve your mental health with AI support and in-depth analytics.
            </motion.p>

            {/* Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <button onClick={onRegister} className="w-40 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg shadow-xl shadow-pink-500/30 hover:scale-105 transition-transform">
                Sign In
              </button>
              <button onClick={onLogin} className="w-40 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg shadow-xl shadow-pink-500/30 hover:scale-105 transition-transform">
                Log In
              </button>
            </motion.div>
          </motion.div>

          {/* Animated Down Arrow */}
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 cursor-pointer text-slate-500 hover:text-white transition-colors"
            onClick={() => scrollToSection('features')}
          >
            <ChevronDown className="w-12 h-12" />
          </motion.div>
        </section>

        {/* features */}
        <section id="features" className="py-32 px-6">
          <div className="max-w-[1400px] mx-auto">

            {/* Header Intro */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ margin: "-100px" }} variants={fadeInUp} className="text-center mb-24 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Excellent features that can help you</h2>
              <p className="text-xl text-slate-400">Our features are designed to empower you at every step of your mental health journey.</p>
            </motion.div>

            {/* Grid Layout 2 Kolom */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Dashboard */}
              <motion.div
                initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
                className="aspect-[4/3] bg-slate-900/50 border border-white/10 rounded-[30px] backdrop-blur-xl shadow-2xl flex items-center justify-center relative overflow-hidden group"
              >
                {/* Efek Glow Dalam */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-center p-6 relative z-10">
                  <Activity className="w-16 h-16 text-pink-500 mx-auto mb-4 opacity-80" />
                  <p className="text-slate-300 font-bold text-lg">Dashboard Preview</p>
                  <p className="text-slate-500 text-sm mt-2">DASS-21 Results & Charts</p>
                </div>
              </motion.div>

              {/* Penjelasan DASS-21 & AI */}
              <motion.div
                initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-8"
              >
                <h3 className="text-4xl font-bold text-white leading-tight">
                  Understand Your Mind with <span className="text-pink-500">DASS-21</span> & AI Analysis
                </h3>

                {/* DASS-21 Survey */}
                <div className="flex gap-4">
                  <div className="mt-1 min-w-[24px]"><div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">1</div></div>
                  <p className="text-left text-lg text-slate-300 leading-relaxed">
                    Begin by taking the <strong>DASS-21 Assessment</strong>. It is a scientifically validated tool designed to measure the three core emotional states: <span className="text-white font-semibold">Depression, Anxiety, and Stress</span>. It’s quick, private, and clinically recognized.
                  </p>
                </div>

                {/* AI Result */}
                <div className="flex gap-4">
                  <div className="mt-1 min-w-[24px]"><div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-bold">2</div></div>
                  <p className="text-left text-lg text-slate-300 leading-relaxed">
                    Once completed, our <strong>AI instantly analyzes your responses</strong>. Instead of confusing numbers, you get a clear, visual dashboard that explains your mental state and tracks your progress over time.
                  </p>
                </div>

                {/* CTA Link */}
                <div className="pt-4">
                  <button onClick={onRegister} className="text-pink-400 font-bold hover:text-pink-300 flex items-center gap-2 transition-colors">
                    Try the Assessment Now <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* technology */}
        <section id="technology" className="py-32 px-6">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ margin: "-100px" }} variants={fadeInUp} className="text-center mb-20 max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Powered by Modern Clinical Psychology & AI</h2>
              <p className="text-xl text-slate-400">
                We combine psychological assessment standards like DASS with artificial intelligence to provide a more accurate, personalized, and easy-to-understand understanding of mental health.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Pink ke Ungu */}
              <motion.div
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} whileHover={{ y: -10 }}
                className="p-10 md:p-12 rounded-[40px] bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-700 shadow-2xl border border-white/10 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <h3 className="text-2xl font-bold mb-6 relative z-10 text-white">Mental Health Analysis with DASS</h3>
                <p className="text-left text-pink-100 leading-relaxed relative z-10 text-base">
                  It uses the scientifically validated Depression Anxiety Stress Scale (DASS) to objectively and measurably assess stress, anxiety, and depression levels. The analysis results are designed according to modern clinical psychology principles to ensure safety and user-friendliness.
                </p>
              </motion.div>

              {/* Ungu ke Pink */}
              <motion.div
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} whileHover={{ y: -10 }}
                className="p-10 md:p-12 rounded-[40px] bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-600 shadow-2xl border border-white/10 relative overflow-hidden group"
              >
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <h3 className="text-2xl font-bold mb-6 relative z-10 text-white">Deeper Insights with AI Chatbot</h3>
                <p className="text-left text-purple-100 leading-relaxed relative z-10 text-base">
                  Our AI chatbot helps translate assessment results into gentle, personalized, and easy-to-understand explanations. The AI provides first-step recommendations, stress management advice, and emotional reflections based on your data.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* footer */}
        <footer className="py-24 text-center relative z-10 border-t border-white/5 bg-slate-950/30 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex justify-center items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">NeoRain</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-10 leading-tight text-white">Take small steps towards better mental health with NeoRain.</h2>
            <button onClick={onRegister} className="px-12 py-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xl shadow-xl shadow-purple-500/30 hover:scale-105 transition-transform mb-12">
              Start Now
            </button>
            <p className="text-slate-500 text-sm">© 2025 NeoRain AI. Crafted for mental wellness.</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default LandingPage;