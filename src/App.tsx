import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Concerts from "./pages/Concerts";
import Sports from "./pages/Sports";
import Food from "./pages/Food";
import Arts from "./pages/Arts";
import EventDetails from "./pages/EventDetails";
import MyAccount from "./pages/MyAccount";
import CreateEvent from "./pages/CreateEvent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/concerts" element={<Concerts />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/food" element={<Food />} />
          <Route path="/arts" element={<Arts />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/create-event" element={<CreateEvent />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
