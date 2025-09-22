
export enum GameState {
  START,
  GENERATING_ASSETS,
  PLAYING,
  VIEWING_ITEM,
  VIEWING_DESK,
  SOLVED,
  ERROR,
}

export interface ItemPosition {
  top: string;
  left: string;
  width: string;
  height: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  initialPrompt: string;
  // Use a function for prompts that depend on game state
  closeupPrompt?: (state?: any) => string; 
  openPrompt?: string;
  position: ItemPosition;
  base64Image?: string;
  closeupImage?: string;
  // FIX: Added optional property to hold the image of the unlocked chest.
  closeupImageUnlocked?: string;
  openImage?: string; // For items that can be opened, like a drawer
  subItems?: Item[]; // For nested interactable items
  requiresCode?: boolean;
  foundText?: string;
}

export interface GeneratedAsset {
  itemId: string;
  base64Image: string;
}