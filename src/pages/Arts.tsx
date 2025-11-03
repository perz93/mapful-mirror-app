import { Palette, MapPin, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Arts = () => {
  const events = [
    {
      id: 11,
      title: "Modern Art Exhibition",
      venue: "MoMA",
      date: "Daily",
      time: "10:00 AM - 6:00 PM",
      price: "$25",
      image: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=400&h=400&fit=crop"
    },
    {
      id: 12,
      title: "Broadway Show: Hamilton",
      venue: "Richard Rodgers Theatre",
      date: "Wed, Nov 20",
      time: "8:00 PM",
      price: "$180",
      image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=400&h=400&fit=crop"
    },
    {
      id: 13,
      title: "Photography Workshop",
      venue: "Chelsea Art Studio",
      date: "Sun, Nov 24",
      time: "2:00 PM",
      price: "$45",
      image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=400&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark animate-fade-in">
      <div className="mx-auto max-w-md animate-zoom-smooth">
        <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-4 px-4 py-4">
            <Link to="/" className="text-stone-900 dark:text-white hover:opacity-70 transition-opacity">
              <ArrowLeft size={24} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Palette size={20} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Arts & Culture</h1>
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
              <div className="overflow-hidden rounded-2xl bg-white dark:bg-stone-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in">
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

export default Arts;
