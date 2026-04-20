'use client';

import { useState, useEffect } from 'react';
import PokemonDisplay from './PokemonDisplay';
import Navigation from './Navigation';
import SearchInput from './SearchInput';
import CryPlayer from './CryPlayer';
import { MAX_ID } from '@/constants/AppConstants';

export default function Pokedex() {
  const [currentPokemonId, setCurrentPokemonId] = useState(1);
  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const MIN_POKEMON_ID = 1;
  const MAX_POKEMON_ID = MAX_ID;

  useEffect(() => {
    const fetchPokemon = async () => {
      if (currentPokemonId < MIN_POKEMON_ID || currentPokemonId > MAX_POKEMON_ID) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/pokemon/${currentPokemonId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch Pokemon data');
        }

        const data = await response.json();
        setPokemonData(data);
      } catch (err) {
        setError(err.message);
        setPokemonData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [currentPokemonId]);


  return (
    <div className="pokedex-container">
      <div className="pokedex-device">
        <div className="pokedex-top">
          <div className="big-blue-light"></div>
          <div className="small-lights">
            <div className="light red"></div>
            <div className="light yellow"></div>
            <div className="light green"></div>
          </div>
        </div>

        <div className="screen-container">
          <div className="screen-border-top">
            <div className="screen-dot"></div>
            <div className="screen-dot"></div>
          </div>
          
          <div className="main-screen">
            <PokemonDisplay 
              pokemonData={pokemonData} 
              loading={loading} 
              error={error} 
            />
          </div>

          <div className="screen-footer">
            <div className="screen-red-light"></div>
            <div className="screen-vent">
              <div className="vent-line"></div>
              <div className="vent-line"></div>
              <div className="vent-line"></div>
              <div className="vent-line"></div>
            </div>
          </div>
        </div>

        <div className="controls-area">
          <div className="control-row">
            <div className="d-pad-container">
              <Navigation currentId={currentPokemonId} onIdChange={setCurrentPokemonId} />
            </div>
          </div>

          <div className="thin-buttons">
            <div className="thin-btn red"></div>
            <div className="thin-btn blue"></div>
          </div>

          <div className="search-container">
             <SearchInput currentId={currentPokemonId} onSearch={setCurrentPokemonId} />
          </div>

          <div className="audio-controls">
             <CryPlayer cryUrl={pokemonData?.cry || pokemonData?.cries?.legacy} />
          </div>
        </div>
      </div>
    </div>
  );
}
