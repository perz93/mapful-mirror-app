import { lazy, Suspense, useEffect, useState, type ComponentType } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NotificationPrompt from "@/components/NotificationPrompt";
import InstallGuide from "@/components/InstallGuide";
import UpdateBanner from "@/components/UpdateBanner";
import HomeFab from "@/components/HomeFab";
import SplashScreenWrapper from "@/components/SplashScreen";
import { useStatusBarColor } from "@/hooks/useStatusBarColor";
import { usePWATheme } from "@/hooks/usePWATheme";
import { useProximityNotifications } from "@/hooks/useProximityNotifications";
import { useNotificationSync } from "@/hooks/useNotificationInbox";
import Index from "./pages/Index";

// Pages secondaires chargées à la demande : le démarrage n'exécute que la carte.
// Elles sont toutes préchargées juste après, en tâche de fond, pour s'ouvrir sans attente.
const pageLoaders: Array<() => Promise<unknown>> = [];
const lazyPage = (load: () => Promise<{ default: ComponentType }>) => {
  // Une fois préchargée, la page est rendue directement : pas de passage par
  // <Suspense> (React 18 suspend toujours un composant lazy au premier rendu).
  let Loaded: ComponentType | null = null;
  const loadOnce = () => load().then((m) => { Loaded = m.default; return m; });
  pageLoaders.push(loadOnce);
  const Lazy = lazy(loadOnce);
  // Choix figé au montage : pas de bascule Lazy → Loaded en cours de route (qui remonterait la page)
  const Page = () => {
    const [Component] = useState<ComponentType>(() => Loaded ?? Lazy);
    return <Component />;
  };
  return Page;
};
const preloadPages = () => pageLoaders.forEach((load) => { load().catch(() => {}); });

const Concerts = lazyPage(() => import("./pages/Concerts"));
const Sports = lazyPage(() => import("./pages/Sports"));
const Nightlife = lazyPage(() => import("./pages/Nightlife"));
const AllEvents = lazyPage(() => import("./pages/AllEvents"));
const Family = lazyPage(() => import("./pages/Family"));
const Conferences = lazyPage(() => import("./pages/Conferences"));
const Workshops = lazyPage(() => import("./pages/Workshops"));
const Festivals = lazyPage(() => import("./pages/Festivals"));
const Shows = lazyPage(() => import("./pages/Shows"));
const Exhibitions = lazyPage(() => import("./pages/Exhibitions"));
const Brunch = lazyPage(() => import("./pages/Brunch"));
const Religious = lazyPage(() => import("./pages/Religious"));
const Other = lazyPage(() => import("./pages/Other"));
const EventDetails = lazyPage(() => import("./pages/EventDetails"));
const MyAccount = lazyPage(() => import("./pages/MyAccount"));
const CreateEvent = lazyPage(() => import("./pages/CreateEvent"));
const ManageEvents = lazyPage(() => import("./pages/ManageEvents"));
const EditEvent = lazyPage(() => import("./pages/EditEvent"));
const Settings = lazyPage(() => import("./pages/Settings"));
const NotFound = lazyPage(() => import("./pages/NotFound"));
const Auth = lazyPage(() => import("./pages/Auth"));
const Marketplace = lazyPage(() => import("./pages/Marketplace"));
const CreateListing = lazyPage(() => import("./pages/CreateListing"));
const EditListing = lazyPage(() => import("./pages/EditListing"));
const ListingDetails = lazyPage(() => import("./pages/ListingDetails"));
const Notifications = lazyPage(() => import("./pages/Notifications"));
const PublicProfile = lazyPage(() => import("./pages/PublicProfile"));

const queryClient = new QueryClient();

const AppContent = () => {
  useStatusBarColor();
  usePWATheme();
  useProximityNotifications();
  useNotificationSync();

  useEffect(() => {
    // requestIdleCallback n'existe pas sur Safari : simple délai à la place
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(preloadPages, { timeout: 4000 });
    else setTimeout(preloadPages, 2500);
  }, []);

  return (
    <Suspense fallback={null}>
    <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/concerts" element={<Concerts />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/food" element={<Navigate to="/brunch" replace />} />
        <Route path="/arts" element={<Navigate to="/exhibitions" replace />} />
        <Route path="/meetups" element={<Navigate to="/conferences" replace />} />
        <Route path="/soirees" element={<Nightlife />} />
        <Route path="/evenements" element={<AllEvents />} />
        <Route path="/famille" element={<Family />} />
        <Route path="/conferences" element={<Conferences />} />
        <Route path="/workshops" element={<Workshops />} />
        <Route path="/festivals" element={<Festivals />} />
        <Route path="/shows" element={<Shows />} />
        <Route path="/exhibitions" element={<Exhibitions />} />
        <Route path="/brunch" element={<Brunch />} />
        <Route path="/religious" element={<Religious />} />
        <Route path="/autres" element={<Other />} />
        <Route path="/event/:id" element={<EventDetails />} />
        <Route path="/my-account" element={<MyAccount />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/manage-events" element={<ManageEvents />} />
        <Route path="/edit-event/:id" element={<EditEvent />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/edit-listing/:id" element={<EditListing />} />
        <Route path="/listing/:id" element={<ListingDetails />} />
        <Route path="/u/:id" element={<PublicProfile />} />
        <Route path="/notifications" element={<Notifications />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Sonner />
    <BrowserRouter future={{ v7_startTransition: true }}>
      <LanguageProvider>
      <AuthProvider>
        <SearchProvider>
          <NotificationProvider>
            <SplashScreenWrapper>
              <UpdateBanner />
              <NotificationPrompt />
              <InstallGuide />
              <AppContent />
              <HomeFab />
            </SplashScreenWrapper>
          </NotificationProvider>
        </SearchProvider>
      </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
