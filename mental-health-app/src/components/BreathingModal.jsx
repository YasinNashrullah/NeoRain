import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind } from 'lucide-react';

const BreathingModal = ({ isOpen, onClose }) => {
    const [phase, setPhase] = useState('inhale'); // inhale, hold, exhale
    const [text, setText] = useState('Tarik Napas');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isOpen) return;

        let timer;
        const cycle = async () => {
            // Inhale (4s)
            setPhase('inhale');
            setText('Tarik Napas...');
            await new Promise(r => setTimeout(r, 4000));

            // Hold (4s)
            setPhase('hold');
            setText('Tahan...');
            await new Promise(r => setTimeout(r, 4000));

            // Exhale (4s)
            setPhase('exhale');
            setText('Hembuskan...');
            await new Promise(r => setTimeout(r, 4000));

            // Loop
            if (isOpen) cycle();
        };

        cycle();

        return () => clearTimeout(timer);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="flex flex-col items-center justify-center w-full max-w-md">

                        {/* Main Circle Animation */}
                        <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                            {/* Outer Glow */}
                            <motion.div
                                animate={{
                                    scale: phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.5 : 1,
                                    opacity: phase === 'inhale' ? 0.5 : phase === 'hold' ? 0.5 : 0.2,
                                }}
                                transition={{ duration: 4, ease: "easeInOut" }}
                                className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl"
                            />

                            {/* Middle Ring */}
                            <motion.div
                                animate={{
                                    scale: phase === 'inhale' ? 1.2 : phase === 'hold' ? 1.2 : 0.8,
                                    borderWidth: phase === 'inhale' ? "2px" : "8px",
                                }}
                                transition={{ duration: 4, ease: "easeInOut" }}
                                className="absolute inset-0 border-4 border-indigo-300/30 rounded-full"
                            />

                            {/* Core Circle */}
                            <motion.div
                                animate={{
                                    scale: phase === 'inhale' ? 1 : phase === 'hold' ? 1 : 0.6,
                                }}
                                transition={{ duration: 4, ease: "easeInOut" }}
                                className="w-48 h-48 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)] relative z-10"
                            >
                                <Wind className="w-16 h-16 text-white opacity-80" />
                            </motion.div>
                        </div>

                        {/* Instruction Text */}
                        <motion.div
                            key={text}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">{text}</h2>
                            <p className="text-indigo-200 text-lg">Fokus pada napasmu</p>
                        </motion.div>

                        {/* Phase Indicator */}
                        <div className="flex gap-2 mt-8">
                            {['inhale', 'hold', 'exhale'].map((p) => (
                                <div
                                    key={p}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${phase === p ? 'w-8 bg-white' : 'w-2 bg-white/20'
                                        }`}
                                />
                            ))}
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BreathingModal;
