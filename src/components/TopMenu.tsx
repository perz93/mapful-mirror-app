import ActiveFiltersPill from '@/components/ActiveFiltersPill';
import { useEffect, useState } from 'react';
import { X, Plus, Bell, ChevronRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationInbox } from "@/hooks/useNotificationInbox";

const TopMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotificationInbox();
  const isLoggedIn = !!user;

  const displayName = (user?.user_metadata?.full_name as string | undefined) || user?.email?.split('@')[0] || '';
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'V';

  // Fermer le menu en changeant de page ou avec Échap
  useEffect(() => { setIsOpen(false); }, [location.pathname, location.search]);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const guard = (path: string) => (isLoggedIn ? path : '/auth');
  const links = [
    { label: 'Mes événements', to: guard('/manage-events') },
    { label: 'Favoris', to: guard('/my-account?tab=favorites') },
    { label: 'Marketplace', to: '/marketplace' },
    { label: 'Notifications', to: guard('/notifications'), badge: unreadCount },
    { label: 'Paramètres', to: guard('/settings') },
  ];

  return <>
      {/* Fond flouté : la carte reste visible derrière le menu */}
      <div
        aria-hidden
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-[45] bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 max-w-md mx-auto" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="p-4 pt-2 flex items-start justify-between">
          {/* Bell icon — left */}
          <button
            onClick={() => navigate(isLoggedIn ? '/notifications' : '/auth')}
            aria-label="Notifications"
            className="pointer-events-auto relative h-12 w-12 rounded-full bg-white dark:bg-stone-900/90 hover:bg-white transition-all duration-300 active:scale-95 flex items-center justify-center mt-2 shadow-lg"
          >
            <Bell size={20} strokeWidth={1.75} className="text-ink" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-lime text-ink text-[10px] font-medium px-1 ring-2 ring-white tabular">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Recherche active — centre */}
          {!isOpen && <div className="pointer-events-auto min-w-0"><ActiveFiltersPill /></div>}

          {/* Menu burger — right */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className={`pointer-events-auto relative h-12 w-12 rounded-full transition-all duration-300 active:scale-95 flex items-center justify-center mt-2 shadow-lg ${isOpen ? 'bg-ink' : 'bg-white dark:bg-stone-900/90'}`}
          >
            <div className={`relative transition-transform duration-500 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
              {isOpen ? <X size={22} strokeWidth={1.75} className="text-parchment" /> : <div className="flex flex-col gap-1 items-center">
                  <div className="w-5 h-[1.5px] bg-ink dark:bg-white rounded-full"></div>
                  <div className="w-5 h-[1.5px] bg-ink dark:bg-white rounded-full"></div>
                  <div className="w-5 h-[1.5px] bg-ink dark:bg-white rounded-full"></div>
                </div>}
            </div>
          </button>
        </div>

        {/* Panneau éditorial (grands liens), sans couvrir tout l'écran */}
        <nav
          aria-hidden={!isOpen}
          className={`mx-4 origin-top-right rounded-[28px] bg-parchment p-5 shadow-2xl transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isOpen ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-2 scale-[0.97] opacity-0'
          }`}
        >
          {/* Profil */}
          <Link to={guard('/my-account')} tabIndex={isOpen ? 0 : -1} className="flex items-center gap-3">
            <span className="flex size-11 flex-shrink-0 items-center justify-center rounded-full bg-lime font-display text-[17px] text-ink">
              {isLoggedIn ? initials : '?'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold text-ink">{isLoggedIn ? displayName : 'Connexion'}</span>
              <span className="block text-[12.5px] text-stone-500">{isLoggedIn ? 'Mon compte' : 'Connecte-toi ou crée un compte'}</span>
            </span>
            <ChevronRight size={18} strokeWidth={1.75} className="text-stone-400" />
          </Link>

          <p className="eyebrow mt-6 text-stone-500">Menu</p>
          <ul className="mt-2">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  tabIndex={isOpen ? 0 : -1}
                  className="flex items-center gap-2 py-1 font-display text-[32px] leading-[1.15] tracking-[-0.035em] text-ink transition-colors active:text-stone-500"
                >
                  {l.label}
                  {!!l.badge && (
                    <span className="mb-4 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-lime px-1.5 font-sans text-[11px] font-semibold tracking-normal text-ink tabular">
                      {l.badge > 9 ? '9+' : l.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            to={guard('/create-event')}
            tabIndex={isOpen ? 0 : -1}
            className="mt-6 flex h-14 items-center justify-center gap-2 rounded-full bg-lime text-[16px] font-medium text-ink hover:bg-lime-deep active:scale-[0.98] transition"
          >
            <Plus size={18} strokeWidth={2} /> Créer un événement
          </Link>

          <div className="mt-4 flex items-center justify-between text-[13px] text-stone-500">
            {isLoggedIn ? (
              <button onClick={() => { setIsOpen(false); signOut(); }} tabIndex={isOpen ? 0 : -1} className="link-underline hover:text-ink">
                Déconnexion
              </button>
            ) : <span />}
            <span>VIBE</span>
          </div>
        </nav>
      </div>
    </>;
};
export default TopMenu;
