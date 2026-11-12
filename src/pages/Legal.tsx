import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LegalDoc, LEGAL_TITLES, type LegalDocKey } from '@/components/LegalDocs';
import { usePageMeta } from '@/hooks/usePageMeta';

/** Pages publiques /legal/mentions, /legal/conditions, /legal/confidentialite */
const Legal = () => {
  const { doc } = useParams<{ doc: string }>();
  const key = (doc && doc in LEGAL_TITLES ? doc : null) as LegalDocKey | null;
  usePageMeta(key ? LEGAL_TITLES[key] : null);
  if (!key) return <Navigate to="/legal/mentions" replace />;

  return (
    <div className="min-h-[100dvh] bg-white text-ink">
      <div className="mx-auto max-w-2xl px-5 pb-16 pt-5" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)' }}>
        <Link to="/" aria-label="Retour" className="flex size-11 items-center justify-center rounded-full bg-parchment active:scale-95">
          <ArrowLeft size={18} strokeWidth={1.9} />
        </Link>
        <h1 className="mt-6 text-[34px] !font-[800] leading-none tracking-[-0.04em]">{LEGAL_TITLES[key]}</h1>
        <nav aria-label="Documents légaux" className="mt-5 flex flex-wrap gap-2">
          {(Object.keys(LEGAL_TITLES) as LegalDocKey[]).map((k) => (
            <Link
              key={k}
              to={`/legal/${k}`}
              replace
              className={`rounded-full px-4 py-2 text-[13.5px] font-semibold ${k === key ? 'bg-ink text-parchment' : 'bg-parchment text-ink'}`}
            >
              {LEGAL_TITLES[k]}
            </Link>
          ))}
        </nav>
        <LegalDoc doc={key} className="mt-6" />
        <p className="mt-10 text-[12.5px] text-stone-500">© {new Date().getFullYear()} Upvibe. Tous droits réservés.</p>
      </div>
    </div>
  );
};

export default Legal;
