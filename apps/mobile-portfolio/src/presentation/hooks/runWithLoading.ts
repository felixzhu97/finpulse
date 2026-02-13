export async function runWithLoading<T>(
  setLoading: (v: boolean) => void,
  setError: (v: string | null) => void,
  fn: () => Promise<T>,
  fallback: T,
  errorMessage: string
): Promise<T> {
  setLoading(true);
  setError(null);
  try {
    return await fn();
  } catch (err) {
    setError(err instanceof Error ? err.message : errorMessage);
    return fallback;
  } finally {
    setLoading(false);
  }
}
