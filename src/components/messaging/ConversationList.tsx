'use client';

import React, { useState } from 'react';
import { Search, User, Users, Megaphone, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, getMediaUrl } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface ConversationListProps {
    conversations: any[];
    activeId: string;
    onSelect: (id: string) => void;
    currentUser: any;
    onCreateConversation: (participantId: string) => void;
}

export function ConversationList({ conversations, activeId, onSelect, currentUser, onCreateConversation }: ConversationListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [createType, setCreateType] = useState<'individual' | 'group' | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const filteredConversations = conversations.filter(conv => {
        const name = conv.isGroup
            ? (conv.name || conv.course?.title)
            : conv.participants.find((p: any) => p._id !== currentUser?._id)?.name;
        return name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleCreateConversation = async (participantId: string) => {
        onCreateConversation(participantId);
        setDialogOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-white border-r">
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 text-blue-600">
                                <Plus size={24} />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>New Conversation</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Suggested</p>
                                    <div className="space-y-1">
                                        {/* This would be populated from a searchable user list in a real app */}
                                        <p className="text-xs text-muted-foreground italic">Search for users to start a conversation...</p>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search messages..."
                        className="pl-9 bg-gray-50 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer rounded-lg px-3 py-1 border-none font-medium">
                        All
                    </Badge>
                    <Badge variant="outline" className="text-gray-500 hover:bg-gray-50 cursor-pointer rounded-lg px-3 py-1 font-medium">
                        Unread
                    </Badge>
                    <Badge variant="outline" className="text-gray-500 hover:bg-gray-50 cursor-pointer rounded-lg px-3 py-1 font-medium">
                        Groups
                    </Badge>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {filteredConversations.map((conv) => {
                        const isGroup = conv.isGroup;
                        const otherParticipant = !isGroup && conv.participants.find((p: any) => p._id !== currentUser?._id);

                        const displayName = isGroup
                            ? (conv.name || conv.course?.title)
                            : otherParticipant?.name;

                        const displayAvatar = isGroup
                            ? conv.course?.thumbnail
                            : otherParticipant?.avatar;

                        const lastMsg = conv.lastMessage;
                        const unreadCount = conv.unreadCount || 0;
                        const isActive = activeId === conv._id;

                        return (
                            <button
                                key={conv._id}
                                onClick={() => onSelect(conv._id)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group text-left",
                                    isActive
                                        ? "bg-blue-50"
                                        : "hover:bg-gray-50"
                                )}
                            >
                                <div className="relative">
                                    <Avatar className={cn(
                                        "h-12 w-12 border-2",
                                        isActive ? "border-white shadow-sm" : "border-transparent"
                                    )}>
                                        <AvatarImage src={getMediaUrl(displayAvatar)} />
                                        <AvatarFallback className={cn(
                                            isGroup ? "bg-indigo-100 text-indigo-700" : "bg-blue-100 text-blue-700"
                                        )}>
                                            {isGroup ? <Users size={20} /> : (displayName?.[0] || 'U')}
                                        </AvatarFallback>
                                    </Avatar>
                                    {!isGroup && otherParticipant?.isOnline && (
                                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h4 className={cn(
                                            "font-semibold truncate",
                                            unreadCount > 0 ? "text-gray-900" : "text-gray-700"
                                        )}>
                                            {displayName}
                                        </h4>
                                        {lastMsg && (
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: false })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className={cn(
                                            "text-xs truncate max-w-[160px]",
                                            unreadCount > 0 ? "text-blue-600 font-medium" : "text-gray-500"
                                        )}>
                                            {lastMsg ? (
                                                <>
                                                    {lastMsg.sender === currentUser?._id && 'You: '}
                                                    {lastMsg.content}
                                                </>
                                            ) : 'No messages yet'}
                                        </p>
                                        {unreadCount > 0 && (
                                            <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold rounded-full ml-2">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
