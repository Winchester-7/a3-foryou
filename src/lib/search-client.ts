/**
 * The search index is big (every decor, door, sofa...), so it is not sent with each page.
 * It is fetched once, on first use (or when the pointer nears the search button), and kept.
 * @author Erbol king
 */
import type { SearchDoc } from './search';

let pending: Promise<SearchDoc[]> | null = null;

export function loadSearchIndex(): Promise<SearchDoc[]> {
  if (!pending) {
    pending = fetch('/api/search-index')
      .then((r) => (r.ok ? (r.json() as Promise<SearchDoc[]>) : Promise.reject(new Error(String(r.status)))))
      .catch((e) => {
        pending = null; // try again next time
        throw e;
      });
  }
  return pending;
}

export function warmSearchIndex(): void {
  loadSearchIndex().catch(() => {});
}
