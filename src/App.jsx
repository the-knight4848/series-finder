import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import ShowGrid from './components/ShowGrid';
import ShowDetails from './components/ShowDetails';
import LoadingState from './components/LoadingState';
import EmptyState from './components/EmptyState';
import ErrorState from './components/ErrorState';
import InitialState from './components/InitialState';
import AuthModal from './components/auth/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { searchShows } from './services/tvmaze';

/**
 * Reads initial 'q' query parameter from current URL location.
 */
function getInitialQueryFromUrl() {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get('q') || '';
}

function AppContent() {
  // 1. Core State
  const [query, setQuery] = useState(() => getInitialQueryFromUrl());
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');
  const [shows, setShows] = useState(null); // null = not searched yet, array = searched
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [validationMessage, setValidationMessage] = useState('');

  const { authNotification } = useAuth();

  // 2. Ref to handle in-flight request cancellation (prevents race conditions)
  const abortControllerRef = useRef(null);

  /**
   * Executes the API search with the provided search term.
   * Cancels any pending previous request to prevent stale results.
   */
  const executeSearch = useCallback(async (searchTerm) => {
    const trimmed = searchTerm ? searchTerm.trim() : '';

    // Form Validation: empty check
    if (!trimmed) {
      setValidationMessage('Please enter a series title to search.');
      return;
    }

    // Clear previous validation or error messages
    setValidationMessage('');
    setError(null);
    setLoading(true);
    setLastSearchedQuery(trimmed);

    // Cancel any previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const results = await searchShows(trimmed, controller.signal);
      setShows(results);

      // Synchronize browser URL without reloading page
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get('q') !== trimmed) {
        currentUrl.searchParams.set('q', trimmed);
        window.history.pushState({ query: trimmed }, '', currentUrl.toString());
      }
    } catch (err) {
      // Ignore AbortError caused by intentional user cancellation / newer search
      if (err.name === 'AbortError') {
        return;
      }
      setError(err.message || 'An unexpected error occurred.');
      setShows([]);
    } finally {
      // Only reset loading if this request is still the active one
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Handles search form submission.
   */
  const handleFormSubmit = useCallback(
    (e) => {
      if (e?.preventDefault) {
        e.preventDefault();
      }
      executeSearch(query);
    },
    [executeSearch, query]
  );

  /**
   * Updates input state and clears validation error on typing.
   */
  const handleQueryChange = useCallback(
    (newQuery) => {
      setQuery(newQuery);
      if (validationMessage) {
        setValidationMessage('');
      }
    },
    [validationMessage]
  );

  /**
   * Clears search input box.
   */
  const handleClearInput = useCallback(() => {
    setQuery('');
    setValidationMessage('');
  }, []);

  /**
   * Handles user selecting a suggestion tag.
   */
  const handleSelectSuggestion = useCallback(
    (suggestionText) => {
      setQuery(suggestionText);
      executeSearch(suggestionText);
    },
    [executeSearch]
  );

  /**
   * Retries the last failed search query.
   */
  const handleRetry = useCallback(() => {
    if (lastSearchedQuery) {
      executeSearch(lastSearchedQuery);
    }
  }, [executeSearch, lastSearchedQuery]);

  /**
   * Resets entire application to clean initial state.
   */
  const handleReset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setQuery('');
    setLastSearchedQuery('');
    setShows(null);
    setLoading(false);
    setError(null);
    setSelectedShow(null);
    setValidationMessage('');

    // Reset URL query parameter
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.has('q')) {
      currentUrl.searchParams.delete('q');
      window.history.pushState({}, '', currentUrl.pathname);
    }
  }, []);

  /**
   * Effect: Handles browser navigation (Back / Forward buttons).
   */
  useEffect(() => {
    const handlePopState = () => {
      const currentQuery = getInitialQueryFromUrl();
      setQuery(currentQuery);
      if (currentQuery) {
        executeSearch(currentQuery);
      } else {
        setShows(null);
        setLastSearchedQuery('');
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initial search if query parameter exists on first page load
    const initialQuery = getInitialQueryFromUrl();
    if (initialQuery) {
      executeSearch(initialQuery);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [executeSearch]);

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      {authNotification && (
        <div className={`auth-toast auth-toast-${authNotification.type}`} role="status">
          <span className="toast-icon">
            {authNotification.type === 'success' ? '✓' : 'ℹ'}
          </span>
          <span>{authNotification.message}</span>
        </div>
      )}

      {/* 1. Header */}
      <Header onReset={handleReset} />

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-container">
          {/* 2. Search Form */}
          <SearchForm
            query={query}
            onQueryChange={handleQueryChange}
            onSubmit={handleFormSubmit}
            loading={loading}
            validationMessage={validationMessage}
            onClear={handleClearInput}
            onSelectSuggestion={handleSelectSuggestion}
          />

          {/* 3. Conditional State Rendering */}
          <div className="results-wrapper">
            {/* Loading State */}
            {loading && <LoadingState query={lastSearchedQuery || query} />}

            {/* Error State */}
            {!loading && error && (
              <ErrorState
                error={error}
                onRetry={handleRetry}
                onReset={handleReset}
              />
            )}

            {/* Empty State (Searched, but 0 shows returned) */}
            {!loading && !error && shows !== null && shows.length === 0 && (
              <EmptyState
                query={lastSearchedQuery}
                onSelectSuggestion={handleSelectSuggestion}
                onReset={handleReset}
              />
            )}

            {/* Success State (Searched and found results) */}
            {!loading && !error && shows !== null && shows.length > 0 && (
              <ShowGrid
                shows={shows}
                query={lastSearchedQuery}
                onSelectShow={setSelectedShow}
                onClearResults={handleReset}
              />
            )}

            {/* Initial State (No search performed yet) */}
            {!loading && !error && shows === null && (
              <InitialState onSelectSuggestion={handleSelectSuggestion} />
            )}
          </div>
        </div>
      </main>

      {/* 4. Show Details Modal */}
      {selectedShow && (
        <ShowDetails
          show={selectedShow}
          onClose={() => setSelectedShow(null)}
        />
      )}

      {/* 5. Auth Modal (Login / Register) */}
      <AuthModal />

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <p className="footer-text">
            Series Finder &bull; Built with React, Vite &amp; TVmaze API
          </p>
          <p className="footer-subtext">
            Search television shows, cast information, and ratings in real-time.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
