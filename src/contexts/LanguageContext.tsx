import { createContext, useContext, useState, ReactNode } from 'react';

export type Lang = 'fr' | 'en';

const translations: Record<string, Record<Lang, string>> = {
  // ==================== COMMON ====================
  'loading': { fr: 'Chargement...', en: 'Loading...' },
  'error': { fr: 'Erreur', en: 'Error' },
  'save': { fr: 'Enregistrer', en: 'Save' },
  'cancel': { fr: 'Annuler', en: 'Cancel' },
  'delete': { fr: 'Supprimer', en: 'Delete' },
  'close': { fr: 'Fermer', en: 'Close' },
  'back': { fr: 'Retour', en: 'Back' },
  'seeDetails': { fr: 'Voir détails', en: 'See details' },
  'user': { fr: 'Utilisateur', en: 'User' },

  // ==================== AUTH ====================
  'auth.welcome': { fr: 'Bienvenue', en: 'Welcome' },
  'auth.discoverCity': { fr: 'Découvrez votre ville autrement', en: 'Discover your city differently' },
  'auth.joinUs': { fr: 'Rejoignez-nous', en: 'Join us' },
  'auth.liveEveryMoment': { fr: 'Vivez chaque instant qui compte', en: 'Live every moment that counts' },
  'auth.login': { fr: 'Se connecter', en: 'Log in' },
  'auth.signup': { fr: "S'inscrire", en: 'Sign up' },
  'auth.fullName': { fr: 'Nom complet', en: 'Full name' },
  'auth.email': { fr: 'Email', en: 'Email' },
  'auth.password': { fr: 'Mot de passe', en: 'Password' },
  'auth.confirmPassword': { fr: 'Confirmer le mot de passe', en: 'Confirm password' },
  'auth.forgotPassword': { fr: 'Mot de passe oublié ?', en: 'Forgot password?' },
  'auth.passwordMismatch': { fr: 'Les mots de passe ne correspondent pas', en: 'Passwords do not match' },
  'auth.acceptTermsRequired': { fr: "Veuillez accepter les conditions d'utilisation", en: 'Please accept the terms of use' },
  'auth.enterEmail': { fr: 'Veuillez entrer votre email', en: 'Please enter your email' },
  'auth.resetSendError': { fr: "Erreur lors de l'envoi de l'email", en: 'Error sending email' },
  'auth.resetSent': { fr: 'Email de réinitialisation envoyé !', en: 'Reset email sent!' },
  'auth.exploreNearby': { fr: 'Explorez les événements près de chez vous', en: 'Explore events near you' },
  'auth.shareWithCommunity': { fr: 'Partagez vos moments avec la communauté', en: 'Share your moments with the community' },
  'auth.acceptTerms': { fr: "J'accepte les", en: 'I accept the' },
  'auth.termsOfUse': { fr: "conditions d'utilisation", en: 'terms of use' },
  'auth.andThe': { fr: 'et la', en: 'and the' },
  'auth.privacyPolicy': { fr: 'politique de confidentialité', en: 'privacy policy' },
  'auth.loginRequired': { fr: 'Connexion requise', en: 'Login required' },
  'auth.mustBeLoggedIn': { fr: 'Vous devez être connecté', en: 'You must be logged in' },
  'auth.loginToSee': { fr: 'Connecte-toi pour voir tes notifications', en: 'Log in to see your notifications' },

  // ==================== EVENTS ====================
  'event.create': { fr: 'Créer un événement', en: 'Create an event' },
  'event.edit': { fr: "Modifier l'événement", en: 'Edit event' },
  'event.publish': { fr: "Publier l'événement", en: 'Publish event' },
  'event.creating': { fr: 'Création en cours...', en: 'Creating...' },
  'event.going': { fr: "J'y vais", en: "I'm going" },
  'event.goingConfirm': { fr: "J'y serai !", en: "I'll be there!" },
  'event.enrolled': { fr: "Tu es inscrit ! On t'attend.", en: "You're enrolled! See you there." },
  'event.attendees': { fr: 'y vont', en: 'going' },
  'event.noEvents': { fr: 'Aucun événement dans cette catégorie pour le moment', en: 'No events in this category yet' },
  'event.notFound': { fr: 'Événement introuvable', en: 'Event not found' },
  'event.backHome': { fr: "Retour à l'accueil", en: 'Back to home' },
  'event.about': { fr: 'À propos de cet événement', en: 'About this event' },
  'event.keyPoints': { fr: 'Points clés', en: 'Key points' },
  'event.step': { fr: 'Étape', en: 'Step' },
  'event.price': { fr: 'Prix', en: 'Price' },
  'event.entry': { fr: 'Entrée', en: 'Entry' },
  'event.free': { fr: 'Gratuit', en: 'Free' },
  'event.capacity': { fr: 'personnes', en: 'people' },
  'event.unlimitedCapacity': { fr: 'Capacité illimitée', en: 'Unlimited capacity' },
  'event.percentFilled': { fr: '% des places prises', en: '% spots taken' },
  'event.addressUnspecified': { fr: 'Adresse non spécifiée', en: 'Address not specified' },
  'event.created': { fr: 'Événement créé !', en: 'Event created!' },
  'event.createdDesc': { fr: 'Votre événement a été publié avec succès.', en: 'Your event has been published successfully.' },
  'event.createError': { fr: "Une erreur est survenue lors de la création de l'événement", en: 'An error occurred while creating the event' },
  'event.updated': { fr: 'Événement mis à jour !', en: 'Event updated!' },
  'event.updateError': { fr: "Erreur lors de la mise à jour", en: 'Error updating' },
  'event.deleted': { fr: 'Événement supprimé', en: 'Event deleted' },
  'event.deleteError': { fr: "Erreur lors de la suppression", en: 'Error deleting' },
  'event.published': { fr: 'Événement publié', en: 'Event published' },
  'event.unpublished': { fr: 'Événement dépublié', en: 'Event unpublished' },
  'event.publishError': { fr: 'Erreur lors de la modification', en: 'Error modifying' },
  'event.unpublishedBadge': { fr: 'Non publié', en: 'Unpublished' },
  'event.editBtn': { fr: 'Modifier', en: 'Edit' },
  'event.unpublishBtn': { fr: 'Dépublier', en: 'Unpublish' },
  'event.publishBtn': { fr: 'Publier', en: 'Publish' },
  'event.deleteConfirm': { fr: "Supprimer l'événement ?", en: 'Delete event?' },
  'event.deleteConfirmDesc': { fr: "Cette action est irréversible. L'événement sera définitivement supprimé.", en: 'This action is irreversible. The event will be permanently deleted.' },
  'event.share': { fr: 'Lien copié !', en: 'Link copied!' },

  // ==================== CREATE EVENT FORM ====================
  'form.shareEvent': { fr: 'Partagez votre événement avec la communauté', en: 'Share your event with the community' },
  'form.updateInfo': { fr: 'Mettez à jour les informations', en: 'Update the information' },
  'form.addImage': { fr: 'Ajouter une image', en: 'Add an image' },
  'form.clickToUpload': { fr: 'Cliquez pour télécharger', en: 'Click to upload' },
  'form.clickToChange': { fr: "Cliquez pour changer", en: 'Click to change' },
  'form.clickToChangeImage': { fr: "Cliquez pour changer l'image", en: 'Click to change image' },
  'form.basicInfo': { fr: 'Informations de base', en: 'Basic information' },
  'form.info': { fr: 'Informations', en: 'Information' },
  'form.title': { fr: "Titre de l'événement *", en: 'Event title *' },
  'form.titleShort': { fr: 'Titre *', en: 'Title *' },
  'form.titlePlaceholder': { fr: 'Festival de musique Jazz', en: 'Jazz music festival' },
  'form.category': { fr: 'Catégorie *', en: 'Category *' },
  'form.selectCategory': { fr: 'Sélectionnez une catégorie', en: 'Select a category' },
  'form.select': { fr: 'Sélectionner', en: 'Select' },
  'form.location': { fr: 'Localisation', en: 'Location' },
  'form.address': { fr: "Adresse / lieu de l'événement *", en: 'Address / event venue *' },
  'form.addressShort': { fr: 'Adresse', en: 'Address' },
  'form.addressPlaceholder': { fr: 'Ex: Cocody Angré, Abidjan', en: 'E.g.: Cocody Angré, Abidjan' },
  'form.mapPosition': { fr: 'Position sur la carte', en: 'Position on map' },
  'form.locating': { fr: 'localisation...', en: 'locating...' },
  'form.mapHint': { fr: 'Utilisez la mini-carte pour ajuster précisément la position via le marqueur rouge', en: 'Use the mini-map to precisely adjust the position via the red marker' },
  'form.dateTime': { fr: 'Date et heure', en: 'Date and time' },
  'form.date': { fr: 'Date *', en: 'Date *' },
  'form.time': { fr: 'Heure *', en: 'Time *' },
  'form.priceCapacity': { fr: 'Prix et capacité', en: 'Price and capacity' },
  'form.priceFCFA': { fr: 'Prix (FCFA)', en: 'Price (FCFA)' },
  'form.pricePlaceholder': { fr: 'Ex: 5000 FCFA', en: 'E.g.: 5000 FCFA' },
  'form.capacityLabel': { fr: 'Capacité', en: 'Capacity' },
  'form.description': { fr: 'Description', en: 'Description' },
  'form.descPlaceholder': { fr: 'Décrivez votre événement...', en: 'Describe your event...' },
  'form.keyPoints': { fr: "Points clés de l'événement", en: 'Event key points' },
  'form.keyPointN': { fr: 'Point clé', en: 'Key point' },
  'form.addKeyPoint': { fr: 'Ajouter un point clé', en: 'Add a key point' },
  'form.maxKeyPoints': { fr: 'Maximum 5 points clés', en: 'Maximum 5 key points' },
  'form.contact': { fr: 'Contact', en: 'Contact' },
  'form.contactNetworks': { fr: 'Contact & Réseaux', en: 'Contact & Social' },
  'form.phone': { fr: 'Numéro de téléphone', en: 'Phone number' },
  'form.phoneShort': { fr: 'Téléphone', en: 'Phone' },
  'form.whatsapp': { fr: 'WhatsApp', en: 'WhatsApp' },
  'form.instagram': { fr: 'Instagram', en: 'Instagram' },
  'form.facebook': { fr: 'Facebook', en: 'Facebook' },
  'form.tiktok': { fr: 'TikTok', en: 'TikTok' },
  'form.twitter': { fr: 'Twitter / X', en: 'Twitter / X' },
  'form.accountPlaceholder': { fr: '@votre_compte', en: '@your_account' },
  'form.pagePlaceholder': { fr: 'Nom de votre page', en: 'Your page name' },
  'form.venue': { fr: 'Lieu *', en: 'Venue *' },
  'form.isPaid': { fr: 'Événement payant', en: 'Paid event' },
  'form.selectImage': { fr: 'Sélectionnez une image', en: 'Select an image' },
  'form.max5mb': { fr: 'Max 5MB', en: 'Max 5MB' },
  'form.invalidImage': { fr: 'Veuillez sélectionner une image valide', en: 'Please select a valid image' },
  'form.imageTooLarge': { fr: "L'image ne doit pas dépasser 5 MB", en: 'Image must not exceed 5 MB' },
  'form.fillRequired': { fr: 'Veuillez remplir les champs obligatoires', en: 'Please fill in the required fields' },
  'form.eventNotFound': { fr: 'Événement non trouvé', en: 'Event not found' },
  'form.loadError': { fr: 'Erreur lors du chargement', en: 'Error loading' },

  // ==================== CATEGORIES ====================
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

  // ==================== MY ACCOUNT ====================
  'account.title': { fr: 'Mon Profil', en: 'My Profile' },
  'account.events': { fr: 'Events', en: 'Events' },
  'account.listings': { fr: 'Annonces', en: 'Listings' },
  'account.favorites': { fr: 'Favoris', en: 'Favorites' },
  'account.activity': { fr: 'Activité', en: 'Activity' },
  'account.myEvents': { fr: 'Mes événements', en: 'My events' },
  'account.manageAll': { fr: 'Gérer tout', en: 'Manage all' },
  'account.noEvents': { fr: 'Aucun événement créé', en: 'No events created' },
  'account.createFirst': { fr: 'Créer mon premier event', en: 'Create my first event' },
  'account.myListings': { fr: 'Mes annonces', en: 'My listings' },
  'account.createListing': { fr: '+ Créer', en: '+ Create' },
  'account.noListings': { fr: 'Aucune annonce', en: 'No listings' },
  'account.publishListing': { fr: 'Publier une annonce', en: 'Post a listing' },
  'account.myFavorites': { fr: 'Mes favoris', en: 'My favorites' },
  'account.noFavorites': { fr: 'Aucun favori', en: 'No favorites' },
  'account.favoritesHint': { fr: 'Les events que tu aimes apparaîtront ici', en: 'Events you like will appear here' },
  'account.goingTitle': { fr: "J'y vais", en: "I'm going" },
  'account.noActivity': { fr: 'Aucun event prévu', en: 'No events planned' },
  'account.activityHint': { fr: 'Clique "J\'y vais" sur un event pour le retrouver ici', en: 'Tap "I\'m going" on an event to find it here' },
  'account.explore': { fr: 'Explorer les events', en: 'Explore events' },
  'account.deleteListingConfirm': { fr: 'Êtes-vous sûr de vouloir supprimer cette annonce ?', en: 'Are you sure you want to delete this listing?' },
  'account.listingDeleted': { fr: 'Annonce supprimée', en: 'Listing deleted' },
  'account.deleteListingError': { fr: 'Erreur lors de la suppression', en: 'Error deleting' },
  'account.avatarUpdated': { fr: 'Photo de profil mise à jour !', en: 'Profile photo updated!' },
  'account.avatarError': { fr: 'Erreur lors de la mise à jour de la photo', en: 'Error updating photo' },

  // ==================== MANAGE EVENTS ====================
  'manage.title': { fr: 'Gérer mes événements', en: 'Manage my events' },
  'manage.noEvents': { fr: "Vous n'avez créé aucun événement pour le moment", en: "You haven't created any events yet" },

  // ==================== SETTINGS ====================
  'settings.title': { fr: 'Paramètres', en: 'Settings' },
  'settings.subtitle': { fr: 'Gérez vos informations et préférences', en: 'Manage your info and preferences' },
  'settings.email': { fr: 'Adresse email', en: 'Email address' },
  'settings.emailCurrent': { fr: 'Email actuel', en: 'Current email' },
  'settings.emailNew': { fr: 'Nouvelle adresse email', en: 'New email address' },
  'settings.emailUpdate': { fr: "Mettre à jour l'email", en: 'Update email' },
  'settings.emailUpdating': { fr: 'Mise à jour...', en: 'Updating...' },
  'settings.emailConfirmSent': { fr: 'Un email de confirmation a été envoyé à votre nouvelle adresse', en: 'A confirmation email has been sent to your new address' },
  'settings.password': { fr: 'Mot de passe', en: 'Password' },
  'settings.passwordChange': { fr: 'Modifiez votre mot de passe', en: 'Change your password' },
  'settings.passwordNew': { fr: 'Nouveau mot de passe', en: 'New password' },
  'settings.passwordConfirm': { fr: 'Confirmer le mot de passe', en: 'Confirm password' },
  'settings.passwordUpdate': { fr: 'Mettre à jour le mot de passe', en: 'Update password' },
  'settings.passwordMismatch': { fr: 'Les mots de passe ne correspondent pas', en: 'Passwords do not match' },
  'settings.passwordTooShort': { fr: 'Le mot de passe doit contenir au moins 6 caractères', en: 'Password must be at least 6 characters' },
  'settings.passwordUpdated': { fr: 'Mot de passe mis à jour avec succès', en: 'Password updated successfully' },
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
  'settings.prefsUpdated': { fr: 'Préférences mises à jour', en: 'Preferences updated' },
  'settings.language': { fr: 'Langue', en: 'Language' },
  'settings.languageDesc': { fr: "Choisissez la langue de l'application", en: 'Choose the app language' },
  'settings.langChangedFr': { fr: 'Langue changée en français', en: 'Langue changée en français' },
  'settings.langChangedEn': { fr: 'Language changed to English', en: 'Language changed to English' },
  'settings.legal': { fr: 'Politique de confidentialité', en: 'Privacy policy' },
  'settings.legalDesc': { fr: "Conditions d'utilisation et protection des données", en: 'Terms of use and data protection' },
  'settings.privacyTitle': { fr: 'Politique de confidentialité', en: 'Privacy Policy' },
  'settings.termsTitle': { fr: "Conditions générales d'utilisation", en: 'Terms of Service' },
  'settings.mustBeLoggedIn': { fr: 'Vous devez être connecté pour accéder aux paramètres', en: 'You must be logged in to access settings' },

  // ==================== SEARCH & FILTERS ====================
  'search.placeholder': { fr: 'Rechercher événement ou adresse...', en: 'Search event or address...' },
  'search.clear': { fr: 'Effacer la recherche', en: 'Clear search' },
  'search.clearBtn': { fr: 'Effacer', en: 'Clear' },
  'search.recent': { fr: 'Recherches récentes', en: 'Recent searches' },
  'search.clearAll': { fr: 'Tout effacer', en: 'Clear all' },
  'search.events': { fr: 'Événements', en: 'Events' },
  'search.routeTo': { fr: 'Itinéraire vers une adresse', en: 'Route to an address' },
  'search.activeSearch': { fr: 'Recherche active', en: 'Active search' },
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

  // ==================== MAP ====================
  'map.yourPosition': { fr: 'Votre position', en: 'Your position' },
  'map.enableLocation': { fr: 'Activez la localisation dans les paramètres du navigateur', en: 'Enable location in browser settings' },
  'map.gpsNotFound': { fr: 'Position GPS introuvable, réessayez', en: 'GPS position not found, try again' },
  'map.enableForRoute': { fr: 'Activez la localisation pour calculer un itinéraire', en: 'Enable location to calculate a route' },
  'map.iosVibe': { fr: 'Réglages iPhone → VIBE → Position → Activer', en: 'iPhone Settings → VIBE → Location → Enable' },
  'map.iosSafari': { fr: 'Réglages iPhone → Safari → Position → Autoriser', en: 'iPhone Settings → Safari → Location → Allow' },
  'map.route': { fr: 'Itinéraire', en: 'Route' },
  'map.routeCalculating': { fr: 'Calcul en cours...', en: 'Calculating...' },
  'map.routeUnavailable': { fr: 'Itinéraire indisponible', en: 'Route unavailable' },
  'map.closeRoute': { fr: "Fermer l'itinéraire", en: 'Close route' },

  // ==================== REMINDER ====================
  'reminder.set': { fr: "Rappel activé — 1h avant l'événement", en: 'Reminder set — 1h before the event' },
  'reminder.removed': { fr: 'Rappel supprimé', en: 'Reminder removed' },
  'reminder.enableNotif': { fr: 'Active les notifications pour les rappels', en: 'Enable notifications for reminders' },
  'reminder.title': { fr: 'dans 1h !', en: 'in 1h!' },

  // ==================== COUNTDOWN ====================
  'countdown.happening': { fr: 'En cours maintenant', en: 'Happening now' },
  'countdown.days': { fr: 'Jours', en: 'Days' },
  'countdown.hours': { fr: 'Heures', en: 'Hours' },
  'countdown.min': { fr: 'Min', en: 'Min' },
  'countdown.sec': { fr: 'Sec', en: 'Sec' },
  'countdown.soon': { fr: 'Commence bientôt !', en: 'Starting soon!' },
  'countdown.tomorrow': { fr: "C'est demain !", en: "It's tomorrow!" },
  'countdown.title': { fr: 'Compte à rebours', en: 'Countdown' },

  // ==================== HYPE BAR ====================
  'hype.full': { fr: 'Complet !', en: 'Full!' },
  'hype.limited': { fr: 'Places limitées', en: 'Limited spots' },
  'hype.rising': { fr: 'Ça monte !', en: 'Rising!' },
  'hype.trending': { fr: 'Tendance', en: 'Trending' },
  'hype.filled': { fr: '% rempli', en: '% filled' },

  // ==================== MARKETPLACE ====================
  'market.title': { fr: 'Marketplace', en: 'Marketplace' },
  'market.all': { fr: 'Tout', en: 'All' },
  'market.noListings': { fr: 'Aucune annonce', en: 'No listings' },
  'market.beFirst': { fr: 'Soyez le premier à proposer vos services !', en: 'Be the first to offer your services!' },
  'market.createListing': { fr: 'Créer une annonce', en: 'Create a listing' },
  'market.perHour': { fr: '/heure', en: '/hour' },
  'market.perDay': { fr: '/jour', en: '/day' },
  'market.negotiable': { fr: 'Négociable', en: 'Negotiable' },
  'market.newListing': { fr: 'Nouvelle annonce', en: 'New listing' },
  'market.offerServices': { fr: 'Proposez vos services à la communauté', en: 'Offer your services to the community' },
  'market.photo': { fr: 'Photo', en: 'Photo' },
  'market.addPhoto': { fr: 'Ajouter une photo', en: 'Add a photo' },
  'market.descPlaceholder': { fr: 'Décrivez votre service en détail...', en: 'Describe your service in detail...' },
  'market.location': { fr: 'Localisation', en: 'Location' },
  'market.locationPlaceholder': { fr: 'Ex: Cocody, Abidjan', en: 'E.g.: Cocody, Abidjan' },
  'market.publishing': { fr: 'Publication...', en: 'Publishing...' },
  'market.publishListing': { fr: "Publier l'annonce", en: 'Publish listing' },
  'market.listingCreated': { fr: 'Annonce créée avec succès !', en: 'Listing created successfully!' },
  'market.listingError': { fr: "Erreur lors de la création de l'annonce", en: 'Error creating listing' },
  'market.selectCategory': { fr: 'Sélectionner une catégorie', en: 'Select a category' },

  // ==================== NOTIFICATIONS ====================
  'notif.title': { fr: 'Notifications', en: 'Notifications' },
  'notif.unread': { fr: 'non lue', en: 'unread' },
  'notif.unreadPlural': { fr: 'non lues', en: 'unread' },
  'notif.markAllRead': { fr: 'Tout lire', en: 'Read all' },
  'notif.empty': { fr: 'Aucune notification pour le moment', en: 'No notifications yet' },
  'notif.emptyHint': { fr: 'Tu recevras des notifications quand de nouveaux events seront publiés près de toi', en: "You'll receive notifications when new events are published near you" },

  // ==================== TOP MENU ====================
  'menu.createEvent': { fr: 'Créer un événement', en: 'Create an event' },
  'menu.organizeEvent': { fr: 'Organiser un nouvel événement', en: 'Organize a new event' },
  'menu.account': { fr: 'Mon compte', en: 'My account' },
  'menu.manageProfile': { fr: 'Gérer votre profil', en: 'Manage your profile' },
  'menu.settings': { fr: 'Paramètres', en: 'Settings' },
  'menu.settingsDesc': { fr: 'Préférences et confidentialité', en: 'Preferences and privacy' },

  // ==================== BOTTOM NAV ====================
  'nav.search': { fr: 'Rechercher', en: 'Search' },
  'nav.searchPlaceholder': { fr: "Nom de l'événement...", en: 'Event name...' },
  'nav.categories': { fr: 'Catégories', en: 'Categories' },
  'nav.clearBtn': { fr: 'Effacer', en: 'Clear' },
  'nav.nearMe': { fr: 'Autour de moi', en: 'Near me' },
  'nav.allDistance': { fr: 'Tout', en: 'All' },
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
