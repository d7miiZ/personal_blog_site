/**
 * Prefix an internal path with the site's base URL.
 * Works for both "/" (no base) and "/repo-name" style bases.
 *
 * Usage: href={link('/writing')}  →  /personal_blog_site/writing
 */
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function link(path: string): string {
  if (!path.startsWith('/')) return path;
  return base + path;
}
