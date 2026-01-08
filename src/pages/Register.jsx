import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from '../firebase';
import logo from '../assets/neorain-logo-svg.svg';

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      onRegisterSuccess({
        uid: user.uid,
        name: user.displayName,
        email: user.email
      });

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Email ini sudah terdaftar.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password terlalu lemah (min. 6 karakter).");
      } else {
        setError("Gagal mendaftar. Cek koneksi internet.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0B0F1A] flex items-center justify-center p-4 font-sans antialiased">

      {/* Background Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative w-full max-w-md"
      >
        {/* Logo Section */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-block p-0.5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-600 shadow-lg mb-4"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-transparent overflow-hidden">
              <img src={logo} alt="NeoRain" className="w-full h-full object-contain brightness-0 invert drop-shadow-sm scale-75" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Bergabunglah</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Mulai perjalanan kesehatan mentalmu hari ini.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">

          <AnimatePresence mode='wait'>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleRegister} className="space-y-5">

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 block text-left">Nama Lengkap</label>
              <div className="relative transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-xl">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Kamu"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white pl-12 pr-4 py-3.5 rounded-xl outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 block text-left">Email</label>
              <div className="relative transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-xl">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white pl-12 pr-4 py-3.5 rounded-xl outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 block text-left">Password</label>
              <div className="relative transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-xl">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 Karakter"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white pl-12 pr-12 py-3.5 rounded-xl outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-sm"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ y: 0, scale: 0.98 }}
              disabled={isLoading}
              className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Daftar <ArrowRight className="w-4 h-4" /></>}
            </motion.button>
          </form>

          {/* Footer text */}
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-8">
            Sudah punya akun?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Masuk
            </button>
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default Register;