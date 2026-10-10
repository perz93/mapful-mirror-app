import LargeTitle from '@/components/LargeTitle';
import { useState, useEffect, useRef } from 'react';
import { FormPageSkeleton } from '@/components/PageSkeleton';
import SectionTitle from '@/components/SectionTitle';
import EventScheduleFields from '@/components/EventScheduleFields';
import { addBaseMap } from '@/lib/mapTiles';
import { searchPlaces, reversePlace, type PlaceResult } from '@/lib/geocode';
import { cityOf } from '@/lib/cities';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Clock, Users, Image as ImageIcon, DollarSign, ArrowLeft, Loader2, Phone, Instagram, Facebook, Twitter, MessageCircle, Plus, X, Mail, Type, CalendarDays, Ticket, AlignLeft, ListOrdered, LocateFixed } from 'lucide-react';
import TikTokIcon from '@/components/icons/TikTokIcon';
import { retryWithoutNewColumns } from '@/lib/retryWithoutNewColumns';
import { emailProviderLabel } from '@/lib/emailProvider';
import { toast } from '@/components/PillToast';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { compressImage, IMMUTABLE_CACHE } from '@/lib/compressImage';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import category icons
import { EVENT_CATEGORIES } from '@/lib/eventCategories';

const inputClass = "h-12 px-4 rounded-xl bg-white border border-stone-300 text-ink placeholder:text-stone-400 text-[15px] focus:outline-none focus:ring-0 focus:border-ink [&]:ring-0 [&]:outline-none";
const labelClass = "text-sm text-stone-600 font-normal";
const cardClass = "rounded-3xl bg-white p-5 space-y-3";

