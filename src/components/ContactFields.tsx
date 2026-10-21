import { useState } from 'react';
import { Phone, Instagram, Facebook, Mail, X, Plus } from 'lucide-react';
import TikTokIcon from '@/components/icons/TikTokIcon';
import { useLanguage } from '@/contexts/LanguageContext';

export interface ContactValues {
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  twitter: string;
  email: string;
}

const KEYS = ['phone', 'whatsapp', 'instagram', 'facebook', 'tiktok', 'twitter', 'email'] as const;
type Key = (typeof KEYS)[number];
const cap = (k: string) => k.charAt(0).toUpperCase() + k.slice(1);

/** Lit les contacts d'un formulaire, que ses champs s'appellent contactPhone ou contact_phone. */
export const readContacts = (form: Record<string, unknown>, style: 'camel' | 'snake'): ContactValues =>
  Object.fromEntries(
    KEYS.map((k) => [k, String(form[style === 'camel' ? `contact${cap(k)}` : `contact_${k}`] ?? '')]),
  ) as unknown as ContactValues;

/** Convertit une modification en champs du formulaire (même convention de noms). */
export const writeContacts = (patch: Partial<ContactValues>, style: 'camel' | 'snake') =>
  Object.fromEntries(
    Object.entries(patch).map(([k, v]) => [style === 'camel' ? `contact${cap(k)}` : `contact_${k}`, v]),
  );

const WhatsAppIcon = (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={p.className}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);
const XIcon = (p: { className?: string }) => <span className={`font-bold leading-none ${p.className ?? ''}`}>𝕏</span>;

type Extra = Exclude<Key, 'phone'>;
const EXTRAS: { key: Extra; label: string; Icon: (p: { className?: string }) => JSX.Element; placeholder: string; type: string }[] = [
  { key: 'whatsapp', label: 'WhatsApp', Icon: WhatsAppIcon, placeholder: 'Numéro WhatsApp', type: 'tel' },
  { key: 'instagram', label: 'Instagram', Icon: Instagram as never, placeholder: '@compte ou lien du profil', type: 'text' },
  { key: 'facebook', label: 'Facebook', Icon: Facebook as never, placeholder: 'Lien de la page (facebook.com/…)', type: 'text' },
  { key: 'tiktok', label: 'TikTok', Icon: TikTokIcon as never, placeholder: '@compte ou lien du profil', type: 'text' },
  { key: 'twitter', label: '', Icon: XIcon, placeholder: '@compte ou lien du profil', type: 'text' },
  { key: 'email', label: 'Email', Icon: Mail as never, placeholder: 'exemple@gmail.com', type: 'email' },
];

interface Props {
  value: ContactValues;
  onChange: (patch: Partial<ContactValues>) => void;
  inputClass: string;
}

/**
 * Contact en version courte (C3) : le numéro d'abord avec « Joignable sur
 * WhatsApp » en un geste, puis les réseaux et l'email ajoutés un par un.
 */
const ContactFields = ({ value, onChange }: Props) => {
  const { lang } = useLanguage();
  const fr = lang === 'fr';
  // WhatsApp = même numéro que le téléphone (cas le plus courant)
  const sameWhatsapp = !!value.phone && value.whatsapp === value.phone;
  const [opened, setOpened] = useState<Extra[]>([]);
  const visible = EXTRAS.filter(
    (e) => (e.key === 'whatsapp' ? value.whatsapp && !sameWhatsapp : value[e.key]) || opened.includes(e.key),
  );
  const hidden = EXTRAS.filter((e) => !visible.includes(e) && !(e.key === 'whatsapp' && sameWhatsapp));

  const field = 'h-12 w-full rounded-xl border border-stone-300 bg-white pl-12 pr-11 text-[15px] text-ink placeholder:text-stone-400 focus:outline-none focus:border-ink';
  const iconWrap = 'pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-parchment text-ink';

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <p className="eyebrow text-stone-500">{fr ? 'Numéro' : 'Phone'}</p>
        <div className="relative">
          <span className={iconWrap}><Phone className="size-4" strokeWidth={1.75} /></span>
          <input
            type="tel"
            inputMode="tel"
            value={value.phone}
            onChange={(e) => {
              const phone = e.target.value;
              onChange(sameWhatsapp ? { phone, whatsapp: phone } : { phone });
            }}
            placeholder="+225 XX XX XX XX XX"
            className={field}
          />
        </div>
        <label className="flex items-center justify-between gap-3 py-1 text-[15px] text-ink">
          {fr ? 'Joignable sur WhatsApp' : 'Reachable on WhatsApp'}
          <button
            type="button"
            role="switch"
            aria-checked={sameWhatsapp}
            disabled={!value.phone}
            onClick={() => onChange({ whatsapp: sameWhatsapp ? '' : value.phone })}
            className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors disabled:opacity-40 ${sameWhatsapp ? 'bg-lime' : 'bg-stone-200'}`}
          >
            <span className={`absolute top-1 size-5 rounded-full bg-white transition-all ${sameWhatsapp ? 'left-6' : 'left-1'}`} />
          </button>
        </label>
      </div>

      <div className="space-y-2.5">
        <p className="eyebrow text-stone-500">{fr ? 'Réseaux & email' : 'Socials & email'}</p>
        {visible.map(({ key, Icon, placeholder, type }) => (
          <div key={key} className="relative">
            <span className={iconWrap}><Icon className="size-4" /></span>
            <input
              type={type}
              inputMode={type === 'email' ? 'email' : type === 'tel' ? 'tel' : undefined}
              autoComplete={type === 'email' ? 'email' : 'off'}
              autoCapitalize="off"
              value={value[key]}
              onChange={(e) => onChange({ [key]: e.target.value })}
              placeholder={placeholder}
              autoFocus={opened.includes(key) && !value[key]}
              className={field}
            />
            <button
              type="button"
              aria-label={fr ? 'Retirer' : 'Remove'}
              onClick={() => {
                onChange({ [key]: '' });
                setOpened((o) => o.filter((k) => k !== key));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex size-7 items-center justify-center rounded-full text-stone-400 active:scale-95"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
        {hidden.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-0.5">
            {hidden.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setOpened((o) => [...o, key])}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-dashed border-stone-300 bg-white px-3 text-[13px] font-semibold text-ink active:scale-95"
              >
                <Plus className="size-3.5" strokeWidth={2.2} />
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactFields;
