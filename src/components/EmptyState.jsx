const SUGGESTIONS = ['Batman', 'Sherlock', 'Friends', 'Stranger Things', 'Breaking Bad'];

export default function EmptyState({ query, onSelectSuggestion, onReset }) {
  return (
    <section className="state-card empty-state" aria-label="No results found">
      <div className="state-icon-wrapper empty-icon" aria-hidden="true">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </div>

      <h2 className="state-title">No series found</h2>
      <p className="state-description">
        We couldn't find any TV series matching{' '}
        {query ? <strong className="highlight-text">"{query}"</strong> : 'your search'}.
      </p>

      <div className="empty-suggestions-box">
        <h3 className="suggestions-subheading">Suggestions to try:</h3>
        <ul className="suggestions-checklist">
          <li>Check for spelling errors or typos.</li>
          <li>Try using a shorter or more generic keyword (e.g., "Star" instead of "Star Trek Picard").</li>
          <li>Search using an alternative English or original title.</li>
        </ul>

        {onSelectSuggestion && (
          <div className="empty-quick-try">
            <span className="try-label">Try searching for:</span>
            <div className="try-chips">
              {SUGGESTIONS.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="try-chip-btn"
                  onClick={() => onSelectSuggestion(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {onReset && (
          <button
            type="button"
            className="state-action-btn secondary-btn"
            onClick={onReset}
          >
            Clear Search
          </button>
        )}
      </div>
    </section>
  );
}
