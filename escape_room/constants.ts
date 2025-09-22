import type { Item } from './types';

export const ROOM_THEME = "a dusty, forgotten study in a Victorian mansion, dimly lit by a single window. The mood is mysterious and slightly eerie. Photorealistic, 4k, cinematic lighting.";

export const SOLUTION_CODE = '231';

export const INITIAL_ITEMS: Item[] = [
  {
    id: 'chest',
    name: 'Locked Wooden Chest',
    description: "A heavy, dark wood chest bound with iron straps. It's securely locked.",
    initialPrompt: `A small, antique locked wooden chest with ornate iron fittings, on a transparent background.`,
    closeupPrompt: (hasKey) => hasKey 
      ? `The same antique wooden chest, now unlocked and slightly ajar, revealing a single, tiny, glowing 'nano banana' inside.`
      : `A detailed close-up of the heavy iron lock on an antique wooden chest. The lock is intricate and appears old and sturdy.`,
    position: { top: '70%', left: '35%', width: '30%', height: '25%' },
  },
  {
    id: 'desk',
    name: 'Old Writing Desk',
    description: "A dusty writing desk. There are a few items on its surface.",
    initialPrompt: `An old, slightly worn writing desk, on a transparent background.`,
    closeupPrompt: () => `A top-down view of an old wooden writing desk. On the desk is a single piece of aged paper and a small drawer is visible on the right.`,
    position: { top: '55%', left: '65%', width: '25%', height: '30%' },
    subItems: [
      {
        id: 'desk-paper',
        name: 'Aged Paper',
        description: 'A riddle is written on the paper.',
        initialPrompt: '', // Not needed, part of desk closeup
        closeupPrompt: () => `A close-up of an old piece of paper. The following riddle is written in elegant cursive script: "I sail on seas, I fly in skies, I swim in depths below. Count my fleets, my feathered spies, and the one who puts on a show. Combine the numbers, in the order told, to unlock a secret of old."`,
        position: { top: '30%', left: '25%', width: '40%', height: '30%' },
      },
      {
        id: 'desk-drawer',
        name: 'Locked Drawer',
        description: 'A small drawer that seems to be locked by a numerical code.',
        initialPrompt: 'A small, locked wooden drawer with a numerical keypad on it, on a transparent background.',
        openPrompt: 'The same small wooden drawer, but now it is open. Inside, you can see one half of an ornate brass key.',
        requiresCode: true,
        position: { top: '65%', left: '70%', width: '25%', height: '20%' },
      }
    ]
  },
  {
    id: 'painting',
    name: 'Strange Painting',
    description: "An unsettling painting of a stormy sea hangs on the wall. It looks like it could be moved.",
    initialPrompt: `An oil painting of a stormy sea with **two ships** being tossed on the waves, **three birds** flying in the stormy sky above, and **one dolphin** leaping from the water, in an ornate, dark wooden frame, on a transparent background.`,
    closeupPrompt: () => `A very close-up view of the oil painting, showing the two ships, three birds, and one dolphin in detail.`,
    position: { top: '25%', left: '10%', width: '20%', height: '35%' },
  },
];

export const ROOM_PROMPT = (theme: string) => `A wide-angle view of ${theme}. In the room, there is this painting hanging on the left wall, this old writing desk on the right side, and this wooden chest on the floor in the middle. The items should be integrated seamlessly into the scene.`;

export const GENERATION_STEPS = [
  "Sketching the forgotten study...",
  "Generating the main items...",
  "Creating a detailed view of the desk...",
  "Writing a mysterious riddle...",
  "Hiding clues within the painting...",
  "Forging the two halves of a key...",
  "Assembling the final scene...",
  "Adding cinematic lighting...",
  "Finalizing the escape room...",
];

export const KEY_HALF_2_PROMPT = "The second half of an ornate brass key, on a transparent background.";