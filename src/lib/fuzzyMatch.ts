/**
 * Fuzzy search — tolerant to typos, accents, and partial matches.
 * Returns true if `query` approximately matches `text`.
 */

// Remove accents: é→e, à→a, etc.
const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

// Levenshtein distance (edit distance between two strings)
function editDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // deletion
        matrix[i][j - 1] + 1,       // insertion
        matrix[i - 1][j - 1] + cost  // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Check if query fuzzy-matches text.
 * - Exact substring match (with accent removal) → true
 * - Any word in text starts with query → true
 * - Edit distance ≤ threshold → true (typo tolerance)
 */
export function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;

  const nText = normalize(text);
  const nQuery = normalize(query);

  if (!nQuery) return true;

  // Exact substring match
  if (nText.includes(nQuery)) return true;

  // Check if any word starts with the query
  const words = nText.split(/\s+/);
  if (words.some(w => w.startsWith(nQuery))) return true;

  // Split query into words and check each
  const queryWords = nQuery.split(/\s+/);
  const allWordsMatch = queryWords.every(qw => {
    // Substring match
    if (nText.includes(qw)) return true;
    // Word-start match
    if (words.some(w => w.startsWith(qw))) return true;
    // Fuzzy match per word: allow ~1 typo per 3 chars (min 1)
    const threshold = Math.max(1, Math.floor(qw.length / 3));
    return words.some(w => editDistance(w.substring(0, qw.length + 2), qw) <= threshold);
  });

  if (allWordsMatch) return true;

  // Full string fuzzy: allow typos proportional to query length
  const fullThreshold = Math.max(1, Math.floor(nQuery.length / 4));
  if (nQuery.length >= 3 && editDistance(nText.substring(0, nQuery.length + 2), nQuery) <= fullThreshold) {
    return true;
  }

  return false;
}
