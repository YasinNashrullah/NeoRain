import React, { useRef, useLayoutEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MessageList = ({ messages, currentStyle, isTyping, messagesEndRef, onLoadMore, hasMore, isLoadingMore }) => {
    const containerRef = useRef(null);
    const [prevScrollHeight, setPrevScrollHeight] = useState(0);

    const handleScroll = () => {
        if (containerRef.current.scrollTop === 0 && hasMore && !isLoadingMore) {
            setPrevScrollHeight(containerRef.current.scrollHeight);
            onLoadMore();
        }
    };

    useLayoutEffect(() => {
        if (prevScrollHeight > 0 && containerRef.current) {
            const newScrollHeight = containerRef.current.scrollHeight;
            const diff = newScrollHeight - prevScrollHeight;
            containerRef.current.scrollTop = diff;
            setPrevScrollHeight(0);
        }
    }, [messages, prevScrollHeight]);

    // Create a reversed copy for display (Newest at Bottom)
    // We use flex-col-reverse so the scroll stays anchored to the bottom more naturally
    const reversedMessages = [...messages].reverse();

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 min-h-0 overflow-y-auto scrollbar-hide relative z-10"
        >
            <div className="p-4 flex flex-col-reverse min-h-full gap-4">
                {/* Bottom Spacer */}
                <div ref={messagesEndRef} className="h-1 flex-none" />

                {/* Typing Indicator (Always at bottom if active) */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center shadow-sm">
                            <Loader2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400 animate-spin" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">Mengetik...</span>
                        </div>
                    </motion.div>
                )}

                {/* Messages */}
                {reversedMessages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.sender === 'system' ? (
                            <div className="w-full flex justify-center my-2">
                                <span className="text-[10px] bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 px-3 py-1 rounded-full backdrop-blur-sm border border-slate-200 dark:border-white/5 flex items-center gap-2 font-medium">
                                    <Sparkles className="w-3 h-3 text-yellow-500 dark:text-yellow-400" />
                                    {typeof msg.text === 'string' ? msg.text.replace(/\\n/g, '\n') : msg.text}
                                </span>
                            </div>
                        ) : (
                            <motion.div
                                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap break-words transition-colors duration-[1500ms] ${msg.sender === 'user'
                                    ? `text-white rounded-tr-sm text-left`
                                    : 'bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm text-slate-800 dark:text-slate-200 rounded-tl-sm border border-white/50 dark:border-white/5 shadow-sm text-left'
                                    }`}
                                animate={{
                                    background: msg.sender === 'user'
                                        ? currentStyle.primaryGradient
                                        : undefined
                                }}
                                transition={{ duration: 1.5 }}
                            >
                                {typeof msg.text === 'string' ? msg.text.replace(/\\n/g, '\n') : msg.text}
                                <div className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                                    {msg.time}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}

                {/* Top Spacer */}
                <div className="h-4 flex-none"></div>

                {/* Loading Indicator for Pagination (At the very top) */}
                {isLoadingMore && (
                    <div className="w-full flex justify-center py-2">
                        <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(MessageList);
