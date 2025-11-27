import MapView from "@/components/MapView";
import MapControls from "@/components/MapControls";
import EventCard from "@/components/EventCard";
import BottomNavigation from "@/components/BottomNavigation";
import TopMenu from "@/components/TopMenu";

const Index = () => {
  return (
    <div className="relative mx-auto flex h-screen max-w-md flex-col overflow-hidden bg-background">
      {/* Gradient overlay for status bar compensation */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/80 via-white/40 to-transparent z-[1] pointer-events-none" />
      
      <div className="relative flex-1 overflow-hidden">
        <div className="h-full w-full animate-fade-in animate-zoom-smooth">
          <MapView />
        </div>
        <TopMenu />
        <MapControls />
        <EventCard />
      </div>
      <BottomNavigation className="my-0 py-0 pb-0 pt-[4px]" />
    </div>
  );
};

export default Index;