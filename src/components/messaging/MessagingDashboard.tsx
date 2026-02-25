'use client';

import React from 'react';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { socket, connectSocket, disconnectSocket } from '@/lib/socket';

export const MessagingDashboard: React.FC = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = React.useState<any[]>([]);
    const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);
    const [messages, setMessages] = React.useState<any[]>([]);
    const [isTyping, setIsTyping] = React.useState(false);
    const [typingUser, setTypingUser] = React.useState<string | undefined>();

    const activeConversation = conversations.find(c => c._id === activeConversationId);

    React.useEffect(() => {
        if (user?._id) {
            fetchConversations();
            connectSocket(user._id);

            socket.on('receive_message', (data) => {
                if (data.conversation === activeConversationId) {
                    setMessages(prev => {
                        if (prev.some(m => m._id === data._id)) return prev;
                        return [...prev, data];
                    });
                }
                // Refresh list to update last message/unread count
                fetchConversations();
            });

            socket.on('user_typing', (data) => {
                if (data.conversationId === activeConversationId) {
                    setIsTyping(true);
                    setTypingUser(data.userName);
                }
            });

            socket.on('user_stopped_typing', (data) => {
                if (data.conversationId === activeConversationId) {
                    setIsTyping(false);
                }
            });

            return () => {
                socket.off('receive_message');
                socket.off('user_typing');
                socket.off('user_stopped_typing');
                disconnectSocket();
            };
        }
    }, [user?._id, activeConversationId]);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/messages/conversations');
            setConversations(res.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (convId: string) => {
        try {
            const res = await api.get(`/messages/conversations/${convId}/messages`);
            setMessages(res.data);
            socket.emit('join_conversation', convId);
            // Mark as read
            await api.patch(`/messages/conversations/${convId}/read`);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSelectConversation = (convId: string) => {
        setActiveConversationId(convId);
        fetchMessages(convId);
    };

    const handleStartNewConversation = async (recipientId: string) => {
        try {
            const res = await api.post('/messages/conversations', { recipientId });
            const newConv = res.data;

            // Add to list if not present
            if (!conversations.find(c => c._id === newConv._id)) {
                setConversations(prev => [newConv, ...prev]);
            }

            setActiveConversationId(newConv._id);
            fetchMessages(newConv._id);
        } catch (error) {
            console.error('Error starting new conversation:', error);
        }
    };

    const handleSendMessage = async (content: string) => {
        if (!activeConversationId) return;
        try {
            const res = await api.post('/messages/messages', {
                conversationId: activeConversationId,
                content
            });

            // Emit socket event for real-time
            socket.emit('send_message', {
                conversationId: activeConversationId,
                sender: user,
                content,
                recipientId: activeConversation?.type === 'dm'
                    ? activeConversation.participants.find((p: any) => p._id !== user?._id)?._id
                    : undefined
            });

            // Optimistic update already handled by socket receive event if working locally
            // But we can also manually add it if needed
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-120px)] gap-4 p-4 lg:p-6 bg-[#0a0a0b]">
            <div className="w-full md:w-80 lg:w-96 h-full shrink-0">
                <ConversationList
                    conversations={conversations}
                    activeId={activeConversationId || ''}
                    onSelect={handleSelectConversation}
                    onCreateConversation={handleStartNewConversation}
                    currentUser={user}
                />
            </div>
            <div className="flex-1 h-full min-w-0">
                {activeConversation ? (
                    <ChatWindow
                        conversation={activeConversation}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        currentUser={user}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center h-full bg-[#f8f9fc] text-gray-500">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};
