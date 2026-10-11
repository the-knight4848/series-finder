import { useEffect, useRef } from 'react';
import PosterImage from './PosterImage';
import { SafeSummary } from '../utils/sanitize';

/**
 * Formats YYYY-MM-DD date string into a friendly localized date
 */
function formatDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return 'Not specified';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function ShowDetails({ show, onClose }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!show) return;

    // Save previous active element to restore focus later
    const previousActiveElement = document.activeElement;

    // Focus close button initially
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Lock background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Handle Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (previousActiveElement && previousActiveElement.focus) {
        previousActiveElement.focus();
      }
    };
  }, [show, onClose]);

  if (!show) return null;

  const {
    name = 'Series Details',
    image,
    summary,
    premiered,
    ended,
    rating,
    genres = [],
    status = 'Unknown',
    language = 'Unknown',
    officialSite,
    url: tvmazeUrl,
    network,
    webChannel,
    runtime,
    averageRuntime,
  } = show;

  const posterUrl = image?.original || image?.medium || null;
  const ratingAverage = rating?.average;
  const channelName = network?.name || webChannel?.name;
  const duration = runtime || averageRuntime;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="show-detail-title"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-meta">
            <span className={`modal-status-badge status-${status.toLowerCase().replace(/\s+/g, '-')}`}>
              {status}
            </span>
            {channelName && (
              <span className="modal-channel-badge">{channelName}</span>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close show details"
            title="Close (Esc)"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-content">
          <div className="modal-grid">
            {/* Poster Column */}
            <div className="modal-poster-col">
              <PosterImage
                src={posterUrl}
                alt={`Poster for ${name}`}
                title={name}
                className="modal-poster"
                loading="eager"
              />

              {/* Rating Card */}
              <div className="detail-rating-box">
                <div className="rating-score">
                  <svg
                    className="modal-star-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="none"
                    aria-hidden="true"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="score-value">
                    {ratingAverage ? ratingAverage.toFixed(1) : 'N/A'}
                  </span>
                  <span className="score-max">/ 10</span>
                </div>
                <span className="rating-source">TVmaze User Rating</span>
              </div>
            </div>

            {/* Info Column */}
            <div className="modal-info-col">
              <h2 id="show-detail-title" className="modal-title">
                {name}
              </h2>

              {/* Genres */}
              <div className="modal-genres">
                {genres && genres.length > 0 ? (
                  genres.map((genre) => (
                    <span key={genre} className="modal-genre-badge">
                      {genre}
                    </span>
                  ))
                ) : (
                  <span className="modal-genre-badge genre-empty">Genre unlisted</span>
                )}
              </div>

              {/* Key metadata grid */}
              <div className="metadata-table">
                <div className="meta-item">
                  <span className="meta-label">Premiere Date</span>
                  <span className="meta-value">{formatDate(premiered)}</span>
                </div>

                {ended && (
                  <div className="meta-item">
                    <span className="meta-label">Ended</span>
                    <span className="meta-value">{formatDate(ended)}</span>
                  </div>
                )}

                <div className="meta-item">
                  <span className="meta-label">Status</span>
                  <span className="meta-value">{status}</span>
                </div>

                <div className="meta-item">
                  <span className="meta-label">Language</span>
                  <span className="meta-value">{language}</span>
                </div>

                {duration && (
                  <div className="meta-item">
                    <span className="meta-label">Runtime</span>
                    <span className="meta-value">{duration} minutes</span>
                  </div>
                )}
              </div>

              {/* Summary Section */}
              <div className="modal-summary-section">
                <h3 className="section-heading">Synopsis / Summary</h3>
                <div className="summary-safe-container">
                  <SafeSummary rawHtml={summary} />
                </div>
              </div>

              {/* External Links */}
              <div className="modal-actions">
                {officialSite && (
                  <a
                    href={officialSite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-button primary-action"
                  >
                    <span>Visit Official Website</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}

                {tvmazeUrl && (
                  <a
                    href={tvmazeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-button secondary-action"
                  >
                    <span>View on TVmaze</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}

                <button
                  type="button"
                  className="action-button back-action"
                  onClick={onClose}
                >
                  Back to Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
