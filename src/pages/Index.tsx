import MapView from "@/components/MapView";
import MapControls from "@/components/MapControls";
import EventCard from "@/components/EventCard";
import BottomNavigation from "@/components/BottomNavigation";
import TopMenu from "@/components/TopMenu";
import TonightSection from "@/components/TonightSection";

const Index = () => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#e8e4d8]" style={{ top: 0, bottom: 0, left: 0, right: 0, height: '100%', minHeight: '-webkit-fill-available' }}>
      <div className="absolute inset-0">
        <MapView />
      </div>
      <TopMenu />
      <MapControls />
      <TonightSection />
      <EventCard />
      <BottomNavigation />
    </div>
  );
};

export default Index;
