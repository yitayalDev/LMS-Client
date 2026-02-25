'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    Image as ImageIcon,
    Paperclip,
    Smile,
    MoreVertical,
    Phone,
    Video,
    ArrowLeft,
    Download,
    X,
    Maximize2,
    Minimize2,
    Volume2,
    VolumeX,
    Mic,
    MicOff,
    PhoneOff,
    User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getMediaUrl } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatWindowProps {
    conversation: any;
    messages: any[];
    onSendMessage: (content: string, type?: string) => void;
    onBack?: () => void;
    currentUser: any;
}

export function ChatWindow({ conversation, messages, onSendMessage, onBack, currentUser }: ChatWindowProps) {
    const [newMessage, setNewMessage] = useState('');
    const [isCalling, setIsCalling] = useState(false);
    const [callType, setCallType] = useState<'voice' | 'video' | null>(null);
    const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Call duration timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (callStatus === 'connected') {
            timer = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [callStatus]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    const startCall = (type: 'voice' | 'video') => {
        setCallType(type);
        setIsCalling(true);
        setCallStatus('ringing');
        setCallDuration(0);

        // Simulate connection
        setTimeout(() => {
            setCallStatus('connected');
        }, 3000);
    };

    const endCall = () => {
        setCallStatus('ended');
        setTimeout(() => {
            setIsCalling(false);
            setCallType(null);
            setCallStatus('ringing');
        }, 2000);
    };

    if (!conversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-muted-foreground">
                Select a conversation to start chatting
            </div>
        );
    }

    const displayAvatar = conversation.isGroup
        ? conversation.course?.thumbnail
        : conversation.participants?.find((p: any) => p._id !== currentUser?._id)?.avatar;

    const displayName = conversation.isGroup
        ? (conversation.name || conversation.course?.title)
        : conversation.participants?.find((p: any) => p._id !== currentUser?._id)?.name;

    return (
        <div className="flex flex-col h-full relative overflow-hidden">
            {/* Call Overlay */}
            {isCalling && (
                <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
                    <div className="absolute top-8 left-8 flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-medium tracking-wider uppercase">
                            {callStatus === 'ringing' ? 'Ringing...' : 'On Call'}
                        </span>
                    </div>

                    <div className="relative">
                        <Avatar className={cn(
                            "h-40 w-40 border-4 relative z-10 shadow-2xl transition-all duration-500",
                            callStatus === 'ended' ? "border-red-500/50 scale-95 grayscale" : "border-white/10"
                        )}>
                            <AvatarImage src={getMediaUrl(displayAvatar)} />
                            <AvatarFallback className="text-4xl bg-blue-600">{displayName?.[0]}</AvatarFallback>
                        </Avatar>
                        {callStatus === 'connected' && callType === 'video' && (
                            <div className="absolute -bottom-4 -right-4 h-32 w-24 bg-gray-800 rounded-lg border-2 border-white/20 overflow-hidden shadow-xl z-20">
                                <div className="h-full w-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                                    <User className="h-8 w-8 text-white/20" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-center space-y-2">
                        <h2 className="text-3xl font-bold">{displayName}</h2>
                        {callStatus === 'connected' && (
                            <p className="text-xl font-mono text-white/60">{formatDuration(callDuration)}</p>
                        )}
                    </div>

                    <div className="mt-16 flex items-center gap-6">
                        <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                                "h-14 w-14 rounded-full border-white/10 text-white hover:bg-white/10",
                                isMuted && "bg-red-500 border-red-500 hover:bg-red-600"
                            )}
                            onClick={() => setIsMuted(!isMuted)}
                        >
                            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </Button>

                        {callType === 'video' && (
                            <Button
                                variant="outline"
                                size="icon"
                                className={cn(
                                    "h-14 w-14 rounded-full border-white/10 text-white hover:bg-white/10",
                                    isVideoOff && "bg-red-500 border-red-500 hover:bg-red-600"
                                )}
                                onClick={() => setIsVideoOff(!isVideoOff)}
                            >
                                {isVideoOff ? <Video size={24} className="text-red-500" /> : <Video size={24} />}
                            </Button>
                        )}

                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-16 w-16 rounded-full shadow-lg shadow-red-500/20"
                            onClick={endCall}
                        >
                            <PhoneOff size={32} />
                        </Button>
                    </div>
                </div>
            )}

            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
                            <ArrowLeft size={20} />
                        </Button>
                    )}
                    <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={getMediaUrl(displayAvatar)} />
                        <AvatarFallback className="bg-blue-600">{displayName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-gray-900 leading-tight">{displayName}</h3>
                        <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Online
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startCall('voice')} className="text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                        <Phone size={20} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => startCall('video')} className="text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                        <Video size={20} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500">
                        <MoreVertical size={20} />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-[#f8f9fc]">
                <div className="space-y-6 max-w-4xl mx-auto">
                    {messages.map((msg, idx) => {
                        const isMe = msg.sender._id === currentUser?._id;
                        const showAvatar = idx === 0 || messages[idx - 1].sender._id !== msg.sender._id;

                        return (
                            <div key={msg._id || idx} className={cn(
                                "flex items-end gap-2 mb-4",
                                isMe ? "flex-row-reverse" : "flex-row"
                            )}>
                                {!isMe && showAvatar && (
                                    <Avatar className="h-8 w-8 shrink-0 border border-white/5">
                                        <AvatarImage src={getMediaUrl(msg.sender.avatar)} />
                                        <AvatarFallback className="text-[10px] bg-gray-700">
                                            {msg.sender.name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                                {!isMe && !showAvatar && <div className="w-8" />}

                                <div className={cn(
                                    "flex flex-col max-w-[70%]",
                                    isMe ? "items-end" : "items-start"
                                )}>
                                    {showAvatar && (
                                        <span className="text-[10px] font-medium text-gray-400 mb-1 px-1">
                                            {isMe ? 'You' : msg.sender.name} • {format(new Date(msg.createdAt), 'HH:mm')}
                                        </span>
                                    )}
                                    <div className={cn(
                                        "px-4 py-2.5 rounded-2xl shadow-sm relative group",
                                        isMe
                                            ? "bg-blue-600 text-white rounded-br-none"
                                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                                    )}>
                                        <p className="text-sm leading-relaxed">{msg.content}</p>

                                        {/* Simple transition message styling */}
                                        <div className={cn(
                                            "absolute bottom-0 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] text-gray-400",
                                            isMe ? "right-full mr-2" : "left-full ml-2"
                                        )}>
                                            {format(new Date(msg.createdAt), 'HH:mm')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto">
                    <div className="flex items-end gap-2 bg-gray-50 rounded-2xl p-2 border border-gray-100 focus-within:border-blue-200 focus-within:bg-white transition-all">
                        <div className="flex items-center">
                            <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-blue-600">
                                <Paperclip size={20} />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-blue-600">
                                <ImageIcon size={20} />
                            </Button>
                        </div>

                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] text-gray-900 placeholder:text-gray-400"
                        />

                        <div className="flex items-center">
                            <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-blue-600">
                                <Smile size={20} />
                            </Button>
                            <Button
                                type="submit"
                                size="icon"
                                className={cn(
                                    "h-10 w-10 rounded-xl transition-all",
                                    newMessage.trim() ? "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                )}
                                disabled={!newMessage.trim()}
                            >
                                <Send size={18} />
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
