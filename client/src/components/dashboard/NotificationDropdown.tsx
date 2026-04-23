import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button" 
        onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) fetchNotifications(); // Refetch instantly on open
        }}
        aria-label="Notifications" 
        className={`relative p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer hover:scale-110 active:scale-95 ${isOpen ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50'}`}
      >
        {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-cyan-400 animate-pulse ring-2 ring-[#0B1120]"></span>
        )}
        <Bell className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-800/80 bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-900/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
                <span className="bg-cyan-500/20 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} New
                </span>
            )}
          </div>
          
          <div className="max-h-[320px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 uppercase tracking-widest animate-pulse">
                    Loading...
                </div>
            ) : notifications.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-slate-500">
                    <Bell className="w-8 h-8 opacity-20 mb-3" />
                    <p className="text-xs">No notifications yet.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-800/60">
                    {notifications.map(notification => (
                        <div 
                            key={notification.id} 
                            className={`p-4 transition-colors hover:bg-white/5 cursor-pointer ${!notification.is_read ? 'bg-cyan-500/5' : ''}`}
                            onClick={() => {
                                if (!notification.is_read) {
                                    markAsRead(notification.id);
                                }
                                navigate('/'); // Send them to dashboard to see the latest matched exams
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 mt-0.5 ${!notification.is_read ? 'text-cyan-400' : 'text-emerald-500'}`}>
                                    <AlertCircle className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm tracking-tight leading-snug mb-1 ${!notification.is_read ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                                        {notification.title}
                                    </p>
                                    <p className="text-xs text-slate-400 leading-relaxed mb-2 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                                            {timeAgo(notification.created_at)}
                                        </span>
                                        {!notification.is_read && (
                                            <span className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                                                Mark Read
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
          <div className="p-3 border-t border-slate-800/60 bg-slate-900/80 text-center">
            <button 
                onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
                View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
