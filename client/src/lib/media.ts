/**
 * Single source of truth for turning an API-relative upload path
 * (e.g. "/uploads/photo-123.jpg") into an absolute URL the browser can load.
 *
 * Replaces the copy-pasted `getImageSrc` / `apiBaseUrl` blocks that previously
 * lived in HomePage, EventsPage, AdminLayout, EventManagerPage, ContentManagerPage
 * and UserManagerPage — each with a slightly different port fallback.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/** The API origin without the trailing `/api` segment. */
export const apiOrigin = API_URL.replace(/\/api\/?$/, '');

export const resolveMediaUrl = (path?: string | null): string => {
  if (!path) return '';
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path;
  return `${apiOrigin}${path.startsWith('/') ? '' : '/'}${path}`;
};
