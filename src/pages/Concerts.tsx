import { Music, MapPin, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Concerts = () => {
  const concerts = [
    {
      id: 1,
      title: "Indie Music Festival",
      venue: "Central Park",
      date: "Sat, Nov 16",
      time: "8:00 PM",
      price: "$45",
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop"
    },
    {
      id: 2,
      title: "Jazz Night Live",
      venue: "Blue Note",
      date: "Fri, Nov 15",
      time: "9:30 PM",
      price: "$35",
      image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop"
    },
    {
      id: 3,
      title: "Rock Legends Tour",
      venue: "Madison Square Garden",
      date: "Sun, Nov 17",
      time: "7:00 PM",
      price: "$85",
      image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=400&fit=crop"
    },
    {
      id: 4,
      title: "Electronic Vibes",
      venue: "Brooklyn Warehouse",
      date: "Sat, Nov 16",
      time: "11:00 PM",
      price: "$55",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop"
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
                <Music size={20} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Concerts</h1>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-4">
          {concerts.map((concert) => (
            <Link
              key={concert.id}
              to={`/event/${concert.id}`}
              className="block group"
            >
              <div className="overflow-hidden rounded-2xl bg-white dark:bg-stone-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in">
                <div 
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url('${concert.image}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary text-white text-sm font-medium">
                      {concert.price}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white group-hover:text-primary transition-colors">
                    {concert.title}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                      <MapPin size={16} />
                      <span className="text-sm">{concert.venue}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                        <Calendar size={16} />
                        <span className="text-sm">{concert.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                        <Clock size={16} />
                        <span className="text-sm">{concert.time}</span>
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

export default Concerts;
