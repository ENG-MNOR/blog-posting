/**
 * Single source of truth for turning an API-relative upload path
 * (e.g. "/uploads/photo-123.jpg") into a URL the browser can load.
 *
 * By default uploads are served **from the site's own origin** — Vite proxies
 * `/uploads` to the API in dev, and Express serves both the SPA and `/uploads`
 * in production. This keeps images working under the app's CSP and regardless
 * of which host the API lives on.
 *
 * Overrides, in order of precedence:
 *   1. `VITE_MEDIA_BASE` — an explicit absolute base (CDN / separate media host)
 *   2. an absolute `VITE_API_URL` — media is taken from that API's origin
 *   3. otherwise: same-origin (paths are returned root-relative)
 */
const MEDIA_BASE = (import.meta.env.VITE_MEDIA_BASE || '').replace(/\/+$/, '');
const API_URL = import.meta.env.VITE_API_URL || '/api';

const apiIsAbsolute = /^https?:\/\//i.test(API_URL);

/** Absolute origin uploads are served from, or '' for same-origin. */
export const apiOrigin = MEDIA_BASE
  ? MEDIA_BASE
  : apiIsAbsolute
    ? API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '')
    : '';

export const resolveMediaUrl = (path?: string | null): string => {
  if (!path) return '';
  // Already a full URL or inline data — leave it alone.
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const rel = path.startsWith('/') ? path : `/${path}`;
  return `${apiOrigin}${rel}`;
};
