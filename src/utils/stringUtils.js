/**
 * Strips all HTML tags from a string and returns clean plain text.
 * 
 * @param {string} html - HTML string to strip.
 * @returns {string} Plain text with tags removed.
 */
export function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  
  if (typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || '';
    } catch {
      // Fallback below
    }
  }

  // Regex fallback for non-DOM environments
  return html.replace(/<[^>]*>?/gm, '').trim();
}
