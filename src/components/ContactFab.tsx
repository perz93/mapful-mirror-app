import { useState, useEffect } from 'react';
import { Phone, Instagram, Facebook, MessageCircle, X, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDisplayUrl } from '@/components/profile/social/SocialPlatformConfig';
import TikTokIcon from '@/components/icons/TikTokIcon';

interface ContactFabProps {
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  contactInstagram?: string | null;
  contactFacebook?: string | null;
  contactTiktok?: string | null;
  contactTwitter?: string | null;
}

interface ContactItem {
  icon: React.ReactNode;
  href: string;
  bgColor: string;
  label: string;
}

const ContactFab = ({
  contactPhone,
  contactWhatsapp,
  contactInstagram,
  contactFacebook,
  contactTiktok,
  contactTwitter
}: ContactFabProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Wait one frame so initial closed transform is committed before animating
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateIn(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setAnimateIn(false);
      const timeout = setTimeout(() => setShouldRender(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Build contact items array
  const contacts: ContactItem[] = [];
  
  if (contactPhone) {
    contacts.push({
      icon: <Phone className="w-5 h-5 text-white" />,
      href: `tel:${contactPhone}`,
      bgColor: 'bg-ink',
      label: 'Téléphone'
    });
  }
  
  if (contactWhatsapp) {
    contacts.push({
      icon: <MessageCircle className="w-5 h-5 text-white" />,
      href: getDisplayUrl('whatsapp', contactWhatsapp),
      bgColor: 'bg-ink',
      label: 'WhatsApp'
    });
  }
  
  if (contactInstagram) {
    contacts.push({
      icon: <Instagram className="w-5 h-5 text-white" />,
      href: getDisplayUrl('instagram', contactInstagram),
      bgColor: 'bg-ink',
      label: 'Instagram'
    });
  }

  if (contactFacebook) {
    contacts.push({
      icon: <Facebook className="w-5 h-5 text-white" />,
      href: getDisplayUrl('facebook', contactFacebook),
      bgColor: 'bg-ink',
      label: 'Facebook'
    });
  }

  if (contactTiktok) {
    contacts.push({
      icon: <TikTokIcon className="w-5 h-5 text-white" />,
      href: getDisplayUrl('tiktok', contactTiktok),
      bgColor: 'bg-ink',
      label: 'TikTok'
    });
  }

  if (contactTwitter) {
    contacts.push({
      icon: <span className="text-white font-bold text-base">𝕏</span>,
      href: getDisplayUrl('twitter', contactTwitter),
      bgColor: 'bg-ink',
      label: 'X'
    });
  }

  const hasContacts = contacts.length > 0;

  // Colonne verticale au-dessus du bouton principal, alignée sur son axe
  // (bouton 56 px, contacts 48 px → décalage de 4 px pour centrer)
  const getPosition = (index: number) => ({
    x: -4,
    y: -(72 + index * 60),
  });

  if (!hasContacts) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Contacts empilés verticalement */}
      {shouldRender && contacts.map((contact, index) => {
        const position = getPosition(index);
        const openDelay = index * 0.06;
        const closeDelay = (contacts.length - index - 1) * 0.04;

        return (
          <a
            key={index}
            href={contact.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className={cn(
"absolute w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-10",
              contact.bgColor
            )}
            style={{
              transform: animateIn
                ? `translate(${position.x}px, ${position.y}px) scale(1)`
                : `translate(${position.x}px, -24px) scale(0.6)`,
              opacity: animateIn ? 1 : 0,
              pointerEvents: animateIn ? 'auto' : 'none',
              transition: `transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${animateIn ? openDelay : closeDelay}s, opacity 0.25s ease ${animateIn ? openDelay : closeDelay}s`,
              bottom: 0,
              right: 0
            }}
            title={contact.label}
            aria-label={contact.label}
          >
            {contact.icon}
            {/* Libellé à gauche de l'icône */}
            <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-lg">
              {contact.label}
            </span>
          </a>
        );
      })}

      {/* Main FAB button */}
      <button
        onClick={() => {
          // Haptic feedback on mobile
          if ('vibrate' in navigator) {
            navigator.vibrate(10);
          }
          setIsOpen(!isOpen);
        }}
        className={cn(
"w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300",
          isOpen 
            ? "bg-ink rotate-180" 
            : "bg-primary hover:bg-primary/90"
        )}
        style={{
          animation: 'pulse-subtle 2s ease-in-out infinite'
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-parchment transition-transform duration-300" strokeWidth={1.75} />
        ) : (
          <MessageSquare className="w-6 h-6 text-ink transition-transform duration-300" strokeWidth={1.75} />
        )}
      </button>

      {/* Backdrop when open */}
      {shouldRender && (
        <div 
          className={cn(
"fixed inset-0 bg-ink/30 backdrop-blur-sm -z-10 transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsOpen(false)}
        />
      )}

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% {
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }
          50% {
            box-shadow: 0 4px 25px rgba(0, 0, 0, 0.35);
          }
        }
      `}</style>
    </div>
  );
};

export default ContactFab;
