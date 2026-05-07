import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationItem {
  id: string;
  event_id: string;
  notification_type: string;
  title: string | null;
  body: string | null;
  url: string | null;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
  // Joined event data
  event_title?: string;
  event_image?: string;
  event_venue?: string;
}

export function useNotificationInbox() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) { setNotifications([]); setUnreadCount(0); setLoading(false); return; }

    const { data, error } = await supabase
      .from('notification_log')
      .select('id, event_id, notification_type, title, body, url, image_url, is_read, created_at, events(title, image_url, venue)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      const items: NotificationItem[] = data.map((n: any) => ({
        id: n.id,
        event_id: n.event_id,
        notification_type: n.notification_type,
        title: n.title || (n.events?.title ? getDefaultTitle(n.notification_type, n.events.title) : 'Notification'),
        body: n.body || n.events?.venue || '',
        url: n.url || (n.event_id ? `/event/${n.event_id}` : '/'),
        image_url: n.image_url || n.events?.image_url || null,
        is_read: n.is_read ?? false,
        created_at: n.created_at,
        event_title: n.events?.title,
        event_image: n.events?.image_url,
        event_venue: n.events?.venue,
      }));
      setNotifications(items);
      setUnreadCount(items.filter(n => !n.is_read).length);
    }
    setLoading(false);
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    await supabase
      .from('notification_log')
      .update({ is_read: true } as any)
      .eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    await supabase
      .from('notification_log')
      .update({ is_read: true } as any)
      .eq('user_id', user.id)
      .eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Refresh when app becomes visible
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') fetchNotifications();
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [fetchNotifications]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh: fetchNotifications };
}

function getDefaultTitle(type: string, eventTitle: string): string {
  switch (type) {
    case 'new_event': return `Nouvel event : ${eventTitle}`;
    case 'proximity': return `${eventTitle} est près de toi !`;
    case 'event_reminder': return `Rappel : ${eventTitle}`;
    case 'event_tomorrow': return `Demain : ${eventTitle}`;
    default: return eventTitle;
  }
}
