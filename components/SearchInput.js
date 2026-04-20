'use client';

import React, { useState } from 'react';

export default function SearchInput({ currentId = 1, onSearch }) {
  const MIN_ID = 1;
  const MAX_ID = 151;
  const [inputValue, setInputValue] = useState(String(currentId));
  const [error, setError] = useState('');

  const validateId = (value) => {
    if (value === '') return '';
    const parsedValue = Number(value);
    if (!Number.isInteger(parsedValue)) return 'Whole numbers only';
    if (parsedValue < MIN_ID || parsedValue > MAX_ID) return `1-${MAX_ID} only`;
    return '';
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationError = validateId(inputValue);
    if (validationError) {
      setError(validationError);
      return;
    }
    const pokemonId = Number(inputValue);
    if (pokemonId) {
       onSearch?.(pokemonId);
    }
  };

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setInputValue(nextValue);
    if (error) setError(validateId(nextValue));
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="number"
        min={MIN_ID}
        max={MAX_ID}
        value={inputValue}
        onChange={handleChange}
        placeholder="#"
        className="pokedex-search-input"
        aria-invalid={Boolean(error)}
      />
    </form>
  );
}
