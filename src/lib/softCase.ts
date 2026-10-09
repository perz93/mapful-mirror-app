/**
 * Affiche les textes saisis EN MAJUSCULES en minuscules (1re lettre en
 * capitale) : « POOL PARTY » → « Pool party », « ANGRÉ 7eme tranche » →
 * « Angré 7eme tranche ». Les mots déjà en casse mixte ne bougent pas.
 */
export const softCase = (text?: string | null): string => {
  if (!text) return '';
  const out = text.replace(/\p{L}[\p{L}'’-]*/gu, (word) =>
    word.length > 1 && word === word.toLocaleUpperCase('fr') && word !== word.toLocaleLowerCase('fr')
      ? word.toLocaleLowerCase('fr')
      : word,
  );
  return out.charAt(0).toLocaleUpperCase('fr') + out.slice(1);
};
