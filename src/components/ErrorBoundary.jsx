import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#0a0a12] p-6 font-sans transition-colors duration-300">
                    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-slate-200 dark:border-white/10 text-center">
                        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                            Oops, ada gangguan kecil
                        </h2>

                        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                            Maaf ya, sistem kami mengalami kendala teknis. Coba muat ulang halamannya ya.
                        </p>

                        <button
                            onClick={this.handleReload}
                            className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Muat Ulang Aplikasi
                        </button>

                        {/* Optional: Show error details in dev mode via console request, but hide from UI for clean look */}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
