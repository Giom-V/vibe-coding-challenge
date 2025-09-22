import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-8 text-center" style={{ backgroundImage: `radial-gradient(circle, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 1) 100%)` }}>
      <h1 className="text-5xl md:text-7xl font-bold text-gray-200 mb-4 tracking-wider" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
        Gemini Escape Room
      </h1>
      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-8">
        You find yourself in a mysterious study, filled with cryptic clues. Can you uncover its secrets and find your way out?
        Every part of this room was imagined and drawn by AI.
      </p>
      <button
        onClick={onStart}
        className="px-8 py-4 bg-amber-700 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-amber-800 transform hover:scale-105 transition-all duration-300 ease-in-out"
      >
        Enter the Room
      </button>
      <p className="mt-8 text-sm text-gray-500">Note: Initial asset generation may take a minute.</p>
    </div>
  );
};

export default StartScreen;
