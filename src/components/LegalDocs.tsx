/**
 * Documents légaux d'Upvibe (version de référence en français) : mentions
 * légales, conditions d'utilisation, politique de confidentialité.
 * Utilisés par la page publique /legal/:doc et par les Paramètres.
 */

export const LEGAL_UPDATED = '11 novembre 2026';
export const CONTACT_EMAIL = 'contact@upvibe.app';

export type LegalDocKey = 'mentions' | 'conditions' | 'confidentialite';

export const LEGAL_TITLES: Record<LegalDocKey, string> = {
  mentions: 'Mentions légales',
  conditions: "Conditions d'utilisation",
  confidentialite: 'Politique de confidentialité',
};

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-6 font-display text-[17px] font-bold tracking-[-0.02em] text-ink">{children}</h2>
);
const P = ({ children }: { children: React.ReactNode }) => <p className="mt-2">{children}</p>;
const List = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="mt-2 list-disc space-y-1.5 pl-5">
    {items.map((item, i) => <li key={i}>{item}</li>)}
  </ul>
);
const Mail = () => <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-ink underline">{CONTACT_EMAIL}</a>;

const Mentions = () => (
  <>
    <H>Éditeur</H>
    <P>
      Upvibe est un service édité depuis Abidjan, Côte d'Ivoire. Il comprend le site upvibe.app et
      l'application qui s'installe depuis ce site.
    </P>
    <P>Contact : <Mail /></P>

    <H>Hébergement</H>
    <List items={[
      <>Site et application : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</>,
      <>Base de données, comptes et images : Supabase Inc., sur des serveurs situés en Irlande (Union européenne).</>,
      <>Nom de domaine et réseau : Cloudflare, Inc.</>,
    ]} />

    <H>Propriété intellectuelle</H>
    <P>
      Le nom Upvibe, le logo, le design et le code de l'application appartiennent à leur éditeur.
      Il est interdit de les copier ou de les réutiliser sans accord écrit.
    </P>
    <P>
      Les affiches, photos et textes des événements et des annonces restent la propriété de ceux
      qui les publient. Si un contenu utilise ton travail sans ton accord, écris-nous : nous le
      retirons après vérification.
    </P>

    <H>Fond de carte</H>
    <P>
      La carte utilise les données d'OpenStreetMap et de ses contributeurs (licence ODbL), servies
      par OpenFreeMap.
    </P>

    <H>Signaler un contenu</H>
    <P>
      Un événement faux, une arnaque, un contenu choquant ? Écris à <Mail /> avec le lien de la
      page. Nous traitons les signalements sous 48 heures.
    </P>
  </>
);

