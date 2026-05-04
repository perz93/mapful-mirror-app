import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Clock, Users, Image as ImageIcon, DollarSign, ArrowLeft, Loader2, Phone, Instagram, Facebook, Twitter, MessageCircle, Plus, X, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import mapBackground from '@/assets/map-background.jpg';
import { supabase } from '@/integrations/supabase/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import category icons
import atelierIcon from '@/assets/icons/atelier.png';
import brunchIcon from '@/assets/icons/brunch.png';
import concertIcon from '@/assets/icons/concert.png';
import conferenceIcon from '@/assets/icons/conference.png';
import expositionIcon from '@/assets/icons/exposition.png';
import festivalIcon from '@/assets/icons/festival.png';
import meetupIcon from '@/assets/icons/meetup.png';
import religieuxIcon from '@/assets/icons/religieux.png';
import spectacleIcon from '@/assets/icons/spectacle.png';
import sportIcon from '@/assets/icons/sport.png';

const categoryIcons: Record<string, string> = {
  workshops: atelierIcon,
  brunch: brunchIcon,
  music: concertIcon,
  conferences: conferenceIcon,
  exhibitions: expositionIcon,
  festivals: festivalIcon,
  meetups: meetupIcon,
  religious: religieuxIcon,
  shows: spectacleIcon,
  sports: sportIcon,
};

const inputClass = "h-11 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#ee9d2b]/30";
const labelClass = "text-sm text-white/70 font-normal";
const cardClass = "rounded-2xl backdrop-blur-2xl bg-white/10 border border-white/15 p-5 space-y-4";
const sectionTitleClass = "text-lg italic text-white mb-4 flex items-center gap-2";

