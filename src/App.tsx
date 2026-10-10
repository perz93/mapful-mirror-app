import { lazy, Suspense, useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NotificationPrompt from "@/components/NotificationPrompt";
import UpdateBanner from "@/components/UpdateBanner";
import SplashScreenWrapper from "@/components/SplashScreen";
import { useStatusBarColor } from "@/hooks/useStatusBarColor";
import { usePWATheme } from "@/hooks/usePWATheme";
import { useProximityNotifications } from "@/hooks/useProximityNotifications";
import { useNotificationSync } from "@/hooks/useNotificationInbox";
import Index from "./pages/Index";

// Guide d'installation : affiché une seule fois, inutile de le charger avec l'accueil
const InstallGuide = lazy(() => import("@/components/InstallGuide"));

// Pages chargées à la demande : la carte (accueil) s'ouvre sans attendre le reste.
const Concerts = lazy(() => import("./pages/Concerts"));
const Sports = lazy(() => import("./pages/Sports"));
const Nightlife = lazy(() => import("./pages/Nightlife"));
const AllEvents = lazy(() => import("./pages/AllEvents"));
const Family = lazy(() => import("./pages/Family"));
const Conferences = lazy(() => import("./pages/Conferences"));
const Workshops = lazy(() => import("./pages/Workshops"));
const Festivals = lazy(() => import("./pages/Festivals"));
const Shows = lazy(() => import("./pages/Shows"));
const Exhibitions = lazy(() => import("./pages/Exhibitions"));
const Brunch = lazy(() => import("./pages/Brunch"));
const Religious = lazy(() => import("./pages/Religious"));
const EventDetails = lazy(() => import("./pages/EventDetails"));
const MyAccount = lazy(() => import("./pages/MyAccount"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const ManageEvents = lazy(() => import("./pages/ManageEvents"));
const EditEvent = lazy(() => import("./pages/EditEvent"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const CreateListing = lazy(() => import("./pages/CreateListing"));
const EditListing = lazy(() => import("./pages/EditListing"));
const ListingDetails = lazy(() => import("./pages/ListingDetails"));
const Notifications = lazy(() => import("./pages/Notifications"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));

const queryClient = new QueryClient();

const AppContent = () => {
  useStatusBarColor();
  usePWATheme();
  useProximityNotifications();
  useNotificationSync();

  // Une fois l'accueil affiché, on précharge en tâche de fond les pages les plus
  // ouvertes : la navigation reste instantanée malgré le découpage.
  useEffect(() => {
    const prefetch = () => {
      import("./pages/EventDetails");
      import("./pages/AllEvents");
      import("./pages/Marketplace");
      import("./pages/MyAccount");
      import("./pages/Notifications");
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const id = w.requestIdleCallback ? w.requestIdleCallback(prefetch) : window.setTimeout(prefetch, 2500);
    return () => { if (!w.requestIdleCallback) clearTimeout(id); };
  }, []);

  return (
    <Suspense fallback={<div className="min-h-screen bg-parchment" />}>
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
    <BrowserRouter>
      <LanguageProvider>
      <AuthProvider>
        <SearchProvider>
          <NotificationProvider>
            <SplashScreenWrapper>
              <UpdateBanner />
              <NotificationPrompt />
              <Suspense fallback={null}><InstallGuide /></Suspense>
              <AppContent />
            </SplashScreenWrapper>
          </NotificationProvider>
        </SearchProvider>
      </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
