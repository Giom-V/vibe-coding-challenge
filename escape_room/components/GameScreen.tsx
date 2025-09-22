import React from 'react';
import type { Item } from '../types';
import Inventory from './Inventory';

interface GameScreenProps {
  roomImage: string;
  items: Item[];
  onItemClick: (itemId: string) => void;
  inventory: string[];
}

const ItemHotspot: React.FC<{ item: Item, onClick: (id: string) => void }> = ({ item, onClick }) => {
  return (
    <div
      className="absolute cursor-pointer group"
      style={{
        top: item.position.top,
        left: item.position.left,
        width: item.position.width,
        height: item.position.height,
      }}
      onClick={() => onClick(item.id)}
    >
      <div className="w-full h-full bg-white/10 rounded-lg border-2 border-transparent group-hover:border-amber-400 group-hover:bg-white/20 transition-all duration-300 animate-pulse group-hover:animate-none"></div>
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        {item.name}
      </div>
    </div>
  );
}

const GameScreen: React.FC<GameScreenProps> = ({ roomImage, items, onItemClick, inventory }) => {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black">
      <div className="relative w-full max-w-[90vh] aspect-square">
        {roomImage ? (
          <img src={`data:image/png;base64,${roomImage}`} alt="Escape Room" className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <p>Loading Room...</p>
          </div>
        )}
        {items.map(item => (
          <ItemHotspot key={item.id} item={item} onClick={onItemClick} />
        ))}
         <Inventory inventory={inventory} />
      </div>
    </div>
  );
};

export default GameScreen;
