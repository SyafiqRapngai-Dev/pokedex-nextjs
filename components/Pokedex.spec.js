import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pokedex from './Pokedex';

// Mock fetch globally
global.fetch = jest.fn();

describe('Pokedex Component', () => {
  const mockPokemonData = {
    id: 1,
    name: 'bulbasaur',
    height: 7,
    weight: 69,
    sprites: {
      front_default: 'https://example.com/bulbasaur.png',
    },
    types: [
      {
        type: { name: 'grass' },
      },
      {
        type: { name: 'poison' },
      },
    ],
    stats: [
      {
        base_stat: 45,
        stat: { name: 'hp' },
      },
      {
        base_stat: 49,
        stat: { name: 'attack' },
      },
    ],
    abilities: [
      {
        ability: { name: 'overgrow' },
      },
      {
        ability: { name: 'chlorophyll' },
      },
    ],
  };

  beforeEach(() => {
    fetch.mockClear();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockPokemonData,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the Pokedex component', () => {
      render(<Pokedex />);
      expect(screen.getByLabelText(/pokémon id/i)).toBeInTheDocument();
    });

    it('renders navigation buttons', () => {
      render(<Pokedex />);
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('renders the Pokemon ID input field', () => {
      render(<Pokedex />);
      const input = screen.getByLabelText(/pokémon id/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'number');
      expect(input).toHaveAttribute('min', '1');
      expect(input).toHaveAttribute('max', '151');
    });

    it('renders decorative elements (lights)', () => {
      const { container } = render(<Pokedex />);
      expect(container.querySelector('.power-light')).toBeInTheDocument();
      expect(container.querySelector('.indicator-light.red')).toBeInTheDocument();
      expect(container.querySelector('.indicator-light.yellow')).toBeInTheDocument();
      expect(container.querySelector('.indicator-light.green')).toBeInTheDocument();
    });
  });

  describe('State Management - Loading State', () => {
    it('displays loading state initially', () => {
      render(<Pokedex />);
      expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    });

    it('disables navigation buttons while loading', () => {
      render(<Pokedex />);
      const prevButton = screen.getByRole('button', { name: /previous/i });
      const nextButton = screen.getByRole('button', { name: /next/i });
      
      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });
  });

  describe('State Management - Success State', () => {
    it('displays Pokemon data after successful fetch', async () => {
      render(<Pokedex />);

      await waitFor(() => {
        expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/#001 bulbasaur/i)).toBeInTheDocument();
    });

    it('displays Pokemon image', async () => {
      render(<Pokedex />);

      await waitFor(() => {
        const img = screen.getByAltText('bulbasaur');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', mockPokemonData.sprites.front_default);
      });
    });

    it('displays Pokemon types', async () => {
      render(<Pokedex />);

      await waitFor(() => {
        expect(screen.getByText('grass')).toBeInTheDocument();
        expect(screen.getByText('poison')).toBeInTheDocument();
      });
    });

    it('displays Pokemon stats', async () => {
      render(<Pokedex />);

      await waitFor(() => {
        expect(screen.getByText('hp')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();
        expect(screen.getByText('attack')).toBeInTheDocument();
        expect(screen.getByText('49')).toBeInTheDocument();
      });
    });

    it('displays Pokemon additional info (height, weight, abilities)', async () => {
      render(<Pokedex />);

      await waitFor(() => {
        expect(screen.getByText('Height:')).toBeInTheDocument();
        expect(screen.getByText('0.7m')).toBeInTheDocument();
        expect(screen.getByText('Weight:')).toBeInTheDocument();
        expect(screen.getByText('6.9kg')).toBeInTheDocument();
        expect(screen.getByText('Abilities:')).toBeInTheDocument();
        expect(screen.getByText('overgrow, chlorophyll')).toBeInTheDocument();
      });
    });
  });

  describe('State Management - Error State', () => {
    it('displays error message when fetch fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      render(<Pokedex />);

      await waitFor(() => {
        expect(screen.getByText(/error:/i)).toBeInTheDocument();
        expect(screen.getByText(/failed to fetch pokemon data/i)).toBeInTheDocument();
      });
    });

    it('does not display Pokemon data when there is an error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      render(<Pokedex />);

      await waitFor(() => {
        expect(screen.getByText(/error:/i)).toBeInTheDocument();
      });

      expect(screen.queryByAltText(/bulbasaur/i)).not.toBeInTheDocument();
    });
  });

  describe('Pokemon ID Changes Trigger Data Fetch', () => {
    it('fetches Pokemon data on mount with ID 1', async () => {
      render(<Pokedex />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/pokemon/1');
      });
    });

    it('fetches new Pokemon data when ID changes via input', async () => {
      render(<Pokedex />);

      // Wait for initial fetch
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/pokemon/1');
      });

      // Mock the new Pokemon data
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockPokemonData,
          id: 25,
          name: 'pikachu',
        }),
      });

      // Change the ID input directly
      const input = screen.getByLabelText(/pokémon id/i);
      fireEvent.change(input, { target: { value: '25' } });

      // Should fetch new Pokemon data
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/pokemon/25');
      });
    });

    it('fetches new Pokemon data when clicking Next button', async () => {
      render(<Pokedex />);

      // Wait for initial render and buttons to be enabled
      await waitFor(() => {
        expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).not.toBeDisabled();

      // Mock the next Pokemon
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockPokemonData,
          id: 2,
          name: 'ivysaur',
        }),
      });

      // Click next
      fireEvent.click(nextButton);

      // Should fetch Pokemon ID 2
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/pokemon/2');
      });
    });

    it('fetches new Pokemon data when clicking Previous button', async () => {
      render(<Pokedex />);

      await waitFor(() => {
        expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
      });

      // Mock Pokemon 5 fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockPokemonData,
          id: 5,
          name: 'charmeleon',
          sprites: {
            front_default: 'https://example.com/charmeleon.png',
          },
        }),
      });

      // Change to Pokemon 5 using fireEvent for direct change
      const input = screen.getByLabelText(/pokémon id/i);
      fireEvent.change(input, { target: { value: '5' } });

      // Wait for Pokemon 5 to load
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/pokemon/5');
      });

      await waitFor(() => {
        expect(screen.getByText(/charmeleon/i)).toBeInTheDocument();
      });

      // Mock previous Pokemon
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockPokemonData,
          id: 4,
          name: 'charmander',
        }),
      });

      // Click previous
      const prevButton = screen.getByRole('button', { name: /previous/i });
      fireEvent.click(prevButton);

      // Should fetch Pokemon ID 4
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/pokemon/4');
      });
    });

    it('wraps around to 151 when clicking Previous on Pokemon 1', async () => {
      render(<Pokedex />);

      await waitFor(() => {
        expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
      });

      // Mock the last Pokemon
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockPokemonData,
          id: 151,
          name: 'mew',
        }),
      });

      const prevButton = screen.getByRole('button', { name: /previous/i });
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/pokemon/151');
      });
    });

    it('wraps around to 1 when clicking Next on Pokemon 151', async () => {
      render(<Pokedex />);

      await waitFor(() => {
        expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
      });

      // Mock Pokemon 151 fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockPokemonData,
          id: 151,
          name: 'mew',
        }),
      });

      // Change to Pokemon 151 using fireEvent for direct change
      const input = screen.getByLabelText(/pokémon id/i);
      fireEvent.change(input, { target: { value: '151' } });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/pokemon/151');
      });

      // Mock wrapping to Pokemon 1
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemonData,
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/pokemon/1');
      });
    });

    it('does not update state when entering invalid Pokemon ID (out of range)', async () => {
      render(<Pokedex />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/pokemon/1');
      });

      const input = screen.getByLabelText(/pokémon id/i);
      expect(input).toHaveValue(1);

      // Try to change to an invalid ID (out of range)
      fireEvent.change(input, { target: { value: '999' } });

      // Input value should not update because 999 is invalid
      // The component only updates state if value is between 1-151
      expect(input).toHaveValue(1);

      // Verify no additional fetch was made beyond the initial one
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('does not update state when entering non-numeric values', async () => {
      render(<Pokedex />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/pokemon/1');
      });

      const input = screen.getByLabelText(/pokémon id/i);
      expect(input).toHaveValue(1);

      // Try to change to non-numeric value
      fireEvent.change(input, { target: { value: 'abc' } });

      // Input value should not update because 'abc' is not a valid number
      expect(input).toHaveValue(1);

      // Verify no additional fetch was made beyond the initial one
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Interactions', () => {
    it('updates input value when typing valid ID', async () => {
      const user = userEvent.setup();
      render(<Pokedex />);

      await waitFor(() => {
        expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
      });

      const input = screen.getByLabelText(/pokémon id/i);
      expect(input).toHaveValue(1);

      // Directly set value instead of typing to avoid concatenation
      fireEvent.change(input, { target: { value: '42' } });

      expect(input).toHaveValue(42);
    });

    it('shows loading state when fetching new Pokemon', async () => {
      render(<Pokedex />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
      });

      // Setup slow fetch for next Pokemon
      fetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ ...mockPokemonData, id: 2, name: 'ivysaur' })
        }), 100))
      );

      // Click next button
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      // Should show loading
      expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    });

    it('enables navigation buttons after data loads', async () => {
      render(<Pokedex />);

      await waitFor(() => {
        expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
      });

      const prevButton = screen.getByRole('button', { name: /previous/i });
      const nextButton = screen.getByRole('button', { name: /next/i });

      expect(prevButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing sprite data gracefully', async () => {
      const mockDataNoSprite = {
        ...mockPokemonData,
        sprites: {
          front_default: null,
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataNoSprite,
      });

      render(<Pokedex />);

      await waitFor(() => {
        expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
      });

      // Verify image element exists but has no src when sprite is null
      const img = screen.getByAltText('bulbasaur');
      expect(img).toBeInTheDocument();
      expect(img.getAttribute('src')).toBeNull();
    });

    it('handles network errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<Pokedex />);

      await waitFor(() => {
        expect(screen.getByText(/error:/i)).toBeInTheDocument();
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('correctly formats stat names with hyphens', async () => {
      const mockDataWithHyphenStat = {
        ...mockPokemonData,
        stats: [
          {
            base_stat: 65,
            stat: { name: 'special-attack' },
          },
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataWithHyphenStat,
      });

      render(<Pokedex />);

      await waitFor(() => {
        expect(screen.getByText('special attack')).toBeInTheDocument();
      });
    });

    it('pads Pokemon ID with zeros in display', async () => {
      render(<Pokedex />);

      await waitFor(() => {
        expect(screen.getByText(/#001 bulbasaur/i)).toBeInTheDocument();
      });
    });
  });
});