const Conditions = () => (
  <>
    <P>
      Ces conditions s'appliquent dès que tu utilises Upvibe, avec ou sans compte. Si tu n'es pas
      d'accord avec elles, n'utilise pas le service.
    </P>

    <H>1. Ce que fait Upvibe</H>
    <P>
      Upvibe affiche sur une carte les événements publiés par leurs organisateurs, et propose un
      Marketplace où des prestataires (DJ, traiteurs, salles, photographes…) présentent leurs
      services. L'utilisation est gratuite.
    </P>
    <P>
      Upvibe n'organise aucun événement et ne vend aucun billet. Les prix affichés sont ceux
      annoncés par l'organisateur ou le prestataire : tu traites directement avec lui.
    </P>

    <H>2. Ton compte</H>
    <List items={[
      'Un compte est nécessaire pour publier un événement ou une annonce, et pour garder tes favoris et tes rappels.',
      'Donne une adresse e-mail valide : elle sert à confirmer ton inscription et à récupérer ton mot de passe.',
      "Garde ton mot de passe pour toi. Ce qui est fait depuis ton compte est sous ta responsabilité.",
      "Si tu es mineur, utilise Upvibe avec l'accord d'un parent ou d'un tuteur.",
    ]} />

    <H>3. Ce que tu publies</H>
    <P>Tu es responsable de tes événements, annonces, photos et textes. Tu t'engages à :</P>
    <List items={[
      'publier des informations exactes : date, lieu, prix, contacts ;',
      "n'utiliser que des images et des textes que tu as le droit d'utiliser ;",
      'ne rien publier de faux, trompeur, haineux, violent, à caractère sexuel ou contraire à la loi ivoirienne ;',
      'mettre à jour ou supprimer ta publication si ton événement est modifié ou annulé.',
    ]} />
    <P>
      En publiant, tu autorises Upvibe à afficher ton contenu dans l'application, sur le site, dans
      les notifications et dans les aperçus de liens, pour faire connaître ta publication. Tu en
      restes propriétaire et tu peux la supprimer quand tu veux.
    </P>
    <P>Pour limiter les abus, un compte peut publier au maximum 10 événements ou annonces par 24 heures.</P>

    <H>4. Modération</H>
    <P>
      Nous pouvons retirer un contenu qui ne respecte pas ces conditions, et suspendre ou fermer
      le compte de son auteur en cas d'abus grave ou répété. Tu peux contester une décision en
      écrivant à <Mail />.
    </P>

    <H>5. Sorties, billets et prestations</H>
    <P>
      Vérifie toujours les informations auprès de l'organisateur ou du prestataire avant de te
      déplacer ou de payer. Upvibe n'est pas partie aux accords que tu passes avec eux et ne peut
      pas être tenu responsable d'une annulation, d'un changement de programme, d'un prix
      différent, d'un refus d'entrée ou d'une prestation mal exécutée.
    </P>

    <H>6. Position et itinéraires</H>
    <P>
      Le partage de ta position est facultatif. Les itinéraires et les durées de trajet sont
      donnés à titre indicatif : respecte toujours la route et les conditions réelles.
    </P>

    <H>7. Disponibilité</H>
    <P>
      Nous faisons de notre mieux pour qu'Upvibe fonctionne en continu, sans pouvoir le garantir.
      Le service peut être interrompu pour maintenance ou évoluer sans préavis.
    </P>

    <H>8. Fermer ton compte</H>
    <P>
      Tu peux supprimer tes publications toi-même. Pour fermer ton compte et effacer tes données,
      écris à <Mail /> depuis l'adresse de ton compte : c'est fait sous 30 jours.
    </P>

    <H>9. Modification de ces conditions</H>
    <P>
      Si ces conditions changent de façon importante, nous te prévenons dans l'application.
      Continuer à utiliser Upvibe après la date d'effet vaut acceptation.
    </P>

    <H>10. Droit applicable</H>
    <P>
      Ces conditions sont soumises au droit ivoirien. En cas de désaccord, écris-nous d'abord pour
      chercher une solution. À défaut, les tribunaux d'Abidjan sont compétents.
    </P>
  </>
);

