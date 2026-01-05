import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, X, AlertCircle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info'),
        warning: (msg) => addToast(msg, 'warning'),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed top-6 left-6 right-6 md:left-auto md:right-6 md:top-auto md:bottom-6 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence mode='popLayout'>
                    {toasts.map((t) => (
                        <ToastItem key={t.id} {...t} onRemove={() => removeToast(t.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ id, message, type, onRemove }) => {
    const variants = {
        initial: { opacity: 0, y: 50, scale: 0.9 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
    };

    const config = {
        success: { icon: CheckCircle, bg: 'bg-white dark:bg-slate-800', border: 'border-green-500', text: 'text-slate-800 dark:text-white', iconColor: 'text-green-500' },
        error: { icon: XCircle, bg: 'bg-white dark:bg-slate-800', border: 'border-red-500', text: 'text-slate-800 dark:text-white', iconColor: 'text-red-500' },
        info: { icon: Info, bg: 'bg-white dark:bg-slate-800', border: 'border-blue-500', text: 'text-slate-800 dark:text-white', iconColor: 'text-blue-500' },
        warning: { icon: AlertCircle, bg: 'bg-white dark:bg-slate-800', border: 'border-yellow-500', text: 'text-slate-800 dark:text-white', iconColor: 'text-yellow-500' },
    };

    const style = config[type] || config.info;
    const Icon = style.icon;

    return (
        <motion.div
            layout
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`pointer-events-auto min-w-[300px] flex items-center gap-3 p-4 rounded-2xl shadow-lg border-l-4 ${style.bg} ${style.border} ${style.text} relative overflow-hidden`}
        >
            <div className={`absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none ${style.iconColor} bg-current`}></div>
            <Icon className={`w-6 h-6 ${style.iconColor} flex-shrink-0`} />
            <p className="text-sm font-semibold flex-1">{message}</p>
            <button onClick={onRemove} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 opacity-50" />
            </button>
        </motion.div>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
