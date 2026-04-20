'use client';

import { useState, useRef, useEffect } from 'react';

export default function CryPlayer({ cryUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [cryUrl]);

  const handlePlay = async () => {
    if (!cryUrl) return;

    try {
      if (!audioRef.current || audioRef.current.src !== cryUrl) {
        if (audioRef.current) audioRef.current.pause();
        audioRef.current = new Audio(cryUrl);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => setIsPlaying(false);
        audioRef.current.volume = 0.2;
      }
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      setIsPlaying(false);
    }finally{
      setIsPlaying(false);
    }
  };

  return (
    <div className="action-buttons">
      <button 
        className="action-btn btn-blue" 
        onClick={handlePlay}
        disabled={!cryUrl || isPlaying}
        aria-label="Play Cry"
      >
      </button>
      <div style={{marginLeft: '10px', color: '#333', fontSize: '10px'}}>CRY</div>
    </div>
  );
}
