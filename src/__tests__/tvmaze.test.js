import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchShows } from '../services/tvmaze';

describe('TVmaze API Service (searchShows)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('constructs request URL using URLSearchParams and returns shows', async () => {
    const mockData = [
      {
        score: 0.9,
        show: {
          id: 975,
          name: 'Batman',
          premiered: '1966-01-12',
          rating: { average: 7.8 },
          genres: ['Action', 'Comedy'],
        },
      },
    ];

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const results = await searchShows('batman');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledUrl = fetchSpy.mock.calls[0][0];
    expect(calledUrl).toContain('https://api.tvmaze.com/search/shows?q=batman');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Batman');
    expect(results[0].id).toBe(975);
  });

  it('handles spaces and special characters with URLSearchParams encoding', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await searchShows('Doctor Who & Friends');

    const calledUrl = fetchSpy.mock.calls[0][0];
    const urlObj = new URL(calledUrl);
    expect(urlObj.searchParams.get('q')).toBe('Doctor Who & Friends');
  });

  it('throws an error when HTTP response is not ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(searchShows('batman')).rejects.toThrow(
      'TVmaze API responded with status 500: Internal Server Error'
    );
  });

  it('re-throws AbortError without wrapping when signal is aborted', async () => {
    const abortError = new Error('The user aborted a request.');
    abortError.name = 'AbortError';

    vi.spyOn(global, 'fetch').mockRejectedValueOnce(abortError);

    const controller = new AbortController();
    await expect(searchShows('batman', controller.signal)).rejects.toThrow(
      'The user aborted a request.'
    );
  });
});
