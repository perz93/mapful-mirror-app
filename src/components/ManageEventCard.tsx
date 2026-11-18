import ShimmerImage from './ShimmerImage';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Eye, EyeOff, MapPin } from 'lucide-react';
import { Event } from '@/hooks/useEvents';
import { softCase } from '@/lib/softCase';
import { dateRangeLabel, eventStatus } from '@/lib/eventStatus';
import { focusPosition } from '@/lib/imageFocus';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/PillToast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries();
      onDeleted(event.id);
    } catch (error) {
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
      queryClient.invalidateQueries();
      onUpdated();
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast.error(t('event.publishError'));
    }
  };

  const ended = eventStatus(event)?.key === 'status.ended';
  const iconBtn = 'inline-flex size-8 items-center justify-center rounded-full transition-transform active:scale-90';

  return (
    // Carte compacte : photo, statut et date, titre, lieu ; boutons ronds à droite
    <div className="card-shadow flex items-center gap-3 rounded-[24px] bg-parchment p-2 dark:bg-stone-900/80">
      <Link to={`/event/${event.id}`} className="flex min-w-0 flex-1 items-center gap-3 no-press">
        <ShimmerImage
          src={event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop'}
          position={focusPosition(event.image_focus)}
          alt=""
          className={`size-[84px] flex-shrink-0 rounded-[18px] ${ended ? 'grayscale-[.75]' : ''}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            {ended ? (
              <span className="inline-flex h-[22px] flex-shrink-0 items-center rounded-full bg-ink/85 px-2.5 text-[11px] font-semibold text-white">{t('status.ended')}</span>
            ) : !event.is_published ? (
              <span className="inline-flex h-[22px] flex-shrink-0 items-center rounded-full bg-stone-200 px-2.5 text-[11px] font-semibold text-stone-600">{t('event.unpublishedBadge')}</span>
            ) : (
              <span className="inline-flex flex-shrink-0 items-center gap-1.5 text-[11px] font-semibold text-ink">
                <span className="size-1.5 rounded-full bg-ink" />{t('manage.online')}
              </span>
            )}
            <span className="truncate text-[11.5px] font-semibold text-stone-500 tabular">
              {dateRangeLabel(event, 'fr', false)}{event.time ? ` · ${event.time.slice(0, 5)}` : ''}
            </span>
          </div>
          <p className={`mt-1 truncate font-display text-[16px] leading-tight tracking-tight text-ink dark:text-white ${ended ? 'opacity-55' : ''}`}>
            {softCase(event.title)}
          </p>
          <span className={`mt-1.5 inline-flex h-6 max-w-full items-center gap-1 rounded-full bg-ink/[0.05] px-2.5 text-[11.5px] font-medium text-stone-700 ${ended ? 'opacity-55' : ''}`}>
            <MapPin size={11} strokeWidth={2.4} className="flex-shrink-0" />
            <span className="truncate">{softCase(event.venue)}</span>
          </span>
        </div>
      </Link>

      <div className="flex flex-shrink-0 flex-col gap-1.5 pr-0.5">
        <Link to={`/edit-event/${event.id}`} aria-label={t('event.editBtn')} className={`${iconBtn} bg-lime text-ink`}>
          <Pencil size={14} strokeWidth={2} />
        </Link>
        {!ended && (
          <button
            onClick={handleTogglePublish}
            aria-label={event.is_published ? t('event.unpublishBtn') : t('event.publishBtn')}
            className={`${iconBtn} bg-canvas text-ink`}
          >
            {event.is_published ? <EyeOff size={14} strokeWidth={2} /> : <Eye size={14} strokeWidth={2} />}
          </button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button aria-label={t('delete')} className={`${iconBtn} bg-canvas text-ink`}>
              <Trash2 size={14} strokeWidth={2} />
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
  );
};

export default ManageEventCard;