const Confidentialite = () => (
  <>
    <P>
      Cette page explique quelles données Upvibe utilise, pourquoi, et comment tu gardes la main
      dessus. Upvibe respecte la loi ivoirienne n° 2013-450 du 19 juin 2013 sur la protection des
      données à caractère personnel.
    </P>

    <H>1. Les données que nous utilisons</H>
    <List items={[
      <><strong>Ton compte</strong> : adresse e-mail, mot de passe (enregistré chiffré, illisible pour nous), nom, et photo ou présentation si tu en ajoutes.</>,
      <><strong>Tes publications</strong> : événements et annonces, avec leurs photos et les contacts que tu choisis d'afficher (téléphone, WhatsApp, e-mail, réseaux sociaux). Ces informations sont publiques.</>,
      <><strong>Ton activité</strong> : tes favoris, tes rappels et les notifications qui t'ont été envoyées.</>,
      <><strong>Les notifications</strong> : si tu les actives, un identifiant technique de ton appareil qui permet de te les envoyer.</>,
      <><strong>Ta position</strong> : si tu l'autorises, elle sert à te situer sur la carte, à calculer les distances et à t'alerter près d'un événement. Elle est utilisée sur ton téléphone et n'est pas enregistrée sur nos serveurs.</>,
    ]} />
    <P>
      Upvibe n'utilise ni publicité ciblée, ni outil de mesure d'audience, ni cookie publicitaire.
      Seul un stockage technique est utilisé sur ton appareil : il garde ta session, tes
      préférences et la dernière liste d'événements pour un affichage plus rapide.
    </P>

    <H>2. À quoi elles servent</H>
    <List items={[
      'créer et sécuriser ton compte ;',
      'afficher les événements et les annonces ;',
      "t'envoyer les e-mails du compte (code de confirmation, mot de passe oublié) et les notifications que tu as activées ;",
      'lutter contre les abus et les fausses publications.',
    ]} />
    <P>Nous ne vendons pas tes données et nous ne les utilisons pas pour de la publicité.</P>

    <H>3. Qui y a accès</H>
    <P>Des prestataires techniques traitent certaines données pour faire fonctionner le service :</P>
    <List items={[
      <><strong>Supabase</strong> : base de données, comptes et images (serveurs en Irlande).</>,
      <><strong>Vercel</strong> : hébergement du site et de l'application (États-Unis).</>,
      <><strong>Brevo</strong> : envoi des e-mails du compte.</>,
      <><strong>Cloudflare</strong> : nom de domaine et réception des e-mails de contact.</>,
      <><strong>Apple et Google</strong> : acheminement des notifications vers ton téléphone.</>,
      <><strong>OpenStreetMap, OpenFreeMap et OSRM</strong> : fond de carte, recherche d'adresse et itinéraires. Quand tu cherches une adresse ou lances un itinéraire, le texte recherché ou les points de départ et d'arrivée leur sont envoyés, sans ton nom ni ton compte.</>,
    ]} />
    <P>
      Certains de ces prestataires sont situés hors de Côte d'Ivoire. Tes données peuvent aussi
      être communiquées aux autorités si la loi l'exige.
    </P>

    <H>4. Combien de temps</H>
    <List items={[
      'Compte et publications : tant que ton compte existe.',
      'Historique des notifications : 90 jours.',
      'Après une demande de suppression : tout est effacé sous 30 jours.',
    ]} />

    <H>5. Tes droits</H>
    <P>
      Tu peux consulter, corriger ou faire supprimer tes données, et t'opposer à leur
      utilisation. Tu modifies ton profil et tes publications directement dans l'application.
      Pour le reste, écris à <Mail /> : nous répondons sous 30 jours.
    </P>
    <P>
      Tu peux retirer à tout moment l'accès à ta position ou aux notifications dans les réglages
      de ton téléphone.
    </P>
    <P>
      Si tu estimes que tes droits ne sont pas respectés, tu peux saisir l'ARTCI, l'autorité
      ivoirienne chargée de la protection des données.
    </P>

    <H>6. Sécurité</H>
    <P>
      Les échanges sont chiffrés (HTTPS), les mots de passe sont enregistrés chiffrés, et chaque
      compte n'a accès qu'à ses propres données privées.
    </P>
  </>
);

const DOCS: Record<LegalDocKey, () => JSX.Element> = {
  mentions: Mentions,
  conditions: Conditions,
  confidentialite: Confidentialite,
};

/** Corps d'un document légal (sans titre de page) */
export const LegalDoc = ({ doc, className = '' }: { doc: LegalDocKey; className?: string }) => {
  const Body = DOCS[doc];
  return (
    <div className={`text-[14.5px] leading-relaxed text-stone-600 ${className}`}>
      <p className="text-[12.5px] text-stone-500">Dernière mise à jour : {LEGAL_UPDATED}</p>
      <Body />
    </div>
  );
};
