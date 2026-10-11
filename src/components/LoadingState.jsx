export default function LoadingState({ query }) {
  // Render 6 skeleton cards for realistic layout placeholder
  const skeletonCards = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div
      className="loading-state-container"
      role="status"
      aria-live="polite"
      aria-label="Searching for series"
    >
      <div className="loading-banner">
        <div className="spinner-orbit" aria-hidden="true">
          <div className="spinner-inner"></div>
        </div>
        <p className="loading-text">
          Searching for series{query ? ` matching "${query}"` : ''}...
        </p>
      </div>

      <div className="shows-grid skeleton-grid" aria-hidden="true">
        {skeletonCards.map((id) => (
          <div key={id} className="skeleton-card">
            <div className="skeleton-poster shimmer"></div>
            <div className="skeleton-body">
              <div className="skeleton-meta shimmer"></div>
              <div className="skeleton-title shimmer"></div>
              <div className="skeleton-tags shimmer"></div>
              <div className="skeleton-btn shimmer"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
