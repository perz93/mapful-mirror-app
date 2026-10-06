import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NotificationPrompt from "@/components/NotificationPrompt";
import InstallGuide from "@/components/InstallGuide";
import UpdateBanner from "@/components/UpdateBanner";
import SplashScreenWrapper from "@/components/SplashScreen";
import { useStatusBarColor } from "@/hooks/useStatusBarColor";
import { usePWATheme } from "@/hooks/usePWATheme";
import { useProximityNotifications } from "@/hooks/useProximityNotifications";
import { useBadgeCount } from "@/hooks/useBadgeCount";
import Index from "./pages/Index";
import Concerts from "./pages/Concerts";
import Sports from "./pages/Sports";
import Nightlife from "./pages/Nightlife";
import AllEvents from "./pages/AllEvents";
import Family from "./pages/Family";
import Conferences from "./pages/Conferences";
import Workshops from "./pages/Workshops";
import Festivals from "./pages/Festivals";
import Shows from "./pages/Shows";
import Exhibitions from "./pages/Exhibitions";
import Brunch from "./pages/Brunch";
import Religious from "./pages/Religious";
import EventDetails from "./pages/EventDetails";
import MyAccount from "./pages/MyAccount";
import CreateEvent from "./pages/CreateEvent";
import ManageEvents from "./pages/ManageEvents";
import EditEvent from "./pages/EditEvent";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Marketplace from "./pages/Marketplace";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import ListingDetails from "./pages/ListingDetails";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

// Voile sombre sous la barre d'état (iOS teinte son flou avec ce qui touche le
// haut de l'écran) — partout sauf sur la carte.
const StatusBarScrim = () => {
  const { pathname } = useLocation();
  if (pathname === '/') return null;
  return <div aria-hidden className="status-bar-scrim" />;
};

const AppContent = () => {
  useStatusBarColor();
  usePWATheme();
  useProximityNotifications();
  useBadgeCount();

  return (
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
        <Route path="/notifications" element={<Notifications />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
    </Routes>
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
              <StatusBarScrim />
              <UpdateBanner />
              <NotificationPrompt />
              <InstallGuide />
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
