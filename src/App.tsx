import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationPrompt from "@/components/NotificationPrompt";
import InstallGuide from "@/components/InstallGuide";
import SplashScreenWrapper from "@/components/SplashScreen";
import { useStatusBarColor } from "@/hooks/useStatusBarColor";
import { usePWATheme } from "@/hooks/usePWATheme";
import { useProximityNotifications } from "@/hooks/useProximityNotifications";
import { useBadgeCount } from "@/hooks/useBadgeCount";

// Keep Index eager — it's the landing page
import Index from "./pages/Index";

// Lazy load all other pages
const Concerts = lazy(() => import("./pages/Concerts"));
const Sports = lazy(() => import("./pages/Sports"));
const Food = lazy(() => import("./pages/Food"));
const Arts = lazy(() => import("./pages/Arts"));
const Meetups = lazy(() => import("./pages/Meetups"));
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

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
    <div className="w-8 h-8 border-3 border-[#ee9d2b] border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppContent = () => {
  useStatusBarColor();
  usePWATheme();
  useProximityNotifications();
  useBadgeCount();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/concerts" element={<Concerts />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/food" element={<Food />} />
          <Route path="/arts" element={<Arts />} />
          <Route path="/meetups" element={<Meetups />} />
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
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
          <NotificationProvider>
            <SplashScreenWrapper>
              <NotificationPrompt />
              <InstallGuide />
              <AppContent />
            </SplashScreenWrapper>
          </NotificationProvider>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
