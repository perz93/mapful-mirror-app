import { useState, useEffect } from 'react';
import { X, Phone, Instagram, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  contactInstagram?: string | null;
  contactFacebook?: string | null;
  contactTwitter?: string | null;
}

const ContactModal = ({
  isOpen,
  onClose,
  contactPhone,
  contactWhatsapp,
  contactInstagram,
  contactFacebook,
  contactTwitter
}: ContactModalProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timeout = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const hasContact = contactPhone || contactWhatsapp || contactInstagram || contactFacebook || contactTwitter;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-300",
        isAnimating ? "bg-black/60 backdrop-blur-sm" : "bg-black/0"
      )}
      onClick={onClose}
    >
      <div 
        className={cn(
          "relative bg-white/95 backdrop-blur-xl rounded-3xl p-6 w-full max-w-sm shadow-2xl transition-all duration-500",
          isAnimating 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-75 translate-y-8"
        )}
        style={{
          animation: isAnimating ? 'bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : undefined
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
        >
          <X className="w-4 h-4 text-stone-600" />
        </button>

        <h3 className="text-xl font-semibold text-stone-900 mb-6 text-center">Contacter l'organisateur</h3>

        {!hasContact ? (
          <p className="text-center text-stone-500 py-4">Aucun contact disponible</p>
        ) : (
          <div className="space-y-3">
            {contactPhone && (
              <a
                href={`tel:${contactPhone}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ animationDelay: '0.1s' }}
              >
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-stone-900">Téléphone</p>
                  <p className="text-sm text-stone-500">{contactPhone}</p>
                </div>
              </a>
            )}

            {contactWhatsapp && (
              <a
                href={`https://wa.me/${contactWhatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ animationDelay: '0.15s' }}
              >
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-stone-900">WhatsApp</p>
                  <p className="text-sm text-stone-500">{contactWhatsapp}</p>
                </div>
              </a>
            )}

            {contactInstagram && (
              <a
                href={`https://instagram.com/${contactInstagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-stone-900">Instagram</p>
                  <p className="text-sm text-stone-500">@{contactInstagram.replace('@', '')}</p>
                </div>
              </a>
            )}

            {contactFacebook && (
              <a
                href={`https://facebook.com/${contactFacebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ animationDelay: '0.25s' }}
              >
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                  <Facebook className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-stone-900">Facebook</p>
                  <p className="text-sm text-stone-500">{contactFacebook}</p>
                </div>
              </a>
            )}

            {contactTwitter && (
              <a
                href={`https://twitter.com/${contactTwitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center">
                  <Twitter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-stone-900">Twitter</p>
                  <p className="text-sm text-stone-500">@{contactTwitter.replace('@', '')}</p>
                </div>
              </a>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(100px);
          }
          50% {
            transform: scale(1.05) translateY(-10px);
          }
          70% {
            transform: scale(0.95) translateY(5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ContactModal;
