'use client';

import React from 'react';
import { MAX_ID } from '@/constants/AppConstants';

export default function Navigation({ currentId, onIdChange }) {
  const MIN_ID = 1;

  const handlePrevious = () => {
    const newId = currentId > MIN_ID ? currentId - 1 : MAX_ID;
    onIdChange(newId);
  };

  const handleNext = () => {
    const newId = currentId < MAX_ID ? currentId + 1 : MIN_ID;
    onIdChange(newId);
  };

  return (
    <div className="d-pad">
      <div className="d-pad-h"></div>
      <div className="d-pad-v"></div>
      <div className="d-pad-center"></div>
      
      <button 
        className="d-pad-btn d-pad-up" 
        onClick={handlePrevious} 
        aria-label="Previous Pokemon"
      ></button>
      <button 
        className="d-pad-btn d-pad-right" 
        onClick={handleNext} 
        aria-label="Next Pokemon"
      ></button>
      <button 
        className="d-pad-btn d-pad-down" 
        onClick={handleNext} 
        aria-label="Next Pokemon"
      ></button>
      <button 
        className="d-pad-btn d-pad-left" 
        onClick={handlePrevious} 
        aria-label="Previous Pokemon"
      ></button>
    </div>
  );
}
