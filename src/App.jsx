import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import ShowGrid from './components/ShowGrid';
import ShowDetails from './components/ShowDetails';
import LoadingState from './components/LoadingState';
import EmptyState from './components/EmptyState';
import ErrorState from './components/ErrorState';
import InitialState from './components/InitialState';
import { searchShows } from './services/tvmaze';

/**
 * Reads initial 'q' query parameter from current URL location.
 */
function getInitialQueryFromUrl() {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get('q') || '';
}

export default function App() {
  // 1. Core State
  const [query, setQuery] = useState(() => getInitialQueryFromUrl());
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');
  const [shows, setShows] = useState(null); // null = not searched yet, array = searched
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [validationMessage, setValidationMessage] = useState('');

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

    // Sync URL with URLSearchParams
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('q', trimmed);
      window.history.pushState({ query: trimmed }, '', url.toString());
    } catch {
      // Fallback if URL API not supported
    }

    try {
      const results = await searchShows(trimmed, controller.signal);
      setShows(results);
      setError(null);
    } catch (err) {
      // Ignore AbortError caused by superseding searches
      if (err.name === 'AbortError') {
        return;
      }
      setError(err.message || 'Failed to fetch TV series. Please try again.');
      setShows(null);
    } finally {
      // Ensure loading state is always reset when this controller completes
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Handles user input changes.
   * Clears obsolete validation message as soon as user types.
   */
  const handleQueryChange = (val) => {
    setQuery(val);
    if (validationMessage) {
      setValidationMessage('');
    }
    if (error) {
      setError(null);
    }
  };

  /**
   * Form submission trigger.
   * Prevents duplicate submission while loading.
   */
  const handleFormSubmit = () => {
    if (loading) return;
    executeSearch(query);
  };

  /**
   * Clears the input field.
   */
  const handleClearInput = () => {
    setQuery('');
    setValidationMessage('');
  };

  /**
   * Resets entire application to initial state.
   */
  const handleReset = () => {
    // Abort pending request if any
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

    // Clear URL query params
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('q');
      window.history.pushState({}, '', url.pathname);
    } catch {
      // Ignore
    }
  };

  /**
   * Handles selecting a quick suggestion chip.
   */
  const handleSelectSuggestion = (suggestionTerm) => {
    setQuery(suggestionTerm);
    executeSearch(suggestionTerm);
  };

  /**
   * Retries the previous search query upon error.
   */
  const handleRetry = () => {
    if (lastSearchedQuery) {
      executeSearch(lastSearchedQuery);
    } else if (query.trim()) {
      executeSearch(query);
    }
  };

  // Initial mount: perform search if initial URL has ?q=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (initialQuery && initialQuery.trim()) {
      setTimeout(() => {
        executeSearch(initialQuery.trim());
      }, 0);
    }

    // Handle browser back/forward buttons
    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const q = currentParams.get('q');
      if (q && q.trim()) {
        setQuery(q.trim());
        executeSearch(q.trim());
      } else {
        handleReset();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [executeSearch]);

  return (
    <div className="app-layout">
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
