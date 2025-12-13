import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from '../firebase';

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        email: user.email,
        role: "Mahasiswa"
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
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">

      {/* --- PAGE BACKGROUND (Global) --- */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,_rgba(219,39,119,0.15)_0%,_transparent_70%)] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,_rgba(79,70,229,0.15)_0%,_transparent_70%)] pointer-events-none"></div>

      {/* --- CENTERED CARD --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-5xl bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10"
      >

        {/* --- LEFT SIDE (VISUAL) --- */}
        <div className="hidden md:flex w-1/2 bg-slate-900/50 relative items-center justify-center p-12 border-r border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.1)_0%,_transparent_70%)]"></div>

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-20 h-20 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-pink-500/20">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Bergabunglah</h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-xs mx-auto">
                Langkah pertama menuju kedamaian pikiran dimulai dari sini.
              </p>
            </motion.div>
          </div>
        </div>

        {/* --- RIGHT SIDE (FORM) --- */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-slate-950/40">
          <div className="max-w-sm mx-auto">
            <div className="text-center md:text-left mb-10">
              <h2 className="text-2xl font-bold text-white mb-2">Buat Akun Baru</h2>
              <p className="text-slate-400 text-sm">Isi data diri untuk mendaftar sebagai mahasiswa.</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </motion.div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-wider">Nama Lengkap</label>
                <div className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-pink-500 focus-within:bg-slate-900 transition-all group">
                  <User className="w-4 h-4 text-slate-500 group-focus-within:text-pink-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Nama Kamu"
                    className="bg-transparent w-full text-white placeholder-slate-600 focus:outline-none text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-wider">Email</label>
                <div className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-pink-500 focus-within:bg-slate-900 transition-all group">
                  <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-pink-400 transition-colors" />
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

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-wider">Password</label>
                <div className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-pink-500 focus-within:bg-slate-900 transition-all group">
                  <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-pink-400 transition-colors" />
                  <input
                    type="password"
                    placeholder="Min. 6 Karakter"
                    className="bg-transparent w-full text-white placeholder-slate-600 focus:outline-none text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-pink-500/20 transition-all active:scale-95 flex justify-center items-center gap-2 text-sm mt-4"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Daftar <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-center text-slate-400 text-xs mt-8">
              Sudah punya akun? <button onClick={onSwitchToLogin} className="text-pink-400 font-bold hover:text-pink-300 transition-colors">Masuk</button>
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Register;