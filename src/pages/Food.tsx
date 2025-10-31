import { Utensils, MapPin, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Food = () => {
  const events = [
    {
      id: 8,
      title: "Street Food Festival",
      venue: "Brooklyn Bridge Park",
      date: "Sat, Nov 16",
      time: "12:00 PM",
      price: "Free",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop"
    },
    {
      id: 9,
      title: "Wine Tasting Evening",
      venue: "Tribeca Wine Bar",
      date: "Fri, Nov 22",
      time: "7:00 PM",
      price: "$65",
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop"
    },
    {
      id: 10,
      title: "Chef's Dinner Experience",
      venue: "The Modern",
      date: "Sat, Nov 23",
      time: "8:00 PM",
      price: "$150",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="mx-auto max-w-md">
        <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-4 px-4 py-4">
            <Link to="/" className="text-stone-900 dark:text-white hover:opacity-70 transition-opacity">
              <ArrowLeft size={24} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Utensils size={20} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Food & Dining</h1>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-4">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/event/${event.id}`}
              className="block group"
            >
              <div className="overflow-hidden rounded-2xl bg-white dark:bg-stone-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div 
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url('${event.image}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary text-white text-sm font-medium">
                      {event.price}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                      <MapPin size={16} />
                      <span className="text-sm">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                        <Calendar size={16} />
                        <span className="text-sm">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                        <Clock size={16} />
                        <span className="text-sm">{event.time}</span>
                      </div>
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
