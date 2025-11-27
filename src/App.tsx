import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SearchProvider } from "@/contexts/SearchContext";
import Index from "./pages/Index";
import Concerts from "./pages/Concerts";
import Sports from "./pages/Sports";
import Food from "./pages/Food";
import Arts from "./pages/Arts";
import Meetups from "./pages/Meetups";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
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
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
          </Routes>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
