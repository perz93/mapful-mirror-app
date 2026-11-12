import LargeTitle from '@/components/LargeTitle';
import { useState, useEffect } from 'react';
import SectionTitle from '@/components/SectionTitle';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserRound, Mail, Lock, Bell, Smartphone, Globe, Shield, ChevronRight, ChevronDown, Check, ExternalLink } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useLanguage, Lang } from '@/contexts/LanguageContext';
import { LegalDoc, LEGAL_TITLES, type LegalDocKey } from '@/components/LegalDocs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/PillToast';
import { SettingsSkeleton } from '@/components/PageSkeleton';
import { MAP_CREDITS } from '@/lib/mapTiles';

const Settings = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const [updating, setUpdating] = useState(false);
  const [openLegal, setOpenLegal] = useState<LegalDocKey | null>(null);

  // Profil public (nom affiché + bio, visibles sur /u/:id)
  const [publicName, setPublicName] = useState('');
  const [bio, setBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Email form
  const [newEmail, setNewEmail] = useState('');
  // Code reçu par e-mail (pas de lien : il ouvrirait Safari hors de l'app).
  // Si Supabase exige une double confirmation, un 2e code arrive sur l'ancienne adresse.
  const [codeTo, setCodeTo] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');

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
      toast.info(lang === 'fr' ? 'Connecte-toi pour accéder aux paramètres' : 'You must be logged in to access settings');
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
          .select('notification_email, notification_events, full_name, bio')
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
          setPublicName(data.full_name ?? '');
          setBio(data.bio ?? '');
        }
      } catch (error: any) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoadingPreferences(false);
      }
    };
    loadPreferences();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: publicName.trim() || null, bio: bio.trim() || null })
        .eq('id', user.id);
      if (error) throw error;
      toast.success(lang === 'fr' ? 'Profil mis à jour' : 'Profile updated');
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !user) return;
    setUpdating(true);
    try {
      const address = newEmail.trim();
      const { error } = await supabase.auth.updateUser({ email: address });
      if (error) throw error;
      setPendingEmail(address);
      setCodeTo(address);
      setEmailCode('');
      setNewEmail('');
    } catch (error: any) {
      toast.error(error.message || t('common.error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeTo || emailCode.length < 6) return;
    setUpdating(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email: codeTo, token: emailCode, type: 'email_change' });
      if (error) throw error;
      if (data.user?.email?.toLowerCase() === pendingEmail.toLowerCase()) {
        toast.success(t('settings.emailChanged'));
        setCodeTo(null);
      } else {
        // Double confirmation : il manque le code envoyé à l'autre adresse
        const other = codeTo.toLowerCase() === pendingEmail.toLowerCase() ? user?.email ?? '' : pendingEmail;
        setCodeTo(other);
        setEmailCode('');
        toast.info(t('settings.emailSecondCode'));
      }
    } catch {
      toast.error(t('auth.errCode'));
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
      <div className="min-h-screen relative overflow-hidden bg-white">
        <div className="relative z-10">
          <SettingsSkeleton />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen relative overflow-hidden pb-32 page-enter bg-white">

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-md px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex size-12 btn-float items-center justify-center rounded-full bg-parchment text-ink active:scale-95 transition-transform mb-6"
          >
            <ArrowLeft size={20} strokeWidth={1.75} className="text-ink" />
          </Link>
          <LargeTitle className="text-[40px] leading-[0.95] tracking-tighter text-ink" backTo="/">
            {t('settings.title')}
          </LargeTitle>
          <p className="mt-2 text-stone-500">{t('settings.subtitle')}</p>
        </div>

        <div className="space-y-6">
          {/* Profil public */}
          <div className="rounded-3xl bg-parchment p-5">
            <div className="mb-1 -mt-1">
              <SectionTitle icon={UserRound}>{lang === 'fr' ? 'Profil public' : 'Public profile'}</SectionTitle>
            </div>
            <p className="text-sm text-stone-500 mb-4">
              {lang === 'fr'
                ? 'Visible par tous sur vos événements et annonces. Votre e-mail reste privé.'
                : 'Shown to everyone on your events and listings. Your email stays private.'}
            </p>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label htmlFor="public-name" className="block text-sm font-medium text-stone-600 mb-1.5">
                  {lang === 'fr' ? 'Nom affiché' : 'Display name'}
                </label>
                <input
                  id="public-name"
                  value={publicName}
                  maxLength={60}
                  onChange={e => setPublicName(e.target.value)}
                  placeholder={lang === 'fr' ? 'Ex. Kofi Events' : 'e.g. Kofi Events'}
                  className="w-full h-12 rounded-xl bg-parchment border border-stone-300 text-ink placeholder:text-stone-400 text-[15px] px-4 focus:outline-none focus:ring-0 focus:border-ink"
                />
              </div>
              <div>
                <label htmlFor="public-bio" className="block text-sm font-medium text-stone-600 mb-1.5">Bio</label>
                <textarea
                  id="public-bio"
                  value={bio}
                  maxLength={160}
                  rows={3}
                  onChange={e => setBio(e.target.value)}
                  placeholder={lang === 'fr' ? 'Soirées, brunchs et pool parties à Cocody…' : 'Parties, brunches and pool parties in Abidjan…'}
                  className="w-full rounded-xl bg-parchment border border-stone-300 text-ink placeholder:text-stone-400 text-[15px] px-4 py-3 resize-none focus:outline-none focus:ring-0 focus:border-ink"
                />
                <p className="mt-1 text-right text-xs text-stone-400 tabular">{bio.length}/160</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-lime text-ink text-sm font-medium hover:bg-lime-deep transition-colors active:scale-95 disabled:opacity-50"
                >
                  {lang === 'fr' ? 'Enregistrer' : 'Save'}
                </button>
                <Link to={`/u/${user.id}`} className="text-sm font-medium text-ink link-underline">
                  {lang === 'fr' ? 'Voir mon profil' : 'View my profile'}
                </Link>
              </div>
            </form>
          </div>

          {/* Email Section */}
          <div className="rounded-3xl bg-parchment p-5">
            <div className="mb-1 -mt-1">
              <SectionTitle icon={Mail}>{t('settings.email')}</SectionTitle>
            </div>
            <p className="text-sm text-stone-500 mb-4">
              {t('settings.emailCurrent')}: {user.email}
            </p>
            {codeTo ? (
            <form onSubmit={handleVerifyEmailCode} className="space-y-4">
              <p className="text-sm text-stone-600">
                {t('auth.codeSentTo')} <span className="font-medium text-ink">{codeTo}</span>. {t('auth.codeHint')}
              </p>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={8}
                autoFocus
                aria-label={t('auth.codePlaceholder')}
                placeholder={t('auth.codePlaceholder')}
                value={emailCode}
                onChange={e => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                className="w-full h-14 rounded-xl bg-parchment border border-stone-300 text-ink text-center text-2xl font-semibold tracking-[0.4em] placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-stone-400 px-4 focus:outline-none focus:ring-0 focus:border-ink"
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={updating || emailCode.length < 6}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-lime text-ink text-sm font-medium hover:bg-lime-deep transition-colors active:scale-95 disabled:opacity-50"
                >
                  {t('settings.emailConfirm')}
                </button>
                <button type="button" onClick={() => setCodeTo(null)} className="h-10 px-3 text-sm font-medium text-stone-500 hover:text-ink">
                  {t('settings.emailCancel')}
                </button>
              </div>
            </form>
            ) : (
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
                  className="w-full h-12 rounded-xl bg-parchment border border-stone-300 text-ink placeholder:text-stone-400 text-[15px] px-4 focus:outline-none focus:ring-0 focus:border-ink"
                />
              </div>
              <button
                type="submit"
                disabled={updating || !newEmail}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-lime text-ink text-sm font-medium hover:bg-lime-deep transition-colors active:scale-95 disabled:opacity-50"
              >
                {updating ? t('settings.emailUpdating') : t('settings.emailUpdate')}
              </button>
            </form>
            )}
          </div>

          {/* Password Section */}
          <div className="rounded-3xl bg-parchment p-5">
            <div className="mb-1 -mt-1">
              <SectionTitle icon={Lock}>{t('settings.password')}</SectionTitle>
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
                  className="w-full h-12 rounded-xl bg-parchment border border-stone-300 text-ink placeholder:text-stone-400 text-[15px] px-4 focus:outline-none focus:ring-0 focus:border-ink"
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
                  className="w-full h-12 rounded-xl bg-parchment border border-stone-300 text-ink placeholder:text-stone-400 text-[15px] px-4 focus:outline-none focus:ring-0 focus:border-ink"
                />
              </div>
              <button
                type="submit"
                disabled={updating || !newPassword || !confirmPassword}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-lime text-ink text-sm font-medium hover:bg-lime-deep transition-colors active:scale-95 disabled:opacity-50"
              >
                {updating ? t('settings.emailUpdating') : t('settings.passwordUpdate')}
              </button>
            </form>
          </div>

          {/* Push Notifications Section */}
          <PushNotificationSection />

          {/* Notification Preferences Section */}
          <div className="rounded-3xl bg-parchment p-5">
            <div className="mb-1 -mt-1">
              <SectionTitle icon={Bell}>{t('settings.notifPrefs')}</SectionTitle>
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

          {/* Langue : une ligne, la langue actuelle en pastille (L3) */}
          <div className="rounded-3xl bg-parchment px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="-my-1">
                <SectionTitle icon={Globe}>{t('settings.language')}</SectionTitle>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label={t('settings.languageDesc')}
                    className="inline-flex h-9 flex-shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 text-sm font-semibold text-ink active:scale-95 transition-transform"
                  >
                    <span>{lang === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
                    {lang === 'fr' ? 'Français' : 'English'}
                    <ChevronDown size={15} strokeWidth={2} className="text-stone-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48 rounded-2xl border-stone-200 p-1.5">
                  {([
                    { id: 'fr' as Lang, label: 'Français', flag: '🇫🇷' },
                    { id: 'en' as Lang, label: 'English', flag: '🇬🇧' },
                  ]).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        if (lang === option.id) return;
                        setLang(option.id);
                        toast.success(option.id === 'fr' ? 'Langue changée en français' : 'Language changed to English');
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors ${lang === option.id ? 'bg-white' : 'hover:bg-parchment/60'}`}
                    >
                      <span className="text-base">{option.flag}</span>
                      <span className="flex-1 text-left">{option.label}</span>
                      {lang === option.id && <Check size={16} strokeWidth={2.2} />}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Legal Section */}
          <div className="rounded-3xl bg-parchment overflow-hidden">
            <div className="p-5 pb-3">
              <div className="mb-1 -mt-1">
                <SectionTitle icon={Shield}>{t('settings.legal')}</SectionTitle>
              </div>
              <p className="text-sm text-stone-500">
                {t('settings.legalDesc')}
              </p>
            </div>

            <div className="divide-y divide-stone-200/40">
              {(Object.keys(LEGAL_TITLES) as LegalDocKey[]).map((key) => (
                <div key={key}>
                  <button
                    onClick={() => setOpenLegal(openLegal === key ? null : key)}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/30 transition-colors"
                  >
                    <span className="text-sm font-medium text-stone-700">{LEGAL_TITLES[key]}</span>
                    <ChevronRight size={16} className={`text-stone-400 transition-transform ${openLegal === key ? 'rotate-90' : ''}`} />
                  </button>
                  {openLegal === key && <LegalDoc doc={key} className="bg-white/40 px-5 pb-5 pt-3" />}
                </div>
              ))}
            </div>
          </div>

          {/* App version + crédits cartographiques (licence ODbL) */}
          <div className="text-center py-4 space-y-1.5">
            <p className="text-xs text-stone-400">© {new Date().getFullYear()} Upvibe — Abidjan, Côte d'Ivoire</p>
            <p className="text-[11px] text-stone-400">
              {lang === 'fr' ? 'Carte' : 'Map'} ©{' '}
              {MAP_CREDITS.map((c, i) => (
                <span key={c.label}>
                  {i > 0 && ' · '}
                  <a href={c.href} target="_blank" rel="noopener noreferrer" className="link-underline hover:text-stone-600">{c.label}</a>
                </span>
              ))}
            </p>
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
    <div className="rounded-3xl bg-parchment p-5">
      <div className="mb-1 -mt-1">
        <SectionTitle icon={Smartphone}>{t('settings.push')}</SectionTitle>
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

export default Settings;
