import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Lang = 'fr' | 'en';

const translations: Record<string, Record<Lang, string>> = {
  // Navigation & common
  'nav.home': { fr: 'Accueil', en: 'Home' },
  'nav.search': { fr: 'Rechercher événement ou adresse...', en: 'Search event or address...' },
  'nav.notifications': { fr: 'Notifications', en: 'Notifications' },
  'nav.back': { fr: 'Retour', en: 'Back' },
  'common.loading': { fr: 'Chargement...', en: 'Loading...' },
  'common.error': { fr: 'Erreur', en: 'Error' },
  'common.save': { fr: 'Enregistrer', en: 'Save' },
  'common.cancel': { fr: 'Annuler', en: 'Cancel' },
  'common.delete': { fr: 'Supprimer', en: 'Delete' },
  'common.free': { fr: 'Gratuit', en: 'Free' },
  'common.seeDetails': { fr: 'Voir détails', en: 'See details' },

  // Auth
  'auth.login': { fr: 'Se connecter', en: 'Log in' },
  'auth.signup': { fr: "S'inscrire", en: 'Sign up' },
  'auth.logout': { fr: 'Se déconnecter', en: 'Log out' },
  'auth.loginRequired': { fr: 'Connexion requise', en: 'Login required' },

  // Events
  'event.create': { fr: 'Créer un événement', en: 'Create an event' },
  'event.edit': { fr: "Modifier l'événement", en: 'Edit event' },
  'event.publish': { fr: "Publier l'événement", en: 'Publish event' },
  'event.going': { fr: "J'y vais", en: "I'm going" },
  'event.goingConfirm': { fr: "J'y serai !", en: "I'll be there!" },
  'event.enrolled': { fr: 'Tu es inscrit ! On t\'attend.', en: "You're enrolled! See you there." },
  'event.attendees': { fr: 'y vont', en: 'going' },
  'event.noEvents': { fr: 'Aucun événement dans cette catégorie pour le moment', en: 'No events in this category yet' },
  'event.reminder.set': { fr: "Rappel activé — 1h avant l'événement", en: 'Reminder set — 1h before the event' },
  'event.reminder.removed': { fr: 'Rappel supprimé', en: 'Reminder removed' },
  'event.about': { fr: 'À propos de cet événement', en: 'About this event' },
  'event.keyPoints': { fr: 'Points clés', en: 'Key points' },
  'event.step': { fr: 'Étape', en: 'Step' },
  'event.price': { fr: 'Prix', en: 'Price' },
  'event.entry': { fr: 'Entrée', en: 'Entry' },
  'event.capacity': { fr: 'personnes', en: 'people' },
  'event.unlimitedCapacity': { fr: 'Capacité illimitée', en: 'Unlimited capacity' },
  'event.notFound': { fr: 'Événement introuvable', en: 'Event not found' },
  'event.backHome': { fr: "Retour à l'accueil", en: 'Back to home' },

  // Categories
  'cat.workshops': { fr: 'Ateliers', en: 'Workshops' },
  'cat.brunch': { fr: 'Brunch', en: 'Brunch' },
  'cat.music': { fr: 'Concerts', en: 'Concerts' },
  'cat.conferences': { fr: 'Conférences', en: 'Conferences' },
  'cat.exhibitions': { fr: 'Expositions', en: 'Exhibitions' },
  'cat.festivals': { fr: 'Festivals', en: 'Festivals' },
  'cat.meetups': { fr: 'Meetups', en: 'Meetups' },
  'cat.religious': { fr: 'Religieux', en: 'Religious' },
  'cat.shows': { fr: 'Spectacles', en: 'Shows' },
  'cat.sports': { fr: 'Sports', en: 'Sports' },

  // My Account
  'account.title': { fr: 'Mon Profil', en: 'My Profile' },
  'account.events': { fr: 'Mes événements', en: 'My events' },
  'account.listings': { fr: 'Mes annonces', en: 'My listings' },
  'account.favorites': { fr: 'Mes favoris', en: 'My favorites' },
  'account.activity': { fr: "J'y vais", en: "I'm going" },
  'account.manageAll': { fr: 'Gérer tout', en: 'Manage all' },
  'account.noEvents': { fr: 'Aucun événement créé', en: 'No events created' },
  'account.createFirst': { fr: 'Créer mon premier event', en: 'Create my first event' },
  'account.noListings': { fr: 'Aucune annonce', en: 'No listings' },
  'account.noFavorites': { fr: 'Aucun favori', en: 'No favorites' },
  'account.favoritesHint': { fr: 'Les events que tu aimes apparaîtront ici', en: 'Events you like will appear here' },
  'account.noActivity': { fr: 'Aucun event prévu', en: 'No events planned' },
  'account.activityHint': { fr: 'Clique "J\'y vais" sur un event pour le retrouver ici', en: 'Tap "I\'m going" on an event to find it here' },
  'account.explore': { fr: 'Explorer les events', en: 'Explore events' },

  // Settings
  'settings.title': { fr: 'Paramètres', en: 'Settings' },
  'settings.subtitle': { fr: 'Gérez vos informations et préférences', en: 'Manage your info and preferences' },
  'settings.email': { fr: 'Adresse email', en: 'Email address' },
  'settings.emailCurrent': { fr: 'Email actuel', en: 'Current email' },
  'settings.emailNew': { fr: 'Nouvelle adresse email', en: 'New email address' },
  'settings.emailUpdate': { fr: "Mettre à jour l'email", en: 'Update email' },
  'settings.emailUpdating': { fr: 'Mise à jour...', en: 'Updating...' },
  'settings.password': { fr: 'Mot de passe', en: 'Password' },
  'settings.passwordChange': { fr: 'Modifiez votre mot de passe', en: 'Change your password' },
  'settings.passwordNew': { fr: 'Nouveau mot de passe', en: 'New password' },
  'settings.passwordConfirm': { fr: 'Confirmer le mot de passe', en: 'Confirm password' },
  'settings.passwordUpdate': { fr: 'Mettre à jour le mot de passe', en: 'Update password' },
  'settings.push': { fr: 'Notifications push', en: 'Push notifications' },
  'settings.pushDesc': { fr: 'Recevez des alertes en temps réel sur votre appareil', en: 'Get real-time alerts on your device' },
  'settings.pushBlocked': { fr: 'Bloqué par le navigateur — activez dans les paramètres', en: 'Blocked by browser — enable in settings' },
  'settings.pushActive': { fr: 'Vous recevrez des notifications', en: 'You will receive notifications' },
  'settings.pushInactive': { fr: 'Activez pour ne rien rater', en: 'Enable to never miss anything' },
  'settings.notifPrefs': { fr: 'Préférences de notification', en: 'Notification preferences' },
  'settings.notifPrefsDesc': { fr: 'Gérez vos notifications par email', en: 'Manage your email notifications' },
  'settings.notifEmail': { fr: 'Notifications par email', en: 'Email notifications' },
  'settings.notifEmailDesc': { fr: 'Recevoir des emails de notification', en: 'Receive notification emails' },
  'settings.notifEvents': { fr: "Notifications d'événements", en: 'Event notifications' },
  'settings.notifEventsDesc': { fr: 'Recevoir des notifications sur les nouveaux événements', en: 'Get notified about new events' },
  'settings.language': { fr: 'Langue', en: 'Language' },
  'settings.languageDesc': { fr: "Choisissez la langue de l'application", en: 'Choose the app language' },
  'settings.legal': { fr: 'Politique de confidentialité', en: 'Privacy policy' },
  'settings.legalDesc': { fr: 'Conditions d\'utilisation et protection des données', en: 'Terms of use and data protection' },

  // Marketplace
  'market.title': { fr: 'Marketplace', en: 'Marketplace' },
  'market.create': { fr: 'Publier une annonce', en: 'Post a listing' },

  // Filters
  'filter.categories': { fr: 'Filtrer par catégorie', en: 'Filter by category' },
  'filter.when': { fr: 'Quand', en: 'When' },
  'filter.all': { fr: 'Tous', en: 'All' },
  'filter.today': { fr: "Aujourd'hui", en: 'Today' },
  'filter.week': { fr: 'Cette semaine', en: 'This week' },
  'filter.month': { fr: 'Ce mois', en: 'This month' },
  'filter.price': { fr: 'Prix', en: 'Price' },
  'filter.free': { fr: 'Gratuit', en: 'Free' },
  'filter.paid': { fr: 'Payant', en: 'Paid' },
  'filter.distance': { fr: 'Distance max', en: 'Max distance' },
  'filter.reset': { fr: 'Réinitialiser tous les filtres', en: 'Reset all filters' },
  'filter.clearAll': { fr: 'Tout effacer', en: 'Clear all' },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (localStorage.getItem('app_language') as Lang) || 'fr';
    } catch { return 'fr'; }
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    try { localStorage.setItem('app_language', newLang); } catch { /* */ }
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
