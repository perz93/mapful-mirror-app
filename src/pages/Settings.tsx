import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Settings = () => {
  const { user, loading } = useAuth();
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
        const { data, error } = await supabase
          .from('profiles')
          .select('notification_email, notification_events, notification_friends')
          .eq('id', user.id)
          .single();

        if (error) {
          // Si le profil n'existe pas, le créer
          if (error.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
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
      const { error } = await supabase.auth.updateUser({
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
      const { error } = await supabase.auth.updateUser({
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
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Préférences mises à jour');
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour des préférences');
    }
  };

  if (loading || loadingPreferences) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-32 animate-fade-in">
      {/* Map Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/src/assets/map-background.jpg')",
          filter: "blur(3px)"
        }}
      />
      {/* Darker Semi-Transparent Blur Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/70 backdrop-blur-md hover:bg-black/90 transition-all mb-4"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-3xl font-bold font-[Righteous] text-foreground">Paramètres</h1>
          <p className="text-muted-foreground mt-2">Gérez vos informations et préférences</p>
        </div>

        <div className="space-y-6">
          {/* Email Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>Adresse email</CardTitle>
              </div>
              <CardDescription>
                Email actuel: {user.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div>
                  <Label htmlFor="new-email">Nouvelle adresse email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nouvelle@email.com"
                  />
                </div>
                <Button type="submit" disabled={updating || !newEmail}>
                  {updating ? 'Mise à jour...' : 'Mettre à jour l\'email'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>Mot de passe</CardTitle>
              </div>
              <CardDescription>
                Modifiez votre mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <Button type="submit" disabled={updating || !newPassword || !confirmPassword}>
                  {updating ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Preferences Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Préférences de notification</CardTitle>
              </div>
              <CardDescription>
                Gérez vos notifications par email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des emails de notification
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notificationEmail}
                  onCheckedChange={(checked) => {
                    setNotificationEmail(checked);
                    handleUpdateNotifications('notification_email', checked);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="event-notifications">Notifications d'événements</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des notifications sur les nouveaux événements
                  </p>
                </div>
                <Switch
                  id="event-notifications"
                  checked={notificationEvents}
                  onCheckedChange={(checked) => {
                    setNotificationEvents(checked);
                    handleUpdateNotifications('notification_events', checked);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="friend-notifications">Notifications d'amis</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des notifications sur vos amis
                  </p>
                </div>
                <Switch
                  id="friend-notifications"
                  checked={notificationFriends}
                  onCheckedChange={(checked) => {
                    setNotificationFriends(checked);
                    handleUpdateNotifications('notification_friends', checked);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
