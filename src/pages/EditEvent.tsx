import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    address: '',
    category: '',
    date: '',
    time: '',
    price: '',
    capacity: '',
    is_paid: false,
  });

  useEffect(() => {
    if (id && user) {
      loadEvent();
    }
  }, [id, user]);

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('Événement non trouvé');
        navigate('/manage-events');
        return;
      }

      setFormData({
        title: data.title,
        description: data.description || '',
        venue: data.venue,
        address: data.address || '',
        category: data.category,
        date: data.date,
        time: data.time,
        price: data.price?.toString() || '',
        capacity: data.capacity?.toString() || '',
        is_paid: data.is_paid,
      });
      
      if (data.image_url) {
        setImagePreview(data.image_url);
      }
    } catch (error: any) {
      console.error('Error loading event:', error);
      toast.error('Erreur lors du chargement de l\'événement');
      navigate('/manage-events');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const geocodeAddress = async (venue: string, address: string) => {
    const query = `${venue}, ${address}`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
    throw new Error('Adresse non trouvée');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    setSubmitting(true);
    try {
      // Geocode address
      const { latitude, longitude } = await geocodeAddress(formData.venue, formData.address);

      let imageUrl = imagePreview;

      // Upload new image if selected
      if (imageFile) {
        // Delete old image if exists
        const { data: eventData } = await supabase
          .from('events')
          .select('image_url')
          .eq('id', id)
          .single();

        if (eventData?.image_url) {
          const oldPath = eventData.image_url.split('/').slice(-2).join('/');
          await supabase.storage
            .from('event-images')
            .remove([oldPath]);
        }

        // Upload new image
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Update event
      const { error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description || null,
          venue: formData.venue,
          address: formData.address || null,
          category: formData.category,
          date: formData.date,
          time: formData.time,
          price: formData.price ? parseFloat(formData.price) : null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          is_paid: formData.is_paid,
          image_url: imageUrl,
          latitude,
          longitude,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Événement mis à jour !');
      navigate('/manage-events');
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden animate-fade-in animate-zoom-smooth">
      {/* Map Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/src/assets/map-background.jpg')",
          filter: "blur(3px)"
        }}
      />
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5">
          <Link 
            to="/manage-events" 
            className="w-11 h-11 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center hover:bg-black/90 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          
          <h1 className="text-foreground text-lg font-semibold">Modifier l'événement</h1>
          
          <div className="w-11 h-11" />
        </div>

        {/* Form */}
        <div className="flex-1 px-6 pb-8 pt-4">
          <form onSubmit={handleSubmit} className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Image de l'événement</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-2" />
                ) : (
                  <div className="py-8">
                    <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Cliquez pour changer l'image</p>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Titre *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            {/* Venue */}
            <div>
              <label className="block text-sm font-medium mb-2">Lieu *</label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({...formData, venue: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-2">Adresse *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">Catégorie *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="music">Musique</option>
                <option value="sports">Sports</option>
                <option value="food">Food</option>
                <option value="arts">Arts</option>
                <option value="meetups">Meetups</option>
                <option value="conferences">Conférences</option>
                <option value="workshops">Ateliers</option>
                <option value="festivals">Festivals</option>
                <option value="shows">Spectacles</option>
                <option value="exhibitions">Expositions</option>
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Heure *</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>

            {/* Price and Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prix (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Capacité</label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>

            {/* Is Paid */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_paid"
                checked={formData.is_paid}
                onChange={(e) => setFormData({...formData, is_paid: e.target.checked})}
                className="w-4 h-4"
              />
              <label htmlFor="is_paid" className="text-sm font-medium">Événement payant</label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                'Mettre à jour'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
