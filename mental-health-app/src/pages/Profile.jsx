import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Lock, HelpCircle, LogOut, Camera, ChevronRight,
  MapPin, Calendar, Mail, Flame, Award, Phone, MessageSquare,
  HeartHandshake, Save, X, Star, ShieldCheck, Sun, Moon, Smartphone, Clock
} from 'lucide-react';
import { updateProfile, updatePassword, deleteUser } from "firebase/auth";
import { auth } from '../firebase';
import { api } from '../utils/api';

const Profile = ({ userData, onLogout, onUpdateProfile, theme, setTheme }) => {
  const [activeView, setActiveView] = useState('main');
  const [streak, setStreak] = useState(0);

  // State untuk Modal Achievement
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  // state form edit
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dob: '',
    location: ''
  });

  // state security
  const [passData, setPassData] = useState({ newPass: '', confirmPass: '' });

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        gender: userData.gender || '',
        dob: userData.date_of_birth || '',
        location: userData.location || ''
      });

      // load streak firestore
      api.getGamification(userData.uid).then(data => {
        setStreak(data?.streak || 0);
      });
    }
  }, [userData]);

  const achievementsList = [
    {
      id: 1, label: 'Langkah Awal', desc: 'Bergabung dengan NeoRain', icon: '🚀',
      unlocked: true
    },
    {
      id: 2, label: 'Pejuang Minggu', desc: 'Login berturut-turut selama 7 hari', icon: '🔥',
      unlocked: parseInt(streak) >= 7
    },
    {
      id: 3, label: 'Mood Master', desc: 'Mencatat mood minimal 20 kali', icon: '🎭',
      unlocked: (userData?.mood_count || 0) >= 20
    },
    {
      id: 4, label: 'Supporter', desc: 'Melengkapi profil data diri (Lokasi & Gender)', icon: '🤝',
      unlocked: userData?.location && userData?.gender && userData.location !== 'Belum diisi'
    },
    {
      id: 5, label: 'Verified', desc: 'Memiliki foto profil custom', icon: '📸',
      unlocked: userData?.photo_url && !userData.photo_url.includes('dicebear')
    }
  ];

  // handlers
  // upload foto
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // validasi ukuran max 2mb
    if (file.size > 2 * 1024 * 1024) {
      return alert("Ukuran file terlalu besar! Maksimal 2MB.");
    }

    try {
      const res = await api.uploadProfilePhoto(userData.uid, file);

      if (res && res.url) {
        alert("Foto berhasil diupdate!");
        if (onUpdateProfile) onUpdateProfile();
      } else {
        alert("Gagal upload foto.");
      }
    } catch (error) {
      console.error(error);
      alert("Gagal upload foto. Cek koneksi.");
    }
  };

  // simpan profil
  const handleSaveProfile = async () => {
    if (!formData.name.trim()) return alert("Nama tidak boleh kosong!");

    try {
      await api.updateUserProfile({
        firebase_uid: userData.uid,
        name: formData.name,
        gender: formData.gender,
        date_of_birth: formData.dob,
        location: formData.location
      });

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: formData.name });
      }
      alert("Profil berhasil disimpan!");

      if (onUpdateProfile) {
        await onUpdateProfile();
      }

      setActiveView('main');

    } catch (error) {
      console.error("Save Error:", error);
      alert("Gagal update profil. Pastikan server Laravel berjalan.");
    }
  };

  // change password firebase
  const handleChangePassword = async () => {
    if (passData.newPass.length < 6) return alert("Password minimal 6 karakter!");
    if (passData.newPass !== passData.confirmPass) return alert("Password konfirmasi tidak cocok!");

    try {
      await updatePassword(auth.currentUser, passData.newPass);
      alert("Password berhasil diubah. Silakan login ulang.");
      onLogout();
    } catch (e) { alert("Gagal: " + e.message); }
  };

  // delete account
  const handleDeleteAccount = async () => {
    if (confirm("Yakin hapus akun? Data hilang permanen!")) {
      try {
        await deleteUser(auth.currentUser);
        onLogout();
      } catch (e) { alert("Login ulang dulu untuk menghapus akun."); }
    }
  };

  // format tanggal bergabung
  const joinDate = auth.currentUser?.metadata?.creationTime
    ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';


  // render
  const renderMain = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* profile card */}
        <div className="lg:col-span-7 bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-8 relative overflow-hidden shadow-sm dark:shadow-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>

          <div className="flex items-center gap-6 mb-8 relative z-10">
            <div className="relative group">
              {/* foto profile dari database */}
              <img
                src={userData?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 object-cover shadow-md"
              />
              <label className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-500 transition-colors shadow-lg group-hover:scale-105">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </label>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">{formData.name || "User"}</h2>
              <button
                onClick={() => setActiveView('edit')}
                className="mt-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-full transition-colors shadow-lg shadow-indigo-500/30"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* grid info detail */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 relative z-10">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Email</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{userData?.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Bergabung</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{joinDate}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Jenis Kelamin</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 capitalize">{formData.gender || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Lokasi</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 capitalize">{formData.location || '-'}</p>
            </div>
          </div>
        </div>

        {/* kanan stats */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* streak card */}
          <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-6 shadow-sm dark:shadow-xl flex items-center justify-between relative overflow-hidden h-full">
            <div className="relative z-10">
              <h3 className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wider mb-1">Your Streak</h3>
              <div className="flex items-center gap-3">
                <Flame className="w-10 h-10 text-orange-500 animate-pulse" />
                <span className="text-4xl font-black text-slate-800 dark:text-white">{streak} <span className="text-lg font-medium text-slate-500">Days</span></span>
              </div>
            </div>
            <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
          </div>

          {/* achievement card preview */}
          <button
            onClick={() => setActiveView('achievements')}
            className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-6 shadow-sm dark:shadow-xl flex items-center justify-between relative overflow-hidden h-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="relative z-10 text-left">
              <h3 className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wider mb-1">Achievements</h3>
              <div className="flex items-center gap-3">
                <Award className="w-10 h-10 text-yellow-400 fill-yellow-400/20" />
                <span className="text-4xl font-black text-slate-800 dark:text-white">
                  {achievementsList.filter(a => a.unlocked).length}
                  <span className="text-lg font-medium text-slate-500"> / {achievementsList.length}</span>
                </span>
              </div>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-full group-hover:bg-slate-200 dark:group-hover:bg-white/10 transition-colors">
              <ChevronRight className="w-6 h-6 text-slate-400" />
            </div>
          </button>

        </div>
      </div>

      {/* bottom menu list */}
      <div className="grid grid-cols-1 gap-4">
        {/* Toggle Theme */}
        {/* Theme Selector */}
        {/* Theme Selector Compact */}
        <div className="bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-500 dark:text-slate-400">
              {theme === 'dark' ? <Moon className="w-6 h-6" /> : theme === 'light' ? <Sun className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-800 dark:text-white text-lg">Appearance</p>
              <p className="text-xs text-slate-500">
                {theme === 'auto' ? 'Auto' : theme === 'dark' ? 'Dark' : 'Light'}
              </p>
            </div>
          </div>

          {/* Compact Controls */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-1">
            <button
              onClick={() => setTheme('light')}
              className={`p-2 rounded-md transition-all ${theme === 'light'
                ? 'bg-white dark:bg-slate-600 text-orange-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              title="Light Mode"
            >
              <Sun className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-2 rounded-md transition-all ${theme === 'dark'
                ? 'bg-white dark:bg-slate-600 text-indigo-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              title="Dark Mode"
            >
              <Moon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTheme('auto')}
              className={`p-2 rounded-md transition-all ${theme === 'auto'
                ? 'bg-white dark:bg-slate-600 text-blue-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              title="Auto Mode"
            >
              <Clock className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button onClick={() => setActiveView('security')} className="bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm group backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-500 dark:text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"><Lock className="w-6 h-6" /></div>
            <div className="text-left">
              <p className="font-bold text-slate-800 dark:text-white text-lg">Privacy & Security</p>
              <p className="text-xs text-slate-500">Manage password & data</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-600" />
        </button>

        <button onClick={() => setActiveView('help')} className="bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm group backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-500 dark:text-slate-400 group-hover:bg-green-500/20 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"><HelpCircle className="w-6 h-6" /></div>
            <div className="text-left">
              <p className="font-bold text-slate-800 dark:text-white text-lg">Help & Support</p>
              <p className="text-xs text-slate-500">Crisis center & guide</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-600" />
        </button>
      </div>

      {/* logout */}
      <div className="pt-4 pb-8 text-center">
        <button onClick={onLogout} className="text-red-500 dark:text-red-400 font-bold text-sm hover:text-red-600 dark:hover:text-red-300 flex items-center justify-center gap-2 mx-auto mb-4 hover:scale-105 transition-transform">
          <LogOut className="w-4 h-4" /> Keluar Akun
        </button>
        <p className="text-[10px] text-slate-500">NeoRain v1.0.0 • Build 2025</p>
      </div>

    </motion.div>
  );

  // achievement view
  const renderAchievements = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto">
      <button onClick={() => setActiveView('main')} className="mb-6 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
        <div className="p-1 bg-slate-200 dark:bg-white/10 rounded-lg"><ChevronRight className="w-5 h-5 rotate-180" /></div>
        <span className="font-bold">Kembali</span>
      </button>

      <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-8 shadow-2xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Pencapaian Kamu</h2>
          <p className="text-slate-500 dark:text-slate-400">Kumpulkan semua lencana untuk menjadi master kesehatan mental!</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {achievementsList.map((ach) => (
            <button
              key={ach.id}
              onClick={() => setSelectedAchievement(ach)}
              className={`relative p-6 rounded-2xl border flex flex-col items-center text-center transition-all group ${ach.unlocked
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:scale-105'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-white/5 opacity-60 grayscale hover:opacity-80'
                }`}
            >
              <div className="text-4xl mb-3 drop-shadow-lg">{ach.icon}</div>
              <h4 className={`font-bold text-sm mb-1 ${ach.unlocked ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{ach.label}</h4>
              <p className="text-[10px] text-slate-500">{ach.unlocked ? 'Tercapai' : 'Terkunci'}</p>

              {ach.unlocked && (
                <div className="absolute top-2 right-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* achievement */}
      <AnimatePresence>
        {selectedAchievement && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-white/60 dark:border-white/10 p-8 rounded-[30px] max-w-sm w-full text-center relative shadow-2xl"
            >
              <button onClick={() => setSelectedAchievement(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-white">
                <X className="w-6 h-6" />
              </button>

              <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-6xl shadow-inner">
                {selectedAchievement.icon}
              </div>

              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{selectedAchievement.label}</h3>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${selectedAchievement.unlocked ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                {selectedAchievement.unlocked ? 'UNLOCKED' : 'LOCKED'}
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedAchievement.desc}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );

  // edit profile view
  const renderEdit = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto">
      <button onClick={() => setActiveView('main')} className="mb-6 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
        <div className="p-1 bg-slate-200 dark:bg-white/10 rounded-lg"><ChevronRight className="w-5 h-5 rotate-180" /></div>
        <span className="font-bold">Kembali</span>
      </button>

      <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Edit Profile</h2>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Nama Lengkap</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 mt-1 text-slate-800 dark:text-white focus:border-indigo-500 outline-none shadow-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Jenis Kelamin</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 mt-1 text-slate-800 dark:text-white focus:border-indigo-500 outline-none appearance-none shadow-sm transition-all"
              >
                <option value="" className="text-slate-800 dark:text-white dark:bg-slate-900">Pilih</option>
                <option value="Laki-laki" className="text-slate-800 dark:text-white dark:bg-slate-900">Laki-laki</option>
                <option value="Perempuan" className="text-slate-800 dark:text-white dark:bg-slate-900">Perempuan</option>
                <option value="Femboy" className="text-slate-800 dark:text-white dark:bg-slate-900">Rafi</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Tanggal Lahir</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 mt-1 text-slate-800 dark:text-white focus:border-indigo-500 outline-none shadow-sm transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Lokasi (Negara/Provinsi)</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 mt-1 text-slate-800 dark:text-white focus:border-indigo-500 outline-none shadow-sm transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/25 mt-4 transition-all active:scale-95 flex justify-center gap-2"
          >
            <Save className="w-5 h-5" /> Simpan Perubahan
          </button>
        </div>
      </div>
    </motion.div>
  );

  // render security view dark mode validation
  const renderSecurity = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto">
      <button onClick={() => setActiveView('main')} className="mb-6 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
        <div className="p-1 bg-slate-200 dark:bg-white/10 rounded-lg"><ChevronRight className="w-5 h-5 rotate-180" /></div>
        <span className="font-bold">Kembali</span>
      </button>

      <div className="space-y-6">
        {/* change password */}
        <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-8 shadow-sm dark:shadow-xl">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Ganti Password
          </h3>
          <div className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Password Baru (Min. 6 Karakter)"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:border-indigo-500 outline-none shadow-sm"
                onChange={(e) => setPassData({ ...passData, newPass: e.target.value })}
              />
            </div>
            <input
              type="password"
              placeholder="Konfirmasi Password Baru"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:border-indigo-500 outline-none shadow-sm"
              onChange={(e) => setPassData({ ...passData, confirmPass: e.target.value })}
            />
            <button onClick={handleChangePassword} className="w-full bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 font-bold py-3 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-600/30 transition-colors">
              Update Password
            </button>
          </div>
        </div>

        {/* delete account */}
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 rounded-[30px] p-8 shadow-sm dark:shadow-xl">
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Zona Bahaya
          </h3>
          <p className="text-sm text-red-800/70 dark:text-red-300/70 mb-4">
            Menghapus akun akan menghilangkan semua data analisis, mood tracker, dan chat secara permanen.
          </p>
          <button onClick={handleDeleteAccount} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
            Hapus Akun Permanen
          </button>
        </div>
      </div>
    </motion.div>
  );

  // render help view dark mode
  const renderHelp = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto">
      <button onClick={() => setActiveView('main')} className="mb-6 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
        <div className="p-1 bg-slate-200 dark:bg-white/10 rounded-lg"><ChevronRight className="w-5 h-5 rotate-180" /></div>
        <span className="font-bold">Kembali</span>
      </button>

      <div className="space-y-6">
        <div className="bg-red-500 text-white rounded-[30px] p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2"><Phone className="w-6 h-6" /> Butuh Bantuan Segera?</h3>
            <p className="text-red-100 mb-6">Jika kamu atau orang yang kamu kenal sedang dalam krisis, jangan ragu untuk menghubungi bantuan profesional.</p>
            <div className="space-y-3">
              <div className="bg-white/20 p-4 rounded-xl flex justify-between items-center backdrop-blur-sm">
                <span className="font-bold">Layanan Sejiwa (Indonesia)</span>
                <span className="font-mono text-xl font-black">119 (Ext 8)</span>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-8 shadow-sm dark:shadow-xl">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><HeartHandshake className="w-5 h-5 text-green-500 dark:text-green-400" /> Hubungi Kami</h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/5">
              <h4 className="font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Feedback & Saran</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Punya ide untuk NeoRain? Kirim email ke:</p>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium mt-1">support@neorain.app</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full h-full bg-transparent dark:bg-slate-950 text-slate-800 dark:text-white overflow-y-auto scrollbar-hide pb-16 md:pb-6">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <AnimatePresence mode='wait'>
          {activeView === 'main' && renderMain()}
          {activeView === 'edit' && renderEdit()}
          {activeView === 'security' && renderSecurity()}
          {activeView === 'help' && renderHelp()}
          {activeView === 'achievements' && renderAchievements()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;