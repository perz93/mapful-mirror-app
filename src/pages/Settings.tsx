import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Bell, Smartphone, Globe, Shield, ChevronRight, ExternalLink } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useLanguage, Lang } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import mapBackground from '@/assets/map-background.jpg';
import { SettingsSkeleton } from '@/components/PageSkeleton';

const Settings = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const [updating, setUpdating] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Email form
  const [newEmail, setNewEmail] = useState('');

  // Password form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification preferences
  const [notificationEmail, setNotificationEmail] = useState(true);
  const [notificationEvents, setNotificationEvents] = useState(true);
  const [loadingPreferences, setLoadingPreferences] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast.error(lang === 'fr' ? 'Vous devez être connecté pour accéder aux paramètres' : 'You must be logged in to access settings');
      navigate('/auth');
    }
  }, [user, loading, navigate, lang]);

  // Load notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('notification_email, notification_events')
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            const { error: insertError } = await supabase.from('profiles').insert({
              id: user.id,
              email: user.email || '',
              notification_email: true,
              notification_events: true,
            });
            if (!insertError) {
              setNotificationEmail(true);
              setNotificationEvents(true);
            }
          }
        } else if (data) {
          setNotificationEmail(data.notification_email ?? true);
          setNotificationEvents(data.notification_events ?? true);
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
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success(lang === 'fr' ? 'Un email de confirmation a été envoyé à votre nouvelle adresse' : 'A confirmation email has been sent to your new address');
      setNewEmail('');
    } catch (error: any) {
      toast.error(error.message || t('common.error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      toast.error(lang === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error(lang === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères' : 'Password must be at least 6 characters');
      return;
    }
    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success(lang === 'fr' ? 'Mot de passe mis à jour avec succès' : 'Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || t('common.error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateNotifications = async (field: string, value: boolean) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('profiles').update({ [field]: value }).eq('id', user.id);
      if (error) throw error;
      toast.success(lang === 'fr' ? 'Préférences mises à jour' : 'Preferences updated');
    } catch (error: any) {
      toast.error(t('common.error'));
    }
  };

  if (loading || loadingPreferences) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-stone-200">
        <div className="fixed inset-0 pointer-events-none">
          <img src={mapBackground} alt="" className="w-full h-full object-cover opacity-60" />
        </div>
        <div className="fixed inset-0 bg-white/30 backdrop-blur-xl pointer-events-none" />
        <div className="relative z-10">
          <SettingsSkeleton />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen relative overflow-hidden pb-32 animate-fade-in animate-zoom-smooth bg-stone-200">
      {/* Map Background */}
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
            {t('settings.title')}
          </h1>
          <p className="mt-2 text-stone-500">{t('settings.subtitle')}</p>
        </div>

        <div className="space-y-6">
          {/* Email Section */}
          <div className="rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-5 w-5 text-[#ee9d2b]" />
              <h2 className="text-lg font-semibold italic text-stone-800" style={{ fontFamily: "'Source Serif 4', serif" }}>
                {t('settings.email')}
              </h2>
            </div>
            <p className="text-sm text-stone-500 mb-4">
              {t('settings.emailCurrent')}: {user.email}
            </p>
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label htmlFor="new-email" className="block text-sm font-medium text-stone-600 mb-1.5">
                  {t('settings.emailNew')}
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
                {updating ? t('settings.emailUpdating') : t('settings.emailUpdate')}
              </button>
            </form>
          </div>

          {/* Password Section */}
          <div className="rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-5 w-5 text-[#ee9d2b]" />
              <h2 className="text-lg font-semibold italic text-stone-800" style={{ fontFamily: "'Source Serif 4', serif" }}>
                {t('settings.password')}
              </h2>
            </div>
            <p className="text-sm text-stone-500 mb-4">
              {t('settings.passwordChange')}
            </p>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-stone-600 mb-1.5">
                  {t('settings.passwordNew')}
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
                  {t('settings.passwordConfirm')}
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
                {updating ? t('settings.emailUpdating') : t('settings.passwordUpdate')}
              </button>
            </form>
          </div>

          {/* Push Notifications Section */}
          <PushNotificationSection />

          {/* Notification Preferences Section */}
          <div className="rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-5 w-5 text-[#ee9d2b]" />
              <h2 className="text-lg font-semibold italic text-stone-800" style={{ fontFamily: "'Source Serif 4', serif" }}>
                {t('settings.notifPrefs')}
              </h2>
            </div>
            <p className="text-sm text-stone-500 mb-5">
              {t('settings.notifPrefsDesc')}
            </p>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="email-notifications" className="text-sm font-medium text-stone-700">
                    {t('settings.notifEmail')}
                  </label>
                  <p className="text-sm text-stone-400">
                    {t('settings.notifEmailDesc')}
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
                    {t('settings.notifEvents')}
                  </label>
                  <p className="text-sm text-stone-400">
                    {t('settings.notifEventsDesc')}
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
            </div>
          </div>

          {/* Language Section */}
          <div className="rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-5 w-5 text-[#ee9d2b]" />
              <h2 className="text-lg font-semibold italic text-stone-800" style={{ fontFamily: "'Source Serif 4', serif" }}>
                {t('settings.language')}
              </h2>
            </div>
            <p className="text-sm text-stone-500 mb-4">
              {t('settings.languageDesc')}
            </p>
            <div className="flex gap-3">
              {([
                { id: 'fr' as Lang, label: 'Français', flag: '🇫🇷' },
                { id: 'en' as Lang, label: 'English', flag: '🇬🇧' },
              ]).map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setLang(option.id);
                    toast.success(option.id === 'fr' ? 'Langue changée en français' : 'Language changed to English');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    lang === option.id
                      ? 'bg-[#ee9d2b] text-white shadow-lg shadow-[#ee9d2b]/20 scale-[1.02]'
                      : 'bg-white/60 text-stone-600 border border-stone-200/50 hover:bg-white/80 hover:scale-[1.02]'
                  }`}
                >
                  <span className="text-lg">{option.flag}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Legal Section */}
          <div className="rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm overflow-hidden">
            <div className="p-5 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-5 w-5 text-[#ee9d2b]" />
                <h2 className="text-lg font-semibold italic text-stone-800" style={{ fontFamily: "'Source Serif 4', serif" }}>
                  {t('settings.legal')}
                </h2>
              </div>
              <p className="text-sm text-stone-500">
                {t('settings.legalDesc')}
              </p>
            </div>

            <div className="divide-y divide-stone-200/40">
              <button
                onClick={() => setShowPrivacy(!showPrivacy)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/30 transition-colors"
              >
                <span className="text-sm font-medium text-stone-700">
                  {lang === 'fr' ? 'Politique de confidentialité' : 'Privacy Policy'}
                </span>
                <ChevronRight size={16} className={`text-stone-400 transition-transform ${showPrivacy ? 'rotate-90' : ''}`} />
              </button>
              {showPrivacy && <PrivacyPolicy lang={lang} />}

              <button
                onClick={() => setShowTerms(!showTerms)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/30 transition-colors"
              >
                <span className="text-sm font-medium text-stone-700">
                  {lang === 'fr' ? "Conditions générales d'utilisation" : 'Terms of Service'}
                </span>
                <ChevronRight size={16} className={`text-stone-400 transition-transform ${showTerms ? 'rotate-90' : ''}`} />
              </button>
              {showTerms && <TermsOfService lang={lang} />}
            </div>
          </div>

          {/* App version */}
          <div className="text-center py-4">
            <p className="text-xs text-stone-400">VIBE v1.0 — Abidjan, Côte d'Ivoire</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Push Notification Section
// ============================================
const PushNotificationSection = () => {
  const { isSupported, isSubscribed, permission, subscribe, unsubscribe, loading: notifLoading } = useNotifications();
  const { t } = useLanguage();

  if (!isSupported) return null;

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      const success = await subscribe();
      if (success) toast.success(t('settings.pushActive'));
      else toast.error(t('common.error'));
    } else {
      const success = await unsubscribe();
      if (success) toast.success(t('settings.pushInactive'));
    }
  };

  return (
    <div className="rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-1">
        <Smartphone className="h-5 w-5 text-[#ee9d2b]" />
        <h2 className="text-lg font-semibold italic text-stone-800" style={{ fontFamily: "'Source Serif 4', serif" }}>
          {t('settings.push')}
        </h2>
      </div>
      <p className="text-sm text-stone-500 mb-5">
        {t('settings.pushDesc')}
      </p>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium text-stone-700">
            {t('settings.push')}
          </label>
          <p className="text-sm text-stone-400">
            {permission === 'denied'
              ? t('settings.pushBlocked')
              : isSubscribed
                ? t('settings.pushActive')
                : t('settings.pushInactive')}
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

// ============================================
// Privacy Policy — Côte d'Ivoire (Loi n°2013-450)
// ============================================
const PrivacyPolicy = ({ lang }: { lang: Lang }) => (
  <div className="px-5 py-4 bg-white/20 animate-fade-in">
    <div className="prose prose-sm prose-stone max-w-none text-xs leading-relaxed text-stone-600 space-y-3">
      {lang === 'fr' ? (
        <>
          <p className="font-semibold text-stone-800 text-sm">Politique de confidentialité — VIBE</p>
          <p><strong>Dernière mise à jour :</strong> 8 mai 2026</p>

          <p><strong>1. Responsable du traitement</strong><br />
          VIBE est une application éditée et opérée depuis Abidjan, Côte d'Ivoire. Le traitement des données personnelles est effectué conformément à la <strong>Loi n°2013-450 du 19 juin 2013</strong> relative à la protection des données à caractère personnel en Côte d'Ivoire et aux recommandations de l'<strong>ARTCI</strong> (Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire).</p>

          <p><strong>2. Données collectées</strong><br />
          Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Données d'inscription :</strong> adresse email, mot de passe (chiffré)</li>
            <li><strong>Données de profil :</strong> nom, photo de profil (optionnel)</li>
            <li><strong>Données d'événements :</strong> titre, lieu, date, contacts de l'organisateur</li>
            <li><strong>Données de localisation :</strong> position GPS (uniquement avec votre consentement explicite, pour afficher les événements à proximité)</li>
            <li><strong>Données techniques :</strong> type d'appareil, navigateur, pour améliorer le service</li>
          </ul>

          <p><strong>3. Finalité du traitement</strong><br />
          Vos données sont utilisées exclusivement pour :</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Permettre la création et la gestion de votre compte</li>
            <li>Afficher les événements sur la carte et dans les catégories</li>
            <li>Envoyer des notifications push (si activées)</li>
            <li>Améliorer l'expérience utilisateur de l'application</li>
          </ul>

          <p><strong>4. Base légale</strong><br />
          Le traitement repose sur votre <strong>consentement</strong> (art. 6, Loi n°2013-450) que vous pouvez retirer à tout moment depuis les paramètres de l'application ou en nous contactant.</p>

          <p><strong>5. Partage des données</strong><br />
          Vos données personnelles ne sont <strong>jamais vendues</strong> à des tiers. Elles peuvent être partagées avec :</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Supabase</strong> (hébergement de la base de données — serveurs sécurisés)</li>
            <li><strong>Les autorités compétentes</strong> si requis par la loi ivoirienne</li>
          </ul>

          <p><strong>6. Durée de conservation</strong><br />
          Vos données sont conservées tant que votre compte est actif. En cas de suppression du compte, vos données sont effacées dans un délai de <strong>30 jours</strong>, conformément à la réglementation de l'ARTCI.</p>

          <p><strong>7. Vos droits (Loi n°2013-450)</strong><br />
          Vous disposez des droits suivants :</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Droit d'accès :</strong> consulter vos données personnelles</li>
            <li><strong>Droit de rectification :</strong> corriger vos informations</li>
            <li><strong>Droit de suppression :</strong> demander l'effacement de vos données</li>
            <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
          </ul>
          <p>Pour exercer ces droits, contactez-nous via l'application ou par email.</p>

          <p><strong>8. Sécurité</strong><br />
          Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données : chiffrement des mots de passe, connexions HTTPS, accès restreint aux bases de données.</p>

          <p><strong>9. Réclamations</strong><br />
          Vous pouvez adresser une réclamation à l'<strong>ARTCI</strong> — Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire — si vous estimez que vos droits ne sont pas respectés.</p>
        </>
      ) : (
        <>
          <p className="font-semibold text-stone-800 text-sm">Privacy Policy — VIBE</p>
          <p><strong>Last updated:</strong> May 8, 2026</p>

          <p><strong>1. Data Controller</strong><br />
          VIBE is an application published and operated from Abidjan, Côte d'Ivoire. Personal data processing complies with <strong>Law No. 2013-450 of June 19, 2013</strong> on the protection of personal data in Côte d'Ivoire and the guidelines of <strong>ARTCI</strong> (Telecommunications/ICT Regulatory Authority of Côte d'Ivoire).</p>

          <p><strong>2. Data Collected</strong><br />
          We only collect data necessary for the service:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Registration data:</strong> email address, password (encrypted)</li>
            <li><strong>Profile data:</strong> name, profile photo (optional)</li>
            <li><strong>Event data:</strong> title, venue, date, organizer contacts</li>
            <li><strong>Location data:</strong> GPS position (only with your explicit consent, to display nearby events)</li>
            <li><strong>Technical data:</strong> device type, browser, to improve the service</li>
          </ul>

          <p><strong>3. Purpose of Processing</strong><br />
          Your data is used exclusively to:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Enable account creation and management</li>
            <li>Display events on the map and in categories</li>
            <li>Send push notifications (if enabled)</li>
            <li>Improve the user experience</li>
          </ul>

          <p><strong>4. Legal Basis</strong><br />
          Processing is based on your <strong>consent</strong> (Art. 6, Law No. 2013-450), which you may withdraw at any time from the app settings or by contacting us.</p>

          <p><strong>5. Data Sharing</strong><br />
          Your personal data is <strong>never sold</strong> to third parties. It may be shared with:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Supabase</strong> (database hosting — secured servers)</li>
            <li><strong>Competent authorities</strong> if required by Ivorian law</li>
          </ul>

          <p><strong>6. Data Retention</strong><br />
          Your data is kept as long as your account is active. Upon account deletion, your data is erased within <strong>30 days</strong>, in accordance with ARTCI regulations.</p>

          <p><strong>7. Your Rights (Law No. 2013-450)</strong><br />
          You have the following rights:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Right of access:</strong> view your personal data</li>
            <li><strong>Right of rectification:</strong> correct your information</li>
            <li><strong>Right of deletion:</strong> request erasure of your data</li>
            <li><strong>Right of objection:</strong> object to data processing</li>
          </ul>
          <p>To exercise these rights, contact us via the app or by email.</p>

          <p><strong>8. Security</strong><br />
          We implement technical and organizational measures to protect your data: password encryption, HTTPS connections, restricted database access.</p>

          <p><strong>9. Complaints</strong><br />
          You may file a complaint with <strong>ARTCI</strong> — Telecommunications/ICT Regulatory Authority of Côte d'Ivoire — if you believe your rights are not being respected.</p>
        </>
      )}
    </div>
  </div>
);

// ============================================
// Terms of Service — Côte d'Ivoire
// ============================================
const TermsOfService = ({ lang }: { lang: Lang }) => (
  <div className="px-5 py-4 bg-white/20 animate-fade-in">
    <div className="prose prose-sm prose-stone max-w-none text-xs leading-relaxed text-stone-600 space-y-3">
      {lang === 'fr' ? (
        <>
          <p className="font-semibold text-stone-800 text-sm">Conditions Générales d'Utilisation — VIBE</p>
          <p><strong>Dernière mise à jour :</strong> 8 mai 2026</p>

          <p><strong>1. Objet</strong><br />
          Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de l'application VIBE, plateforme de découverte et de publication d'événements à Abidjan, Côte d'Ivoire.</p>

          <p><strong>2. Accès au service</strong><br />
          L'application est accessible gratuitement. La création d'un compte est nécessaire pour publier des événements, des annonces ou interagir avec le contenu (favoris, participation).</p>

          <p><strong>3. Inscription</strong><br />
          L'utilisateur s'engage à fournir des informations exactes lors de son inscription. Il est responsable de la confidentialité de ses identifiants de connexion. Toute utilisation frauduleuse du compte doit être signalée immédiatement.</p>

          <p><strong>4. Contenu publié</strong><br />
          L'utilisateur est seul responsable du contenu qu'il publie (événements, annonces, images). Il s'interdit de publier tout contenu :</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Illicite, diffamatoire, injurieux ou discriminatoire</li>
            <li>Portant atteinte aux droits de propriété intellectuelle d'autrui</li>
            <li>Faux ou trompeur</li>
            <li>Contraire à l'ordre public et aux bonnes mœurs</li>
          </ul>
          <p>VIBE se réserve le droit de supprimer tout contenu non conforme sans préavis.</p>

          <p><strong>5. Propriété intellectuelle</strong><br />
          L'application VIBE, son design, son code source et ses contenus originaux sont protégés par le droit de la propriété intellectuelle applicable en Côte d'Ivoire (Accord de Bangui révisé, OAPI). Toute reproduction non autorisée est interdite.</p>

          <p><strong>6. Responsabilité</strong><br />
          VIBE ne peut être tenu responsable :</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>De la véracité des informations publiées par les utilisateurs</li>
            <li>Des dommages résultant de l'utilisation ou de l'impossibilité d'utiliser le service</li>
            <li>Des relations entre organisateurs d'événements et participants</li>
          </ul>

          <p><strong>7. Géolocalisation</strong><br />
          L'utilisation de la géolocalisation est facultative et soumise à votre consentement. Vous pouvez désactiver cette fonctionnalité à tout moment dans les paramètres de votre appareil.</p>

          <p><strong>8. Modification des CGU</strong><br />
          VIBE se réserve le droit de modifier les présentes CGU. Les utilisateurs seront informés de toute modification substantielle. La poursuite de l'utilisation du service vaut acceptation des nouvelles conditions.</p>

          <p><strong>9. Résiliation</strong><br />
          L'utilisateur peut supprimer son compte à tout moment. VIBE se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU.</p>

          <p><strong>10. Droit applicable</strong><br />
          Les présentes CGU sont régies par le droit ivoirien. Tout litige sera soumis aux juridictions compétentes d'Abidjan, Côte d'Ivoire.</p>
        </>
      ) : (
        <>
          <p className="font-semibold text-stone-800 text-sm">Terms of Service — VIBE</p>
          <p><strong>Last updated:</strong> May 8, 2026</p>

          <p><strong>1. Purpose</strong><br />
          These Terms of Service govern access to and use of the VIBE application, a platform for discovering and publishing events in Abidjan, Côte d'Ivoire.</p>

          <p><strong>2. Access</strong><br />
          The application is free to access. Account creation is required to publish events, listings, or interact with content (favorites, attendance).</p>

          <p><strong>3. Registration</strong><br />
          Users must provide accurate information upon registration. Users are responsible for the confidentiality of their login credentials. Any fraudulent use of the account must be reported immediately.</p>

          <p><strong>4. Published Content</strong><br />
          Users are solely responsible for content they publish (events, listings, images). The following content is prohibited:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Illegal, defamatory, abusive, or discriminatory content</li>
            <li>Content infringing on intellectual property rights</li>
            <li>False or misleading content</li>
            <li>Content contrary to public order and decency</li>
          </ul>
          <p>VIBE reserves the right to remove non-compliant content without notice.</p>

          <p><strong>5. Intellectual Property</strong><br />
          The VIBE application, its design, source code, and original content are protected by intellectual property law applicable in Côte d'Ivoire (revised Bangui Agreement, OAPI). Unauthorized reproduction is prohibited.</p>

          <p><strong>6. Liability</strong><br />
          VIBE cannot be held responsible for:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>The accuracy of information published by users</li>
            <li>Damages resulting from the use or inability to use the service</li>
            <li>Relationships between event organizers and attendees</li>
          </ul>

          <p><strong>7. Geolocation</strong><br />
          Geolocation is optional and subject to your consent. You can disable this feature at any time in your device settings.</p>

          <p><strong>8. Amendments</strong><br />
          VIBE reserves the right to amend these Terms. Users will be notified of any substantial changes. Continued use of the service constitutes acceptance of the updated terms.</p>

          <p><strong>9. Termination</strong><br />
          Users may delete their account at any time. VIBE reserves the right to suspend or delete any account that violates these Terms.</p>

          <p><strong>10. Governing Law</strong><br />
          These Terms are governed by Ivorian law. Any dispute shall be submitted to the competent courts of Abidjan, Côte d'Ivoire.</p>
        </>
      )}
    </div>
  </div>
);

export default Settings;
