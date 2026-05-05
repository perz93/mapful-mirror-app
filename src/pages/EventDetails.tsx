import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Users, Share2, Heart, Flame } from 'lucide-react';
import { useAttendees } from '@/hooks/useAttendees';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import ContactFab from '@/components/ContactFab';
import ImageLightbox from '@/components/ImageLightbox';
import CountdownTimer from '@/components/CountdownTimer';
import HypeBar from '@/components/HypeBar';


const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) throw new Error('Event ID is required');
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Event not found');
      
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-stone-600 dark:text-stone-400">Chargement...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-stone-600 dark:text-stone-400 mb-4">Événement introuvable</p>
          <Link to="/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = format(new Date(event.date), "EEEE d MMMM yyyy", { locale: fr });
  const formattedTime = event.time.substring(0, 5);
  const keyPoints = event.key_points as string[] | null;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark animate-fade-in animate-zoom-smooth">
      <div className="mx-auto max-w-md">
        <div
          onClick={() => event.image_url && setLightboxOpen(true)}
          className="relative h-80 bg-cover bg-center rounded-3xl overflow-hidden mx-4 mt-4 cursor-zoom-in transition-transform active:scale-[0.99]"
          style={{
            backgroundImage: `url('${event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop'}')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
          
          <div className="absolute left-4 right-4 flex items-center justify-between" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(-1); }}
              className="w-11 h-11 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center hover:bg-black/90 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: event.title,
                      text: `${event.title} — ${formattedDate} à ${event.venue}`,
                      url: window.location.href,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Lien copié !');
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
              >
                <Share2 size={20} />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
                <Heart size={20} />
              </button>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-block px-3 py-1 rounded-full bg-primary text-white text-sm font-medium mb-2">
              {event.category}
            </span>
            <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Countdown Timer */}
          <CountdownTimer eventDate={event.date} eventTime={event.time} />

          {/* Hype Bar */}
          <div className="rounded-2xl bg-white dark:bg-stone-900 p-4 border border-stone-200/50 dark:border-stone-700/30 shadow-sm">
            <HypeBar eventId={event.id} maxCapacity={event.capacity || 50} />
          </div>

          <div className="space-y-4 rounded-md px-[3px] py-[10px] bg-orange-50">
            <div className="flex items-start gap-3 px-[9px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <MapPin size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-stone-900 dark:text-white italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>{event.venue}</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">{event.address || 'Adresse non spécifiée'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 my-0 mx-[9px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <Calendar size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 dark:text-white">{formattedDate}</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">{formattedTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 mx-[9px] py-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <Users size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 dark:text-white">
                  {event.capacity ? `${event.capacity} personnes` : 'Capacité illimitée'}
                </p>
              </div>
            </div>
          </div>

          {/* Key Points Section - Infographic Style */}
          {keyPoints && keyPoints.length > 0 && (() => {
            const stepColors = [
              { bg: 'bg-[#3B82F6]', text: 'text-[#3B82F6]', shadow: 'shadow-[#3B82F6]/30' },
              { bg: 'bg-[#F59E0B]', text: 'text-[#F59E0B]', shadow: 'shadow-[#F59E0B]/30' },
              { bg: 'bg-[#EF4444]', text: 'text-[#EF4444]', shadow: 'shadow-[#EF4444]/30' },
              { bg: 'bg-[#10B981]', text: 'text-[#10B981]', shadow: 'shadow-[#10B981]/30' },
              { bg: 'bg-[#8B5CF6]', text: 'text-[#8B5CF6]', shadow: 'shadow-[#8B5CF6]/30' },
            ];
            return (
              <div className="border-t border-stone-200 dark:border-stone-800 pt-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-300 dark:to-stone-700" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                    Points clés
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-300 dark:to-stone-700" />
                </div>

                <div className="relative">
                  {/* Vertical connecting line */}
                  <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-stone-200 via-stone-300 to-stone-200 dark:from-stone-800 dark:via-stone-700 dark:to-stone-800" />

                  <ul className="space-y-5">
                    {keyPoints.map((point, index) => {
                      const color = stepColors[index % stepColors.length];
                      return (
                        <li key={index} className="group relative flex items-center gap-4">
                          {/* Circle with number */}
                          <div className={`relative flex-shrink-0 w-14 h-14 rounded-full ${color.bg} flex items-center justify-center shadow-lg ${color.shadow} ring-4 ring-white dark:ring-background-dark transition-transform group-hover:scale-110`}>
                            <span className="text-white font-bold text-lg">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>

                          {/* Content card */}
                          <div className="flex-1 relative">
                            {/* Connector dot */}
                            <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${color.bg}`} />
                            <div className="bg-white dark:bg-stone-900 rounded-xl px-4 py-3 shadow-sm border border-stone-100 dark:border-stone-800 transition-all group-hover:shadow-md group-hover:border-stone-200 dark:group-hover:border-stone-700">
                              <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${color.text} mb-1`}>
                                Étape {String(index + 1).padStart(2, '0')}
                              </p>
                              <p className="text-stone-800 dark:text-stone-200 text-sm leading-relaxed font-medium">
                                {point}
                              </p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })()}

          {event.description && (
            <div className="border-t border-stone-200 dark:border-stone-800 pt-6">
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3 italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>À propos de cet événement</h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed italic font-semibold" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                {event.description}
              </p>
            </div>
          )}

          <div className="border-t border-stone-200 dark:border-stone-800 pt-6 pb-20">
            <GoingSection eventId={event.id} />
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  {event.is_paid ? 'Prix' : 'Entrée'}
                </p>
                <p className="text-3xl font-bold text-stone-900 dark:text-white">
                  {event.is_paid && event.price ? `${event.price} FCFA` : 'Gratuit'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContactFab
        contactPhone={event.contact_phone}
        contactWhatsapp={event.contact_whatsapp}
        contactInstagram={event.contact_instagram}
        contactFacebook={event.contact_facebook}
        contactTwitter={event.contact_twitter}
      />

      {event.image_url && (
        <ImageLightbox
          src={event.image_url}
          alt={event.title}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

const GoingSection = ({ eventId }: { eventId: string }) => {
  const { isGoing, count, toggleGoing } = useAttendees(eventId);

  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#ee9d2b]/5 border border-[#ee9d2b]/15 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ee9d2b]/10">
          <Flame size={20} className="text-[#ee9d2b]" />
        </div>
        <div>
          <p className="text-sm font-bold text-stone-900 dark:text-white">{count} personnes y vont</p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">Montre que tu seras là !</p>
        </div>
      </div>
      <button
        onClick={toggleGoing}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
          isGoing
            ? 'bg-[#ee9d2b] text-white shadow-md'
            : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-[#ee9d2b]/50'
        }`}
      >
        {isGoing ? "J'y vais !" : "J'y vais"}
      </button>
    </div>
  );
};

export default EventDetails;
