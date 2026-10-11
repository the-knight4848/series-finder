export default function ErrorState({ error, onRetry, onReset }) {
  const errorMessage =
    error || 'An unexpected error occurred while communicating with the TVmaze API.';

  return (
    <section className="state-card error-state" role="alert" aria-live="assertive">
      <div className="state-icon-wrapper error-icon" aria-hidden="true">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h2 className="state-title">Search Failed</h2>
      <p className="state-description error-description">{errorMessage}</p>

      <div className="state-actions-row">
        {onRetry && (
          <button
            type="button"
            className="state-action-btn retry-btn"
            onClick={onRetry}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="1 4 1 10 7 10" />
              <polyline points="23 20 23 14 17 14" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            <span>Retry Search</span>
          </button>
        )}

        {onReset && (
          <button
            type="button"
            className="state-action-btn secondary-btn"
            onClick={onReset}
          >
            Start Over
          </button>
        )}
      </div>
    </section>
  );
}
