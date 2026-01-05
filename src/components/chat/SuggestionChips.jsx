import React from 'react';

const SuggestionChips = ({ suggestions, loadingSuggestions, setInput }) => {
    return (
        <div className="flex-none w-full px-4 pb-2 z-20">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {loadingSuggestions && suggestions.length === 0 ? (
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-8 w-24 bg-slate-200 dark:bg-white/5 rounded-full animate-pulse" />)}
                    </div>
                ) : (
                    suggestions.map((text, idx) => (
                        <button
                            key={idx}
                            onClick={() => setInput(text)}
                            className="flex-none bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full px-4 py-2 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap hover:bg-indigo-600 hover:text-white hover:border-indigo-500 dark:hover:bg-indigo-600 dark:hover:text-white dark:hover:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                        >
                            {text}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default SuggestionChips;
