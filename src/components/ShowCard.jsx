import PosterImage from './PosterImage';

/**
 * Extracts 4-digit premiere year from a date string (YYYY-MM-DD).
 */
function getPremiereYear(premiered) {
  if (!premiered || typeof premiered !== 'string') return null;
  const match = premiered.match(/^\d{4}/);
  return match ? match[0] : null;
}

export default function ShowCard({ show, onSelect }) {
  if (!show) return null;

  const {
    id,
    name = 'Untitled Series',
    image,
    premiered,
    rating,
    genres = [],
    status,
    language,
  } = show;

  const posterUrl = image?.medium || image?.original || null;
  const premiereYear = getPremiereYear(premiered);
  const ratingValue = rating?.average;
  // Display at most 2 genres on the card
  const displayGenres = Array.isArray(genres) ? genres.slice(0, 2) : [];

  return (
    <article
      className="show-card"
      data-testid={`show-card-${id}`}
      onClick={() => onSelect(show)}
    >
      <div className="card-poster-container">
        <PosterImage
          src={posterUrl}
          alt={`Poster of ${name}`}
          title={name}
          className="card-poster"
        />

        {/* Rating Badge */}
        <div className="card-rating-badge" aria-label={`Rating: ${ratingValue ? `${ratingValue} out of 10` : 'Not rated'}`}>
          <svg
            className="star-icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
            aria-hidden="true"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>{ratingValue ? ratingValue.toFixed(1) : '—'}</span>
        </div>

        {/* Status indicator badge */}
        {status && (
          <span
            className={`card-status-badge status-${status.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {status}
          </span>
        )}
      </div>

      <div className="card-body">
        <div className="card-meta">
          {premiereYear ? (
            <span className="card-year">{premiereYear}</span>
          ) : (
            <span className="card-year year-unknown">Year N/A</span>
          )}
          {language && <span className="card-language">{language}</span>}
        </div>

        <h3 className="card-title" title={name}>
          {name}
        </h3>

        {/* Genre Tags */}
        <div className="card-genres">
          {displayGenres.length > 0 ? (
            displayGenres.map((genre) => (
              <span key={genre} className="genre-tag">
                {genre}
              </span>
            ))
          ) : (
            <span className="genre-tag genre-empty">Genre unlisted</span>
          )}
        </div>

        <div className="card-footer">
          <button
            type="button"
            className="view-details-button"
            onClick={(e) => {
              e.stopPropagation(); // prevent double trigger
              onSelect(show);
            }}
            aria-label={`View details for ${name}`}
          >
            <span>View Details</span>
            <svg
              className="arrow-icon"
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
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
