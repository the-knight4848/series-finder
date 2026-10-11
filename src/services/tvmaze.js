/**
 * TVmaze API service for Series Finder
 * Endpoint: https://api.tvmaze.com/search/shows?q={query}
 */

const BASE_URL = 'https://api.tvmaze.com/search/shows';

/**
 * Searches for TV shows using the TVmaze API.
 * 
 * @param {string} searchQuery - The search term to query.
 * @param {AbortSignal} [signal] - Optional AbortSignal to cancel pending requests.
 * @returns {Promise<Array<Object>>} List of show objects matching the query.
 * @throws {Error} If the HTTP request fails or the response cannot be parsed.
 */
export async function searchShows(searchQuery, signal) {
  // Construct URL with URLSearchParams as required
  const params = new URLSearchParams({
    q: searchQuery,
  });

  const url = `${BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new Error(
        `TVmaze API responded with status ${response.status}: ${response.statusText || 'Search request failed'}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format received from TVmaze API.');
    }

    // Extract the show object from each item: { score, show }
    return data.map((item) => item.show).filter(Boolean);
  } catch (error) {
    // If the error was caused by aborting the request, rethrow it so caller can ignore it
    if (error.name === 'AbortError') {
      throw error;
    }

    // Format friendly error for network or unexpected issues
    const message = error.message.includes('Failed to fetch')
      ? 'Unable to connect to TVmaze API. Please check your internet connection and try again.'
      : error.message;

    throw new Error(message);
  }
}
