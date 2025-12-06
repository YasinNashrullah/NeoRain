import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from '../firebase';

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
    <div className="min-h-screen w-full bg-slate-950 flex overflow-hidden">
      
      {/* --- LEFT SIDE (DESKTOP VISUAL) --- */}
      <div className="hidden md:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden border-r border-white/5">
        {/* Animated Background Blobs */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        
        <div className="relative z-10 text-center p-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">NeoRain</h1>
            <p className="text-xl text-slate-400 max-w-md mx-auto leading-relaxed">
              Teman curhat AI dan pelacak kesehatan mental pribadimu.
            </p>
          </motion.div>
        </div>
      </div>

      {/* --- RIGHT SIDE (FORM) --- */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 relative">
        
        {/* Mobile Background Blobs */}
        <div className="md:hidden absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[80px]"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Selamat Datang Kembali</h2>
            <p className="text-slate-400">Masuk untuk melanjutkan perjalananmu.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Email</label>
              <div className="bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-3 focus-within:border-indigo-500 focus-within:bg-slate-900 transition-all">
                <Mail className="w-5 h-5 text-slate-500" />
                <input 
                  type="email" 
                  placeholder="nama@email.com"
                  className="bg-transparent w-full text-white placeholder-slate-600 focus:outline-none text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Password</label>
              <div className="bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-3 focus-within:border-indigo-500 focus-within:bg-slate-900 transition-all">
                <Lock className="w-5 h-5 text-slate-500" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="bg-transparent w-full text-white placeholder-slate-600 focus:outline-none text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="text-right">
              <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Lupa Password?</button>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95 flex justify-center items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Masuk <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="h-[1px] bg-white/10 flex-1"></div>
            <span className="text-xs text-slate-500 font-medium">ATAU</span>
            <div className="h-[1px] bg-white/10 flex-1"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white text-slate-900 font-bold py-3.5 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            <span>Masuk dengan Google</span>
          </button>

          <p className="text-center text-slate-400 text-sm mt-8">
            Belum punya akun? <button onClick={onSwitchToRegister} className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Daftar Sekarang</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;