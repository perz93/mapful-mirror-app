import { Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DirectionsButtonProps {
  latitude: number;
  longitude: number;
  label?: string;
  className?: string;
}

const DirectionsButton = ({ latitude, longitude, label = "Itinéraire", className }: DirectionsButtonProps) => {
  const handleClick = () => {
    const destination = `${latitude},${longitude}`;

    const openMaps = (origin?: string) => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      let url: string;

      if (isIOS) {
        // Apple Maps – uses current location automatically when no saddr
        url = origin
          ? `https://maps.apple.com/?saddr=${origin}&daddr=${destination}&dirflg=d`
          : `https://maps.apple.com/?daddr=${destination}&dirflg=d`;
      } else {
        url = origin
          ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
          : `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
      }
      window.open(url, '_blank');
    };

    if (!navigator.geolocation) {
      openMaps();
      return;
    }

    toast.loading('Récupération de votre position...', { id: 'geo' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss('geo');
        openMaps(`${pos.coords.latitude},${pos.coords.longitude}`);
      },
      () => {
        toast.dismiss('geo');
        toast.message('Position non disponible, ouverture de la carte sans point de départ');
        openMaps();
      },
      { timeout: 5000, enableHighAccuracy: false }
    );
  };

  return (
    <Button
      onClick={handleClick}
      className={`gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 ${className || ''}`}
    >
      <Navigation size={18} />
      {label}
    </Button>
  );
};

export default DirectionsButton;
