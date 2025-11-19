import { Music, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Concerts = () => {
  const concerts = [
    {
      id: 1,
      title: "Festival de Musique Indie",
      venue: "Central Park",
      date: "Sam, 16 Nov",
      time: "20:00",
      price: "15 000 FCFA",
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop"
    },
    {
      id: 2,
      title: "Soirée Jazz Live",
      venue: "Blue Note",
      date: "Ven, 15 Nov",
      time: "21:30",
      price: "12 000 FCFA",
      image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop"
    },
    {
      id: 3,
      title: "Tournée Légendes Rock",
      venue: "Stade Municipal",
      date: "Dim, 17 Nov",
      time: "19:00",
      price: "25 000 FCFA",
      image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=400&fit=crop"
    },
    {
      id: 4,
      title: "Soirée Électro",
      venue: "Warehouse Brooklyn",
      date: "Sam, 16 Nov",
      time: "23:00",
      price: "18 000 FCFA",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop"
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
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                <Music size={22} className="text-orange-500" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Concerts</h1>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-3">
          {concerts.map((concert) => (
            <Link
              key={concert.id}
              to={`/event/${concert.id}`}
              className="block group"
            >
              <div className="overflow-hidden rounded-3xl bg-white dark:bg-stone-900 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border border-stone-200/50 dark:border-stone-800/50">
                <div 
                  className="h-44 bg-cover bg-center relative"
                  style={{ backgroundImage: `url('${concert.image}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div className="flex-1">
                      <p className="text-white/90 text-xs font-medium mb-1">{concert.venue}</p>
                      <h3 className="text-white text-lg font-bold leading-tight pr-2">{concert.title}</h3>
                    </div>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-sm text-stone-900 text-xs font-semibold whitespace-nowrap">
                      {concert.price}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center gap-4 text-stone-600 dark:text-stone-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} strokeWidth={2} />
                      <span className="text-xs font-medium">{concert.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} strokeWidth={2} />
                      <span className="text-xs font-medium">{concert.time}</span>
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

export default Concerts;
