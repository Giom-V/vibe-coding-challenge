import React from 'react';

interface InventoryProps {
  inventory: string[];
}

const Inventory: React.FC<InventoryProps> = ({ inventory }) => {
  const hasKeyHalf1 = inventory.includes('key_half_1');
  const hasKeyHalf2 = inventory.includes('key_half_2');

  return (
    <div className="absolute bottom-4 left-4 bg-black/50 p-3 rounded-lg border border-gray-700">
      <h3 className="text-sm font-bold text-gray-300 mb-2 text-center">Inventory</h3>
      <div className="flex gap-3">
        <div className={`w-16 h-16 bg-gray-800/80 rounded-md flex items-center justify-center border-2 ${hasKeyHalf1 ? 'border-amber-500' : 'border-gray-600'}`}>
          {hasKeyHalf1 && <span className="text-3xl" title="Key Half 1">🔑</span>}
        </div>
        <div className={`w-16 h-16 bg-gray-800/80 rounded-md flex items-center justify-center border-2 ${hasKeyHalf2 ? 'border-amber-500' : 'border-gray-600'}`}>
           {hasKeyHalf2 && <span className="text-3xl" title="Key Half 2">🔑</span>}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
