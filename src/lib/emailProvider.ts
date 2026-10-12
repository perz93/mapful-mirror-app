/** Nom du service de messagerie d'après le domaine de l'adresse (Gmail, Hotmail…). */
const PROVIDERS: Array<{ label: string; domains: string[] }> = [
  { label: 'Gmail', domains: ['gmail.com', 'googlemail.com'] },
  { label: 'Hotmail', domains: ['hotmail.com', 'hotmail.fr'] },
  { label: 'Outlook', domains: ['outlook.com', 'outlook.fr', 'live.com', 'live.fr', 'msn.com'] },
  { label: 'Yahoo', domains: ['yahoo.com', 'yahoo.fr', 'ymail.com'] },
  { label: 'iCloud', domains: ['icloud.com', 'me.com', 'mac.com'] },
  { label: 'Proton', domains: ['proton.me', 'protonmail.com'] },
];

export function emailProviderLabel(email: string): string {
  const domain = email.trim().toLowerCase().split('@')[1] ?? '';
  const found = PROVIDERS.find((p) => p.domains.includes(domain));
  return found ? found.label : 'Email';
}

export function mailtoHref(email: string, subject?: string): string {
  return `mailto:${email.trim()}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
}
