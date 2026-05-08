import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Clock, Users, Image as ImageIcon, DollarSign, ArrowLeft, Loader2, Phone, Instagram, Facebook, Twitter, MessageCircle, Plus, X, Sparkles } from 'lucide-react';
import TikTokIcon from '@/components/icons/TikTokIcon';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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

const inputClass = "h-9 rounded-xl bg-white/50 border border-stone-300/40 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-0 focus:border-[#ee9d2b]/50 [&]:ring-0 [&]:outline-none";
const labelClass = "text-sm text-stone-600 font-normal";
const cardClass = "rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] p-4 space-y-3";
const sectionTitleClass = "text-lg italic text-stone-800 mb-4 flex items-center gap-2";

const CreateEvent = () => {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.mustBeLoggedIn'),
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, loading, navigate, toast]);
  // Load saved contacts from localStorage
  const savedContacts = (() => {
    try {
      return JSON.parse(localStorage.getItem('saved_contacts') || '{}');
    } catch { return {}; }
  })();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    address: '',
    date: '',
    time: '',
    price: '',
    capacity: '',
    description: '',
    contactPhone: savedContacts.contactPhone || '',
    contactWhatsapp: savedContacts.contactWhatsapp || '',
    contactInstagram: savedContacts.contactInstagram || '',
    contactFacebook: savedContacts.contactFacebook || '',
    contactTiktok: savedContacts.contactTiktok || '',
    contactTwitter: savedContacts.contactTwitter || '',
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
        description: t('form.invalidImage'),
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: t('form.imageTooLarge'),
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
        description: t('auth.mustBeLoggedIn'),
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
          contact_tiktok: formData.contactTiktok || null,
          contact_twitter: formData.contactTwitter || null,
          key_points: validKeyPoints.length > 0 ? validKeyPoints : null
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: t('event.created'),
        description: t('event.createdDesc')
      });

      // Save contacts for next time
      try {
        localStorage.setItem('saved_contacts', JSON.stringify({
          contactPhone: formData.contactPhone,
          contactWhatsapp: formData.contactWhatsapp,
          contactInstagram: formData.contactInstagram,
          contactFacebook: formData.contactFacebook,
          contactTiktok: formData.contactTiktok,
          contactTwitter: formData.contactTwitter,
        }));
      } catch { /* */ }

      // Reset form (contacts kept in localStorage for next creation)
      setFormData({
        title: '',
        category: '',
        address: '',
        date: '',
        time: '',
        price: '',
        capacity: '',
        description: '',
        contactPhone: formData.contactPhone,
        contactWhatsapp: formData.contactWhatsapp,
        contactInstagram: formData.contactInstagram,
        contactFacebook: formData.contactFacebook,
        contactTiktok: formData.contactTiktok,
        contactTwitter: formData.contactTwitter,
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
        description: t('event.createError'),
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
        <div className="w-10 h-10 border-3 border-[#ee9d2b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen pb-32 animate-fade-in animate-zoom-smooth overflow-hidden overscroll-none bg-stone-200">
      {/* Static Map Background — lighter, more natural */}
      <div className="fixed inset-0 pointer-events-none">
        <img
          src={mapBackground}
          alt=""
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      {/* Light blur overlay — less dark, more natural */}
      <div className="fixed inset-0 bg-white/30 backdrop-blur-xl pointer-events-none" />

      {/* Content */}
      <div className="relative mx-auto max-w-md">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-10">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/70 backdrop-blur-md shadow-sm border border-white/60 hover:scale-105 active:scale-95 transition-all mb-8"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </Link>
          <h1 className="text-4xl italic text-stone-800 mb-3 text-center" style={{ fontFamily: '"Source Serif 4", serif' }}>
            {t('event.create')}
          </h1>
          <p className="text-stone-500 font-light text-center">{t('form.shareEvent')}</p>
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
                className="border border-dashed border-stone-300/50 rounded-2xl p-8 hover:border-stone-400/60 transition-colors cursor-pointer bg-white/30"
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm">{t('form.clickToChange')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <ImageIcon className="h-10 w-10 text-[#ee9d2b] mb-4" strokeWidth={1.5} />
                    <h3 className="font-light text-stone-700 mb-1">{t('form.addImage')}</h3>
                    <p className="text-sm text-stone-400 font-light">{t('form.clickToUpload')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information Card */}
            <div className={cardClass}>
              <h2 className={sectionTitleClass} style={{ fontFamily: '"Source Serif 4", serif' }}>
                {t('form.basicInfo')}
              </h2>

              <div className="space-y-3">
                <Label htmlFor="title" className={labelClass}>{t('form.title')}</Label>
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
                <Label htmlFor="category" className={labelClass}>{t('form.category')}</Label>
                <Select
                  value={formData.category}
                  onValueChange={value => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={t('form.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-2xl bg-white/95 border-stone-200/60">
                    <SelectItem value="workshops">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.workshops} alt="" className="w-5 h-5" />
                        {t('cat.workshops')}
                      </span>
                    </SelectItem>
                    <SelectItem value="brunch">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.brunch} alt="" className="w-5 h-5" />
                        {t('cat.brunch')}
                      </span>
                    </SelectItem>
                    <SelectItem value="music">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.music} alt="" className="w-5 h-5" />
                        {t('cat.concerts')}
                      </span>
                    </SelectItem>
                    <SelectItem value="conferences">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.conferences} alt="" className="w-5 h-5" />
                        {t('cat.conferences')}
                      </span>
                    </SelectItem>
                    <SelectItem value="exhibitions">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.exhibitions} alt="" className="w-5 h-5" />
                        {t('cat.exhibitions')}
                      </span>
                    </SelectItem>
                    <SelectItem value="festivals">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.festivals} alt="" className="w-5 h-5" />
                        {t('cat.festivals')}
                      </span>
                    </SelectItem>
                    <SelectItem value="meetups">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.meetups} alt="" className="w-5 h-5" />
                        {t('cat.meetups')}
                      </span>
                    </SelectItem>
                    <SelectItem value="religious">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.religious} alt="" className="w-5 h-5" />
                        {t('cat.religious')}
                      </span>
                    </SelectItem>
                    <SelectItem value="shows">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.shows} alt="" className="w-5 h-5" />
                        {t('cat.shows')}
                      </span>
                    </SelectItem>
                    <SelectItem value="sports">
                      <span className="flex items-center gap-2">
                        <img src={categoryIcons.sports} alt="" className="w-5 h-5" />
                        {t('cat.sports')}
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
                {t('form.location')}
              </h2>

              <div className="space-y-3">
                <Label htmlFor="address" className={labelClass}>{t('form.address')}</Label>
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
                  {t('form.mapPosition')} {geocoding && <span className="text-xs text-stone-400">({t('form.locating')})</span>}
                </Label>
                <div
                  className="w-full h-48 rounded-2xl overflow-hidden border border-stone-300/40"
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  <div
                    ref={mapContainerRef}
                    className="w-full h-full"
                  />
                </div>
                <p className="text-xs text-stone-400">
                  {t('form.mapHint')}
                </p>
              </div>
            </div>

            {/* Date and Time Card */}
            <div className={cardClass}>
              <h2 className={sectionTitleClass} style={{ fontFamily: '"Source Serif 4", serif' }}>
                <Calendar className="h-5 w-5 text-[#ee9d2b]" strokeWidth={1.5} />
                {t('form.dateTime')}
              </h2>

              <div className="space-y-3 overflow-hidden">
                <Label htmlFor="date" className={labelClass}>{t('form.date')}</Label>
                <div className="relative overflow-hidden">
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
                    className={`${inputClass} w-full max-w-full`}
                  />
                  {formData.date && (
                    <button type="button" onClick={() => setFormData({ ...formData, date: '' })} className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-stone-300/40 flex items-center justify-center hover:bg-stone-400/40 transition-colors">
                      <X className="w-2.5 h-2.5 text-stone-500" />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-3 overflow-hidden">
                <Label htmlFor="time" className={labelClass}>{t('form.time')}</Label>
                <div className="relative overflow-hidden">
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    required
                    className={`${inputClass} w-full max-w-full`}
                  />
                  {formData.time && (
                    <button type="button" onClick={() => setFormData({ ...formData, time: '' })} className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-stone-300/40 flex items-center justify-center hover:bg-stone-400/40 transition-colors">
                      <X className="w-2.5 h-2.5 text-stone-500" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Price and Capacity Card */}
            <div className={cardClass}>
              <h2 className={sectionTitleClass} style={{ fontFamily: '"Source Serif 4", serif' }}>
                {t('form.priceCapacity')}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <Label htmlFor="price" className={labelClass}>{t('form.priceFCFA')}</Label>
                  <Input
                    id="price"
                    placeholder="Ex: 5000 FCFA"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="capacity" className={labelClass}>{t('form.capacityLabel')}</Label>
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
                {t('form.description')}
              </h2>

              <div className="space-y-3">
                <Textarea
                  id="description"
                  placeholder={t('form.descPlaceholder')}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="rounded-xl bg-white/50 border border-stone-300/40 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-0 focus:border-[#ee9d2b]/50 resize-none"
                />
              </div>
            </div>

            {/* Key Points Card */}
            <div className={cardClass}>
              <h2 className={sectionTitleClass} style={{ fontFamily: '"Source Serif 4", serif' }}>
                <Sparkles className="h-5 w-5 text-[#ee9d2b]" strokeWidth={1.5} />
                {t('form.keyPoints')}
              </h2>

              <div className="space-y-3">
                {keyPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`${t('form.keyPointN')} ${index + 1}`}
                      value={point}
                      onChange={e => updateKeyPoint(index, e.target.value)}
                      className={`${inputClass} flex-1`}
                    />
                    {keyPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKeyPoint(index)}
                        className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center hover:bg-red-500/25 transition-colors"
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
                    {t('form.addKeyPoint')}
                  </button>
                )}
                <p className="text-xs text-stone-400">{t('form.maxKeyPoints')}</p>
              </div>
            </div>

            {/* Contact Card */}
            <div className={cardClass}>
              <h2 className={sectionTitleClass} style={{ fontFamily: '"Source Serif 4", serif' }}>
                <Phone className="h-5 w-5 text-[#ee9d2b]" strokeWidth={1.5} />
                {t('form.contact')}
              </h2>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="contactPhone" className={`${labelClass} flex items-center gap-2`}>
                    <Phone className="w-4 h-4 text-[#ee9d2b]" />
                    {t('form.phone')}
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
                    {t('form.whatsapp')}
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
                    {t('form.instagram')}
                  </Label>
                  <Input
                    id="contactInstagram"
                    placeholder={t('form.accountPlaceholder')}
                    value={formData.contactInstagram}
                    onChange={e => setFormData({ ...formData, contactInstagram: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="contactFacebook" className={`${labelClass} flex items-center gap-2`}>
                    <Facebook className="w-4 h-4 text-[#ee9d2b]" />
                    {t('form.facebook')}
                  </Label>
                  <Input
                    id="contactFacebook"
                    placeholder={t('form.pagePlaceholder')}
                    value={formData.contactFacebook}
                    onChange={e => setFormData({ ...formData, contactFacebook: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="contactTiktok" className={`${labelClass} flex items-center gap-2`}>
                    <TikTokIcon className="w-4 h-4 text-[#ee9d2b]" />
                    {t('form.tiktok')}
                  </Label>
                  <Input
                    id="contactTiktok"
                    placeholder={t('form.accountPlaceholder')}
                    value={formData.contactTiktok}
                    onChange={e => setFormData({ ...formData, contactTiktok: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="contactTwitter" className={`${labelClass} flex items-center gap-2`}>
                    <Twitter className="w-4 h-4 text-[#ee9d2b]" />
                    {t('form.twitter')}
                  </Label>
                  <Input
                    id="contactTwitter"
                    placeholder={t('form.accountPlaceholder')}
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
                    {t('event.creating')}
                  </>
                ) : (
                  t('event.publish')
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
