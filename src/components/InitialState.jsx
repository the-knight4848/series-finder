const POPULAR_PICKS = [
  { name: 'Batman', genre: 'Action / Crime' },
  { name: 'Stranger Things', genre: 'Sci-Fi / Horror' },
  { name: 'Breaking Bad', genre: 'Crime / Drama' },
  { name: 'Doctor Who', genre: 'Adventure / Sci-Fi' },
  { name: 'Sherlock', genre: 'Crime / Mystery' },
  { name: 'The Last of Us', genre: 'Drama / Horror' },
];

export default function InitialState({ onSelectSuggestion }) {
  return (
    <section className="initial-state-container" aria-label="Welcome guide">
      <div className="hero-banner">
        <div className="hero-badge">
          <span className="sparkle-icon" aria-hidden="true">✨</span>
          <span>Explore Television History</span>
        </div>
        <h2 className="hero-title">
          Ready to discover your next binge-worthy show?
        </h2>
        <p className="hero-description">
          Type any title in the search box above to instantly fetch official posters,
          plot summaries, broadcast schedules, and viewer ratings from the TVmaze database.
        </p>
      </div>

      <div className="features-row">
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Instant Search</h3>
          <p>Search thousands of live and ended shows with real-time API results.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⭐</div>
          <h3>Verified Ratings</h3>
          <p>Check authentic viewer scores and premier dates before watching.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📖</div>
          <h3>Detailed Synopsis</h3>
          <p>Read sanitized summaries and discover official broadcasting links.</p>
        </div>
      </div>

      <div className="initial-suggestions">
        <h3 className="initial-suggestions-title">
          Or start exploring with these popular favorites:
        </h3>
        <div className="initial-cards-grid">
          {POPULAR_PICKS.map((item) => (
            <button
              key={item.name}
              type="button"
              className="quick-pick-card"
              onClick={() => onSelectSuggestion(item.name)}
              aria-label={`Search for ${item.name}`}
            >
              <span className="quick-pick-name">{item.name}</span>
              <span className="quick-pick-genre">{item.genre}</span>
              <span className="quick-pick-arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
