import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, Settings, Bell, Shield, HelpCircle, 
  LogOut, Flame, Award, ChevronRight, Edit2, 
  Mail, Trophy 
} from 'lucide-react';

const Profile = ({ userData, onLogout }) => {
  // Data Menu Settings
  const menuItems = [
    { icon: User, label: 'Edit Profil', action: () => console.log('Edit') },
    { icon: Bell, label: 'Notifikasi', action: () => console.log('Notif') },
    { icon: Shield, label: 'Privasi & Keamanan', action: () => console.log('Privacy') },
    { icon: HelpCircle, label: 'Bantuan & Dukungan', action: () => console.log('Help') },
  ];

  return (
    <div className="w-full h-full bg-slate-950 text-white flex flex-col relative overflow-hidden">
      
      {/* Background Glow (Sama seperti halaman lain) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-indigo-900/20 blur-[100px] pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="px-6 pt-8 pb-2 relative z-10">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Profil <User className="w-6 h-6 text-indigo-400" />
        </h1>
        <p className="text-slate-400 text-sm">Kelola akun dan preferensi</p>
      </div>

      {/* --- CONTENT AREA (SCROLLABLE) --- */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide relative z-10 space-y-4 pt-4">
        
        {/* 1. USER CARD (INFO & STATS) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-white/10 rounded-[30px] p-6 relative overflow-hidden shadow-2xl"
        >
          {/* Dekorasi Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>

          {/* Profile Info */}
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="relative">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.name || 'User'}`} 
                alt="Avatar" 
                className="w-16 h-16 rounded-full border-2 border-indigo-500 bg-slate-800"
              />
              <button className="absolute -bottom-1 -right-1 bg-indigo-600 p-1 rounded-full border-2 border-slate-900 text-white">
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold capitalize">{userData?.name || "Pengguna Baru"}</h2>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Mail className="w-3 h-3" />
                <span>{userData?.email || "email@contoh.com"}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid (Streak & Achievement) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Streak */}
            <div className="bg-slate-800/50 rounded-2xl p-3 text-center border border-white/5">
              <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-bold">Streak Harian</p>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]">
                <Flame className="w-6 h-6 fill-current" /> 14
              </div>
            </div>
            {/* Achievement Count */}
            <div className="bg-slate-800/50 rounded-2xl p-3 text-center border border-white/5">
              <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-bold">Pencapaian</p>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                <Award className="w-6 h-6 fill-current" /> 5
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2. RECENT ACHIEVEMENT (PENCAPAIAN TERBARU) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 border border-white/10 rounded-[30px] p-6 shadow-lg"
        >
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            Pencapaian Terbaru <Trophy className="w-4 h-4 text-yellow-400" />
          </h3>
          
          {/* Gradient Box */}
          <div className="h-24 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between px-6 relative overflow-hidden shadow-lg shadow-indigo-500/20 group cursor-pointer">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            
            <div className="relative z-10">
              <p className="text-xs text-indigo-200 font-medium mb-1">Badge Didapatkan</p>
              <h4 className="text-xl font-bold text-white">Early Bird 🦜</h4>
            </div>
            
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6 text-yellow-300 fill-current" />
            </div>
          </div>
        </motion.div>

        {/* 3. SETTINGS MENU */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 border border-white/10 rounded-[30px] overflow-hidden shadow-lg"
        >
          {menuItems.map((item, index) => (
            <button 
              key={index}
              onClick={item.action}
              className={`w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-200">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          ))}
        </motion.div>

        {/* 4. LOGOUT BUTTON */}
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={onLogout}
          className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-4 rounded-[20px] flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all active:scale-95"
        >
          <LogOut className="w-5 h-5" /> Keluar Akun
        </motion.button>

        {/* Footer Info */}
        <p className="text-center text-[10px] text-slate-600 pb-4">
          Versi Aplikasi 1.0.0 • Build by Tim Amikom
        </p>

      </div>
    </div>
  );
};

export default Profile;