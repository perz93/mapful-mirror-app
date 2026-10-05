import LargeTitle from '@/components/LargeTitle';
import { EVENT_CATEGORIES, normalizeEventCategory } from '@/lib/eventCategories';
import { useState, useEffect, useRef } from 'react';
import SectionTitle from '@/components/SectionTitle';
import { ArrowLeft, Upload, Loader2, Image as ImageIcon, Phone, MessageCircle, Instagram, Facebook, Mail, Type, CalendarDays, Ticket } from 'lucide-react';
import TikTokIcon from '@/components/icons/TikTokIcon';
import { retryWithoutNewColumns } from '@/lib/retryWithoutNewColumns';
import { emailProviderLabel } from '@/lib/emailProvider';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/PillToast';
import { useQueryClient } from '@tanstack/react-query';
import { EditEventSkeleton } from '@/components/PageSkeleton';

const inputClass = "h-12 px-4 rounded-xl bg-white border border-stone-300 text-ink placeholder:text-stone-400 text-[15px] focus:outline-none focus:ring-0 focus:border-ink w-full";
const labelClass = "text-sm text-stone-600 font-normal";
const cardClass = "rounded-3xl bg-white p-5 space-y-3";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
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
    contact_phone: '',
    contact_whatsapp: '',
    contact_instagram: '',
    contact_facebook: '',
    contact_tiktok: '',
    contact_twitter: '',
    contact_email: '',
  });

  useEffect(() => {
    if (id && user) loadEvent();
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
        toast.error(t('form.eventNotFound'));
        navigate('/manage-events');
        return;
      }

      setFormData({
        title: data.title,
        description: data.description || '',
        venue: data.venue,
        address: data.address || '',
        category: normalizeEventCategory(data.category),
        date: data.date,
        time: data.time,
        price: data.price?.toString() || '',
        capacity: data.capacity?.toString() || '',
        is_paid: data.is_paid,
        contact_phone: data.contact_phone || '',
        contact_whatsapp: data.contact_whatsapp || '',
        contact_instagram: data.contact_instagram || '',
        contact_facebook: data.contact_facebook || '',
        contact_tiktok: data.contact_tiktok || '',
        contact_twitter: data.contact_twitter || '',
        contact_email: data.contact_email || '',
      });

      if (data.image_url) setImagePreview(data.image_url);
    } catch (error: any) {
      console.error('Error loading event:', error);
      toast.error(t('form.loadError'));
      navigate('/manage-events');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error(t('form.selectImage')); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error(t('form.max5mb')); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.info(t('auth.loginRequired')); return; }

    setSubmitting(true);
    try {
      const { data: currentEvent } = await supabase
        .from('events')
        .select('latitude, longitude, image_url')
        .eq('id', id)
        .single();

      let imageUrl = imagePreview;

      if (imageFile) {
        if (currentEvent?.image_url) {
          const oldPath = currentEvent.image_url.split('/').slice(-2).join('/');
          await supabase.storage.from('event-images').remove([oldPath]);
        }
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${user.id}/${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('event-images').upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      const { error } = await retryWithoutNewColumns({
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
          latitude: currentEvent?.latitude ?? 5.3600,
          longitude: currentEvent?.longitude ?? -4.0083,
          contact_phone: formData.contact_phone || null,
          contact_whatsapp: formData.contact_whatsapp || null,
          contact_instagram: formData.contact_instagram || null,
          contact_facebook: formData.contact_facebook || null,
          contact_tiktok: formData.contact_tiktok || null,
          contact_twitter: formData.contact_twitter || null,
          contact_email: formData.contact_email || null,
        }, ['contact_email'], (p) => supabase.from('events').update(p).eq('id', id!));

      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success(t('event.updated'));
      navigate('/manage-events');
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error(error.message || t('event.updateError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-parchment">
        <div className="relative z-10">
          <EditEventSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-32 page-enter overflow-hidden overscroll-none bg-parchment">

      {/* Content */}
      <div className="relative mx-auto max-w-md">
        {/* Header */}
        <div className="px-4 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
          <Link
            to="/manage-events"
            className="inline-flex size-12 btn-float items-center justify-center rounded-full bg-white text-ink active:scale-95 transition-transform mb-6"
          >
            <ArrowLeft size={20} strokeWidth={1.75} className="text-ink" />
          </Link>
          <LargeTitle className="text-[40px] leading-[0.95] tracking-tighter text-ink" backTo="/manage-events">
            {t('event.edit')}
          </LargeTitle>
          <p className="mt-2 text-stone-500">{t('form.updateInfo')}</p>
        </div>

        {/* Form */}
        <div className="px-4 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image */}
            <div className={cardClass}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-stone-300/50 rounded-2xl p-6 hover:border-stone-400/60 transition-colors cursor-pointer bg-white/30"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-4">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-lime mb-3">
                      <ImageIcon size={24} strokeWidth={1.75} className="text-ink" />
                    </span>
                    <p className="text-stone-600 text-sm">{t('form.clickToChangeImage')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className={cardClass}>
              <SectionTitle icon={Type}>{t('form.info')}</SectionTitle>

              <div className="space-y-2">
                <label className={labelClass}>{t('form.titleShort')}</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputClass} />
              </div>

              <div className="space-y-2">
                <label className={labelClass}>{t('form.description')}</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="rounded-xl bg-white border border-stone-300 text-ink placeholder:text-stone-400 text-[15px] px-4 py-3 focus:outline-none focus:ring-0 focus:border-ink w-full px-3 py-2 resize-none" />
              </div>

              <div className="space-y-2">
                <label className={labelClass}>{t('form.venue')}</label>
                <input type="text" required value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} className={inputClass} />
              </div>

              <div className="space-y-2">
                <label className={labelClass}>{t('form.addressShort')}</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={inputClass} />
              </div>

              <div className="space-y-2">
                <label className={labelClass}>{t('form.category')}</label>
                <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={inputClass}>
                  <option value="">{t('form.select')}</option>
                  {EVENT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{t(c.tKey)}</option>)}
                </select>
              </div>
            </div>

            {/* Date & Time — stacked */}
            <div className={cardClass}>
              <SectionTitle icon={CalendarDays}>{t('form.dateTime')}</SectionTitle>

              <div className="space-y-2">
                <label className={labelClass}>{t('form.date')}</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>{t('form.time')}</label>
                <input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className={inputClass} />
              </div>
            </div>

            {/* Price & Capacity */}
            <div className={cardClass}>
              <SectionTitle icon={Ticket}>{t('form.priceCapacity')}</SectionTitle>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className={labelClass}>{t('form.priceFCFA')}</label>
                  <input type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>{t('form.capacityLabel')}</label>
                  <input type="number" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className={inputClass} />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="is_paid" checked={formData.is_paid} onChange={e => setFormData({...formData, is_paid: e.target.checked})} className="w-4 h-4 accent-[#14140f]" />
                <label htmlFor="is_paid" className="text-sm text-stone-600">{t('form.isPaid')}</label>
              </div>
            </div>

            {/* Contact / Réseaux sociaux */}
            <div className={cardClass}>
              <SectionTitle icon={Phone}>{t('form.contactNetworks')}</SectionTitle>

              <div className="space-y-2">
                <label className={`${labelClass} flex items-center gap-2`}>
                  <Phone className="w-4 h-4 text-ink" /> {t('form.phoneShort')}
                </label>
                <input type="tel" placeholder="+225 XX XX XX XX" value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})} className={inputClass} />
              </div>

              <div className="space-y-2">
                <label className={`${labelClass} flex items-center gap-2`}>
                  <MessageCircle className="w-4 h-4 text-ink" /> {t('form.whatsapp')}
                </label>
                <input type="tel" placeholder="+225 XX XX XX XX" value={formData.contact_whatsapp} onChange={e => setFormData({...formData, contact_whatsapp: e.target.value})} className={inputClass} />
              </div>

              <div className="space-y-2">
                <label className={`${labelClass} flex items-center gap-2`}>
                  <Instagram className="w-4 h-4 text-ink" /> {t('form.instagram')}
                </label>
                <input type="text" placeholder="@votre_compte" value={formData.contact_instagram} onChange={e => setFormData({...formData, contact_instagram: e.target.value})} className={inputClass} />
              </div>

              <div className="space-y-2">
                <label className={`${labelClass} flex items-center gap-2`}>
                  <Facebook className="w-4 h-4 text-ink" /> {t('form.facebook')}
                </label>
                <input type="text" placeholder="Nom de page" value={formData.contact_facebook} onChange={e => setFormData({...formData, contact_facebook: e.target.value})} className={inputClass} />
              </div>

              <div className="space-y-2">
                <label className={`${labelClass} flex items-center gap-2`}>
                  <TikTokIcon className="w-4 h-4 text-ink" /> {t('form.tiktok')}
                </label>
                <input type="text" placeholder="@votre_compte" value={formData.contact_tiktok} onChange={e => setFormData({...formData, contact_tiktok: e.target.value})} className={inputClass} />
              </div>

              <div className="space-y-2">
                <label className={`${labelClass} flex items-center gap-2`}>
                  <span className="text-ink font-bold text-sm">𝕏</span> X (Twitter)
                </label>
                <input type="text" placeholder="@votre_compte" value={formData.contact_twitter} onChange={e => setFormData({...formData, contact_twitter: e.target.value})} className={inputClass} />
              </div>

              <div className="space-y-2">
                <label className={`${labelClass} flex items-center gap-2`}>
                  <Mail className="w-4 h-4 text-ink" /> {formData.contact_email.includes('@') ? emailProviderLabel(formData.contact_email) : 'Email'}
                </label>
                <input type="email" inputMode="email" autoComplete="email" placeholder="exemple@gmail.com" value={formData.contact_email} onChange={e => setFormData({...formData, contact_email: e.target.value})} className={inputClass} />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-full bg-lime text-ink text-[15px] font-medium hover:bg-lime-deep transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Mettre à jour'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
