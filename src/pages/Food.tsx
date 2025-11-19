import { Utensils, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Food = () => {
  const events = [
    {
      id: 8,
      title: "Festival Street Food",
      venue: "Parc de la Marina",
      date: "Sam, 16 Nov",
      time: "12:00",
      price: "Gratuit",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop"
    },
    {
      id: 9,
      title: "Soirée Dégustation de Vins",
      venue: "Wine Bar Plateau",
      date: "Ven, 22 Nov",
      time: "19:00",
      price: "8 000 FCFA",
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop"
    },
    {
      id: 10,
      title: "Dîner du Chef",
      venue: "Restaurant Le Moderne",
      date: "Sam, 23 Nov",
      time: "20:00",
      price: "35 000 FCFA",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 animate-fade-in">
      <div className="mx-auto max-w-md">
        <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-stone-900/80 border-b border-stone-200/50 dark:border-stone-800/50">
          <div className="flex items-center gap-4 px-4 py-4">
            <Link to="/" className="text-stone-900 dark:text-white hover:opacity-70 transition-opacity">
              <ArrowLeft size={24} strokeWidth={1.5} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5">
                <Utensils size={22} className="text-red-500" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Restauration</h1>
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

export default Food;
