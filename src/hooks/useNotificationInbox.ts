import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

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

const inboxKey = (userId: string | null) => ['notif-inbox', userId] as const;

async function fetchInbox(userId: string, lang: string): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from('notification_log' as any)
    .select('id, event_id, notification_type, title, body, url, image_url, is_read, created_at, events(title, image_url, venue)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map((n: any) => ({
    id: n.id,
    event_id: n.event_id,
    notification_type: n.notification_type,
    title: n.title || (n.events?.title ? getDefaultTitle(n.notification_type, n.events.title, lang) : 'Notification'),
    body: n.body || n.events?.venue || '',
    url: n.url || (n.event_id ? `/event/${n.event_id}` : '/'),
    image_url: n.image_url || n.events?.image_url || null,
    is_read: n.is_read ?? false,
    created_at: n.created_at,
    event_title: n.events?.title,
    event_image: n.events?.image_url,
    event_venue: n.events?.venue,
  }));
}

/**
 * Boîte de réception du compte connecté. Une seule source (cache partagé) :
 * la cloche, la page Notifications et la pastille de l'icône de l'app
 * affichent toujours le même nombre de non-lus.
 */
export function useNotificationInbox() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const userId = user?.id ?? null;

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: inboxKey(userId),
    queryFn: () => fetchInbox(userId!, lang),
    enabled: !!userId,
    staleTime: 30_000,
  });

  const unreadCount = userId ? notifications.filter((n) => !n.is_read).length : 0;

  const setItems = useCallback(
    (update: (items: NotificationItem[]) => NotificationItem[]) =>
      queryClient.setQueryData<NotificationItem[]>(inboxKey(userId), (prev) => update(prev ?? [])),
    [queryClient, userId],
  );

  const markAsRead = useCallback(async (id: string) => {
    setItems((items) => items.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await supabase.from('notification_log' as any).update({ is_read: true } as any).eq('id', id);
  }, [setItems]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    setItems((items) => items.map((n) => ({ ...n, is_read: true })));
    await supabase
      .from('notification_log' as any)
      .update({ is_read: true } as any)
      .eq('user_id', userId)
      .eq('is_read', false);
  }, [setItems, userId]);

  return {
    notifications: userId ? notifications : [],
    unreadCount,
    loading: !!userId && isLoading,
    markAsRead,
    markAllAsRead,
    refresh: refetch,
  };
}

/**
 * À monter une seule fois (App) : temps réel, rafraîchissement au retour dans
 * l'app, et pastille de l'icône = nombre de notifications non lues du compte
 * connecté (effacée à la déconnexion), comme les grandes apps.
 */
export function useNotificationSync() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { unreadCount, refresh } = useNotificationInbox();
  const userId = user?.id ?? null;

  // Nouvelle notification reçue pendant que l'app est ouverte
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notif-inbox-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notification_log', filter: `user_id=eq.${userId}` },
        () => { queryClient.invalidateQueries({ queryKey: inboxKey(userId) }); },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, queryClient]);

  // Retour dans l'app : relire la boîte (une notif a pu arriver en arrière-plan)
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && userId) refresh();
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [userId, refresh]);

  // Pastille de l'icône
  useEffect(() => {
    if (authLoading || !('setAppBadge' in navigator)) return;
    const nav = navigator as Navigator & { setAppBadge: (n?: number) => Promise<void>; clearAppBadge: () => Promise<void> };
    (unreadCount > 0 ? nav.setAppBadge(unreadCount) : nav.clearAppBadge()).catch(() => {});
  }, [unreadCount, userId, authLoading]);
}

function getDefaultTitle(type: string, eventTitle: string, lang: string): string {
  if (lang === 'en') {
    switch (type) {
      case 'new_event': return `New event: ${eventTitle}`;
      case 'proximity': return `${eventTitle} is near you!`;
      case 'event_reminder': return `Reminder: ${eventTitle}`;
      case 'event_tomorrow': return `Tomorrow: ${eventTitle}`;
      case 'event_starting': return `Starting soon: ${eventTitle}`;
      default: return eventTitle;
    }
  }
  switch (type) {
    case 'new_event': return `Nouvel event : ${eventTitle}`;
    case 'proximity': return `${eventTitle} est près de toi !`;
    case 'event_reminder': return `Rappel : ${eventTitle}`;
    case 'event_tomorrow': return `Demain : ${eventTitle}`;
    case 'event_starting': return `Bientôt : ${eventTitle}`;
    default: return eventTitle;
  }
}
