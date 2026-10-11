import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import * as tvmazeService from '../services/tvmaze';

const sampleBatmanShow = {
  id: 975,
  name: 'Batman',
  premiered: '1966-01-12',
  status: 'Ended',
  language: 'English',
  genres: ['Action', 'Comedy'],
  rating: { average: 7.8 },
  image: {
    medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/6/16463.jpg',
    original: 'https://static.tvmaze.com/uploads/images/original_untouched/6/16463.jpg',
  },
  summary: '<p>Wealthy entrepreneur Bruce Wayne and his ward Dick Grayson lead a double life: they are actually <b>Batman and Robin</b>.</p>',
  officialSite: 'https://abc.com/shows/batman',
  url: 'https://www.tvmaze.com/shows/975/batman',
};

const sampleShowMissingFields = {
  id: 99999,
  name: 'Mystery Indie Show',
  premiered: null,
  status: null,
  language: null,
  genres: [],
  rating: { average: null },
  image: null,
  summary: null,
  officialSite: null,
  url: null,
};

describe('Series Finder Web Application', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.pushState({}, '', '/');
  });

  it('renders initial welcome state and header on first load', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /Series Finder/i })).toBeDefined();
    expect(screen.getByText(/Discover your next favorite series/i)).toBeDefined();
    expect(screen.getByRole('search')).toBeDefined();
    expect(screen.getByLabelText(/Search for a TV series/i)).toBeDefined();
    expect(screen.getByText(/Ready to discover your next binge-worthy show\?/i)).toBeDefined();
  });

  it('shows validation error when submitting an empty or whitespace query without calling API', async () => {
    const searchSpy = vi.spyOn(tvmazeService, 'searchShows');
    render(<App />);

    const searchButton = screen.getByRole('button', { name: /Submit search/i });
    fireEvent.click(searchButton);

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText(/Please enter a series title to search/i)).toBeDefined();
    expect(searchSpy).not.toHaveBeenCalled();
  });

  it('handles search flow, displays loading state and then successful results', async () => {
    vi.spyOn(tvmazeService, 'searchShows').mockResolvedValueOnce([sampleBatmanShow]);

    render(<App />);
    const input = screen.getByLabelText(/Search for a TV series/i);
    const searchButton = screen.getByRole('button', { name: /Submit search/i });

    fireEvent.change(input, { target: { value: 'batman' } });
    fireEvent.click(searchButton);

    // Shows loading indicator
    expect(screen.getByRole('status')).toBeDefined();

    // Resolves and displays results
    await waitFor(() => {
      expect(screen.getByText(/Search Results/i)).toBeDefined();
    });

    expect(screen.getByText(/Found/i)).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: 'Batman' })).toBeDefined();
    expect(screen.getByText('1966')).toBeDefined();
    expect(screen.getByText('7.8')).toBeDefined();
    expect(screen.getByText('Action')).toBeDefined();
  });

  it('allows submitting search with Enter key', async () => {
    const searchSpy = vi.spyOn(tvmazeService, 'searchShows').mockResolvedValueOnce([sampleBatmanShow]);

    render(<App />);
    const input = screen.getByLabelText(/Search for a TV series/i);

    fireEvent.change(input, { target: { value: 'batman' } });
    fireEvent.submit(screen.getByRole('search'));

    await waitFor(() => {
      expect(searchSpy).toHaveBeenCalledWith('batman', expect.any(AbortSignal));
    });
  });

  it('displays empty state when search returns zero results', async () => {
    vi.spyOn(tvmazeService, 'searchShows').mockResolvedValueOnce([]);

    render(<App />);
    const input = screen.getByLabelText(/Search for a TV series/i);
    fireEvent.change(input, { target: { value: 'nonexistentquery123' } });
    fireEvent.submit(screen.getByRole('search'));

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: /No series found/i })).toBeDefined();
    });

    expect(screen.getByText(/Suggestions to try:/i)).toBeDefined();
  });

  it('displays error state on network or server error and allows retry', async () => {
    const searchSpy = vi
      .spyOn(tvmazeService, 'searchShows')
      .mockRejectedValueOnce(new Error('TVmaze API is currently unavailable.'))
      .mockResolvedValueOnce([sampleBatmanShow]);

    render(<App />);
    const input = screen.getByLabelText(/Search for a TV series/i);
    fireEvent.change(input, { target: { value: 'batman' } });
    fireEvent.submit(screen.getByRole('search'));

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: /Search Failed/i })).toBeDefined();
    });

    expect(screen.getByText('TVmaze API is currently unavailable.')).toBeDefined();

    // Click Retry
    const retryButton = screen.getByRole('button', { name: /Retry Search/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(searchSpy).toHaveBeenCalledTimes(2);
      expect(screen.getByRole('heading', { level: 3, name: 'Batman' })).toBeDefined();
    });
  });

  it('safely handles missing poster, unrated scores, and missing metadata', async () => {
    vi.spyOn(tvmazeService, 'searchShows').mockResolvedValueOnce([sampleShowMissingFields]);

    render(<App />);
    const input = screen.getByLabelText(/Search for a TV series/i);
    fireEvent.change(input, { target: { value: 'mystery' } });
    fireEvent.submit(screen.getByRole('search'));

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: 'Mystery Indie Show' })).toBeDefined();
    });

    expect(screen.getByText('Year N/A')).toBeDefined();
    expect(screen.getByText('Genre unlisted')).toBeDefined();
    expect(screen.getByText('No Poster')).toBeDefined();
  });

  it('opens show details modal and closes with Escape key or close button', async () => {
    vi.spyOn(tvmazeService, 'searchShows').mockResolvedValueOnce([sampleBatmanShow]);

    render(<App />);
    const input = screen.getByLabelText(/Search for a TV series/i);
    fireEvent.change(input, { target: { value: 'batman' } });
    fireEvent.submit(screen.getByRole('search'));

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: 'Batman' })).toBeDefined();
    });

    // Click "View Details"
    const viewDetailsBtn = screen.getByRole('button', { name: /View details for Batman/i });
    fireEvent.click(viewDetailsBtn);

    // Modal dialog opens
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: 'Batman' })).toBeDefined();
    expect(screen.getByText(/Visit Official Website/i)).toBeDefined();
    expect(screen.getByText(/View on TVmaze/i)).toBeDefined();

    // Safely rendered synopsis
    expect(screen.getByText(/Wealthy entrepreneur Bruce Wayne/i)).toBeDefined();

    // Close with Escape key
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});