const CreateEvent = () => {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour créer un événement.",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, loading, navigate, toast]);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    address: '',
    date: '',
    time: '',
    price: '',
    capacity: '',
    description: '',
    contactPhone: '',
    contactWhatsapp: '',
    contactInstagram: '',
    contactFacebook: '',
    contactTwitter: ''
  });

  const [keyPoints, setKeyPoints] = useState<string[]>(['']);

  const addKeyPoint = () => {
    if (keyPoints.length < 5) {
      setKeyPoints([...keyPoints, '']);
    }
  };

  const updateKeyPoint = (index: number, value: string) => {
    const updated = [...keyPoints];
    updated[index] = value;
    setKeyPoints(updated);
  };

  const removeKeyPoint = (index: number) => {
    if (keyPoints.length > 1) {
      setKeyPoints(keyPoints.filter((_, i) => i !== index));
    }
  };

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: 5.3600, lng: -4.0083 });
  const [geocoding, setGeocoding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image valide",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 5 MB",
        variant: "destructive"
      });
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Initialize map
  useEffect(() => {
    // Delay map initialization to ensure container is rendered
    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      try {
        mapRef.current = L.map(mapContainerRef.current).setView([5.3600, -4.0083], 12);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 20,
        }).addTo(mapRef.current);

        // Add initial marker
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="width: 40px; height: 40px; background: #ef4444; border: 3px solid white; border-radius: 50%; cursor: move; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        markerRef.current = L.marker([5.3600, -4.0083], {
          icon: customIcon,
          draggable: true
        }).addTo(mapRef.current);

        markerRef.current.on('dragend', () => {
          const position = markerRef.current?.getLatLng();
          if (position) {
            setCoordinates({ lat: position.lat, lng: position.lng });
          }
        });

        // Force map to resize
        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 100);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Add "Abidjan, Côte d'Ivoire" if not already included to improve geocoding accuracy
      const query = address.toLowerCase().includes('abidjan') || address.toLowerCase().includes('ivoire')
        ? address
        : `${address}, Abidjan, Côte d'Ivoire`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Geocode when address changes
  useEffect(() => {
    const geocodeTimeout = setTimeout(async () => {
      if (formData.address) {
        setGeocoding(true);
        const coords = await geocodeAddress(formData.address);
        if (coords && mapRef.current && markerRef.current) {
          setCoordinates(coords);
          markerRef.current.setLatLng([coords.lat, coords.lng]);
          mapRef.current.setView([coords.lat, coords.lng], 15);
        }
        setGeocoding(false);
      }
    }, 1000); // Debounce

    return () => clearTimeout(geocodeTimeout);
  }, [formData.address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer un événement",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Use coordinates from map marker (already initialized with Dakar center)
      let imageUrl = null;

      // Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Insert event into database
      // Filter out empty key points
      const validKeyPoints = keyPoints.filter(kp => kp.trim() !== '');

      const { error: insertError } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          category: formData.category,
          venue: formData.address,
          address: formData.address,
          date: formData.date,
          time: formData.time,
          price: formData.price ? parseFloat(formData.price) : null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          description: formData.description || null,
          image_url: imageUrl,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          is_paid: formData.price ? parseFloat(formData.price) > 0 : false,
          is_published: true,
          user_id: user.id,
          contact_phone: formData.contactPhone || null,
          contact_whatsapp: formData.contactWhatsapp || null,
          contact_instagram: formData.contactInstagram || null,
          contact_facebook: formData.contactFacebook || null,
          contact_twitter: formData.contactTwitter || null,
          key_points: validKeyPoints.length > 0 ? validKeyPoints : null
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Événement créé !",
        description: "Votre événement a été publié avec succès."
      });

      // Reset form
      setFormData({
        title: '',
        category: '',
        address: '',
        date: '',
        time: '',
        price: '',
        capacity: '',
        description: '',
        contactPhone: '',
        contactWhatsapp: '',
        contactInstagram: '',
        contactFacebook: '',
        contactTwitter: ''
      });
      setKeyPoints(['']);
      setImageFile(null);
      setImagePreview(null);

      // Navigate to home
      navigate('/');

    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'événement",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen pb-32 animate-fade-in animate-zoom-smooth">
      {/* Static Map Background */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={mapBackground}
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      {/* Dark Overlay with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl pointer-events-none" />

      {/* Content */}
      <div className="relative mx-auto max-w-md">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-10">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md shadow-[0_8px_24px_-6px_rgba(0,0,0,0.25)] hover:scale-105 active:scale-95 transition-all mb-8"
          >
            <ArrowLeft className="w-5 h-5 text-stone-900 dark:text-white" />
          </Link>
          <h1 className="text-4xl italic text-white mb-3 text-center" style={{ fontFamily: '"Source Serif 4", serif' }}>
            Créer un événement
          </h1>
          <p className="text-white/60 font-light text-center">Partagez votre événement avec la communauté</p>
        </div>

        {/* Form Cards */}
        <div className="px-4 sm:px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload Card */}
            <div className={cardClass}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-white/20 rounded-2xl p-8 hover:border-white/40 transition-colors cursor-pointer bg-white/5"
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm">Cliquez pour changer</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <ImageIcon className="h-10 w-10 text-[#ee9d2b] mb-4" strokeWidth={1.5} />
                    <h3 className="font-light text-white mb-1">Ajouter une image</h3>
                    <p className="text-sm text-white/60 font-light">Cliquez pour télécharger</p>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information Card */}
            <div className={cardClass}>
              <h2 className={sectionTitleClass} style={{ fontFamily: '"Source Serif 4", serif' }}>
                Informations de base
              </h2>

              <div className="space-y-3">
                <Label htmlFor="title" className={labelClass}>Titre de l'événement *</Label>
                <Input
                  id="title"
                  placeholder="Festival de musique Jazz"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="category" className={labelClass}>Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={value => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-2xl bg-stone-900/95 border-white/15">
                    <SelectItem value="workshops">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.workshops} alt="" className="w-5 h-5" />
                        Ateliers
                      </span>
                    </SelectItem>
                    <SelectItem value="brunch">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.brunch} alt="" className="w-5 h-5" />
                        Brunch
                      </span>
                    </SelectItem>
                    <SelectItem value="music">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.music} alt="" className="w-5 h-5" />
                        Concerts
                      </span>
                    </SelectItem>
                    <SelectItem value="conferences">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.conferences} alt="" className="w-5 h-5" />
                        Conférences
                      </span>
                    </SelectItem>
                    <SelectItem value="exhibitions">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.exhibitions} alt="" className="w-5 h-5" />
                        Expositions
                      </span>
                    </SelectItem>
                    <SelectItem value="festivals">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.festivals} alt="" className="w-5 h-5" />
                        Festivals
                      </span>
                    </SelectItem>
                    <SelectItem value="meetups">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.meetups} alt="" className="w-5 h-5" />
                        Meetups
                      </span>
                    </SelectItem>
                    <SelectItem value="religious">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.religious} alt="" className="w-5 h-5" />
                        Religieux
                      </span>
                    </SelectItem>
                    <SelectItem value="shows">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.shows} alt="" className="w-5 h-5" />
                        Spectacles
                      </span>
                    </SelectItem>
                    <SelectItem value="sports">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.sports} alt="" className="w-5 h-5" />
                        Sports
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location Card */}
            <div className={cardClass}>
              <h2 className={sectionTitleClass} style={{ fontFamily: '"Source Serif 4", serif' }}>
                <MapPin className="h-5 w-5 text-[#ee9d2b]" strokeWidth={1.5} />
                Localisation
              </h2>

              <div className="space-y-3">
                <Label htmlFor="address" className={labelClass}>Adresse / lieu de l'événement *</Label>
                <Input
                  id="address"
                  placeholder="Ex: Cocody Angré, Abidjan"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>

              {/* Map for position adjustment */}
              <div className="space-y-3 mt-4">
                <Label className={labelClass}>
                  Position sur la carte {geocoding && <span className="text-xs text-white/40">(localisation...)</span>}
                </Label>
                <div
                  className="w-full h-48 rounded-2xl overflow-hidden border border-white/15"
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  <div
                    ref={mapContainerRef}
                    className="w-full h-full"
                  />
                </div>
                <p className="text-xs text-white/50">
                  Utilisez la mini-carte pour ajuster précisément la position via le marqueur rouge
                </p>
              </div>
            </div>

            {/* Date and Time Card */}
            <div className={cardClass}>
              <h2 className={sectionTitleClass} style={{ fontFamily: '"Source Serif 4", serif' }}>
                <Calendar className="h-5 w-5 text-[#ee9d2b]" strokeWidth={1.5} />
                Date et heure
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="date" className={labelClass}>Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="time" className={labelClass}>Heure *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Price and Capacity Card */}
            <div className={cardClass}>
              <h2 className={sectionTitleClass} style={{ fontFamily: '"Source Serif 4", serif' }}>
                <DollarSign className="h-5 w-5 text-[#ee9d2b]" strokeWidth={1.5} />
                Prix et capacité
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="price" className={labelClass}>Prix (FCFA)</Label>
                  <Input
                    id="price"
                    placeholder="Ex: 5000 FCFA"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="capacity" className={labelClass}>Capacité</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="100"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className={cardClass}>
              <h2 className={sectionTitleClass} style={{ fontFamily: '"Source Serif 4", serif' }}>
                Description
              </h2>

              <div className="space-y-3">
                <Textarea
                  id="description"
                  placeholder="Décrivez votre événement..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#ee9d2b]/30 resize-none"
                />
              </div>
            </div>

            {/* Key Points Card */}
            <div className={cardClass}>
              <h2 className={sectionTitleClass} style={{ fontFamily: '"Source Serif 4", serif' }}>
                <Sparkles className="h-5 w-5 text-[#ee9d2b]" strokeWidth={1.5} />
                Points clés de l'événement
              </h2>

              <div className="space-y-3">
                {keyPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Point clé ${index + 1}`}
                      value={point}
                      onChange={e => updateKeyPoint(index, e.target.value)}
                      className={`${inputClass} flex-1`}
                    />
                    {keyPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKeyPoint(index)}
                        className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                ))}

                {keyPoints.length < 5 && (
                  <button
                    type="button"
                    onClick={addKeyPoint}
                    className="flex items-center gap-2 text-[#ee9d2b] hover:text-[#ee9d2b]/80 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un point clé
                  </button>
                )}
                <p className="text-xs text-white/50">Maximum 5 points clés</p>
              </div>
            </div>

            {/* Contact Card */}
            <div className={cardClass}>
              <h2 className={sectionTitleClass} style={{ fontFamily: '"Source Serif 4", serif' }}>
                <Phone className="h-5 w-5 text-[#ee9d2b]" strokeWidth={1.5} />
                Contact
              </h2>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="contactPhone" className={`${labelClass} flex items-center gap-2`}>
                    <Phone className="w-4 h-4 text-[#ee9d2b]" />
                    Numéro de téléphone
                  </Label>
                  <Input
                    id="contactPhone"
                    placeholder="+225 XX XX XX XX XX"
                    value={formData.contactPhone}
                    onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="contactWhatsapp" className={`${labelClass} flex items-center gap-2`}>
                    <MessageCircle className="w-4 h-4 text-[#ee9d2b]" />
                    WhatsApp
                  </Label>
                  <Input
                    id="contactWhatsapp"
                    placeholder="+225 XX XX XX XX XX"
                    value={formData.contactWhatsapp}
                    onChange={e => setFormData({ ...formData, contactWhatsapp: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="contactInstagram" className={`${labelClass} flex items-center gap-2`}>
                    <Instagram className="w-4 h-4 text-[#ee9d2b]" />
                    Instagram
                  </Label>
                  <Input
                    id="contactInstagram"
                    placeholder="@votre_compte"
                    value={formData.contactInstagram}
                    onChange={e => setFormData({ ...formData, contactInstagram: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="contactFacebook" className={`${labelClass} flex items-center gap-2`}>
                    <Facebook className="w-4 h-4 text-[#ee9d2b]" />
                    Facebook
                  </Label>
                  <Input
                    id="contactFacebook"
                    placeholder="Nom de votre page"
                    value={formData.contactFacebook}
                    onChange={e => setFormData({ ...formData, contactFacebook: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="contactTwitter" className={`${labelClass} flex items-center gap-2`}>
                    <Twitter className="w-4 h-4 text-[#ee9d2b]" />
                    Twitter / X
                  </Label>
                  <Input
                    id="contactTwitter"
                    placeholder="@votre_compte"
                    value={formData.contactTwitter}
                    onChange={e => setFormData({ ...formData, contactTwitter: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-full bg-[#ee9d2b] text-white font-semibold text-base hover:opacity-90 transition-all active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  'Publier l\'événement'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default CreateEvent;
