import { stripHtml } from './stringUtils';

/**
 * Whitelist of allowed HTML tags in TVmaze summaries.
 */
const ALLOWED_TAGS = new Set(['p', 'b', 'strong', 'i', 'em', 'span', 'br', 'ul', 'ol', 'li', 'small']);

/**
 * Recursively converts safe DOM nodes into native React elements.
 * Prevents any execution of scripts, iframes, styles, or event handlers.
 * Never uses dangerouslySetInnerHTML.
 * 
 * @param {Node} node 
 * @param {string} keyPrefix 
 * @returns {React.ReactNode}
 */
function domNodeToReact(node, keyPrefix = 'node') {
  if (!node) return null;

  // Text nodes: return plain text string
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }

  // Element nodes
  if (node.nodeType === Node.ELEMENT_NODE) {
    const tagName = node.tagName.toLowerCase();

    // If tag is not in whitelist, recursively process its children as plain text/elements
    if (!ALLOWED_TAGS.has(tagName)) {
      const childNodes = Array.from(node.childNodes);
      return childNodes.map((child, index) =>
        domNodeToReact(child, `${keyPrefix}-${index}`)
      );
    }

    // Process children
    const childNodes = Array.from(node.childNodes);
    const children = childNodes.map((child, index) =>
      domNodeToReact(child, `${keyPrefix}-${tagName}-${index}`)
    );

    // Map to React safe elements
    switch (tagName) {
      case 'p':
        return <p key={keyPrefix} className="show-summary-paragraph">{children}</p>;
      case 'b':
      case 'strong':
        return <strong key={keyPrefix}>{children}</strong>;
      case 'i':
      case 'em':
        return <em key={keyPrefix}>{children}</em>;
      case 'br':
        return <br key={keyPrefix} />;
      case 'ul':
        return <ul key={keyPrefix}>{children}</ul>;
      case 'ol':
        return <ol key={keyPrefix}>{children}</ol>;
      case 'li':
        return <li key={keyPrefix}>{children}</li>;
      case 'small':
        return <small key={keyPrefix}>{children}</small>;
      case 'span':
      default:
        return <span key={keyPrefix}>{children}</span>;
    }
  }

  return null;
}

/**
 * Parses raw HTML into safe DOM nodes.
 */
function parseHtmlNodes(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return null;
  if (typeof DOMParser === 'undefined') return null;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
    return Array.from(doc.body.childNodes);
  } catch {
    return null;
  }
}

/**
 * Safely parses and renders a TVmaze HTML summary into clean React elements
 * without injecting raw untrusted HTML into the DOM.
 * 
 * @param {Object} props
 * @param {string} props.rawHtml - HTML string from TVmaze API.
 * @returns {React.ReactNode}
 */
export function SafeSummary({ rawHtml }) {
  if (!rawHtml || typeof rawHtml !== 'string' || !rawHtml.trim()) {
    return (
      <p className="summary-empty">
        No summary is currently available for this series.
      </p>
    );
  }

  const nodes = parseHtmlNodes(rawHtml);

  if (!nodes || nodes.length === 0) {
    return <p className="show-summary-paragraph">{stripHtml(rawHtml)}</p>;
  }

  return (
    <div className="show-summary-content">
      {nodes.map((node, index) => domNodeToReact(node, `summary-${index}`))}
    </div>
  );
}
