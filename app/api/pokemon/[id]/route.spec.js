/**
 * @jest-environment node
 */

// Mock next/server before importing route
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    }),
  },
}));

global.fetch = jest.fn();

const { GET } = require('./route');

describe('Pokemon API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return pokemon data with correct structure', async () => {
    const mockPokeApiResponse = {
      name: 'pikachu',
      types: [
        { type: { name: 'electric' } }
      ],
      sprites: {
        other: {
          'official-artwork': {
            front_default: 'https://example.com/pikachu.png'
          }
        }
      },
      cries: {
        latest: 'https://example.com/pikachu-cry.ogg'
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPokeApiResponse,
    });

    const request = {};
    const params = { id: '25' };

    const response = await GET(request, { params });
    const responseData = await response.json();

    expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/25');
    expect(responseData).toEqual({
      name: 'pikachu',
      types: ['electric'],
      image: 'https://example.com/pikachu.png',
      cry: 'https://example.com/pikachu-cry.ogg'
    });
  });

  it('should handle multiple types correctly', async () => {
    const mockPokeApiResponse = {
      name: 'charizard',
      types: [
        { type: { name: 'fire' } },
        { type: { name: 'flying' } }
      ],
      sprites: {
        other: {
          'official-artwork': {
            front_default: 'https://example.com/charizard.png'
          }
        }
      },
      cries: {
        latest: 'https://example.com/charizard-cry.ogg'
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPokeApiResponse,
    });

    const request = {};
    const params = { id: '6' };

    const response = await GET(request, { params });
    const responseData = await response.json();

    expect(responseData).toEqual({
      name: 'charizard',
      types: ['fire', 'flying'],
      image: 'https://example.com/charizard.png',
      cry: 'https://example.com/charizard-cry.ogg'
    });
  });

  it('should return 404 when pokemon not found', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const request = {};
    const params = { id: '99999' };

    const response = await GET(request, { params });
    const responseData = await response.json();

    expect(response.status).toBe(404);
    expect(responseData).toEqual({
      error: 'Pokemon not found'
    });
  });

  it('should return 500 when fetch throws an error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const request = {};
    const params = { id: '1' };

    const response = await GET(request, { params });
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({
      error: 'Failed to fetch Pokemon data'
    });
  });

  it('should accept pokemon name as id', async () => {
    const mockPokeApiResponse = {
      name: 'bulbasaur',
      types: [
        { type: { name: 'grass' } },
        { type: { name: 'poison' } }
      ],
      sprites: {
        other: {
          'official-artwork': {
            front_default: 'https://example.com/bulbasaur.png'
          }
        }
      },
      cries: {
        latest: 'https://example.com/bulbasaur-cry.ogg'
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPokeApiResponse,
    });

    const request = {};
    const params = { id: 'bulbasaur' };

    const response = await GET(request, { params });
    const responseData = await response.json();

    expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/bulbasaur');
    expect(responseData.name).toBe('bulbasaur');
    expect(responseData.types).toEqual(['grass', 'poison']);
  });

  it('should handle pokemon with single type', async () => {
    const mockPokeApiResponse = {
      name: 'magikarp',
      types: [
        { type: { name: 'water' } }
      ],
      sprites: {
        other: {
          'official-artwork': {
            front_default: 'https://example.com/magikarp.png'
          }
        }
      },
      cries: {
        latest: 'https://example.com/magikarp-cry.ogg'
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPokeApiResponse,
    });

    const request = {};
    const params = { id: '129' };

    const response = await GET(request, { params });
    const responseData = await response.json();

    expect(responseData.types).toEqual(['water']);
    expect(responseData.types.length).toBe(1);
  });
});
