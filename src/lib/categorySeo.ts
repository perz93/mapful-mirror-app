/**
 * Textes de référencement des pages catégorie (/concerts, /soirees…).
 * Partagé entre l'app (CategoryPage) et le serveur (middleware.ts) :
 * ce fichier ne doit importer aucun autre module.
 */

export interface CategorySeo {
  /** Valeur stockée dans events.category ('all' = toutes) */
  category: string;
  path: string;
  /** Libellé court pour les liens entre catégories */
  label: string;
  /** Titre de l'onglet et du résultat Google (sans « | Upvibe ») */
  title: string;
  /** Phrase d'introduction affichée sur le site et reprise en description */
  intro: string;
}

export const CATEGORY_SEO: CategorySeo[] = [
  {
    category: 'all', path: '/evenements', label: 'Tout',
    title: "Événements à Abidjan aujourd'hui et ce week-end",
    intro: "Tous les événements à venir à Abidjan : soirées, concerts, brunchs, expos, sport, conférences… Pour chacun : la date, le lieu, le prix et l'itinéraire.",
  },
  {
    category: 'nightlife', path: '/soirees', label: 'Soirées',
    title: 'Soirées à Abidjan : clubs, rooftops et afterworks',
    intro: "Les soirées à venir à Abidjan : clubs, rooftops, afterworks, soirées à thème. Pour chacune : la date, le lieu, le prix et l'itinéraire.",
  },
  {
    category: 'music', path: '/concerts', label: 'Concerts',
    title: 'Concerts à Abidjan : dates, lieux et prix',
    intro: "Les concerts à venir à Abidjan : live, showcases, rap, zouglou, coupé-décalé, gospel. Pour chacun : la date, le lieu, le prix et l'itinéraire.",
  },
  {
    category: 'festivals', path: '/festivals', label: 'Festivals',
    title: "Festivals à Abidjan et en Côte d'Ivoire",
    intro: "Les festivals à venir à Abidjan et en Côte d'Ivoire : musique, culture, gastronomie. Pour chacun : les dates, le lieu, le prix et l'itinéraire.",
  },
  {
    category: 'shows', path: '/shows', label: 'Spectacles',
    title: 'Spectacles et humour à Abidjan',
    intro: "Les spectacles à venir à Abidjan : stand-up, théâtre, danse, one-man-shows. Pour chacun : la date, le lieu, le prix et l'itinéraire.",
  },
  {
    category: 'brunch', path: '/brunch', label: 'Brunchs',
    title: 'Brunchs et sorties food à Abidjan',
    intro: "Les brunchs et rendez-vous food à venir à Abidjan : brunchs du dimanche, dégustations, food markets, dîners à thème. Date, lieu, prix et itinéraire.",
  },
  {
    category: 'exhibitions', path: '/exhibitions', label: 'Expos',
    title: 'Expositions et sorties culturelles à Abidjan',
    intro: "Les expositions et sorties culturelles à venir à Abidjan : vernissages, galeries, projections. Pour chacune : la date, le lieu, le prix et l'itinéraire.",
  },
  {
    category: 'conferences', path: '/conferences', label: 'Business',
    title: 'Conférences et networking à Abidjan',
    intro: "Les conférences et rencontres pro à venir à Abidjan : meetups, afterworks networking, salons. Pour chacune : la date, le lieu, le prix et l'itinéraire.",
  },
  {
    category: 'workshops', path: '/workshops', label: 'Ateliers',
    title: 'Ateliers et formations à Abidjan',
    intro: "Les ateliers et formations à venir à Abidjan : ateliers créatifs, masterclass, formations courtes. Pour chacun : la date, le lieu, le prix et l'itinéraire.",
  },
  {
    category: 'sports', path: '/sports', label: 'Sport',
    title: 'Sport et bien-être à Abidjan',
    intro: "Les événements sport et bien-être à venir à Abidjan : courses, tournois, yoga, séances collectives. Pour chacun : la date, le lieu, le prix et l'itinéraire.",
  },
  {
    category: 'family', path: '/famille', label: 'En famille',
    title: 'Sorties en famille et activités enfants à Abidjan',
    intro: "Les sorties en famille à venir à Abidjan : activités pour enfants, fêtes, sorties du week-end. Pour chacune : la date, le lieu, le prix et l'itinéraire.",
  },
  {
    category: 'religious', path: '/religious', label: 'Religieux',
    title: 'Cultes, veillées et concerts gospel à Abidjan',
    intro: "Les événements religieux à venir à Abidjan : cultes, veillées, concerts gospel, retraites. Pour chacun : la date, le lieu et l'itinéraire.",
  },
  {
    category: 'other', path: '/autres', label: 'Autres',
    title: 'Autres événements à Abidjan',
    intro: "Les autres événements à venir à Abidjan, qui n'entrent dans aucune catégorie. Pour chacun : la date, le lieu, le prix et l'itinéraire.",
  },
];

/** Anciennes clés de catégorie regroupées (même table que eventCategories.ts) */
export const CATEGORY_LEGACY: Record<string, string> = { meetups: 'conferences', food: 'brunch', arts: 'exhibitions' };

export const categorySeoByPath = (path: string) => CATEGORY_SEO.find((c) => c.path === path);
export const categorySeoByCategory = (category: string) => CATEGORY_SEO.find((c) => c.category === category);

/** Description courte (≤ 160 caractères) pour Google */
export const categoryDescription = (seo: CategorySeo) => {
  const text = `${seo.intro} Gratuit, sur la carte Upvibe.`;
  if (text.length <= 160) return text;
  if (seo.intro.length <= 160) return seo.intro;
  return `${seo.intro.slice(0, seo.intro.lastIndexOf(' ', 157))}…`;
};
