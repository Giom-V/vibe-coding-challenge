import React from 'react';
// FIX: GameState is an enum used as a value, so it must not be a type-only import.
import { GameState, type Item } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  isSolved: boolean;
  onReset: () => void;
  gameState: GameState;
  onSubItemClick: (subItemId: string) => void;
  onSearchPainting: () => void;
  isDrawerOpen: boolean;
  paintingSearched: boolean;
}

const SubItemHotspot: React.FC<{ item: Item, onClick: (id: string) => void, isDrawerOpen?: boolean }> = ({ item, onClick, isDrawerOpen }) => {
  const isOpenedDrawer = item.id === 'desk-drawer' && isDrawerOpen;
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
      <div className="w-full h-full bg-white/10 rounded-lg border-2 border-transparent group-hover:border-cyan-400 group-hover:bg-white/20 transition-all duration-300"></div>
       <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        {isOpenedDrawer ? "Opened Drawer" : item.name}
      </div>
    </div>
  );
}


const Modal: React.FC<ModalProps> = ({ 
  isOpen, onClose, item, isSolved, onReset, gameState,
  onSubItemClick, onSearchPainting, isDrawerOpen, paintingSearched
}) => {
  if (!isOpen || !item) return null;

  const renderSolvedContent = () => (
    <>
      <h2 className="text-3xl font-bold text-amber-400 mb-4">Congratulations!</h2>
      <p className="text-gray-300 mb-6">You've unlocked the chest and found... a glowing nano banana? The mystery of the study deepens, but your escape is secured.</p>
       <div className="w-full aspect-square bg-gray-900 rounded-lg mb-6 overflow-hidden border-2 border-amber-600">
        {item.closeupImage && <img src={`data:image/png;base64,${item.closeupImage}`} alt={item.name} className="w-full h-full object-cover" />}
      </div>
      <button
        onClick={onReset}
        className="w-full px-6 py-3 bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors font-bold text-lg"
      >
        Play Again
      </button>
    </>
  );

  const renderDeskContent = () => (
     <>
       <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-200">{item.name}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        <div className="w-full aspect-square bg-gray-900 rounded-lg mb-4 overflow-hidden border border-gray-700 relative">
            {item.closeupImage ? (
                <img src={`data:image/png;base64,${item.closeupImage}`} alt={item.name} className="w-full h-full object-cover" />
            ) : <p>Loading desk...</p>}
            {item.subItems?.map(subItem => <SubItemHotspot key={subItem.id} item={subItem} onClick={onSubItemClick} isDrawerOpen={isDrawerOpen} />)}
        </div>
        <p className="text-gray-400">{item.description}</p>
    </>
  );

  const renderItemContent = () => (
    <>
       <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-200">{item.name}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        <div className="w-full aspect-square bg-gray-900 rounded-lg mb-4 overflow-hidden border border-gray-700">
            {item.closeupImage ? (
                <img src={`data:image/png;base64,${item.closeupImage}`} alt={item.name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-gray-400"></div>
                </div>
            )}
        </div>
        <p className="text-gray-400 mb-4">{item.description}</p>
        {item.id === 'painting' && !paintingSearched && (
           <button 
             onClick={onSearchPainting}
             className="w-full px-6 py-2 bg-cyan-800 hover:bg-cyan-700 rounded-lg transition-colors font-bold"
            >
                Search Behind Painting
            </button>
        )}
    </>
  );
  
  const renderContent = () => {
      if (isSolved) return renderSolvedContent();
      if (gameState === GameState.VIEWING_DESK) return renderDeskContent();
      return renderItemContent();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg relative border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default Modal;