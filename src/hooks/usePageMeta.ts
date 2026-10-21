import { useEffect } from 'react';

const SITE = 'Upvibe';
const DEFAULT_TITLE = 'Upvibe — Découvre les events à Abidjan';

const setMeta = (selector: string, content: string) => {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content);
};

/**
 * Titre d'onglet et description de la page (Google lit le rendu JS).
 * Les aperçus de partage des pages événement / annonce sont générés
 * côté serveur par middleware.ts.
 */
export const usePageMeta = (title?: string | null, description?: string | null) => {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    const previousDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? '';
    document.title = `${title} | ${SITE}`;
    if (description) {
      const text = description.replace(/\s+/g, ' ').trim().slice(0, 160);
      setMeta('meta[name="description"]', text);
    }
    return () => {
      document.title = previous || DEFAULT_TITLE;
      setMeta('meta[name="description"]', previousDescription);
    };
  }, [title, description]);
};
