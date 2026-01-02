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
                // load gamification data
                const savedGamification = (await api.getGamification(userData.uid)) || {
                    score: 0,
                    streak: 0,
                    completedIndices: [],
                    history: []
                };

                // load latest assessment
                const assessment = await api.getLatestAssessment(userData.uid);
                setAssessmentId(assessment?.id);

                // load current stored plan
                let currentPlan = await api.getDailyPlan(userData.uid);
                let actions = [];

                // LOGIC: Sync with Assessment
                // If we have a new assessment that is different from what we based our current plan on
                if (assessment && assessment.ai_analysis?.actions) {

                    // Check if we need to update (Different source assessment ID)
                    if (currentPlan?.source_assessment_id !== assessment.id) {
                        // NEW PLAN FROM ASSESSMENT
                        actions = assessment.ai_analysis.actions;

                        // Filter out "Professional Help" generic advice if possible, to keep it actionable
                        actions = actions.filter(a =>
                            !a.toLowerCase().includes("konsultasi") &&
                            !a.toLowerCase().includes("profesional")
                        );

                        // Fallback if filter removes everything
                        if (actions.length === 0) actions = assessment.ai_analysis.actions;

                        // Save this new plan
                        await api.saveDailyPlan(userData.uid, {
                            source_assessment_id: assessment.id,
                            updated_at: new Date().toISOString(),
                            actions: actions
                        });

                        // Reset progress for new plan
                        savedGamification.completedIndices = [];
                        await api.saveGamification(userData.uid, savedGamification);
                    } else {
                        // EXISTING PLAN (Match)
                        actions = currentPlan.actions || [];
                    }
                } else {
                    // No assessment available yet, or no actions in it
                    actions = [];
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
        if (score < 50) return { label: 'Novice', color: 'text-slate-400', border: 'border-slate-400', bg: 'bg-slate-400/10', icon: Star, next: 50 };
        if (score < 150) return { label: 'Apprentice', color: 'text-indigo-400', border: 'border-indigo-400', bg: 'bg-indigo-400/10', icon: Zap, next: 150 };
        if (score < 300) return { label: 'Expert', color: 'text-purple-400', border: 'border-purple-400', bg: 'bg-purple-400/10', icon: Medal, next: 300 };
        return { label: 'Master', color: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400/10', icon: Crown, next: 1000 };
    };

    const currentLevel = getLevel(score);
    const progressPercent = actionItems.length > 0 ? (completedIndices.length / actionItems.length) * 100 : 0;
    const levelProgress = Math.min(100, (score / currentLevel.next) * 100);

    if (loading) return (
        <div className="flex items-center justify-center h-full text-zinc-900 dark:text-white">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="w-full h-full bg-transparent dark:bg-slate-950 text-slate-800 dark:text-white overflow-y-auto scrollbar-hide pb-24 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-indigo-500/10 dark:bg-indigo-900/20 blur-[100px] pointer-events-none"></div>

            <div className="w-full h-full p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 relative z-10">

                {/* header stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[30px] p-6 flex items-center justify-between shadow-lg shadow-indigo-500/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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

                    <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-6 flex flex-col justify-center items-center shadow-sm dark:shadow-xl hover:border-orange-500/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-600 dark:text-slate-500'}`} />
                            <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Streak</span>
                        </div>
                        <span className="text-3xl font-bold text-slate-800 dark:text-white">{streak} <span className="text-sm text-slate-500 font-normal">days</span></span>
                    </div>

                    <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-6 flex flex-col justify-center items-center shadow-sm dark:shadow-xl hover:border-purple-500/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <Medal className="w-5 h-5 text-purple-400" />
                            <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Badges</span>
                        </div>
                        <span className="text-3xl font-bold text-slate-800 dark:text-white">{achievements.length} <span className="text-sm text-slate-500 font-normal">/ {ACHIEVEMENTS_LIST.length}</span></span>
                    </div>
                </div>

                {/* main content grid */}
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* left column missions */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* progress bar */}
                        <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900/50 dark:to-slate-900/50 border border-white/60 dark:border-white/10 rounded-[20px] p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                            <div className="flex justify-between items-end mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <Target className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Mission Progress
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Complete tasks to boost your wellness score.</p>
                                </div>
                                <span className="text-2xl font-bold text-indigo-500 dark:text-indigo-400">{Math.round(progressPercent)}%</span>
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

                        {/* mission list */}
                        <div className="space-y-4">
                            {actionItems.length === 0 ? (
                                <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900/50 dark:to-slate-900/50 border border-white/60 dark:border-white/10 rounded-[30px] p-12 text-center flex flex-col items-center justify-center min-h-[400px] shadow-sm">
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
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => handleToggleTask(idx)}
                                            className={`group relative p-5 rounded-2xl border transition-all cursor-pointer overflow-hidden shadow-sm ${isCompleted
                                                ? 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/30'
                                                : 'bg-white/60 dark:bg-slate-900 border-white/60 dark:border-white/10 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4 relative z-10">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all mt-0.5 flex-shrink-0 ${isCompleted
                                                    ? 'bg-green-500 border-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                                                    : 'border-slate-300 dark:border-slate-500 text-transparent group-hover:border-indigo-400'
                                                    }`}>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-base font-medium transition-all leading-relaxed ${isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200'
                                                        }`}>
                                                        {item}
                                                    </p>
                                                </div>
                                                {isCompleted && (
                                                    <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/10 px-3 py-1 rounded-full whitespace-nowrap border border-green-200 dark:border-green-500/20">
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

                    {/* right column sidebar */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* daily motivation card */}
                        <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-orange-500/10 dark:to-purple-500/10 border border-orange-200 dark:border-orange-500/20 rounded-[30px] p-6 relative overflow-hidden shadow-sm">
                            <Quote className="absolute top-4 right-4 w-12 h-12 text-orange-500/10 rotate-12" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-orange-400" /> Daily Boost
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed relative z-10">
                                "Small steps every day add up to big results. Keep moving forward!"
                            </p>
                        </div>

                        {/* achievements list */}
                        <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-6 shadow-sm dark:shadow-xl">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500 dark:text-yellow-400" /> Achievements
                            </h3>
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
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

                        {/* level card */}
                        <div className="bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-900 dark:to-slate-900 border border-white/60 dark:border-white/10 rounded-[30px] p-6 relative overflow-hidden shadow-sm dark:shadow-xl">
                            <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 ${currentLevel.bg.replace('/10', '')}`}></div>

                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Current Level</h3>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rank {Math.floor(score / 50) + 1}</span>
                            </div>

                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className={`w-24 h-24 rounded-full ${currentLevel.bg} flex items-center justify-center mb-4 border-4 ${currentLevel.border} shadow-[0_0_20px_rgba(0,0,0,0.1)] relative`}>
                                    <currentLevel.icon className={`w-10 h-10 ${currentLevel.color}`} />
                                    {/* Circular Progress (Visual Only) */}
                                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-200 dark:text-white/10" />
                                        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2"
                                            className={currentLevel.color}
                                            strokeDasharray="289"
                                            strokeDashoffset={289 - (289 * levelProgress) / 100}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                                <h4 className={`text-2xl font-black ${currentLevel.color} mb-1 tracking-tight`}>{currentLevel.label}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    {score} / {currentLevel.next} XP to next rank
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

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
