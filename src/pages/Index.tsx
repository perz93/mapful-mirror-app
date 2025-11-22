import MapView from "@/components/MapView";
import SearchBar from "@/components/SearchBar";
import MapControls from "@/components/MapControls";
import EventCard from "@/components/EventCard";
import BottomNavigation from "@/components/BottomNavigation";
const Index = () => {
  return <div className="relative mx-auto flex h-screen max-w-md flex-col overflow-hidden bg-background">
      <div className="relative flex-1 overflow-hidden animate-fade-in animate-zoom-smooth">
        <MapView />
        <SearchBar />
        <MapControls />
        <EventCard />
      </div>
      <BottomNavigation className="my-0 py-0 pb-0 pt-[4px]" />
    </div>;
};
export default Index;