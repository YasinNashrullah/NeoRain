import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Lock, HelpCircle, LogOut, Camera, ChevronRight,
  MapPin, Calendar, Mail, Flame, Award, Phone, MessageSquare,
  HeartHandshake, Save, X, Star, ShieldCheck, Sun, Moon, Smartphone, Clock,
  Trophy, Target
} from 'lucide-react';
import { updateProfile, updatePassword, deleteUser } from "firebase/auth";
import { auth } from '../firebase';
import { api } from '../utils/api';

import { ACHIEVEMENTS_LIST, getLevel } from '../utils/achievements';

const Profile = ({ userData, onLogout, onUpdateProfile, theme, setTheme }) => {
  // Force rebuild timestamp: 2026-01-02
  const [activeView, setActiveView] = useState('main');
  const [streak, setStreak] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);

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

      const checkAndSaveAchievements = async () => {
        try {
          // load gamification firestore
          let gamification = await api.getGamification(userData.uid);
          if (!gamification) gamification = { streak: 0, achievements: [] };

          setStreak(gamification.streak || 0);

          const currentUnlocked = gamification.achievements || [];
          let hasNewUnlock = false;

          // Prepare data for condition checking
          const checkData = {
            streak: gamification.streak || 0,
            score: gamification.score || 0,
            moodCount: userData.mood_count || 0,
            hasLocation: !!userData.location && userData.location !== 'Belum diisi',
            hasGender: !!userData.gender,
            hasCustomPhoto: !!userData.photo_url && !userData.photo_url.includes('dicebear')
          };

          // Check all achievements
          ACHIEVEMENTS_LIST.forEach(ach => {
            if (!currentUnlocked.includes(ach.id)) {
              if (ach.condition(checkData)) {
                currentUnlocked.push(ach.id);
                hasNewUnlock = true;
              }
            }
          });

          setUnlockedAchievements(currentUnlocked);

          // Save if new unlocks found
          if (hasNewUnlock) {
            await api.saveGamification(userData.uid, {
              ...gamification,
              achievements: currentUnlocked
            });
          }

        } catch (error) {
          console.error("Failed to sync achievements:", error);
        }
      };

      checkAndSaveAchievements();
    }
  }, [userData]);

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
                  {unlockedAchievements.length}
                  <span className="text-lg font-medium text-slate-500"> / {ACHIEVEMENTS_LIST.length}</span>
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
        <p className="text-[10px] text-slate-500">NeoRain v1.0.0 • Build date: {new Date().getFullYear()}</p>
      </div>

    </motion.div>
  );

  // achievement view
  const renderAchievements = () => {
    const unlockedList = ACHIEVEMENTS_LIST.filter(ach => unlockedAchievements.includes(ach.id));
    const lockedList = ACHIEVEMENTS_LIST.filter(ach => !unlockedAchievements.includes(ach.id));
    const currentLevel = getLevel(userData?.score || 0);

    // Data for Spotlight (Latest Achievement)
    const latestAchievement = unlockedList.length > 0 ? unlockedList[unlockedList.length - 1] : null;

    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full pb-20">
        <button onClick={() => setActiveView('main')} className="mb-6 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
          <div className="p-1 bg-slate-200 dark:bg-white/10 rounded-lg"><ChevronRight className="w-5 h-5 rotate-180" /></div>
          <span className="font-bold">Kembali</span>
        </button>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">Dashboard Pencapaian</h2>
              <p className="text-slate-500 dark:text-slate-400">Pantau progress dan koleksi lencanamu.</p>
            </div>
          </div>

          {/* NEW BENTO GRID LAYOUT */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

            {/* 1. SPOTLIGHT CARD (Hero) - 2x2 on Desktop */}
            <div className="md:col-span-2 lg:col-span-2 row-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[30px] p-8 relative overflow-hidden shadow-xl group flex flex-col justify-center items-center text-center">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

              <div className="relative z-10">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-wider border border-white/20">
                    Latest Unlock
                  </span>
                </div>

                {latestAchievement ? (
                  <>
                    <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-500 border border-white/20">
                      <latestAchievement.icon className="w-16 h-16 text-white drop-shadow-lg" />
                    </div>
                    <h3 className="text-white font-black text-3xl mb-2">{latestAchievement.label}</h3>
                    <p className="text-indigo-100 text-sm max-w-xs mx-auto leading-relaxed">{latestAchievement.desc}</p>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center opacity-60">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-4">
                      <Lock className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-white font-medium">Belum ada lencana</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. STATS CARDS - Stacked on right */}
            <div className="md:col-span-1 lg:col-span-2 grid grid-cols-2 gap-6">
              {/* Total Badges */}
              <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-6 shadow-sm dark:shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full blur-xl"></div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-3 text-yellow-600 dark:text-yellow-400 group-hover:rotate-12 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <p className="text-4xl font-black text-slate-800 dark:text-white mb-1">{unlockedList.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Lencana</p>
              </div>

              {/* Current Rank */}
              <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-6 shadow-sm dark:shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center mb-3 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform">
                  <currentLevel.icon className="w-6 h-6" />
                </div>
                <p className="text-lg font-black text-slate-800 dark:text-white line-clamp-1">{currentLevel.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Current Rank</p>
              </div>
            </div>

            {/* 3. LEVEL PROGRESS (Full Width in this section) */}
            <div className="md:col-span-1 lg:col-span-2 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-950 rounded-[30px] p-6 relative overflow-hidden shadow-xl border border-slate-700/50 flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">Level Progress</h3>
                    <p className="text-slate-400 text-xs">Keep going!</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <span className="text-yellow-400 font-black text-sm">{userData?.score || 0} XP</span>
                  </div>
                </div>

                <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000"
                    style={{ width: `${Math.min((userData?.score || 0) / 10, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Level {Math.floor((userData?.score || 0) / 100) + 1}</span>
                  <span>Next: 1000 XP</span>
                </div>
              </div>
            </div>

            {/* 4. ALL ACHIEVEMENTS GRID (Full Width) */}
            <div className="col-span-full bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-8 shadow-sm dark:shadow-xl">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-indigo-500" /> Semua Pencapaian
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {ACHIEVEMENTS_LIST.map((ach) => {
                  const isUnlocked = unlockedAchievements.includes(ach.id);
                  return (
                    <button
                      key={ach.id}
                      onClick={() => setSelectedAchievement({ ...ach, unlocked: isUnlocked })}
                      className={`group relative aspect-square rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 border
                        ${isUnlocked
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:scale-105 hover:shadow-[0_0_25px_rgba(99,102,241,0.7)]'
                          : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-white/5 opacity-70 hover:opacity-100'
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                        ${isUnlocked
                          ? 'bg-white/20 backdrop-blur-sm text-white shadow-inner group-hover:scale-110 group-hover:rotate-3'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 grayscale'
                        }`}>
                        <ach.icon className="w-6 h-6" />
                      </div>

                      <span className={`text-xs font-bold text-center leading-tight line-clamp-2
                        ${isUnlocked ? 'text-white text-shadow-sm' : 'text-slate-400 dark:text-slate-500'}
                      `}>
                        {ach.label}
                      </span>

                      {isUnlocked && (
                        <div className="absolute top-3 right-3 animate-pulse">
                          <Star className="w-3 h-3 text-yellow-300 fill-yellow-300 drop-shadow-md" />
                        </div>
                      )}
                      {!isUnlocked && (
                        <div className="absolute top-3 right-3">
                          <Lock className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* achievement modal */}
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

                <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <selectedAchievement.icon className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
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
  };

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
              <p className="text-indigo-600 dark:text-indigo-400 font-medium mt-1">neorain.app@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full h-full bg-transparent dark:bg-slate-950 text-slate-800 dark:text-white overflow-y-auto scrollbar-hide pb-16 md:pb-6">
      <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8">
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