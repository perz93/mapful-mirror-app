import MapView from "@/components/MapView";
import MapControls from "@/components/MapControls";
import EventCard from "@/components/EventCard";
import BottomNavigation from "@/components/BottomNavigation";
import TopMenu from "@/components/TopMenu";
import Landing from "@/pages/Landing";
import { useIsLanding } from "@/hooks/useIsLanding";

// Navigateur : page vitrine qui pousse à installer. App installée : la carte.
const Index = () => {
  const isLanding = useIsLanding();
  if (isLanding) return <Landing />;

  return (
    <div className="relative mx-auto flex h-screen max-w-md flex-col overflow-hidden bg-background">
      <div className="relative flex-1 overflow-hidden">
        <div className="h-full w-full page-enter">
          <MapView />
        </div>
        {/* Voile crème en dégradé derrière la carte d'événement et la barre du bas :
            elles restent lisibles quel que soit le fond de carte (modèle B) */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[5] mx-auto h-[360px] max-w-md"
          style={{ background: 'linear-gradient(to top, #f5f5eb 0%, rgb(245 245 235 / 0.93) 55%, rgb(245 245 235 / 0) 100%)' }}
        />
        <TopMenu />
        <MapControls />
        <EventCard />
      </div>
      <BottomNavigation className="my-0 py-0 pb-0 pt-[4px]" />
    </div>
  );
};

export default Index;
