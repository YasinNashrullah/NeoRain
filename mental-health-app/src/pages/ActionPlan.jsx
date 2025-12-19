import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, Trophy, Flame, CheckCircle2, Star,
    Medal, Lock, ArrowRight, PartyPopper, Loader2,
    Quote, Zap, Crown, Sparkles, BrainCircuit
} from 'lucide-react';
import { api } from '../utils/api';
import { config } from '../utils/config';
import confetti from 'canvas-confetti';

const ActionPlan = ({ userData, onNavigate }) => {
    const [loading, setLoading] = useState(true);
    const [actionItems, setActionItems] = useState([]);
    const [assessmentId, setAssessmentId] = useState(null);
    const fetchingRef = React.useRef(false); // Lock to prevent double fetching

    // Gamification State
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [completedIndices, setCompletedIndices] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [lastActiveDate, setLastActiveDate] = useState(null);

    // UI State
    const [showCelebration, setShowCelebration] = useState(false);
    const [justUnlocked, setJustUnlocked] = useState(null);

    // Load Data
    useEffect(() => {
        const init = async () => {
            if (!userData?.uid) return;

            try {
                const today = new Date().toDateString();

                // 1. Load Gamification Data (Streak, Score, History)
                const savedGamification = (await api.getGamification(userData.uid)) || {
                    score: 0,
                    streak: 0,
                    last_active_date: null,
                    completedIndices: [], // This tracks TODAY's completion
                    history: [] // New: Track past completion for AI context
                };

                // 2. Load Daily Plan
                let currentPlan = await api.getDailyPlan(userData.uid);
                let actions = [];

                // Check if plan is for today
                if (currentPlan && currentPlan.date === today) {
                    actions = currentPlan.actions;
                } else if (!fetchingRef.current) {
                    // GENERATE NEW DAILY PLAN (Only if not already fetching)
                    fetchingRef.current = true; // Set lock
                    const assessment = await api.getLatestAssessment(userData.uid);
                    const moods = await api.getMoods(userData.uid); // Fetch moods

                    // Context for AI
                    const lastPlan = currentPlan || { actions: [], date: 'never' };
                    const lastCompletedCount = savedGamification.completedIndices?.length || 0;

                    actions = await generateDailyMissions(assessment, lastPlan, lastCompletedCount, moods);

                    // Save new plan
                    await api.saveDailyPlan(userData.uid, {
                        date: today,
                        actions: actions
                    });

                    // Reset daily completion for new day
                    savedGamification.completedIndices = [];
                    // Update gamification to clear old indices immediately
                    await api.saveGamification(userData.uid, savedGamification);

                    fetchingRef.current = false; // Release lock
                }

                setActionItems(actions);

                // Streak Logic
                let newStreak = savedGamification.streak || 0;
                const lastActive = savedGamification.last_active_date;

                if (lastActive !== today) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);

                    if (lastActive === yesterday.toDateString()) {
                        // Continued streak
                    } else if (lastActive && new Date(lastActive) < yesterday) {
                        // Broken streak
                        newStreak = 0;
                    }
                }

                setScore(savedGamification.score || 0);
                setStreak(newStreak);
                setAchievements(savedGamification.achievements || []);
                setLastActiveDate(lastActive);
                setCompletedIndices(savedGamification.completedIndices || []);

            } catch (error) {
                console.error("Failed to load action plan", error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [userData]);

    // --- AI GENERATOR ---
    const generateDailyMissions = async (assessment, lastPlan, lastCompletedCount, moods) => {
        try {
            const { apiKey, baseUrl, model } = config.gemini;
            if (!apiKey) throw new Error("API Key missing");

            const scores = assessment ? {
                depression: assessment.depression_score,
                anxiety: assessment.anxiety_score,
                stress: assessment.stress_score
            } : { depression: 0, anxiety: 0, stress: 0 };

            // Process Moods
            const recentMoods = moods && moods.length > 0
                ? moods.slice(0, 5).map(m => m.mood).join(", ")
                : "Tidak ada data mood";

            const prompt = `
                Role: Life Coach Gen Z.
                User: DASS-21(D:${scores.depression},A:${scores.anxiety},S:${scores.stress}). Mood:${recentMoods}.
                History: "${lastPlan.actions.join(', ')}". Done:${lastCompletedCount}/${lastPlan.actions.length}.

                Task: 5 NEW Daily Missions.
                Adapt:
                - Done < 2: Easier, supportive.
                - Done >= 3: Slightly harder.
                - Must be different.
                
                Style:
                - No prefixes (e.g. "Journaling:"). Just the action.
                - Descriptive, chill, aesthetic, persuasive sentences.
                - Bahasa Indonesia gaul/santai.

                JSON Output: { "actions": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5"] }
            `;

            const response = await fetch(`${baseUrl}/${model}:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });

            const data = await response.json();
            const result = JSON.parse(data.candidates[0].content.parts[0].text);
            return result.actions || ["Istirahat sejenak", "Minum air putih", "Tarik napas dalam", "Dengar lagu favorit", "Tidur lebih awal"];

        } catch (e) {
            console.error("AI Generation Failed", e);
            // Fallback actions
            return [
                "Coba jalan santai sore ini sambil dengerin playlist favoritmu biar pikiran lebih fresh.",
                "Luangkan waktu 5 menit untuk menumpahkan semua isi kepalamu ke kertas agar pikiran lebih lega.",
                "Lepas HP dulu selama 15 menit sebelum tidur, seduh teh hangat, dan nikmati ketenangan.",
                "Rapikan kasur atau meja belajarmu sedikit saja, ruang yang rapi bisa bikin mood lebih baik.",
                "Minum segelas air hangat, tarik napas dalam-dalam, dan izinkan tubuhmu rileks sejenak."
            ];
        }
    };

    // Save Data Effect
    useEffect(() => {
        if (!userData?.uid || loading) return;

        const saveData = async () => {
            const dataToSave = {
                score,
                streak,
                last_active_date: lastActiveDate,
                completedIndices,
                achievements
            };
            await api.saveGamification(userData.uid, dataToSave);
        };
        saveData();
    }, [score, streak, completedIndices, achievements, userData, loading, lastActiveDate]);


    const handleToggleTask = (index) => {
        const isCompleted = completedIndices.includes(index);

        if (isCompleted) {
            // Uncheck Logic
            setCompletedIndices(prev => prev.filter(i => i !== index));
            setScore(prev => Math.max(0, prev - 10)); // Deduct points
        } else {
            // Check Logic
            const newCompleted = [...completedIndices, index];
            setCompletedIndices(newCompleted);

            // Add Score
            const points = 10;
            setScore(prev => prev + points);

            // Update Streak (Once per day)
            const today = new Date().toDateString();

            if (lastActiveDate !== today) {
                setStreak(prev => prev + 1);
                setLastActiveDate(today);
            }

            // Check Achievements
            checkAchievements(newCompleted.length, score + points);

            // Celebration
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
        const badges = [
            { id: 'first_step', label: 'First Step', desc: 'Complete 1 task', icon: Star, condition: () => completedCount >= 1 },
            { id: 'on_fire', label: 'On Fire', desc: 'Reach 3 day streak', icon: Flame, condition: () => streak >= 3 },
            { id: 'master', label: 'Task Master', desc: 'Score 100 points', icon: Trophy, condition: () => currentScore >= 100 },
        ];

        badges.forEach(badge => {
            if (!newAchievements.includes(badge.id) && badge.condition()) {
                newAchievements.push(badge.id);
                setJustUnlocked(badge);
                setTimeout(() => setJustUnlocked(null), 4000);
            }
        });

        setAchievements(newAchievements);
    };

    const getLevel = (score) => {
        if (score < 50) return { label: 'Novice', color: 'text-slate-400', border: 'border-slate-400', bg: 'bg-slate-400/10', icon: Star, next: 50 };
        if (score < 150) return { label: 'Apprentice', color: 'text-indigo-400', border: 'border-indigo-400', bg: 'bg-indigo-400/10', icon: Zap, next: 150 };
        if (score < 300) return { label: 'Expert', color: 'text-purple-400', border: 'border-purple-400', bg: 'bg-purple-400/10', icon: Medal, next: 300 };
        return { label: 'Master', color: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400/10', icon: Crown, next: 1000 };
    };

    const currentLevel = getLevel(score);
    const progressPercent = actionItems.length > 0 ? (completedIndices.length / actionItems.length) * 100 : 0;
    const levelProgress = Math.min(100, (score / currentLevel.next) * 100);

    if (loading) return (
        <div className="flex items-center justify-center h-full text-white">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="w-full h-full bg-slate-950 text-white overflow-y-auto scrollbar-hide pb-24">
            <div className="max-w-6xl mx-auto p-6 space-y-8">

                {/* Header Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[30px] p-6 flex items-center justify-between shadow-lg shadow-indigo-500/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <p className="text-indigo-100 font-medium mb-1">Total Score</p>
                            <h2 className="text-4xl font-bold text-white">{score}</h2>
                            <div className="flex items-center gap-2 mt-2 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                                <currentLevel.icon className="w-3 h-3 text-white" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">{currentLevel.label}</span>
                            </div>
                        </div>
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner border border-white/10">
                            <Trophy className="w-10 h-10 text-yellow-300 drop-shadow-lg" />
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-white/10 rounded-[30px] p-6 flex flex-col justify-center items-center shadow-lg hover:border-orange-500/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-600'}`} />
                            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Streak</span>
                        </div>
                        <span className="text-3xl font-bold text-white">{streak} <span className="text-sm text-slate-500 font-normal">days</span></span>
                    </div>

                    <div className="bg-slate-900 border border-white/10 rounded-[30px] p-6 flex flex-col justify-center items-center shadow-lg hover:border-purple-500/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <Medal className="w-5 h-5 text-purple-400" />
                            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Badges</span>
                        </div>
                        <span className="text-3xl font-bold text-white">{achievements.length} <span className="text-sm text-slate-500 font-normal">/ 3</span></span>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* Left Column: Missions (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Progress Bar */}
                        <div className="bg-slate-900/50 border border-white/10 rounded-[20px] p-6 backdrop-blur-sm">
                            <div className="flex justify-between items-end mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Target className="w-5 h-5 text-indigo-400" /> Mission Progress
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">Complete tasks to boost your wellness score.</p>
                                </div>
                                <span className="text-2xl font-bold text-indigo-400">{Math.round(progressPercent)}%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                        </div>

                        {/* Mission List */}
                        <div className="space-y-4">
                            {actionItems.length === 0 ? (
                                <div className="bg-slate-900/50 border border-white/10 rounded-[30px] p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                                    <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 relative">
                                        <BrainCircuit className="w-12 h-12 text-slate-600" />
                                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">Your Action Plan is Empty</h3>
                                    <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
                                        It looks like you haven't completed an AI Analysis yet.
                                        Start a diagnosis to receive your personalized mental health action plan.
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
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => handleToggleTask(idx)}
                                            className={`group relative p-5 rounded-2xl border transition-all cursor-pointer overflow-hidden ${isCompleted
                                                ? 'bg-green-500/5 border-green-500/30'
                                                : 'bg-slate-900 border-white/10 hover:border-indigo-500/50 hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4 relative z-10">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all mt-0.5 flex-shrink-0 ${isCompleted
                                                    ? 'bg-green-500 border-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                                                    : 'border-slate-500 text-transparent group-hover:border-indigo-400'
                                                    }`}>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-base font-medium transition-all leading-relaxed ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'
                                                        }`}>
                                                        {item}
                                                    </p>
                                                </div>
                                                {isCompleted && (
                                                    <span className="text-xs font-bold text-green-400 bg-green-500/10 px-3 py-1 rounded-full whitespace-nowrap border border-green-500/20">
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

                    {/* Right Column: Sidebar (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Daily Motivation Card */}
                        <div className="bg-gradient-to-br from-orange-500/10 via-pink-500/5 to-purple-500/10 border border-orange-500/20 rounded-[30px] p-6 relative overflow-hidden">
                            <Quote className="absolute top-4 right-4 w-12 h-12 text-orange-500/10 rotate-12" />
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-orange-400" /> Daily Boost
                            </h3>
                            <p className="text-slate-300 italic font-medium leading-relaxed relative z-10">
                                "Small steps every day add up to big results. Keep moving forward!"
                            </p>
                        </div>

                        {/* Achievements List - Refined */}
                        <div className="bg-slate-900 border border-white/10 rounded-[30px] p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-400" /> Achievements
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { id: 'first_step', label: 'First Step', desc: 'Complete 1 task', icon: Star },
                                    { id: 'on_fire', label: 'On Fire', desc: 'Reach 3 day streak', icon: Flame },
                                    { id: 'master', label: 'Task Master', desc: 'Score 100 points', icon: Trophy },
                                ].map(badge => {
                                    const isUnlocked = achievements.includes(badge.id);
                                    return (
                                        <div key={badge.id} className={`relative overflow-hidden flex items-center gap-4 p-3 rounded-2xl border transition-all group ${isUnlocked
                                            ? 'bg-gradient-to-r from-indigo-900/40 to-slate-900 border-indigo-500/30'
                                            : 'bg-white/5 border-transparent opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
                                            }`}>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isUnlocked ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 'bg-slate-700 text-slate-400'
                                                }`}>
                                                <badge.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-bold text-sm truncate ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>{badge.label}</h4>
                                                <p className="text-[10px] text-slate-500 truncate">{badge.desc}</p>
                                            </div>
                                            {isUnlocked ? (
                                                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                                </div>
                                            ) : (
                                                <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Level Card - Refined */}
                        <div className="bg-slate-900 border border-white/10 rounded-[30px] p-6 relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 ${currentLevel.bg.replace('/10', '')}`}></div>

                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-white">Current Level</h3>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rank {Math.floor(score / 50) + 1}</span>
                            </div>

                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className={`w-24 h-24 rounded-full ${currentLevel.bg} flex items-center justify-center mb-4 border-4 ${currentLevel.border} shadow-[0_0_20px_rgba(0,0,0,0.3)] relative`}>
                                    <currentLevel.icon className={`w-10 h-10 ${currentLevel.color}`} />
                                    {/* Circular Progress (Visual Only) */}
                                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/10" />
                                        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2"
                                            className={currentLevel.color}
                                            strokeDasharray="289"
                                            strokeDashoffset={289 - (289 * levelProgress) / 100}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                                <h4 className={`text-2xl font-black ${currentLevel.color} mb-1 tracking-tight`}>{currentLevel.label}</h4>
                                <p className="text-xs text-slate-400 font-medium">
                                    {score} / {currentLevel.next} XP to next rank
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Mission Complete Modal */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/50 p-8 rounded-[40px] shadow-2xl text-center flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 mb-2">
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Mission Complete!</h2>
                                <p className="text-indigo-300 font-bold text-lg">+10 Points</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Achievement Unlocked Modal */}
            <AnimatePresence>
                {justUnlocked && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 50, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-0 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 border border-yellow-500/50 p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]"
                    >
                        <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/40">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Achievement Unlocked</p>
                            <h3 className="text-lg font-bold text-white">{justUnlocked.label}</h3>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default ActionPlan;
