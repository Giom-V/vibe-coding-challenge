import React from 'react';
import { GENERATION_STEPS } from '../constants';

interface LoadingScreenProps {
  message: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-amber-500"></div>
      <p className="text-gray-300 text-xl mt-6 font-semibold tracking-wide">{message || 'Preparing the mystery...'}</p>
      <div className="mt-8 text-gray-500 text-sm w-full max-w-xs text-center">
        <p className="font-bold mb-2">Generating World with Gemini...</p>
        <ul className="text-left">
          {GENERATION_STEPS.map((step, index) => (
             <li key={index} className="truncate text-gray-400">{step}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LoadingScreen;
