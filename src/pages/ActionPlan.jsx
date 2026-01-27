import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, Trophy, Flame, CheckCircle2, Star,
    Medal, Lock, ArrowRight, PartyPopper, Loader2,
    Quote, Zap, Crown, Sparkles, BrainCircuit
} from 'lucide-react';
import { api } from '../utils/api';
import confetti from 'canvas-confetti';
import { ACHIEVEMENTS_LIST } from '../utils/achievements';
import Skeleton from '../components/ui/Skeleton';

const ActionPlan = ({ userData, onNavigate }) => {
    const [loading, setLoading] = useState(true);
    const [actionItems, setActionItems] = useState([]);
    const [assessmentId, setAssessmentId] = useState(null);
    const fetchingRef = React.useRef(false);

    // gamification state
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [completedIndices, setCompletedIndices] = useState([]);
    const [achievements, setAchievements] = useState([]);

    // UI State
    const [showCelebration, setShowCelebration] = useState(false);
    const [justUnlocked, setJustUnlocked] = useState(null);

    // Load Data
    useEffect(() => {
        const init = async () => {
            if (!userData?.uid) return;

            try {
                const todayStr = new Date().toDateString();

                // load gamification data
                const savedGamification = (await api.getGamification(userData.uid)) || {
                    score: 0,
                    streak: 0,
                    completedIndices: [],
                    last_action_date: null,
                    history: []
                };

                // load latest assessment (for context/generating new goals if needed)
                const assessment = await api.getLatestAssessment(userData.uid);
                setAssessmentId(assessment?.id);

                // load current stored plan
                let currentPlan = await api.getDailyPlan(userData.uid);
                let actions = [];

                // LOGIC: Daily Reset & Sync with Home.jsx
                if (currentPlan && currentPlan.date === todayStr) {
                    actions = currentPlan.goals || currentPlan.actions || [];
                } else {
                    const newPlan = await api.analyst.generateDailyGoals({
                        userData,
                        lastAssessment: assessment,
                        currentMood: 'calm'
                    });

                    // Save this new plan
                    const planToSave = {
                        ...newPlan,
                        date: todayStr,
                        source_assessment_id: assessment?.id,
                        updated_at: new Date().toISOString()
                    };

                    await api.saveDailyPlan(userData.uid, planToSave);
                    actions = newPlan.goals || [];
                    currentPlan = planToSave;
                }

                // Check for Daily Reset of Checks
                if (savedGamification.last_action_date !== todayStr) {
                    savedGamification.completedIndices = [];
                    savedGamification.last_action_date = todayStr;
                    await api.saveGamification(userData.uid, savedGamification);
                }

                setActionItems(actions);

                // streak logic 
                setStreak(savedGamification.streak || 0);
                setScore(savedGamification.score || 0);
                setAchievements(savedGamification.achievements || []);
                setCompletedIndices(savedGamification.completedIndices || []);

            } catch (error) {
                console.error("Failed to load action plan", error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [userData]);

    // save data effect
    useEffect(() => {
        if (!userData?.uid || loading) return;

        const saveData = async () => {
            const dataToSave = {
                score,
                streak,
                completedIndices,
                achievements
            };
            await api.saveGamification(userData.uid, dataToSave);
        };
        saveData();
    }, [score, streak, completedIndices, achievements, userData, loading]);


    const handleToggleTask = (index) => {
        const isCompleted = completedIndices.includes(index);

        if (isCompleted) {
            // uncheck logic
            setCompletedIndices(prev => prev.filter(i => i !== index));
            setScore(prev => Math.max(0, prev - 10)); // Deduct points
        } else {
            // check logic
            const newCompleted = [...completedIndices, index];
            setCompletedIndices(newCompleted);

            // add score
            const points = 10;
            setScore(prev => prev + points);

            // check achievements
            checkAchievements(newCompleted.length, score + points);

            // celebration
            triggerCelebration();
        }
    };

    const triggerCelebration = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#818cf8', '#c084fc', '#34d399']
        });
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
    };

    const checkAchievements = (completedCount, currentScore) => {
        const newAchievements = [...achievements];

        // Prepare data for condition checking
        const checkData = {
            completedCount: completedCount,
            streak: streak,
            score: currentScore,
            moodCount: 0,
            hasLocation: true,
            hasGender: true,
            hasCustomPhoto: true
        };

        ACHIEVEMENTS_LIST.forEach(badge => {
            if (!newAchievements.includes(badge.id) && badge.condition(checkData)) {
                newAchievements.push(badge.id);
                setJustUnlocked(badge);
                setTimeout(() => setJustUnlocked(null), 4000);
            }
        });

        setAchievements(newAchievements);
    };

    const getLevel = (score) => {
        if (score < 50) return { label: 'Novice', color: 'text-slate-600 dark:text-slate-400', border: 'border-slate-400', bg: 'bg-slate-400/10', icon: Star, next: 50 };
        if (score < 150) return { label: 'Apprentice', color: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/50 dark:border-indigo-400', bg: 'bg-indigo-500/10 dark:bg-indigo-400/10', icon: Zap, next: 150 };
        if (score < 300) return { label: 'Expert', color: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500 dark:border-purple-400', bg: 'bg-purple-500/10 dark:bg-purple-400/10', icon: Medal, next: 300 };
        return { label: 'Master', color: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500 dark:border-yellow-400', bg: 'bg-yellow-500/10 dark:bg-yellow-400/10', icon: Crown, next: 1000 };
    };

    const currentLevel = getLevel(score);
    const progressPercent = actionItems.length > 0 ? (completedIndices.length / actionItems.length) * 100 : 0;
    const levelProgress = Math.min(100, (score / currentLevel.next) * 100);

    return (
        <div className="w-full h-full bg-transparent dark:bg-slate-950 text-slate-800 dark:text-white flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-indigo-500/10 dark:bg-indigo-900/20 blur-[100px] pointer-events-none"></div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hide pb-24 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 relative z-10 max-w-full"
                    >
                        <div className="w-full h-full space-y-6 md:space-y-8 animate-pulse">
                            {/* Header Stats Skeleton */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Skeleton className="col-span-2 h-32 rounded-[30px]" />
                                <Skeleton className="h-32 rounded-[30px]" />
                                <Skeleton className="h-32 rounded-[30px]" />
                            </div>

                            {/* Main Grid Skeleton */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Left Column */}
                                <div className="lg:col-span-8 space-y-6">
                                    {/* Progress Bar Skeleton */}
                                    <Skeleton className="h-24 rounded-[20px]" />

                                    {/* Mission List Skeleton */}
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <Skeleton key={i} className="h-20 rounded-2xl" />
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="lg:col-span-4 space-y-6">
                                    {/* Motivation Skeleton */}
                                    <Skeleton className="h-40 rounded-[30px]" />

                                    {/* Achievements Skeleton */}
                                    <Skeleton className="h-64 rounded-[30px]" />

                                    {/* Level Skeleton */}
                                    <Skeleton className="h-48 rounded-[30px]" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hide pb-24 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 relative z-10 max-w-full"
                    >
                        {/* header stats (Hero Section) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 1. Score (Premium Hero Card) */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[20px] p-4 flex items-center justify-between shadow-xl shadow-indigo-500/30 relative overflow-hidden group">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                                <Trophy className="absolute top-1/2 right-10 -translate-y-1/2 w-32 h-32 text-white/5 -rotate-12" />

                                {/* Left: Label */}
                                <div className="relative z-10 flex flex-col justify-center h-full">
                                    <div className="flex items-center gap-2 bg-indigo-500/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-indigo-400/20 mb-1 w-fit">
                                        <Trophy className="w-3.5 h-3.5 text-yellow-300" />
                                        <span className="text-indigo-100 font-bold text-[10px] uppercase tracking-widest">Total Skor</span>
                                    </div>
                                    <p className="text-indigo-200 text-xs font-medium max-w-[120px] leading-relaxed">
                                        Poin produktivitas Anda sejauh ini.
                                    </p>
                                </div>

                                {/* Right: Score */}
                                <div className="relative z-10">
                                    <h2 className="text-5xl font-black text-white tracking-tighter drop-shadow-sm leading-none text-right">{score}</h2>
                                </div>
                            </div>

                            {/* 2. Level (Premium Hero Card) */}
                            <div className="bg-gradient-to-br from-white via-indigo-50/50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-[20px] p-4 flex flex-col justify-between shadow-xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-20 mix-blend-multiply dark:mix-blend-overlay"></div>
                                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 ${currentLevel.bg.replace('/10', '')}`}></div>

                                <div className="relative z-10 h-full flex flex-col justify-between pt-2">
                                    {/* Combined Header */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`p-1 rounded-md ${currentLevel.bg} border ${currentLevel.border.replace('border-', 'border-opacity-20 ')}`}>
                                                <currentLevel.icon className={`w-3.5 h-3.5 ${currentLevel.color}`} />
                                            </div>
                                            <span className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">Level Saat Ini</span>
                                        </div>

                                        <div className="flex items-baseline gap-3">
                                            <h2 className={`text-3xl font-black ${currentLevel.color} tracking-tight leading-none`}>{currentLevel.label}</h2>
                                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10">
                                                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Rank</span>
                                                <span className="text-xs font-bold text-slate-700 dark:text-white leading-none">{Math.floor(score / 50) + 1}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Section */}
                                    <div className="bg-white/60 dark:bg-slate-800/50 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700/50 mt-1 backdrop-blur-sm">
                                        <div className="flex justify-between items-end mb-1.5">
                                            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Progress</span>
                                            <span className="text-[10px] font-bold text-slate-700 dark:text-white">{currentLevel.next - score} XP <span className="text-slate-500 font-normal">lagi</span></span>
                                        </div>

                                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-900/50 rounded-full overflow-hidden relative shadow-inner">
                                            <motion.div
                                                className={`h-full relative z-10 shadow-[0_0_10px_rgba(250,204,21,0.3)]`}
                                                style={{
                                                    width: `${levelProgress}%`,
                                                    background: 'linear-gradient(90deg, #ca8a04, #eab308, #facc15, #eab308)',
                                                    backgroundSize: '200% 100%'
                                                }}
                                                animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Daily Motivation Banner */}
                        <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-orange-500/10 dark:to-purple-500/10 border border-orange-200 dark:border-orange-500/20 rounded-[30px] p-6 relative overflow-hidden shadow-sm flex items-center justify-between gap-6">
                            <div className="relative z-10 flex-1">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-orange-400" /> Motivasi Harian
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed">
                                    "Langkah kecil setiap hari membawa hasil besar. Teruslah melangkah!"
                                </p>
                            </div>
                            <Quote className="hidden md:block w-12 h-12 text-orange-500/20 rotate-12 shrink-0" />
                        </div>

                        {/* main content grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-full">

                            {/* left column: Missions */}
                            <div className="lg:col-span-8 space-y-6 w-full min-w-0 flex flex-col">

                                {/* progress bar */}
                                <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900/50 dark:to-slate-900/50 border border-white/60 dark:border-white/10 rounded-[20px] p-6 backdrop-blur-sm shadow-sm dark:shadow-none w-full">
                                    <div className="flex flex-wrap justify-between items-end mb-3 gap-2">
                                        <div className="max-w-full">
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                <Target className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                                                <span>Progres Misi</span>
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">Selesaikan misi untuk meningkatkan skor kesehatanmu.</p>
                                        </div>
                                        <span className="text-2xl font-bold text-indigo-500 dark:text-indigo-400 shrink-0">{Math.round(progressPercent)}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>

                                {/* mission list (Grid Layout) */}
                                <div className={actionItems.length === 0 ? "h-full" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                                    {actionItems.length === 0 ? (
                                        <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900/50 dark:to-slate-900/50 border border-white/60 dark:border-white/10 rounded-[30px] p-12 text-center flex flex-col items-center justify-center min-h-[300px] shadow-sm h-full">
                                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 relative">
                                                <BrainCircuit className="w-12 h-12 text-slate-400 dark:text-slate-600" />
                                                <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl animate-pulse"></div>
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Belum Ada Data Action Plan</h3>
                                            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
                                                Sepertinya Anda belum menyelesaikan Analisis AI.
                                                Mulai diagnosis untuk mendapatkan rencana kesehatan mental yang dipersonalisasi.
                                            </p>
                                            <button
                                                onClick={() => onNavigate && onNavigate('analyze')}
                                                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full shadow-lg shadow-indigo-500/30 hover:scale-105 transition-transform flex items-center gap-2"
                                            >
                                                <Sparkles className="w-5 h-5" />
                                                Start AI Analysis
                                            </button>
                                        </div>
                                    ) : (
                                        actionItems.map((item, idx) => {
                                            const isCompleted = completedIndices.includes(idx);
                                            return (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    onClick={() => handleToggleTask(idx)}
                                                    className={`group relative p-5 rounded-2xl border transition-all cursor-pointer overflow-hidden shadow-sm flex flex-col justify-between min-h-[140px] ${isCompleted
                                                        ? 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/30'
                                                        : 'bg-white/60 dark:bg-slate-900/80 border-white/60 dark:border-white/10 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-800 hover:-translate-y-1 hover:shadow-md'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3 relative z-10">
                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all mt-0.5 flex-shrink-0 ${isCompleted
                                                            ? 'bg-green-500 border-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                                                            : 'border-slate-300 dark:border-slate-500 text-transparent group-hover:border-indigo-400'
                                                            }`}>
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium transition-all leading-relaxed ${isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200'
                                                                }`}>
                                                                {item}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* XP Text / Indicator */}
                                                    <div className="flex justify-end mt-4">
                                                        {isCompleted ? (
                                                            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/10 px-2 py-0.5 rounded-full whitespace-nowrap border border-green-200 dark:border-green-500/20">
                                                                Completed (+10 XP)
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500/50 group-hover:text-indigo-500 transition-colors">
                                                                +10 XP
                                                            </span>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                </div>

                            </div>

                            {/* right column sidebar: Achievements (Compact) */}
                            <div className="lg:col-span-4 h-full flex flex-col gap-6">

                                {/* Streak Card (Relocated here) */}
                                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[30px] p-6 text-white shadow-lg shadow-orange-500/30 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                                            <Flame className={`w-4 h-4 ${streak > 0 ? 'text-white animate-pulse' : 'text-white/70'}`} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Current Streak</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black">{streak}</span>
                                            <span className="text-lg font-medium text-orange-100">Hari</span>
                                        </div>
                                        <p className="text-xs text-orange-100 mt-2 font-medium">
                                            {streak > 3 ? "Konsistensi yang luar biasa! Pertahankan!" : "Ayo bangun kebiasaan baik setiap hari!"}
                                        </p>
                                    </div>
                                </div>

                                {/* achievements list */}
                                <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-6 shadow-sm dark:shadow-xl flex-1 flex flex-col max-h-[420px]">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 flex-shrink-0">
                                        <Trophy className="w-5 h-5 text-yellow-500 dark:text-yellow-400" /> Pencapaian
                                    </h3>
                                    <div className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent flex-1">
                                        {ACHIEVEMENTS_LIST.map(badge => {
                                            const isUnlocked = achievements.includes(badge.id);
                                            return (
                                                <div key={badge.id} className={`relative overflow-hidden flex items-center gap-4 p-3 rounded-2xl border transition-all group ${isUnlocked
                                                    ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-slate-900 border-indigo-200 dark:border-indigo-500/30'
                                                    : 'bg-slate-50 dark:bg-white/5 border-transparent opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
                                                    }`}>
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isUnlocked ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                                        }`}>
                                                        <badge.icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-bold text-sm truncate ${isUnlocked ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{badge.label}</h4>
                                                        <p className="text-[10px] text-slate-500 truncate">{badge.desc}</p>
                                                    </div>
                                                    {isUnlocked ? (
                                                        <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
                                                        </div>
                                                    ) : (
                                                        <Lock className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

            {/* mission complete modal */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-indigo-200 dark:border-indigo-500/50 p-8 rounded-[40px] shadow-2xl text-center flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 mb-2">
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Mission Complete!</h2>
                                <p className="text-indigo-600 dark:text-indigo-300 font-bold text-lg">+10 Points</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* achievement unlocked modal */}
            <AnimatePresence>
                {justUnlocked && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 50, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-0 left-1/2 -translate-x-1/2 z-[60] bg-white dark:bg-slate-900 border border-yellow-500/50 p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]"
                    >
                        <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/40">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Achievement Unlocked</p>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{justUnlocked.label}</h3>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default ActionPlan;
