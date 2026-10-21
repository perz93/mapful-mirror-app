type SaveResult = { error: { code?: string; message: string } | null };

/**
 * Enregistre `payload` ; si la base n'a pas encore les nouvelles colonnes
 * (migration pas encore appliquée), réessaie sans elles plutôt que d'échouer.
 */
export async function retryWithoutNewColumns<P extends Record<string, unknown>>(
  payload: P,
  newKeys: string[],
  run: (p: P) => PromiseLike<SaveResult>,
): Promise<SaveResult> {
  const res = await run(payload);
  const missingColumn =
    res.error && (res.error.code === 'PGRST204' || /column|schema cache/i.test(res.error.message));
  if (!missingColumn) return res;
  const stripped = { ...payload };
  for (const k of newKeys) delete stripped[k];
  return run(stripped);
}
