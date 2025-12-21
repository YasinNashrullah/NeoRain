import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from '../firebase';
import logo from '../assets/neorain-logo-svg.svg';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      onLoginSuccess({
        uid: user.uid,
        name: user.displayName || "Pengguna",
        email: user.email,
        role: "Mahasiswa"
      });

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError("Email atau password salah.");
      } else {
        setError("Gagal masuk. Coba lagi nanti.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      onLoginSuccess({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: "Mahasiswa"
      });

    } catch (err) {
      console.error(err);
      setError("Gagal login dengan Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(0deg,#EEF1FF_0%,#D2DAFF_29%,#AAC4FF_66%,#B1B2FF_100%)] dark:bg-none dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">

      {/* page background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,_rgba(79,70,229,0.15)_0%,_transparent_70%)] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,_rgba(147,51,234,0.15)_0%,_transparent_70%)] pointer-events-none"></div>

      {/* centered card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-5xl bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10"
      >

        {/* left side (visual) */}
        <div className="hidden md:flex w-1/2 bg-indigo-50/20 dark:bg-slate-900/50 relative items-center justify-center p-12 border-r border-white/20 dark:border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.1)_0%,_transparent_70%)]"></div>

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden">
                <img
                  src={logo}
                  alt="NeoRain Logo"
                  className="w-20 h-20 object-contain brightness-0 invert drop-shadow-md"
                />
              </div>
              <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-3 tracking-tight">NeoRain</h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-xs mx-auto">
                Sahabat AI yang mengerti perasaanmu dan menjaga kesehatan mentalmu.
              </p>
            </motion.div>
          </div>
        </div>

        {/* right side (form) */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 bg-white/30 dark:bg-slate-950/40">
          <div className="max-w-sm mx-auto">
            <div className="text-center md:text-left mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Selamat Datang</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Masuk untuk melanjutkan sesi curhatmu.</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-xl mb-6 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">Email</label>
                <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all group">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    className="bg-transparent w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">Password</label>
                <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all group">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="bg-transparent w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="text-right">
                <button type="button" className="text-xs text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Lupa Password?</button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex justify-center items-center gap-2 text-sm"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Masuk <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 text-slate-400 dark:text-slate-500 font-medium bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm rounded">Atau</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white dark:bg-white text-slate-800 dark:text-slate-900 font-bold py-3 rounded-xl border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
              <span>Masuk dengan Google</span>
            </button>

            <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-8">
              Belum punya akun? <button onClick={onSwitchToRegister} className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">Daftar Sekarang</button>
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;