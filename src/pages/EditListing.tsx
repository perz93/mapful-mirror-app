import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type MarketplaceListing = Tables<'marketplace_listings'>;

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

const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

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

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadListing();
  }, [user, id]);

  const loadListing = async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      toast.error('Annonce introuvable');
      navigate('/my-account');
      return;
    }

    // Check ownership
    if (data.user_id !== user?.id) {
      toast.error('Vous n\'êtes pas autorisé à modifier cette annonce');
      navigate('/my-account');
      return;
    }

    setFormData({
      title: data.title || '',
      description: data.description || '',
      category: data.category || '',
      price: data.price?.toString() || '',
      price_type: data.price_type || 'negotiable',
      contact_phone: data.contact_phone || '',
      contact_email: data.contact_email || '',
      location: data.location || '',
    });

    if (data.image_url) {
      setImagePreview(data.image_url);
      setOriginalImageUrl(data.image_url);
    }

    setIsLoading(false);
  };

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
      let imageUrl = originalImageUrl;

      // Upload new image if changed
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user!.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName);
        
        imageUrl = urlData.publicUrl;
      } else if (!imagePreview) {
        imageUrl = null;
      }

      // Update listing
      const { error } = await supabase
        .from('marketplace_listings')
        .update({
          title: formData.title,
          description: formData.description || null,
          category: formData.category as any,
          price: formData.price ? parseFloat(formData.price) : null,
          price_type: formData.price_type,
          contact_phone: formData.contact_phone || null,
          contact_email: formData.contact_email || null,
          location: formData.location || null,
          image_url: imageUrl,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Annonce mise à jour !');
      navigate('/my-account');
    } catch (error: any) {
      console.error('Error updating listing:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex h-screen max-w-md flex-col overflow-hidden bg-background animate-fade-in animate-zoom-smooth">
      {/* Header */}
      <div className="relative z-10 flex items-center gap-4 px-4 pt-12 pb-4">
        <Link
          to="/my-account"
          className="flex size-10 items-center justify-center rounded-full bg-black/70 backdrop-blur-md"
        >
          <ArrowLeft className="text-white" size={20} />
        </Link>
        <h1 className="text-xl font-bold">Modifier l'annonce</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 pb-8">
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
            {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
          </Button>
        </div>
      </form>

      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20" />
    </div>
  );
};

export default EditListing;
