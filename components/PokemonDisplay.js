'use client';

export default function PokemonDisplay({ pokemonData, loading, error }) {
  if (loading) {
    return (
      <div className="screen-content loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="screen-content error">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!pokemonData) {
    return (
      <div className="screen-content empty-state">
        <p>No Pokemon data</p>
      </div>
    );
  }

  const officialArtwork = pokemonData.image;
  const fallbackImage = pokemonData.sprites?.front_default;
  const imageUrl = officialArtwork || fallbackImage;

  return (
    <div className="screen-content">
      {/* Pokemon Image */}
      <div className="pokemon-image-container">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={pokemonData.name}
            className="pokemon-image"
          />
        ) : (
          <div className="no-image">No image</div>
        )}
      </div>

      {/* Pokemon Info */}
      <div className="pokemon-info">
        <h2 className="pokemon-name">
         {pokemonData.name}
        </h2>

        {/* Types */}
        {pokemonData.types && pokemonData.types.length > 0 && (
          <div className="pokemon-types">
            {pokemonData.types.map((typeInfo) => (
              <span 
                key={typeInfo}
                className={`type-badge type-${typeInfo}`}
              >
                {typeInfo}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
