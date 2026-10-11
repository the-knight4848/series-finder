import { useState } from 'react';

/**
 * Robust image component for show posters with automatic fallback
 * if image URL is missing or fails to load.
 */
export default function PosterImage({
  src,
  alt,
  title,
  className = '',
  loading = 'lazy',
}) {
  const [hasError, setHasError] = useState(false);

  // If no source or image loading errored, show styled placeholder
  if (!src || hasError) {
    return (
      <div
        className={`poster-placeholder ${className}`}
        aria-label={`${alt || title} (No poster available)`}
      >
        <div className="placeholder-icon" aria-hidden="true">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
            <polyline points="17 2 12 7 7 2" />
            <line x1="8" y1="21" x2="16" y2="21" />
          </svg>
        </div>
        <span className="placeholder-title" title={title}>
          {title}
        </span>
        <span className="placeholder-tag">No Poster</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || `Poster for ${title}`}
      className={`poster-image ${className}`}
      loading={loading}
      onError={() => setHasError(true)}
    />
  );
}
