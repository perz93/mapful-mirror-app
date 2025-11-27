import { ArrowLeft, MapPin, Calendar, Clock, Users, Share2, Heart, Ticket } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
const EventDetails = () => {
  const { id } = useParams();

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
  return <div className="min-h-screen bg-background-light dark:bg-background-dark animate-fade-in animate-zoom-smooth">
      <div className="mx-auto max-w-md">
        <div className="relative h-80 bg-cover bg-center rounded-3xl overflow-hidden mx-4 mt-4" style={{
        backgroundImage: `url('${event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop'}')`
      }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
          
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <Link 
              to="/" 
              className="w-11 h-11 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center hover:bg-black/90 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div className="flex gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
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
          <div className="space-y-4 rounded-md px-[3px] py-[10px] bg-orange-50">
            <div className="flex items-start gap-3 px-[9px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <MapPin size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 dark:text-white">{event.venue}</p>
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

          {event.description && (
            <div className="border-t border-stone-200 dark:border-stone-800 pt-6">
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">À propos de cet événement</h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          <div className="border-t border-stone-200 dark:border-stone-800 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  {event.is_paid ? 'Prix' : 'Entrée'}
                </p>
                <p className="text-3xl font-bold text-stone-900 dark:text-white">
                  {event.is_paid && event.price ? `${event.price} FCFA` : 'Gratuit'}
                </p>
              </div>
            </div>
            
            <Button className="w-full h-12 text-base font-semibold">
              Contacter
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default EventDetails;