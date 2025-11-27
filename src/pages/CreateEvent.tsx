import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Clock, Users, Image as ImageIcon, DollarSign, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import MapView from '@/components/MapView';
import { supabase } from '@/integrations/supabase/client';

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
    venue: '',
    address: '',
    date: '',
    time: '',
    price: '',
    capacity: '',
    description: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const geocodeAddress = async (venue: string, address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const query = `${venue}, ${address}`;
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
      // Geocode the address
      const coordinates = await geocodeAddress(formData.venue, formData.address);
      
      if (!coordinates) {
        toast({
          title: "Erreur",
          description: "Impossible de localiser l'adresse. Veuillez vérifier le lieu et l'adresse.",
          variant: "destructive"
        });
        setSubmitting(false);
        return;
      }

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
      const { error: insertError } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          category: formData.category,
          venue: formData.venue,
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
          user_id: user.id
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
        venue: '',
        address: '',
        date: '',
        time: '',
        price: '',
        capacity: '',
        description: ''
      });
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
    <div className="relative min-h-screen pb-32 animate-fade-in">
      {/* Map Background */}
      <div className="absolute inset-0 pointer-events-none">
        <MapView />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Content */}
      <div className="relative mx-auto max-w-md">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-10">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/70 backdrop-blur-md hover:bg-black/90 transition-all mb-8"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-4xl font-light text-stone-900 mb-3 text-center">Créer un événement</h1>
          <p className="text-stone-700 font-light text-center">Partagez votre événement avec la communauté</p>
        </div>

        {/* Form Card */}
        <div className="px-4 sm:px-6 pb-6">
          <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-stone-400/50 rounded-2xl p-8 hover:border-stone-500 transition-colors cursor-pointer bg-white/20"
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
                    <ImageIcon className="h-10 w-10 text-stone-700 mb-4" strokeWidth={1.5} />
                    <h3 className="font-light text-stone-900 mb-1">Ajouter une image</h3>
                    <p className="text-sm text-stone-700 font-light">Cliquez pour télécharger</p>
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-sm text-stone-700 font-normal">Titre de l'événement *</Label>
                <Input 
                  id="title" 
                  placeholder="Festival de musique Jazz" 
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })} 
                  required 
                  className="h-12 border-stone-400/50 bg-white/40"
                />
              </div>

              {/* Category */}
              <div className="space-y-3">
                <Label htmlFor="category" className="text-sm text-stone-700 font-normal">Catégorie *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={value => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="h-12 border-stone-400/50 bg-white/40">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-xl bg-white/95 border-stone-400/50">
                    <SelectItem value="concerts">🎵 Concerts</SelectItem>
                    <SelectItem value="sports">🏆 Sports</SelectItem>
                    <SelectItem value="food">🍔 Restauration</SelectItem>
                    <SelectItem value="arts">🎨 Arts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Venue */}
              <div className="space-y-3">
                <Label htmlFor="venue" className="text-sm text-stone-700 font-normal flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Lieu *
                </Label>
                <Input 
                  id="venue" 
                  placeholder="Centre culturel de Dakar" 
                  value={formData.venue} 
                  onChange={e => setFormData({ ...formData, venue: e.target.value })} 
                  required 
                  className="h-12 border-stone-400/50 bg-white/40"
                />
              </div>

              {/* Address */}
              <div className="space-y-3">
                <Label htmlFor="address" className="text-sm text-stone-700 font-normal">Adresse complète *</Label>
                <Input 
                  id="address" 
                  placeholder="Dakar, Sénégal" 
                  value={formData.address} 
                  onChange={e => setFormData({ ...formData, address: e.target.value })} 
                  required 
                  className="h-12 border-stone-400/50 bg-white/40"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <Label htmlFor="date" className="text-sm text-stone-700 font-normal flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Date *
                  </Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={formData.date} 
                    onChange={e => setFormData({ ...formData, date: e.target.value })} 
                    required 
                    className="h-12 border-stone-400/50 bg-white/40"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="time" className="text-sm text-stone-700 font-normal flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Heure *
                  </Label>
                  <Input 
                    id="time" 
                    type="time" 
                    value={formData.time} 
                    onChange={e => setFormData({ ...formData, time: e.target.value })} 
                    required 
                    className="h-12 border-stone-400/50 bg-white/40"
                  />
                </div>
              </div>

              {/* Price and Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <Label htmlFor="price" className="text-sm text-stone-700 font-normal flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Prix
                  </Label>
                  <Input 
                    id="price" 
                    placeholder="Gratuit" 
                    value={formData.price} 
                    onChange={e => setFormData({ ...formData, price: e.target.value })} 
                    className="h-12 border-stone-400/50 bg-white/40"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="capacity" className="text-sm text-stone-700 font-normal flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Capacité
                  </Label>
                  <Input 
                    id="capacity" 
                    type="number" 
                    placeholder="100" 
                    value={formData.capacity} 
                    onChange={e => setFormData({ ...formData, capacity: e.target.value })} 
                    className="h-12 border-stone-400/50 bg-white/40"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm text-stone-700 font-normal">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Décrivez votre événement..." 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  rows={5} 
                  className="border-stone-400/50 bg-white/40 resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full h-12 text-base font-normal mt-10"
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreateEvent;