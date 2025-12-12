import React, { useRef, useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

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

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 min-h-0 overflow-y-auto scrollbar-hide relative z-10"
        >
            <div className="p-4 space-y-4 flex flex-col justify-end min-h-full">
                {/* Loading Indicator for Pagination */}
                {isLoadingMore && (
                    <div className="w-full flex justify-center py-2">
                        <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                    </div>
                )}

                <div className="h-4 flex-none"></div>

                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.sender === 'system' ? (
                            <div className="w-full flex justify-center my-2">
                                <span className="text-[10px] bg-white/10 text-slate-300 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-yellow-400" />
                                    {typeof msg.text === 'string' ? msg.text.replace(/\\n/g, '\n') : msg.text}
                                </span>
                            </div>
                        ) : (
                            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-md whitespace-pre-wrap break-words ${msg.sender === 'user'
                                ? `${currentStyle.primary} text-white rounded-tr-sm text-left`
                                : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-white/5 text-left'
                                }`}>
                                {typeof msg.text === 'string' ? msg.text.replace(/\\n/g, '\n') : msg.text}
                                <div className="text-[10px] opacity-50 mt-1 text-right">{msg.time}</div>
                            </div>
                        )}
                    </motion.div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                            <span className="text-xs text-slate-400">Mengetik...</span>
                        </div>
                    </div>
                )}
                {/* Elemen target scroll */}
                <div ref={messagesEndRef} className="h-1" />
            </div>
        </div>
    );
};

export default MessageList;
