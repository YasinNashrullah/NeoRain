import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Sparkles, ChevronDown, Activity } from 'lucide-react';

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
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400">Mental Health</span>, matters a lot
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              A comprehensive platform to monitor, evaluate, and improve your mental health with AI support and in-depth analytics.
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
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Excellent features that can help you</h2>
              <p className="text-lg text-slate-400">Our features are designed to empower you at every step of your mental health journey.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* left visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
                className="aspect-[4/3] bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-[30px] shadow-2xl flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
                <div className="text-center p-6 relative z-10">
                  <Activity className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                  <p className="text-slate-300 font-bold text-lg">Dashboard Preview</p>
                  <p className="text-slate-500 text-sm mt-2">DASS-21 Results & Charts</p>
                </div>
              </motion.div>

              {/* right content */}
              <motion.div
                initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  Understand Your Mind with <span className="text-pink-500">DASS-21</span> & AI Analysis
                </h3>

                <div className="flex gap-4">
                  <div className="mt-1 min-w-[24px]"><div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">1</div></div>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    Begin by taking the <strong>DASS-21 Assessment</strong>. It is a scientifically validated tool designed to measure the three core emotional states: <span className="text-white font-semibold">Depression, Anxiety, and Stress</span>. It’s quick, private, and clinically recognized.
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 min-w-[24px]"><div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-bold">2</div></div>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    Once completed, our <strong>AI instantly analyzes your responses</strong>. Instead of confusing numbers, you get a clear, visual dashboard that explains your mental state and tracks your progress over time.
                  </p>
                </div>

                <div className="pt-4">
                  <button onClick={onRegister} className="text-pink-400 font-bold hover:text-pink-300 flex items-center gap-2 transition-colors">
                    Try the Assessment Now <ChevronDown className="w-4 h-4 -rotate-90" />
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
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Powered by Modern Clinical Psychology & AI</h2>
              <p className="text-lg text-slate-400">
                We combine psychological assessment standards like DASS with artificial intelligence to provide a more accurate, personalized, and easy-to-understand understanding of mental health.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* card 1 */}
              <motion.div
                whileHover={{ y: -5 }} transition={{ duration: 0.2 }}
                className="p-10 rounded-[30px] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px]"></div>
                <h3 className="text-xl font-bold mb-4 text-white">Mental Health Analysis with DASS</h3>
                <p className="text-slate-300 leading-relaxed text-base">
                  It uses the scientifically validated Depression Anxiety Stress Scale (DASS) to objectively and measurably assess stress, anxiety, and depression levels. The analysis results are designed according to modern clinical psychology principles to ensure safety and user-friendliness.
                </p>
              </motion.div>

              {/* card 2 */}
              <motion.div
                whileHover={{ y: -5 }} transition={{ duration: 0.2 }}
                className="p-10 rounded-[30px] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[50px]"></div>
                <h3 className="text-xl font-bold mb-4 text-white">Deeper Insights with AI Chatbot</h3>
                <p className="text-slate-300 leading-relaxed text-base">
                  Our AI chatbot helps translate assessment results into gentle, personalized, and easy-to-understand explanations. The AI provides first-step recommendations, stress management advice, and emotional reflections based on your data.
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
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white max-w-2xl mx-auto">Take small steps towards better mental health with NeoRain.</h2>
            <button onClick={onRegister} className="px-10 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-pink-500/20 transition-all mb-12">
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