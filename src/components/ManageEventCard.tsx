import { format } from 'date-fns';
import ShimmerImage from './ShimmerImage';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Event } from '@/hooks/useEvents';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/PillToast';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
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

      toast.success(t('event.deleted'));
      onDeleted(event.id);
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error(t('event.deleteError'));
    }
  };

  const handleTogglePublish = async () => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_published: !event.is_published })
        .eq('id', event.id);

      if (error) throw error;

      toast.success(event.is_published ? t('event.unpublished') : t('event.published'));
      onUpdated();
    } catch (error: any) {
      console.error('Error toggling publish:', error);
      toast.error(t('event.publishError'));
    }
  };

  return (
    <div className="w-full pointer-events-auto touch-auto">
      <div className="flex items-stretch justify-between gap-3 rounded-3xl bg-white dark:bg-stone-900/80 p-4 shadow-2xl">
        <div className="flex flex-col justify-between gap-2 flex-[2_2_0px]">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <p className="text-stone-900 dark:text-white text-sm font-bold leading-tight">
                {event.title}
              </p>
              {!event.is_published && (
                <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                  {t('event.unpublishedBadge')}
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
              className="inline-flex items-center justify-center gap-1.5 rounded-full h-8 px-3.5 bg-lime text-ink text-xs font-medium hover:bg-lime-deep transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{t('event.editBtn')}</span>
            </Link>
            
            <button
              onClick={handleTogglePublish}
              className="inline-flex items-center justify-center gap-1.5 rounded-full h-8 px-3.5 bg-parchment text-ink text-xs font-medium hover:bg-stone-200 transition-colors"
            >
              {event.is_published ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{t('event.unpublishBtn')}</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{t('event.publishBtn')}</span>
                </>
              )}
            </button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="inline-flex items-center justify-center rounded-full size-8 bg-parchment text-ink hover:bg-destructive hover:text-white transition-colors">
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('event.deleteConfirm')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('event.deleteConfirmDesc')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>{t('delete')}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <ShimmerImage
          src={event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop'}
          alt=""
          className="w-20 h-20 flex-shrink-0 rounded-2xl"
        />
      </div>
    </div>
  );
};

export default ManageEventCard;
