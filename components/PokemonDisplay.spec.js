import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PokemonDisplay from './PokemonDisplay';

describe('PokemonDisplay', () => {
  describe('Loading State', () => {
    it('should render loading spinner when loading is true', () => {
      render(<PokemonDisplay loading={true} />);
      
      expect(screen.getByText('Loading Pokemon...')).toBeInTheDocument();
      expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
    });

    it('should have loading-state class when loading', () => {
      render(<PokemonDisplay loading={true} />);
      
      const loadingDiv = screen.getByText('Loading Pokemon...').closest('.pokemon-display');
      expect(loadingDiv).toHaveClass('loading-state');
    });
  });

  describe('Error State', () => {
    it('should render error message when error is provided', () => {
      const errorMessage = 'Failed to fetch Pokemon';
      render(<PokemonDisplay error={errorMessage} />);
      
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });

    it('should display error hint text', () => {
      render(<PokemonDisplay error="Network error" />);
      
      expect(screen.getByText('Please try again or select a different Pokemon')).toBeInTheDocument();
    });

    it('should display error icon', () => {
      render(<PokemonDisplay error="Some error" />);
      
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('should have error-state class when error exists', () => {
      render(<PokemonDisplay error="Some error" />);
      
      const errorDiv = screen.getByText('⚠️').closest('.pokemon-display');
      expect(errorDiv).toHaveClass('error-state');
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no pokemon data is provided', () => {
      render(<PokemonDisplay />);
      
      expect(screen.getByText('No Pokemon data available')).toBeInTheDocument();
    });

    it('should have empty-state class when no data', () => {
      render(<PokemonDisplay />);
      
      const emptyDiv = screen.getByText('No Pokemon data available').closest('.pokemon-display');
      expect(emptyDiv).toHaveClass('empty-state');
    });
  });

  describe('Pokemon Data Display', () => {
    const mockPokemonData = {
      id: 25,
      name: 'pikachu',
      sprites: {
        front_default: 'https://example.com/pikachu-front.png',
        other: {
          'official-artwork': {
            front_default: 'https://example.com/pikachu-official.png'
          }
        }
      },
      types: [
        {
          type: {
            name: 'electric'
          }
        }
      ]
    };

    it('should render pokemon name capitalized', () => {
      render(<PokemonDisplay pokemonData={mockPokemonData} />);
      
      expect(screen.getByText('pikachu')).toBeInTheDocument();
    });

    it('should render pokemon number with zero padding', () => {
      render(<PokemonDisplay pokemonData={mockPokemonData} />);
      
      expect(screen.getByText('#025')).toBeInTheDocument();
    });

    it('should render pokemon image with official artwork', () => {
      render(<PokemonDisplay pokemonData={mockPokemonData} />);
      
      const image = screen.getByAltText('pikachu');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/pikachu-official.png');
    });

    it('should fallback to front_default sprite when official artwork is not available', () => {
      const pokemonWithoutArtwork = {
        ...mockPokemonData,
        sprites: {
          front_default: 'https://example.com/pikachu-front.png'
        }
      };
      
      render(<PokemonDisplay pokemonData={pokemonWithoutArtwork} />);
      
      const image = screen.getByAltText('pikachu');
      expect(image).toHaveAttribute('src', 'https://example.com/pikachu-front.png');
    });

    it('should display "No image available" when no sprites exist', () => {
      const pokemonWithoutSprites = {
        ...mockPokemonData,
        sprites: {}
      };
      
      render(<PokemonDisplay pokemonData={pokemonWithoutSprites} />);
      
      expect(screen.getByText('No image available')).toBeInTheDocument();
    });

    it('should render pokemon types', () => {
      render(<PokemonDisplay pokemonData={mockPokemonData} />);
      
      expect(screen.getByText('electric')).toBeInTheDocument();
    });

    it('should render multiple types', () => {
      const pokemonWithMultipleTypes = {
        ...mockPokemonData,
        types: [
          {
            type: {
              name: 'electric'
            }
          },
          {
            type: {
              name: 'steel'
            }
          }
        ]
      };
      
      render(<PokemonDisplay pokemonData={pokemonWithMultipleTypes} />);
      
      expect(screen.getByText('electric')).toBeInTheDocument();
      expect(screen.getByText('steel')).toBeInTheDocument();
    });

    it('should apply correct type class to type badges', () => {
      render(<PokemonDisplay pokemonData={mockPokemonData} />);
      
      const electricBadge = screen.getByText('electric');
      expect(electricBadge).toHaveClass('type-badge', 'type-electric');
    });

    it('should handle pokemon without types gracefully', () => {
      const pokemonWithoutTypes = {
        ...mockPokemonData,
        types: []
      };
      
      render(<PokemonDisplay pokemonData={pokemonWithoutTypes} />);
      
      expect(screen.getByText('pikachu')).toBeInTheDocument();
      expect(screen.queryByText('electric')).not.toBeInTheDocument();
    });

    it('should format pokemon number correctly for single digit ids', () => {
      const bulbasaur = {
        ...mockPokemonData,
        id: 1,
        name: 'bulbasaur'
      };
      
      render(<PokemonDisplay pokemonData={bulbasaur} />);
      
      expect(screen.getByText('#001')).toBeInTheDocument();
    });

    it('should format pokemon number correctly for triple digit ids', () => {
      const mew = {
        ...mockPokemonData,
        id: 151,
        name: 'mew'
      };
      
      render(<PokemonDisplay pokemonData={mew} />);
      
      expect(screen.getByText('#151')).toBeInTheDocument();
    });

    it('should handle pokemon with no official artwork or front sprite', () => {
      const pokemonWithNoImage = {
        ...mockPokemonData,
        sprites: {
          other: {}
        }
      };
      
      render(<PokemonDisplay pokemonData={pokemonWithNoImage} />);
      
      expect(screen.getByText('No image available')).toBeInTheDocument();
    });
  });

  describe('Priority States', () => {
    const mockPokemonData = {
      id: 25,
      name: 'pikachu',
      sprites: {
        front_default: 'https://example.com/pikachu.png'
      },
      types: [
        {
          type: {
            name: 'electric'
          }
        }
      ]
    };

    it('should show loading state over pokemon data', () => {
      render(<PokemonDisplay pokemonData={mockPokemonData} loading={true} />);
      
      expect(screen.getByText('Loading Pokemon...')).toBeInTheDocument();
      expect(screen.queryByText('pikachu')).not.toBeInTheDocument();
    });

    it('should show loading state over error', () => {
      render(<PokemonDisplay error="Some error" loading={true} />);
      
      expect(screen.getByText('Loading Pokemon...')).toBeInTheDocument();
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    });

    it('should show error state over pokemon data', () => {
      render(<PokemonDisplay pokemonData={mockPokemonData} error="Some error" />);
      
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
      expect(screen.queryByText('pikachu')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle pokemon with undefined sprites property', () => {
      const pokemonNoSprites = {
        id: 1,
        name: 'missingno',
        types: []
      };
      
      render(<PokemonDisplay pokemonData={pokemonNoSprites} />);
      
      expect(screen.getByText('No image available')).toBeInTheDocument();
      expect(screen.getByText('missingno')).toBeInTheDocument();
    });

    it('should handle pokemon with null types', () => {
      const pokemonNullTypes = {
        id: 1,
        name: 'test',
        sprites: {},
        types: null
      };
      
      render(<PokemonDisplay pokemonData={pokemonNullTypes} />);
      
      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });
});
