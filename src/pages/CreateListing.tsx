import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import mapBackground from '@/assets/map-background.jpg';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const categories = [
  { value: 'location_espaces', label: 'Location espaces' },
  { value: 'traiteurs', label: 'Traiteurs' },
  { value: 'animation_dj', label: 'Animation/DJ' },
  { value: 'decoration', label: 'Décoration' },
  { value: 'autre', label: 'Autre' },
];

const priceTypes = [
  { value: 'fixed', label: 'Prix fixe' },
  { value: 'hourly', label: 'Par heure' },
  { value: 'daily', label: 'Par jour' },
  { value: 'negotiable', label: 'Négociable' },
];

const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    price_type: 'negotiable',
    contact_phone: '',
    contact_email: '',
    location: '',
  });

  // Redirect if not authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;

      // Upload image if exists
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName);
        
        imageUrl = urlData.publicUrl;
      }

      // Insert listing
      const { error } = await supabase.from('marketplace_listings').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        category: formData.category as any,
        price: formData.price ? parseFloat(formData.price) : null,
        price_type: formData.price_type,
        contact_phone: formData.contact_phone || null,
        contact_email: formData.contact_email || user.email || null,
        location: formData.location || null,
        image_url: imageUrl,
      });

      if (error) throw error;

      toast.success('Annonce créée avec succès !');
      navigate('/marketplace');
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast.error('Erreur lors de la création de l\'annonce');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden">
      {/* Background map */}
      <div className="fixed inset-0 pointer-events-none">
        <img src={mapBackground} alt="" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 sm:px-6 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <Link
          to="/marketplace"
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/70 backdrop-blur-md shadow-sm border border-white/60 hover:scale-105 active:scale-95 transition-all mb-4"
        >
          <ArrowLeft className="w-5 h-5 text-stone-700" />
        </Link>
        <h1 className="text-3xl italic text-stone-800 text-center" style={{ fontFamily: '"Source Serif 4", serif' }}>Nouvelle annonce</h1>
        <p className="text-stone-500 font-light text-center mt-1">Proposez vos services à la communauté</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="relative z-10 flex-1 overflow-y-auto px-4 pb-8">
        <div className="space-y-6">
          {/* Image Upload */}
          <div>
            <Label>Photo</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-48 w-full rounded-2xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-2 top-2 rounded-full bg-black/70 p-2"
                  >
                    <X className="text-white" size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-white/50 dark:bg-stone-800/50 transition-colors hover:border-primary">
                  <Upload className="mb-2 text-muted-foreground" size={32} />
                  <span className="text-sm text-muted-foreground">Ajouter une photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Salle de réception 200 personnes"
              className="mt-2"
              required
            />
          </div>

          {/* Category */}
          <div>
            <Label>Catégorie *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez votre service en détail..."
              className="mt-2 min-h-[100px]"
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Prix (FCFA)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Type de prix</Label>
              <Select
                value={formData.price_type}
                onValueChange={(value) => setFormData({ ...formData, price_type: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: Cocody, Abidjan"
              className="mt-2"
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+225..."
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="contact@..."
                className="mt-2"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-500 hover:bg-amber-600"
          >
            {isSubmitting ? 'Publication...' : 'Publier l\'annonce'}
          </Button>
        </div>
      </form>

    </div>
  );
};

export default CreateListing;
