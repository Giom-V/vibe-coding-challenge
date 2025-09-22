import React, { useState, useCallback, useMemo } from 'react';
import { GameState, Item } from './types';
import { generateInitialAssets } from './services/geminiService';
import { INITIAL_ITEMS, ROOM_THEME, SOLUTION_CODE } from './constants';
import StartScreen from './components/StartScreen';
import LoadingScreen from './components/LoadingScreen';
import GameScreen from './components/GameScreen';
import Modal from './components/Modal';
import CodePad from './components/CodePad';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.START);
    const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
    const [roomImage, setRoomImage] = useState<string>('');
    const [currentItem, setCurrentItem] = useState<Item | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    
    // New state for complex puzzle
    const [inventory, setInventory] = useState<string[]>([]);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [paintingSearched, setPaintingSearched] = useState<boolean>(false);
    const [showCodePad, setShowCodePad] = useState<boolean>(false);
    const [keyHalf2Image, setKeyHalf2Image] = useState<string>('');

    const hasFullKey = useMemo(() => inventory.includes('key_half_1') && inventory.includes('key_half_2'), [inventory]);

    const startGame = useCallback(async () => {
        setGameState(GameState.GENERATING_ASSETS);
        try {
            const { roomImage, items: generatedItems, keyHalf2Image } = await generateInitialAssets(
                ROOM_THEME,
                setLoadingMessage
            );
            setRoomImage(roomImage);
            setItems(generatedItems);
            setKeyHalf2Image(keyHalf2Image);
            setGameState(GameState.PLAYING);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            setErrorMessage(message);
            setGameState(GameState.ERROR);
        }
    }, []);

    const handleItemClick = useCallback((itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        if (item.id === 'desk') {
            setCurrentItem(item);
            setGameState(GameState.VIEWING_DESK);
        } else if (item.id === 'chest' && hasFullKey) {
            // Special handling for the solved state chest
             const chest = items.find(i => i.id === 'chest');
             const solvedView = { ...chest, closeupImage: chest?.closeupImageUnlocked, name: "Chest Unlocked!" };
             setCurrentItem(solvedView as Item);
             setGameState(GameState.SOLVED);
        } else {
            setCurrentItem(item);
            setGameState(GameState.VIEWING_ITEM);
        }
    }, [items, hasFullKey]);
    
    const handleCloseModal = () => {
       if (gameState !== GameState.SOLVED) {
         setCurrentItem(null);
         setGameState(GameState.PLAYING);
       }
    };
    
    const handleSubItemClick = (subItemId: string) => {
        const desk = items.find(i => i.id === 'desk');
        const subItem = desk?.subItems?.find(si => si.id === subItemId);
        if(!subItem) return;
        
        if(subItem.requiresCode && !drawerOpen) {
            setShowCodePad(true);
        } else {
            // Show a simple view of the sub-item
            setCurrentItem(subItem);
            setGameState(GameState.VIEWING_ITEM);
        }
    };
    
    const handleCodeSubmit = (code: string) => {
        if(code === SOLUTION_CODE) {
            setDrawerOpen(true);
            if(!inventory.includes('key_half_1')) {
               setInventory(prev => [...prev, 'key_half_1']);
            }
            setShowCodePad(false);
            // Show the opened drawer
            const desk = items.find(i => i.id === 'desk');
            const drawer = desk?.subItems?.find(si => si.id === 'desk-drawer');
            const openedDrawerView = { ...drawer, closeupImage: drawer?.openImage, name: "Drawer Opened", description: "You found one half of a key!" }
            setCurrentItem(openedDrawerView as Item);
            setGameState(GameState.VIEWING_ITEM);

        } else {
            alert("Incorrect code.");
        }
    };
    
    const handleSearchPainting = () => {
        setPaintingSearched(true);
        if(!inventory.includes('key_half_2')) {
            setInventory(prev => [...prev, 'key_half_2']);
        }
        // Show the found key half
        const keyItem: Item = {
            id: 'key_half_2',
            name: 'Key Half Found!',
            description: 'You found the other half of the key behind the painting!',
            initialPrompt: '',
            position: { top: '0', left: '0', width: '0', height: '0' },
            closeupImage: keyHalf2Image,
        };
        setCurrentItem(keyItem);
    }
    
    const resetGame = () => {
        setGameState(GameState.START);
        setItems(INITIAL_ITEMS);
        setRoomImage('');
        setCurrentItem(null);
        setLoadingMessage('');
        setErrorMessage('');
        setInventory([]);
        setDrawerOpen(false);
        setPaintingSearched(false);
        setShowCodePad(false);
        setKeyHalf2Image('');
    }

    const renderContent = () => {
        switch (gameState) {
            case GameState.START:
                return <StartScreen onStart={startGame} />;
            case GameState.GENERATING_ASSETS:
                return <LoadingScreen message={loadingMessage} />;
            case GameState.PLAYING:
            case GameState.VIEWING_ITEM:
            case GameState.VIEWING_DESK:
            case GameState.SOLVED:
                const isModalOpen = gameState === GameState.VIEWING_ITEM || gameState === GameState.VIEWING_DESK || gameState === GameState.SOLVED;
                return (
                    <>
                        <GameScreen roomImage={roomImage} items={items} onItemClick={handleItemClick} inventory={inventory} />
                         <Modal
                            isOpen={isModalOpen}
                            onClose={handleCloseModal}
                            item={currentItem}
                            gameState={gameState}
                            isSolved={gameState === GameState.SOLVED}
                            onReset={resetGame}
                            onSubItemClick={handleSubItemClick}
                            onSearchPainting={handleSearchPainting}
                            isDrawerOpen={drawerOpen}
                            paintingSearched={paintingSearched}
                        />
                        <CodePad 
                            isOpen={showCodePad}
                            onClose={() => setShowCodePad(false)}
                            onSubmit={handleCodeSubmit}
                        />
                    </>
                );
            case GameState.ERROR:
                 return (
                    <div className="flex flex-col items-center justify-center h-screen bg-red-900/50">
                        <h2 className="text-3xl font-bold text-red-400 mb-4">An Error Occurred</h2>
                        <p className="text-red-200 mb-6 max-w-md text-center">{errorMessage}</p>
                        <button
                            onClick={resetGame}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return <div className="w-full h-screen font-serif">{renderContent()}</div>;
};

export default App;
