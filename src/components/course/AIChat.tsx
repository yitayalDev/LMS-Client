'use client';

import React, { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, X, User, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

// API_URL moved to @/lib/api

interface Message {
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

export default function AIChat({ courseId, context }: { courseId: string; context?: string }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
        setLoading(true);

        try {
            const { data } = await api.post(`/ai/ask`, {
                courseId,
                question: userMsg,
                context
            });

            setMessages(prev => [...prev, { role: 'ai', content: data.answer, timestamp: new Date() }]);
        } catch (error: any) {
            console.error('AI Error', error);
            const errorMessage = error.response?.data?.message || "I'm experiencing a temporary neural lapse. Please try again in a moment.";
            setMessages(prev => [...prev, {
                role: 'ai',
                content: errorMessage,
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 bg-blue-600 hover:bg-blue-500 hover:scale-110 transition-all duration-300 border-4 border-[#0f1012]"
            >
                <div className="relative">
                    <MessageSquare className="h-7 w-7 text-white" />
                    <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
                </div>
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-6 right-6 w-[360px] h-[520px] shadow-2xl z-50 flex flex-col overflow-hidden border-white/10 bg-[#0f1012]/95 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold leading-none">Smart Assistant</CardTitle>
                        <p className="text-[10px] text-blue-100 mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            AI Online
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                    <X className="h-5 w-5" />
                </Button>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center py-10 px-6">
                                <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                                    <Sparkles className="h-7 w-7 text-blue-400" />
                                </div>
                                <h4 className="text-white font-semibold mb-2">How can I help you?</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    I'm your course-aware AI. You can ask me about concepts, summaries, or clarification on your lessons.
                                </p>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} className={cn("flex w-full mb-4", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                <div className={cn(
                                    "max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed relative group animate-in slide-in-from-bottom-2",
                                    msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/20'
                                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                                )}>
                                    {msg.content}
                                    <div className={cn(
                                        "text-[9px] mt-1.5 opacity-40",
                                        msg.role === 'user' ? 'text-right' : 'text-left'
                                    )}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start mb-4">
                                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-medium">Assistant thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-white/5 flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:ring-blue-500 h-10 rounded-xl pr-10 text-xs"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                            <Sparkles className="h-3.5 w-3.5 text-blue-500/40" />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || loading}
                        className="h-10 w-10 shrink-0 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/40"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

