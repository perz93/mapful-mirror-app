import { Sparkles, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Festivals = () => {
  const events = [
    {
      id: 20,
      title: "Festival des Lumières",
      venue: "Centre-Ville",
      date: "Ven, 29 Nov",
      time: "18:00",
      price: "Gratuit",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=400&fit=crop"
    },
    {
      id: 21,
      title: "Festival International du Film",
      venue: "Cinéma Prestige",
      date: "Mer, 27 Nov",
      time: "19:30",
      price: "10 000 FCFA",
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=400&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 animate-fade-in">
      <div className="mx-auto max-w-md">
        <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-stone-900/80 border-b border-stone-200/50 dark:border-stone-800/50">
          <div className="flex items-center gap-4 px-4 py-4">
            <Link 
              to="/" 
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-900 text-stone-900 dark:text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md border border-stone-200/50 dark:border-stone-700/50"
            >
              <ArrowLeft size={20} strokeWidth={2} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-500/5">
                <Sparkles size={22} className="text-pink-500" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Festivals</h1>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-3">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/event/${event.id}`}
              className="block group"
            >
              <div className="overflow-hidden rounded-3xl bg-white dark:bg-stone-900 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border border-stone-200/50 dark:border-stone-800/50">
                <div 
                  className="h-44 bg-cover bg-center relative"
                  style={{ backgroundImage: `url('${event.image}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div className="flex-1">
                      <p className="text-white/90 text-xs font-medium mb-1">{event.venue}</p>
                      <h3 className="text-white text-lg font-bold leading-tight pr-2">{event.title}</h3>
                    </div>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-sm text-stone-900 text-xs font-semibold whitespace-nowrap">
                      {event.price}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center gap-4 text-stone-600 dark:text-stone-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} strokeWidth={2} />
                      <span className="text-xs font-medium">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} strokeWidth={2} />
                      <span className="text-xs font-medium">{event.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Festivals;
