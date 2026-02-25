'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import io from 'socket.io-client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

dayjs.extend(relativeTime);

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface Notification {
    _id: string;
    title: string;
    message: string;
    isRead: boolean;
    type: string;
    createdAt: string;
    relatedId?: string;
}

export const NotificationBell = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        // Fetch initial notifications
        const fetchNotifications = async () => {
            try {
                const data = await notificationService.getNotifications(1, 10);
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            } catch (error) {
                console.error('Failed to fetch notifications', error);
            }
        };

        fetchNotifications();

        // Connect to socket for real-time updates
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            socket.emit('register', user._id);
        });

        socket.on('new_notification', (newNotification: Notification) => {
            setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // Keep top 10
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const handleMarkAsRead = async (id: string, isRead: boolean) => {
        if (isRead) return;
        try {
            await notificationService.markAsRead(id);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="relative p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer outline-none">
                <Bell className="h-5 w-5 text-gray-700" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto p-0">
                <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center z-10">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleMarkAllRead();
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="flex flex-col">
                    {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification._id}
                                className={`px-4 py-3 border-b outline-none cursor-pointer flex flex-col items-start gap-1 transition-colors ${!notification.isRead ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'}`}
                                onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
                            >
                                <div className="flex justify-between items-start w-full">
                                    <h4 className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                        {notification.title}
                                    </h4>
                                    {!notification.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>}
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2 w-full pr-4">{notification.message}</p>
                                <span className="text-[10px] text-gray-400 font-medium mt-1">
                                    {dayjs(notification.createdAt).fromNow()}
                                </span>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
