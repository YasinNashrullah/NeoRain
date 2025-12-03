import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
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
      // 1. Buat User di Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update Nama User (DisplayName)
      await updateProfile(user, {
        displayName: name
      });

      console.log("Register Berhasil:", user);
      
      // 3. Kirim data user ke App.jsx
      onRegisterSuccess({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: "Mahasiswa" // Default role
      });

    } catch (err) {
      console.error(err);
      // Custom Error Message biar bahasa Indonesia
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
    <div className="absolute inset-0 w-full h-full bg-slate-950 flex flex-col justify-center items-center p-6 overflow-hidden">
      
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-pink-600/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Buat Akun Baru</h1>
          <p className="text-slate-400">Mulai perjalanan kesehatan mentalmu.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Name Input */}
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-pink-500/50 focus-within:bg-white/10 transition-all">
            <User className="w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Nama Lengkap"
              className="bg-transparent w-full text-white placeholder-slate-500 focus:outline-none text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email Input */}
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-pink-500/50 focus-within:bg-white/10 transition-all">
            <Mail className="w-5 h-5 text-slate-400" />
            <input 
              type="email" 
              placeholder="Email Address"
              className="bg-transparent w-full text-white placeholder-slate-500 focus:outline-none text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-pink-500/50 focus-within:bg-white/10 transition-all">
            <Lock className="w-5 h-5 text-slate-400" />
            <input 
              type="password" 
              placeholder="Password (Min. 6 Karakter)"
              className="bg-transparent w-full text-white placeholder-slate-500 focus:outline-none text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all active:scale-95 flex justify-center items-center gap-2 mt-4"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Daftar <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-8">
          Sudah punya akun? <button onClick={onSwitchToLogin} className="text-pink-400 font-bold hover:underline">Masuk</button>
        </p>
      </div>
    </div>
  );
};

export default Register;