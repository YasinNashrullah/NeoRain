import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from '../firebase'; // Import auth & provider

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- LOGIN EMAIL BIASA ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("Login Berhasil:", user);
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

  // --- LOGIN GOOGLE ---
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("Google Login Berhasil:", user);
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
    <div className="absolute inset-0 w-full h-full bg-slate-950 flex flex-col justify-center items-center p-6 overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-600/30 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-purple-600/30 rounded-full blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-3xl">🧠</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Masuk untuk melanjutkan perjalananmu.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-indigo-500/50 focus-within:bg-white/10 transition-all">
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

          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-indigo-500/50 focus-within:bg-white/10 transition-all">
            <Lock className="w-5 h-5 text-slate-400" />
            <input 
              type="password" 
              placeholder="Password"
              className="bg-transparent w-full text-white placeholder-slate-500 focus:outline-none text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="text-right">
            <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300">Lupa Password?</button>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Masuk <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-[1px] bg-white/10 flex-1"></div>
          <span className="text-xs text-slate-500">Atau masuk dengan</span>
          <div className="h-[1px] bg-white/10 flex-1"></div>
        </div>

        {/* Google Button */}
        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white text-slate-900 font-bold py-3.5 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          <span>Google</span>
        </button>

        <p className="text-center text-slate-400 text-sm mt-8">
          Belum punya akun? <button onClick={onSwitchToRegister} className="text-indigo-400 font-bold hover:underline">Daftar Sekarang</button>
        </p>
      </div>
    </div>
  );
};

export default Login;