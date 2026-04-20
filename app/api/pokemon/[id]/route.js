import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Pokemon not found' },
        { status: 404 }
      );
    }

    const data = await response.json();

    const pokemonData = {
      name: data.name,
      types: data.types.map((typeInfo) => typeInfo.type.name),
      // image: data.sprites.other['official-artwork'].front_default,
      image: data.sprites.front_default,
      cry: data.cries.latest,
    };

    return NextResponse.json(pokemonData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch Pokemon data' },
      { status: 500 }
    );
  }
}
