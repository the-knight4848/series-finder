import { useRef } from 'react';

const SUGGESTED_QUERIES = [
  'Batman',
  'Stranger Things',
  'Breaking Bad',
  'Sherlock',
  'Doctor Who',
  'The Last of Us',
];

export default function SearchForm({
  query,
  onQueryChange,
  onSubmit,
  loading,
  validationMessage,
  onClear,
  onSelectSuggestion,
}) {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const handleClear = () => {
    if (onClear) onClear();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <section className="search-section" aria-label="Search series section">
      <form
        className="search-form"
        onSubmit={handleSubmit}
        noValidate
        role="search"
      >
        <div className="search-input-group">
          <label htmlFor="series-search-input" className="search-label">
            Search for a TV series
          </label>

          <div className="input-wrapper">
            <span className="input-icon" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>

            <input
              ref={inputRef}
              id="series-search-input"
              type="text"
              className={`search-input ${validationMessage ? 'input-error' : ''}`}
              placeholder="Search for a TV series..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              disabled={loading}
              autoComplete="off"
              aria-describedby={validationMessage ? 'search-validation-error' : undefined}
              aria-invalid={validationMessage ? 'true' : 'false'}
            />

            {query && !loading && (
              <button
                type="button"
                className="clear-button"
                onClick={handleClear}
                aria-label="Clear search input"
                title="Clear input"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}

            <button
              type="submit"
              className="search-button"
              disabled={loading}
              aria-label={loading ? 'Searching for series...' : 'Submit search'}
            >
              {loading ? (
                <>
                  <span className="spinner-inline" aria-hidden="true"></span>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <svg
                    className="button-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation message */}
        {validationMessage && (
          <div
            id="search-validation-error"
            className="validation-alert"
            role="alert"
            aria-live="polite"
          >
            <svg
              className="alert-icon"
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{validationMessage}</span>
          </div>
        )}

        {/* Quick suggestions chips */}
        <div className="suggestions-container">
          <span className="suggestions-label">Popular searches:</span>
          <div className="suggestions-list" role="list">
            {SUGGESTED_QUERIES.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className={`suggestion-chip ${query.trim().toLowerCase() === suggestion.toLowerCase() ? 'active' : ''}`}
                onClick={() => onSelectSuggestion(suggestion)}
                disabled={loading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </form>
    </section>
  );
}
