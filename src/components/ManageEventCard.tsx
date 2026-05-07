import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Event } from '@/hooks/useEvents';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ManageEventCardProps {
  event: Event;
  onDeleted: (eventId: string) => void;
  onUpdated: () => void;
}

const ManageEventCard = ({ event, onDeleted, onUpdated }: ManageEventCardProps) => {
  const formatEventDate = (date: string, time: string) => {
    const eventDate = new Date(date);
    const [hours] = time.split(':');
    return `${format(eventDate, 'EEE, d MMM', { locale: fr })} • ${hours}h00`;
  };

  const handleDelete = async () => {
    try {
      // Delete event image if exists
      if (event.image_url) {
        const imagePath = event.image_url.split('/').slice(-2).join('/');
        await supabase.storage
          .from('event-images')
          .remove([imagePath]);
      }

      // Delete event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      toast.success('Événement supprimé');
      onDeleted(event.id);
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleTogglePublish = async () => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_published: !event.is_published })
        .eq('id', event.id);

      if (error) throw error;

      toast.success(event.is_published ? 'Événement dépublié' : 'Événement publié');
      onUpdated();
    } catch (error: any) {
      console.error('Error toggling publish:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  return (
    <div className="w-full pointer-events-auto touch-auto">
      <div className="flex items-stretch justify-between gap-3 rounded-2xl backdrop-blur-2xl bg-white/80 dark:bg-stone-900/80 p-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] border border-white/60 dark:border-stone-700/30">
        <div className="flex flex-col justify-between gap-2 flex-[2_2_0px]">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <p className="text-stone-900 dark:text-white text-sm font-bold leading-tight">
                {event.title}
              </p>
              {!event.is_published && (
                <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                  Non publié
                </span>
              )}
            </div>
            <p className="text-stone-500 dark:text-stone-400 text-xs font-normal leading-normal">
              {event.venue}
            </p>
            <p className="text-stone-500 dark:text-stone-400 text-xs font-normal leading-normal">
              {formatEventDate(event.date, event.time)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              to={`/edit-event/${event.id}`}
              className="flex items-center justify-center gap-1 rounded-full h-7 px-3 bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all"
            >
              <Pencil className="w-3 h-3" />
              <span>Modifier</span>
            </Link>
            
            <button
              onClick={handleTogglePublish}
              className="flex items-center justify-center gap-1 rounded-full h-7 px-3 bg-secondary text-secondary-foreground text-xs font-medium hover:opacity-90 transition-all"
            >
              {event.is_published ? (
                <>
                  <EyeOff className="w-3 h-3" />
                  <span>Dépublier</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  <span>Publier</span>
                </>
              )}
            </button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center justify-center rounded-full h-7 w-7 bg-destructive text-destructive-foreground hover:opacity-90 transition-all">
                  <Trash2 className="w-3 h-3" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer l'événement ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. L'événement sera définitivement supprimé.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div 
          style={{
            backgroundImage: event.image_url ? `url('${event.image_url}')` : "url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop')"
          }} 
          className="w-20 h-20 flex-shrink-0 bg-center bg-no-repeat bg-cover rounded" 
        />
      </div>
    </div>
  );
};

export default ManageEventCard;
