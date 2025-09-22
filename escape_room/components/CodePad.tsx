import React, { useState } from 'react';

interface CodePadProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
}

const CodePad: React.FC<CodePadProps> = ({ isOpen, onClose, onSubmit }) => {
  const [code, setCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(code);
    setCode('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-gray-900 border border-cyan-500 rounded-xl shadow-2xl p-8 w-full max-w-xs relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-cyan-300 mb-4">Enter Code</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-3 mb-6 bg-gray-800 border-2 border-gray-700 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:border-cyan-400"
            maxLength={4}
            autoFocus
          />
          <button
            type="submit"
            className="w-full px-6 py-3 bg-cyan-700 hover:bg-cyan-600 rounded-lg transition-colors font-bold text-lg"
          >
            Unlock
          </button>
        </form>
         <button onClick={onClose} className="absolute top-2 right-3 text-gray-500 hover:text-white text-3xl">&times;</button>
      </div>
    </div>
  );
};

export default CodePad;