const CreateEvent = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast.info(t('auth.loginRequired'), { description: t('auth.mustBeLoggedIn') });
      navigate('/auth');
    }
  }, [user, loading, navigate]);
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
    endDate: '',
    endTime: '',
    multiDay: false,
    price: '',
    capacity: '',
    description: '',
    contactPhone: savedContacts.contactPhone || '',
    contactWhatsapp: savedContacts.contactWhatsapp || '',
    contactInstagram: savedContacts.contactInstagram || '',
    contactFacebook: savedContacts.contactFacebook || '',
    contactTiktok: savedContacts.contactTiktok || '',
    contactTwitter: savedContacts.contactTwitter || '',
    contactEmail: savedContacts.contactEmail || '',
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
      toast.error(t('form.invalidImage'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('form.imageTooLarge'));
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
        mapRef.current = L.map(mapContainerRef.current, { attributionControl: false, maxZoom: 19 }).setView([5.3600, -4.0083], 12);

        addBaseMap(mapRef.current);

        // Add initial marker
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="width: 40px; height: 40px; background: #14140f; border: 4px solid #a6e22e; border-radius: 50%; cursor: move; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
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
            pinnedRef.current = true;
            setCoordinates({ lat: position.lat, lng: position.lng });
          }
        });

        // Toucher la carte déplace le marqueur
        mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
          pinnedRef.current = true;
          markerRef.current?.setLatLng(e.latlng);
          setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
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

  // Lieu : suggestions dans toute la Côte d'Ivoire, la carte suit le choix
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locatingMe, setLocatingMe] = useState(false);
  const skipGeocodeRef = useRef(false);   // adresse remplie par un choix : pas de nouvelle recherche
  const pinnedRef = useRef(false);        // position fixée à la main : on ne la déplace plus seule

  const placeMarker = (lat: number, lng: number, zoom = 16) => {
    setCoordinates({ lat, lng });
    markerRef.current?.setLatLng([lat, lng]);
    mapRef.current?.setView([lat, lng], zoom);
  };

  const pickSuggestion = (place: PlaceResult) => {
    skipGeocodeRef.current = true;
    pinnedRef.current = true;
    setFormData((f) => ({ ...f, address: place.subtitle ? `${place.title}, ${place.subtitle}` : place.title }));
    setSuggestions([]);
    setShowSuggestions(false);
    if (place.locality) setPlaceCity({ key: `${place.lat.toFixed(4)},${place.lng.toFixed(4)}`, name: place.locality });
    placeMarker(place.lat, place.lng);
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      toast.error(t('map.gpsNotFound'));
      return;
    }
    setLocatingMe(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        pinnedRef.current = true;
        placeMarker(lat, lng, 17);
        if (!formData.address.trim()) {
          const place = await reversePlace(lat, lng);
          if (place) {
            skipGeocodeRef.current = true;
            setFormData((f) => ({ ...f, address: place.subtitle ? `${place.title}, ${place.subtitle}` : place.title }));
          }
        }
        setLocatingMe(false);
      },
      () => {
        setLocatingMe(false);
        toast.error(t('map.enableLocation'));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  // Recherche quand l'adresse change (anti-rebond)
  useEffect(() => {
    if (skipGeocodeRef.current) {
      skipGeocodeRef.current = false;
      return;
    }
    const query = formData.address.trim();
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setGeocoding(true);
      try {
        const results = await searchPlaces(query, controller.signal);
        setSuggestions(results);
        // Premier résultat posé d'office tant que la position n'a pas été choisie à la main
        if (results[0] && !pinnedRef.current) placeMarker(results[0].lat, results[0].lng, 15);
      } catch {
        /* recherche annulée ou hors ligne */
      } finally {
        setGeocoding(false);
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [formData.address]);

  // Ville / localité réelle du point choisi (géocodage inverse), enregistrée avec l'événement.
  // En attendant la réponse (ou hors ligne) : la ville connue la plus proche, si elle est près.
  const [placeCity, setPlaceCity] = useState<{ key: string; name: string | null } | null>(null);
  const coordKey = `${coordinates.lat.toFixed(4)},${coordinates.lng.toFixed(4)}`;
  useEffect(() => {
    if (placeCity?.key === coordKey) return;
    const timer = setTimeout(async () => {
      const place = await reversePlace(coordinates.lat, coordinates.lng);
      setPlaceCity({ key: coordKey, name: place?.locality ?? null });
    }, 700);
    return () => clearTimeout(timer);
  }, [coordKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const detectedCity =
    (placeCity?.key === coordKey ? placeCity.name : null) ?? cityOf(coordinates.lat, coordinates.lng);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error(t('auth.mustBeLoggedIn'));
      return;
    }

    if (formData.multiDay && formData.endDate && formData.endDate < formData.date) {
      toast.error(t('form.endDateError'));
      return;
    }

    setSubmitting(true);

    try {
      // Use coordinates from map marker (already initialized with Dakar center)
      let imageUrl = null;

      // Upload image if selected
      if (imageFile) {
        const image = await compressImage(imageFile);
        const fileName = `${user.id}/${Date.now()}.${image.ext}`;

        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, image.blob, { contentType: image.contentType, cacheControl: IMMUTABLE_CACHE });

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

      const { error: insertError } = await retryWithoutNewColumns({
          title: formData.title,
          category: formData.category,
          venue: formData.address,
          address: formData.address,
          date: formData.date,
          time: formData.time,
          end_date: formData.multiDay && formData.endDate > formData.date ? formData.endDate : null,
          end_time: formData.endTime || null,
          price: formData.price ? parseFloat(formData.price) : null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          description: formData.description || null,
          image_url: imageUrl,
          city: detectedCity,
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
          contact_email: formData.contactEmail || null,
          key_points: validKeyPoints.length > 0 ? validKeyPoints : null
        }, ['contact_email', 'end_date', 'end_time', 'city'], (p) => supabase.from('events').insert(p));

      if (insertError) {
        throw insertError;
      }

      toast.success(t('event.created'), { description: t('event.createdDesc') });

      // Save contacts for next time
      try {
        localStorage.setItem('saved_contacts', JSON.stringify({
          contactPhone: formData.contactPhone,
          contactWhatsapp: formData.contactWhatsapp,
          contactInstagram: formData.contactInstagram,
          contactFacebook: formData.contactFacebook,
          contactTiktok: formData.contactTiktok,
          contactTwitter: formData.contactTwitter,
          contactEmail: formData.contactEmail,
        }));
      } catch { /* */ }

      // Reset form (contacts kept in localStorage for next creation)
      setFormData({
        title: '',
        category: '',
        address: '',
        date: '',
        time: '',
        endDate: '',
        endTime: '',
        multiDay: false,
        price: '',
        capacity: '',
        description: '',
        contactPhone: formData.contactPhone,
        contactWhatsapp: formData.contactWhatsapp,
        contactInstagram: formData.contactInstagram,
        contactFacebook: formData.contactFacebook,
        contactTiktok: formData.contactTiktok,
        contactTwitter: formData.contactTwitter,
        contactEmail: formData.contactEmail,
      });
      setKeyPoints(['']);
      setImageFile(null);
      setImagePreview(null);

      // Invalidate events cache so the map shows the new event immediately
      await queryClient.invalidateQueries();

      // Navigate to home
      navigate('/');

    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(t('event.createError'));
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <FormPageSkeleton />
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen pb-32 page-enter overflow-hidden overscroll-none bg-parchment">


      {/* Content */}
      <div className="relative mx-auto max-w-md">
        {/* Header */}
        <div className="px-4 sm:px-6 pb-6" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
          <Link
            to="/"
            className="inline-flex size-12 btn-float items-center justify-center rounded-full bg-white text-ink active:scale-95 transition-transform mb-6"
          >
            <ArrowLeft size={20} strokeWidth={1.75} className="text-ink" />
          </Link>
          <LargeTitle className="text-[40px] leading-[0.95] tracking-tighter text-ink" backTo="/">
            {t('event.create')}
          </LargeTitle>
          <p className="mt-2 text-stone-500">{t('form.shareEvent')}</p>
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
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-lime mb-4">
                      <ImageIcon size={24} strokeWidth={1.75} className="text-ink" />
                    </span>
                    <h3 className="font-light text-stone-700 mb-1">{t('form.addImage')}</h3>
                    <p className="text-sm text-stone-400 font-light">{t('form.clickToUpload')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information Card */}
            <div className={cardClass}>
              <SectionTitle icon={Type}>{t('form.basicInfo')}</SectionTitle>

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
                  <SelectContent className="bg-white border-stone-200">
                    {EVENT_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <span className="flex items-center gap-2">
                          <img src={c.icon} alt="" className="w-5 h-5" />
                          {t(c.tKey)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location Card */}
            <div className={cardClass}>
              <SectionTitle icon={MapPin}>{t('form.location')}</SectionTitle>

              <div className="space-y-3">
                <Label htmlFor="address" className={labelClass}>{t('form.address')}</Label>
                <div className="relative">
                  <Input
                    id="address"
                    placeholder={t('form.addressPlaceholder')}
                    value={formData.address}
                    onChange={e => {
                      pinnedRef.current = false;
                      setFormData({ ...formData, address: e.target.value });
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    autoComplete="off"
                    required
                    className={inputClass}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-20 rounded-2xl bg-white border border-stone-200 shadow-xl overflow-hidden">
                      {suggestions.map((place, i) => (
                        <button
                          key={`${place.lat},${place.lng},${i}`}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pickSuggestion(place)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-stone-100 last:border-b-0 active:bg-parchment"
                        >
                          <span className="h-8 w-8 rounded-full bg-parchment flex items-center justify-center flex-shrink-0">
                            <MapPin size={15} className="text-ink" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-ink truncate">{place.title}</span>
                            {place.subtitle && <span className="block text-xs text-stone-500 truncate">{place.subtitle}</span>}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={locateMe}
                  disabled={locatingMe}
                  className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-parchment text-ink text-[13px] font-medium active:scale-95 transition-transform disabled:opacity-60"
                >
                  {locatingMe ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
                  {t('form.useMyLocation')}
                </button>
              </div>

              {/* Map for position adjustment */}
              <div className="space-y-3 mt-4">
                <Label className={labelClass}>
                  {t('form.mapPosition')} {geocoding && <span className="text-xs text-stone-400">({t('form.locating')})</span>}
                </Label>
                <div
                  className="w-full h-56 rounded-2xl overflow-hidden border border-stone-300/40"
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  <div
                    ref={mapContainerRef}
                    className="w-full h-full"
                  />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-stone-400">
                    {t('form.mapHint')}
                  </p>
                  {detectedCity && (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-parchment text-ink text-xs font-medium">
                      <MapPin size={12} /> {detectedCity}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Date and Time Card */}
            <div className={cardClass}>
              <SectionTitle icon={CalendarDays}>{t('form.dateTime')}</SectionTitle>

              <EventScheduleFields
                value={{ date: formData.date, time: formData.time, endDate: formData.endDate, endTime: formData.endTime, multiDay: formData.multiDay }}
                onChange={(v) => setFormData({ ...formData, ...v })}
                inputClass={inputClass}
                labelClass={labelClass}
              />
            </div>

            {/* Price and Capacity Card */}
            <div className={cardClass}>
              <SectionTitle icon={Ticket}>{t('form.priceCapacity')}</SectionTitle>

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
              <SectionTitle icon={AlignLeft}>{t('form.description')}</SectionTitle>

              <div className="space-y-3">
                <Textarea
                  id="description"
                  placeholder={t('form.descPlaceholder')}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="rounded-xl bg-white border border-stone-300 text-ink placeholder:text-stone-400 text-[15px] px-4 py-3 focus:outline-none focus:ring-0 focus:border-ink resize-none"
                />
              </div>
            </div>

            {/* Key Points Card */}
            <div className={cardClass}>
              <SectionTitle icon={ListOrdered}>{t('form.keyPoints')}</SectionTitle>

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
                    className="flex items-center gap-2 text-ink hover:text-graphite transition-colors text-sm font-medium"
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
              <SectionTitle icon={Phone}>{t('form.contact')}</SectionTitle>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="contactPhone" className={`${labelClass} flex items-center gap-2`}>
                    <Phone className="w-4 h-4 text-ink" />
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
                    <MessageCircle className="w-4 h-4 text-ink" />
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
                    <Instagram className="w-4 h-4 text-ink" />
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
                    <Facebook className="w-4 h-4 text-ink" />
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
                    <TikTokIcon className="w-4 h-4 text-ink" />
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
                    <Twitter className="w-4 h-4 text-ink" />
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

                <div className="space-y-3">
                  <Label htmlFor="contactEmail" className={`${labelClass} flex items-center gap-2`}>
                    <Mail className="w-4 h-4 text-ink" />
                    {formData.contactEmail.includes('@') ? emailProviderLabel(formData.contactEmail) : 'Email'}
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="exemple@gmail.com"
                    value={formData.contactEmail}
                    onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
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
                className="w-full h-12 rounded-full bg-lime text-ink text-[15px] font-medium hover:bg-lime-deep transition-colors active:scale-[0.98]"
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
