import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 md:px-8 md:py-6">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          Analyseur de Checklist IA
        </h1>
        <p className="text-slate-500 mt-1">Transformez vos checklists papier en données structurées.</p>
      </div>
    </header>
  );
};