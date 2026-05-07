import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Bell, Smartphone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import mapBackground from '@/assets/map-background.jpg';

const Settings = () => {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);

  // Email form
  const [newEmail, setNewEmail] = useState('');

  // Password form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification preferences
  const [notificationEmail, setNotificationEmail] = useState(true);
  const [notificationEvents, setNotificationEvents] = useState(true);
  const [notificationFriends, setNotificationFriends] = useState(true);
  const [loadingPreferences, setLoadingPreferences] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast.error('Vous devez être connecté pour accéder aux paramètres');
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Load notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      try {
        const {
          data,
          error
        } = await supabase.from('profiles').select('notification_email, notification_events, notification_friends').eq('id', user.id).single();
        if (error) {
          // Si le profil n'existe pas, le créer
          if (error.code === 'PGRST116') {
            const {
              error: insertError
            } = await supabase.from('profiles').insert({
              id: user.id,
              email: user.email || '',
              notification_email: true,
              notification_events: true,
              notification_friends: true
            });
            if (!insertError) {
              setNotificationEmail(true);
              setNotificationEvents(true);
              setNotificationFriends(true);
            }
          }
        } else if (data) {
          setNotificationEmail(data.notification_email ?? true);
          setNotificationEvents(data.notification_events ?? true);
          setNotificationFriends(data.notification_friends ?? true);
        }
      } catch (error: any) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoadingPreferences(false);
      }
    };
    loadPreferences();
  }, [user]);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !user) return;
    setUpdating(true);
    try {
      const {
        error
      } = await supabase.auth.updateUser({
        email: newEmail
      });
      if (error) throw error;
      toast.success('Un email de confirmation a été envoyé à votre nouvelle adresse');
      setNewEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'email');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setUpdating(true);
    try {
      const {
        error
      } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      toast.success('Mot de passe mis à jour avec succès');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du mot de passe');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateNotifications = async (field: string, value: boolean) => {
    if (!user) return;
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        [field]: value
      }).eq('id', user.id);
      if (error) throw error;
      toast.success('Préférences mises à jour');
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour des préférences');
    }
  };

  if (loading || loadingPreferences) {
    return <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-32 animate-fade-in animate-zoom-smooth bg-stone-200">
      {/* Map Background — light natural */}
      <div className="fixed inset-0 pointer-events-none">
        <img src={mapBackground} alt="" className="w-full h-full object-cover opacity-60" />
      </div>
      <div className="fixed inset-0 bg-white/30 backdrop-blur-xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-md px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)' }}>
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/70 backdrop-blur-md shadow-sm border border-white/60 hover:scale-105 active:scale-95 transition-all mb-4"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </Link>
          <h1 className="text-3xl font-bold italic text-stone-800" style={{ fontFamily: "'Source Serif 4', serif" }}>
            Paramètres
          </h1>
          <p className="mt-2 text-stone-500">Gérez vos informations et préférences</p>
        </div>

        <div className="space-y-6">
          {/* Email Section */}
          <div className="rounded-2xl backdrop-blur-2xl bg-white/30 border border-white/30 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] p-5">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-5 w-5 text-[#ee9d2b]" />
              <h2 className="text-lg font-semibold italic text-stone-800" style={{ fontFamily: "'Source Serif 4', serif" }}>
                Adresse email
              </h2>
            </div>
            <p className="text-sm text-stone-500 mb-4">
              Email actuel: {user.email}
            </p>
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label htmlFor="new-email" className="block text-sm font-medium text-stone-600 mb-1.5">
                  Nouvelle adresse email
                </label>
                <input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="nouvelle@email.com"
                  className="w-full h-11 rounded-xl bg-white/50 border border-stone-300/40 text-stone-900 placeholder:text-stone-400 text-sm px-3 focus:outline-none focus:ring-0 focus:border-[#ee9d2b]/50"
                />
              </div>
              <button
                type="submit"
                disabled={updating || !newEmail}
                className="bg-[#ee9d2b] text-white rounded-full px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {updating ? 'Mise à jour...' : 'Mettre à jour l\'email'}
              </button>
            </form>
          </div>

          {/* Password Section */}
          <div className="rounded-2xl backdrop-blur-2xl bg-white/30 border border-white/30 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] p-5">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-5 w-5 text-[#ee9d2b]" />
              <h2 className="text-lg font-semibold italic text-stone-800" style={{ fontFamily: "'Source Serif 4', serif" }}>
                Mot de passe
              </h2>
            </div>
            <p className="text-sm text-stone-500 mb-4">
              Modifiez votre mot de passe
            </p>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-stone-600 mb-1.5">
                  Nouveau mot de passe
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 rounded-xl bg-white/50 border border-stone-300/40 text-stone-900 placeholder:text-stone-400 text-sm px-3 focus:outline-none focus:ring-0 focus:border-[#ee9d2b]/50"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-stone-600 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 rounded-xl bg-white/50 border border-stone-300/40 text-stone-900 placeholder:text-stone-400 text-sm px-3 focus:outline-none focus:ring-0 focus:border-[#ee9d2b]/50"
                />
              </div>
              <button
                type="submit"
                disabled={updating || !newPassword || !confirmPassword}
                className="bg-[#ee9d2b] text-white rounded-full px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {updating ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </button>
            </form>
          </div>

          {/* Push Notifications Section */}
          <PushNotificationSection />

          {/* Notification Preferences Section */}
          <div className="rounded-2xl backdrop-blur-2xl bg-white/30 border border-white/30 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] p-5">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-5 w-5 text-[#ee9d2b]" />
              <h2 className="text-lg font-semibold italic text-stone-800" style={{ fontFamily: "'Source Serif 4', serif" }}>
                Préférences de notification
              </h2>
            </div>
            <p className="text-sm text-stone-500 mb-5">
              Gérez vos notifications par email
            </p>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="email-notifications" className="text-sm font-medium text-stone-700">
                    Notifications par email
                  </label>
                  <p className="text-sm text-stone-400">
                    Recevoir des emails de notification
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notificationEmail}
                  onCheckedChange={checked => {
                    setNotificationEmail(checked);
                    handleUpdateNotifications('notification_email', checked);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="event-notifications" className="text-sm font-medium text-stone-700">
                    Notifications d'événements
                  </label>
                  <p className="text-sm text-stone-400">
                    Recevoir des notifications sur les nouveaux événements
                  </p>
                </div>
                <Switch
                  id="event-notifications"
                  checked={notificationEvents}
                  onCheckedChange={checked => {
                    setNotificationEvents(checked);
                    handleUpdateNotifications('notification_events', checked);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="friend-notifications" className="text-sm font-medium text-stone-700">
                    Notifications d'amis
                  </label>
                  <p className="text-sm text-stone-400">
                    Recevoir des notifications sur vos amis
                  </p>
                </div>
                <Switch
                  id="friend-notifications"
                  checked={notificationFriends}
                  onCheckedChange={checked => {
                    setNotificationFriends(checked);
                    handleUpdateNotifications('notification_friends', checked);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PushNotificationSection = () => {
  const { isSupported, isSubscribed, permission, subscribe, unsubscribe, loading: notifLoading } = useNotifications();

  if (!isSupported) return null;

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      const success = await subscribe();
      if (success) {
        toast.success('Notifications push activées !');
      } else {
        toast.error('Impossible d\'activer les notifications');
      }
    } else {
      const success = await unsubscribe();
      if (success) {
        toast.success('Notifications push désactivées');
      }
    }
  };

  return (
    <div className="rounded-2xl backdrop-blur-2xl bg-white/30 border border-white/30 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] p-5">
      <div className="flex items-center gap-2 mb-1">
        <Smartphone className="h-5 w-5 text-[#ee9d2b]" />
        <h2 className="text-lg font-semibold italic text-stone-800" style={{ fontFamily: "'Source Serif 4', serif" }}>
          Notifications push
        </h2>
      </div>
      <p className="text-sm text-stone-500 mb-5">
        Recevez des alertes en temps réel sur votre appareil
      </p>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium text-stone-700">
            Notifications push
          </label>
          <p className="text-sm text-stone-400">
            {permission === 'denied'
              ? 'Bloqué par le navigateur — activez dans les paramètres'
              : isSubscribed
                ? 'Vous recevrez des notifications'
                : 'Activez pour ne rien rater'}
          </p>
        </div>
        <Switch
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={notifLoading || permission === 'denied'}
        />
      </div>
    </div>
  );
};

export default Settings;
