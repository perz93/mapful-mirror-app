import MapView from "@/components/MapView";
import SearchBar from "@/components/SearchBar";
import MapControls from "@/components/MapControls";
import EventCard from "@/components/EventCard";
import BottomNavigation from "@/components/BottomNavigation";
const Index = () => {
  return <div className="relative mx-auto flex h-screen max-w-md flex-col overflow-hidden bg-background animate-fade-in animate-zoom-smooth">
      <div className="relative flex-1 overflow-hidden">
        <MapView />
        <SearchBar />
        <MapControls />
        <EventCard />
      </div>
      <BottomNavigation />
    </div>;
};
export default Index;