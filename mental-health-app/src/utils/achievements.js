import {
    Star, Flame, Trophy, Rocket, Smile, HeartHandshake, Camera, Zap, Medal, Crown,
    Calendar, Target, Sun, Moon, BookOpen, Share2, Award, TrendingUp, Shield
} from 'lucide-react';

export const ACHIEVEMENTS_LIST = [
    // --- ONBOARDING & PROFILE ---
    {
        id: 'langkah_awal',
        label: 'Langkah Awal',
        desc: 'Bergabung dengan NeoRain',
        icon: Rocket,
        condition: () => true
    },
    {
        id: 'supporter',
        label: 'Supporter',
        desc: 'Melengkapi profil data diri',
        icon: HeartHandshake,
        condition: (data) => data.hasLocation && data.hasGender
    },
    {
        id: 'verified',
        label: 'Verified',
        desc: 'Memiliki foto profil custom',
        icon: Camera,
        condition: (data) => data.hasCustomPhoto
    },

    // --- STREAKS (CONSISTENCY) ---
    {
        id: 'on_fire',
        label: 'On Fire',
        desc: 'Login 3 hari berturut-turut',
        icon: Flame,
        condition: (data) => (data.streak || 0) >= 3
    },
    {
        id: 'pejuang_minggu',
        label: 'Pejuang Minggu',
        desc: 'Login 7 hari berturut-turut',
        icon: Calendar,
        condition: (data) => (data.streak || 0) >= 7
    },
    {
        id: 'konsisten_sejati',
        label: 'Konsisten Sejati',
        desc: 'Login 30 hari berturut-turut',
        icon: Crown,
        condition: (data) => (data.streak || 0) >= 30
    },

    // --- TASKS & ACTION PLAN ---
    {
        id: 'first_step',
        label: 'First Action',
        desc: 'Selesaikan 1 tugas pertamamu',
        icon: Star,
        condition: (data) => (data.completedCount || 0) >= 1
    },
    {
        id: 'task_hunter',
        label: 'Task Hunter',
        desc: 'Selesaikan 10 tugas',
        icon: Target,
        condition: (data) => (data.completedCount || 0) >= 10
    },
    {
        id: 'productivity_king',
        label: 'Productivity King',
        desc: 'Selesaikan 50 tugas',
        icon: Zap,
        condition: (data) => (data.completedCount || 0) >= 50
    },

    // --- SCORING (XP) ---
    {
        id: 'novice_earner',
        label: 'Novice Earner',
        desc: 'Kumpulkan 100 poin',
        icon: Trophy,
        condition: (data) => (data.score || 0) >= 100
    },
    {
        id: 'pro_earner',
        label: 'Pro Earner',
        desc: 'Kumpulkan 500 poin',
        icon: Medal,
        condition: (data) => (data.score || 0) >= 500
    },
    {
        id: 'elite_earner',
        label: 'Elite Earner',
        desc: 'Kumpulkan 1000 poin',
        icon: Award,
        condition: (data) => (data.score || 0) >= 1000
    },

    // --- MOOD TRACKING ---
    {
        id: 'mood_starter',
        label: 'Mood Starter',
        desc: 'Mencatat mood pertama kali',
        icon: Smile,
        condition: (data) => (data.moodCount || 0) >= 1
    },
    {
        id: 'mood_master',
        label: 'Mood Master',
        desc: 'Mencatat mood 20 kali',
        icon: BookOpen,
        condition: (data) => (data.moodCount || 0) >= 20
    },
    {
        id: 'self_aware',
        label: 'Self Aware',
        desc: 'Mencatat mood 50 kali',
        icon: BrainCircuit, // Assuming BrainCircuit is imported or available, else use another
        condition: (data) => (data.moodCount || 0) >= 50
    },

    // --- WELLNESS ---
    {
        id: 'early_bird',
        label: 'Early Bird',
        desc: 'Login di pagi hari (05:00 - 09:00)',
        icon: Sun,
        condition: (data) => {
            const hour = new Date().getHours();
            return hour >= 5 && hour < 9;
        }
    },
    {
        id: 'night_owl',
        label: 'Night Owl',
        desc: 'Login di malam hari (20:00 - 23:59)',
        icon: Moon,
        condition: (data) => {
            const hour = new Date().getHours();
            return hour >= 20;
        }
    }
];

// Helper to get BrainCircuit if not imported above (it was in ActionPlan imports, let's add it to imports)
import { BrainCircuit } from 'lucide-react';

export const getLevel = (score) => {
    if (score < 100) return { label: 'Novice', color: 'text-slate-400', border: 'border-slate-400', bg: 'bg-slate-400/10', icon: Star, next: 100 };
    if (score < 500) return { label: 'Apprentice', color: 'text-indigo-400', border: 'border-indigo-400', bg: 'bg-indigo-400/10', icon: Zap, next: 500 };
    if (score < 1000) return { label: 'Expert', color: 'text-purple-400', border: 'border-purple-400', bg: 'bg-purple-400/10', icon: Medal, next: 1000 };
    return { label: 'Master', color: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400/10', icon: Crown, next: 2000 };
};
