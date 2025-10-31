import { ArrowLeft, MapPin, Calendar, Clock, Users, Share2, Heart, Ticket } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const EventDetails = () => {
  const { id } = useParams();

  const event = {
    title: "Indie Music Festival",
    venue: "Central Park",
    address: "Central Park, New York, NY 10024",
    date: "Saturday, November 16, 2024",
    time: "8:00 PM - 11:30 PM",
    price: "$45",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop",
    description: "Experience an unforgettable evening of indie music featuring local and international artists. This festival brings together the best emerging talents in the indie music scene for a night of incredible performances under the stars.",
    highlights: [
      "Live performances from 8 indie bands",
      "Food trucks and craft beverages",
      "Outdoor seating with stunning park views",
      "Meet & greet with artists after the show"
    ],
    capacity: "500 attendees",
    organizer: "NYC Live Events",
    category: "Music"
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="mx-auto max-w-md">
        <div 
          className="relative h-80 bg-cover bg-center rounded-3xl overflow-hidden mx-4 mt-4"
          style={{ backgroundImage: `url('${event.image}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
          
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <Link 
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
            >
              <ArrowLeft size={20} />
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
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <MapPin size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 dark:text-white">{event.venue}</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">{event.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <Calendar size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 dark:text-white">{event.date}</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">{event.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <Users size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 dark:text-white">{event.capacity}</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">Organized by {event.organizer}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-200 dark:border-stone-800 pt-6">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">About This Event</h2>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="border-t border-stone-200 dark:border-stone-800 pt-6">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">Event Highlights</h2>
            <ul className="space-y-2">
              {event.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-stone-600 dark:text-stone-400">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-stone-200 dark:border-stone-800 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">Price per ticket</p>
                <p className="text-3xl font-bold text-stone-900 dark:text-white">{event.price}</p>
              </div>
            </div>
            
            <Button className="w-full h-12 text-base font-semibold">
              <Ticket size={20} className="mr-2" />
              Get Tickets
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
