import { useState, useEffect } from 'react';
import { Phone, Instagram, Facebook, MessageCircle, X, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactFabProps {
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  contactInstagram?: string | null;
  contactFacebook?: string | null;
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
      bgColor: 'bg-green-500',
      label: 'Téléphone'
    });
  }
  
  if (contactWhatsapp) {
    contacts.push({
      icon: <MessageCircle className="w-5 h-5 text-white" />,
      href: `https://wa.me/${contactWhatsapp.replace(/[^0-9]/g, '')}`,
      bgColor: 'bg-green-600',
      label: 'WhatsApp'
    });
  }
  
  if (contactInstagram) {
    contacts.push({
      icon: <Instagram className="w-5 h-5 text-white" />,
      href: `https://instagram.com/${contactInstagram.replace('@', '')}`,
      bgColor: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
      label: 'Instagram'
    });
  }
  
  if (contactFacebook) {
    contacts.push({
      icon: <Facebook className="w-5 h-5 text-white" />,
      href: `https://facebook.com/${contactFacebook}`,
      bgColor: 'bg-blue-600',
      label: 'Facebook'
    });
  }
  
  if (contactTwitter) {
    contacts.push({
      icon: <span className="text-white font-bold text-base">𝕏</span>,
      href: `https://x.com/${contactTwitter.replace('@', '')}`,
      bgColor: 'bg-black',
      label: 'X'
    });
  }

  const hasContacts = contacts.length > 0;

  // Semi-circle fan towards upper-left with generous spacing
  const getPosition = (index: number, total: number) => {
    if (total === 1) {
      return { x: 0, y: -90 };
    }

    // Bigger radius = more space between icons
    const radius = 75 + total * 15;
    // Spread from 90° (straight up) to 180° (straight left)
    const startAngle = 90;
    const endAngle = 185;
    const angleStep = (endAngle - startAngle) / (total - 1);
    const angle = (startAngle + index * angleStep) * (Math.PI / 180);

    return {
      x: Math.cos(angle) * radius,
      y: -Math.sin(angle) * radius
    };
  };

  if (!hasContacts) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Contact icons in semi-circle */}
      {shouldRender && contacts.map((contact, index) => {
        const position = getPosition(index, contacts.length);
        const openDelay = index * 0.13;
        const closeDelay = (contacts.length - index - 1) * 0.08;

        return (
          <a
            key={index}
            href={contact.href}
            target="_self"
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
                ? `translate(${position.x}px, ${position.y}px) scale(1) rotate(0deg)`
                : 'translate(0, 0) scale(0.3) rotate(-45deg)',
              opacity: animateIn ? 1 : 0,
              pointerEvents: animateIn ? 'auto' : 'none',
              transition: `transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${animateIn ? openDelay : closeDelay}s, opacity 0.35s ease ${animateIn ? openDelay : closeDelay}s`,
              bottom: 0,
              right: 0
            }}
            title={contact.label}
          >
            {contact.icon}
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
            ? "bg-stone-800 rotate-180" 
            : "bg-primary hover:bg-primary/90"
        )}
        style={{
          animation: 'pulse-subtle 2s ease-in-out infinite'
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white transition-transform duration-300" />
        ) : (
          <MessageSquare className="w-6 h-6 text-white transition-transform duration-300" />
        )}
      </button>

      {/* Backdrop when open */}
      {shouldRender && (
        <div 
          className={cn(
            "fixed inset-0 bg-black/30 backdrop-blur-sm -z-10 transition-opacity duration-300",
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
