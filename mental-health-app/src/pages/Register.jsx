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
    <div className="min-h-screen w-full bg-slate-950 flex overflow-hidden">
      
      {/* --- LEFT SIDE (DESKTOP VISUAL) --- */}
      <div className="hidden md:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden border-r border-white/5">
        <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-pink-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        
        <div className="relative z-10 text-center p-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-24 h-24 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-pink-500/30">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">Bergabunglah</h1>
            <p className="text-xl text-slate-400 max-w-md mx-auto leading-relaxed">
              Mulai langkah pertamamu menuju kesehatan mental yang lebih baik.
            </p>
          </motion.div>
        </div>
      </div>

      {/* --- RIGHT SIDE (FORM) --- */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 relative">
        
        {/* Mobile Background Blobs */}
        <div className="md:hidden absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-pink-600/20 rounded-full blur-[80px]"></div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Buat Akun Baru</h2>
            <p className="text-slate-400">Isi data diri untuk mendaftar.</p>
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

          <form onSubmit={handleRegister} className="space-y-5">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Nama Lengkap</label>
              <div className="bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-3 focus-within:border-pink-500 focus-within:bg-slate-900 transition-all">
                <User className="w-5 h-5 text-slate-500" />
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

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Email</label>
              <div className="bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-3 focus-within:border-pink-500 focus-within:bg-slate-900 transition-all">
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
              <div className="bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-3 focus-within:border-pink-500 focus-within:bg-slate-900 transition-all">
                <Lock className="w-5 h-5 text-slate-500" />
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
              className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-500/25 transition-all active:scale-95 flex justify-center items-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Daftar <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-8">
            Sudah punya akun? <button onClick={onSwitchToLogin} className="text-pink-400 font-bold hover:text-pink-300 transition-colors">Masuk</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;