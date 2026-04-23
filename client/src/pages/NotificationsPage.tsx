import React, { useState, useEffect } from 'react';
import { Bell, Clock, AlertCircle, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Category = 'all' | 'alert' | 'deadline' | 'system';

interface Notification {
  id: number;
  title: string;
  message: string;
  category: 'alert' | 'deadline' | 'system';
  is_read: boolean;
  created_at: string;
  post_id?: number;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Category>('all');
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
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
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    for (const id of unreadIds) {
      await markAsRead(id);
    }
  };

  const filteredNotifications = notifications.filter(n => 
    activeTab === 'all' ? true : n.category === activeTab
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'alert': return <AlertCircle className="h-5 w-5 text-amber-400" />;
      case 'deadline': return <Clock className="h-5 w-5 text-rose-400" />;
      default: return <Info className="h-5 w-5 text-cyan-400" />;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
            <Bell className="h-8 w-8 text-cyan-400" /> Notifications
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Stay updated on new exam matches, approaching deadlines, and system alerts.
          </p>
        </div>
        
        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={markAllAsRead}
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" /> Mark all as read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-white/10 pb-4">
        {(['all', 'alert', 'deadline', 'system'] as Category[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 capitalize cursor-pointer ${
              activeTab === tab 
                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-slate-900/50 p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-slate-600 mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-slate-300">All caught up!</h3>
            <p className="mt-1 text-sm text-slate-500">You have no {activeTab !== 'all' ? activeTab : ''} notifications at the moment.</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id}
              className={`group relative flex gap-4 rounded-2xl border p-5 transition-all duration-300 ${
                notification.is_read 
                  ? 'border-white/5 bg-slate-900/40 opacity-80' 
                  : 'border-cyan-500/20 bg-slate-800/80 shadow-[0_0_20px_rgba(34,211,238,0.05)] hover:border-cyan-500/40'
              }`}
            >
              {!notification.is_read && (
                <div className="absolute top-5 right-5 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
              
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                notification.category === 'alert' ? 'bg-amber-400/10' :
                notification.category === 'deadline' ? 'bg-rose-400/10' :
                'bg-cyan-400/10'
              }`}>
                {getCategoryIcon(notification.category)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-medium text-white pr-4">{notification.title}</h3>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    {new Date(notification.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                <p className={`mt-1 text-sm leading-relaxed ${notification.is_read ? 'text-slate-500' : 'text-slate-300'}`}>
                  {notification.message}
                </p>

                <div className="mt-4 flex items-center gap-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {!notification.is_read && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark read
                    </button>
                  )}
                  {notification.post_id && (
                    <button 
                      onClick={() => navigate('/eligible-exams')}
                      className="text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      View Details <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
