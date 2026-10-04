import LargeTitle from '@/components/LargeTitle';
import { useState, useEffect } from 'react';
import { FormPageSkeleton } from '@/components/PageSkeleton';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, X, Image as ImageIcon, Type, AlignLeft, Ticket, MapPin, Phone, Mail, MessageCircle, Instagram, Facebook } from 'lucide-react';
import TikTokIcon from '@/components/icons/TikTokIcon';
import { retryWithoutNewColumns } from '@/lib/retryWithoutNewColumns';
import { emailProviderLabel } from '@/lib/emailProvider';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import SectionTitle from '@/components/SectionTitle';
import { MARKETPLACE_CATEGORIES } from '@/lib/marketplaceCategories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type MarketplaceListing = Tables<'marketplace_listings'>;

const categories = MARKETPLACE_CATEGORIES.map((c) => ({ value: c.value, label: c.fr, icon: c.icon }));

const priceTypes = [
  { value: 'fixed', label: 'Prix fixe' },
  { value: 'hourly', label: 'Par heure' },
  { value: 'daily', label: 'Par jour' },
  { value: 'negotiable', label: 'Négociable' },
];

const labelClass = "text-sm text-stone-600 font-normal";
const cardClass = "rounded-3xl bg-white p-5 space-y-3";
const inputClass = "h-12 px-4 rounded-xl bg-white border border-stone-300 text-ink placeholder:text-stone-400 text-[15px] focus:outline-none focus:ring-0 focus:border-ink";



const XIcon = ({ className }: { className?: string }) => <span className={`font-bold leading-none ${className ?? ''}`}>𝕏</span>;
const SOCIAL_FIELDS = [
  { key: 'contact_whatsapp', label: 'WhatsApp', Icon: MessageCircle, placeholder: '+225 XX XX XX XX XX', type: 'tel' },
  { key: 'contact_instagram', label: 'Instagram', Icon: Instagram, placeholder: '@votre_compte', type: 'text' },
  { key: 'contact_facebook', label: 'Facebook', Icon: Facebook, placeholder: 'Nom de page', type: 'text' },
  { key: 'contact_tiktok', label: 'TikTok', Icon: TikTokIcon, placeholder: '@votre_compte', type: 'text' },
  { key: 'contact_twitter', label: 'X (Twitter)', Icon: XIcon, placeholder: '@votre_compte', type: 'text' },
] as const;
const NEW_CONTACT_COLUMNS = SOCIAL_FIELDS.map((f) => f.key as string);

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
    contact_whatsapp: '',
    contact_instagram: '',
    contact_facebook: '',
    contact_tiktok: '',
    contact_twitter: '',
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
      contact_whatsapp: data.contact_whatsapp || '',
      contact_instagram: data.contact_instagram || '',
      contact_facebook: data.contact_facebook || '',
      contact_tiktok: data.contact_tiktok || '',
      contact_twitter: data.contact_twitter || '',
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
      const { error } = await retryWithoutNewColumns({
          title: formData.title,
          description: formData.description || null,
          category: formData.category as any,
          price: formData.price ? parseFloat(formData.price) : null,
          price_type: formData.price_type,
          contact_phone: formData.contact_phone || null,
          contact_email: formData.contact_email || null,
          location: formData.location || null,
          image_url: imageUrl,
          contact_whatsapp: formData.contact_whatsapp.trim() || null,
          contact_instagram: formData.contact_instagram.trim() || null,
          contact_facebook: formData.contact_facebook.trim() || null,
          contact_tiktok: formData.contact_tiktok.trim() || null,
          contact_twitter: formData.contact_twitter.trim() || null,
        }, NEW_CONTACT_COLUMNS, (p) => supabase.from('marketplace_listings').update(p).eq('id', id!));

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
      <FormPageSkeleton />
    );
  }

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-parchment page-enter">
      {/* Header */}
      <div className="relative z-10 px-4 pb-5" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <Link
          to="/my-account"
          className="inline-flex size-10 items-center justify-center rounded-full bg-white text-ink active:scale-95 transition-transform mb-6"
        >
          <ArrowLeft size={18} strokeWidth={1.75} className="text-ink" />
        </Link>
        <LargeTitle className="text-[40px] leading-[0.95] tracking-tighter text-ink" backTo="/my-account">Modifier l'annonce</LargeTitle>
        <p className="mt-2 text-stone-500">Mettez à jour les informations de votre service</p>
      </div>

      {/* Form — même structure que « Créer un événement » */}
      <form onSubmit={handleSubmit} className="relative z-10 flex-1 px-4 pb-10">
        <div className="space-y-4">
          {/* Photo */}
          <div className={cardClass}>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="h-52 w-full rounded-2xl object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="Retirer la photo"
                  className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white text-ink active:scale-95 transition-transform"
                >
                  <X size={16} strokeWidth={1.75} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 p-8 text-center transition-colors hover:border-ink">
                <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-lime">
                  <ImageIcon size={24} strokeWidth={1.75} className="text-ink" />
                </span>
                <span className="font-medium text-ink">Ajouter une photo</span>
                <span className="mt-1 text-sm text-stone-500">Touchez pour choisir une image</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Informations */}
          <div className={cardClass}>
            <SectionTitle icon={Type}>Informations</SectionTitle>
            <div className="space-y-2">
              <Label htmlFor="title" className={labelClass}>Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Salle de réception 200 personnes"
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Catégorie *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent className="bg-white border-stone-200">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2.5">
                        <cat.icon size={16} strokeWidth={1.75} className="text-stone-500" />
                        {cat.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className={cardClass}>
            <SectionTitle icon={AlignLeft}>Description</SectionTitle>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez votre service en détail..."
              className="min-h-[120px]"
            />
          </div>

          {/* Tarif */}
          <div className={cardClass}>
            <SectionTitle icon={Ticket}>Tarif</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="price" className={labelClass}>Prix (FCFA)</Label>
                <Input
                  id="price"
                  type="number"
                  inputMode="numeric"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Type de prix</Label>
                <Select
                  value={formData.price_type}
                  onValueChange={(value) => setFormData({ ...formData, price_type: value })}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-stone-200">
                    {priceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className={cardClass}>
            <SectionTitle icon={MapPin}>Localisation</SectionTitle>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: Cocody, Abidjan"
              className={inputClass}
            />
          </div>

          {/* Contact */}
          <div className={cardClass}>
            <SectionTitle icon={Phone}>Contact</SectionTitle>
            <div className="space-y-2">
              <Label htmlFor="phone" className={`${labelClass} flex items-center gap-2`}>
                <Phone className="h-4 w-4 text-ink" strokeWidth={1.75} /> Téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+225 XX XX XX XX XX"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className={`${labelClass} flex items-center gap-2`}>
                <Mail className="h-4 w-4 text-ink" strokeWidth={1.75} /> {formData.contact_email.includes('@') ? emailProviderLabel(formData.contact_email) : 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="exemple@gmail.com"
                className={inputClass}
              />
            </div>
            {SOCIAL_FIELDS.map(({ key, label, Icon, placeholder, type }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className={`${labelClass} flex items-center gap-2`}>
                  <Icon className="h-4 w-4 text-ink" /> {label}
                </Label>
                <Input
                  id={key}
                  type={type}
                  value={formData[key]}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  placeholder={placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-full bg-lime text-ink text-[15px] font-medium hover:bg-lime-deep transition-colors active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
          </button>
        </div>
      </form>

      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-parchment" />
    </div>
  );
};

export default EditListing;
