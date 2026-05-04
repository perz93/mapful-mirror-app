import MapView from "@/components/MapView";
import MapControls from "@/components/MapControls";
import EventCard from "@/components/EventCard";
import BottomNavigation from "@/components/BottomNavigation";
import TopMenu from "@/components/TopMenu";
import TonightSection from "@/components/TonightSection";

const Index = () => {
  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-md flex-col overflow-hidden bg-[#e8e4d8]">
      <div className="relative flex-1 overflow-hidden">
        <div className="h-full w-full animate-fade-in animate-zoom-smooth">
          <MapView />
        </div>
        <TopMenu />
        <MapControls />
        <TonightSection />
        <EventCard />
      </div>
      <BottomNavigation className="my-0 py-0 pb-0 pt-[4px]" />
    </div>
  );
};

export default Index;