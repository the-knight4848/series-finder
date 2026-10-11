import ShowCard from './ShowCard';

export default function ShowGrid({ shows, query, onSelectShow, onClearResults }) {
  if (!shows || shows.length === 0) {
    return null;
  }

  return (
    <section className="results-section" aria-label="Search results">
      <div className="results-header">
        <div className="results-summary">
          <h2 className="results-title">
            Search Results
          </h2>
          <p className="results-count" aria-live="polite">
            Found <span className="highlight-count">{shows.length}</span> {shows.length === 1 ? 'series' : 'series'}
            {query ? (
              <> for <span className="highlight-query">"{query}"</span></>
            ) : null}
          </p>
        </div>

        {onClearResults && (
          <button
            type="button"
            className="clear-results-button"
            onClick={onClearResults}
            title="Clear current results"
          >
            Clear results
          </button>
        )}
      </div>

      <div className="shows-grid" role="list">
        {shows.map((show) => (
          <ShowCard
            key={show.id}
            show={show}
            onSelect={onSelectShow}
          />
        ))}
      </div>
    </section>
  );
}
