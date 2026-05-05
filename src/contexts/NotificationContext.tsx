import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
  getPermissionState,
} from '@/lib/pushNotifications';

interface NotificationContextType {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const supported = await isPushSupported();
      setIsSupported(supported);

      if (supported) {
        const perm = await getPermissionState();
        setPermission(perm);

        const sub = await getCurrentSubscription();
        setIsSubscribed(!!sub);
      }

      setLoading(false);
    };

    init();
  }, []);

  const subscribe = async () => {
    setLoading(true);
    const sub = await subscribeToPush();
    const success = !!sub;
    setIsSubscribed(success);
    if (success) setPermission('granted');
    setLoading(false);
    return success;
  };

  const unsubscribe = async () => {
    setLoading(true);
    const success = await unsubscribeFromPush();
    if (success) setIsSubscribed(false);
    setLoading(false);
    return success;
  };

  return (
    <NotificationContext.Provider value={{ isSupported, isSubscribed, permission, subscribe, unsubscribe, loading }}>
      {children}
    </NotificationContext.Provider>
  );
};
