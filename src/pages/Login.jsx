import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { auth, googleProvider } from '../firebase';
import logo from '../assets/neorain-logo-svg.svg';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess({
        uid: userCredential.user.uid,
        name: userCredential.user.displayName || "User",
        email: userCredential.user.email,
        role: "Mahasiswa"
      });
    } catch (err) {
      setError("Email atau kata sandi tidak sesuai.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLoginSuccess({
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        role: "Mahasiswa"
      });
    } catch (err) {
      setError("Gagal masuk dengan Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Mohon isi email terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Link reset password telah dikirim ke email Anda.");
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError("Email tidak terdaftar.");
      } else {
        setError("Gagal mengirim email reset. Coba lagi nanti.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsResetMode(!isResetMode);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0B0F1A] flex items-center justify-center p-4 font-sans antialiased">

      {/* Background Decorative - Sangat Soft */}
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isResetMode ? "Reset Password" : "Selamat Datang Kembali"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
            {isResetMode ? "Kami akan mengirimkan link untuk mengatur ulang kata sandi Anda." : "Lanjutkan perjalanan kesehatan mentalmu bersama NeoRain."}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">

          <AnimatePresence mode='wait'>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" /> {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" /> {success}
              </motion.div>
            )}
          </AnimatePresence>

          {!isResetMode ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-5">
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
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Password</label>
                  <button type="button" onClick={toggleMode} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Lupa Sandi?</button>
                </div>
                <div className="relative transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-xl">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white pl-12 pr-12 py-3.5 rounded-xl outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-sm"
                    required
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
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Masuk <ArrowRight className="w-4 h-4" /></>}
              </motion.button>
            </form>
          ) : (
            /* RESET PASSWORD FORM */
            <form onSubmit={handleResetPassword} className="space-y-5">
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

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ y: 0, scale: 0.98 }}
                disabled={isLoading}
                className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Kirim Link Reset <ArrowRight className="w-4 h-4" /></>}
              </motion.button>

              <button
                type="button"
                onClick={toggleMode}
                className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Login
              </button>
            </form>
          )}

          {!isResetMode && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100 dark:border-slate-800"></span>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-slate-900 text-slate-400 font-medium">atau masuk dengan</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm mb-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
            </>
          )}
        </div>

        {/* Footer text */}
        {!isResetMode && (
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-8">
            Belum bergabung?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Daftar Gratis
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default Login;