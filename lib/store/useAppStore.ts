// KINETIC CORE - Unified Single-Page Application (SPA) State Store
// Enables the entire Operating System to run seamlessly on a single link (http://localhost:3001/)
// with zero full-page reloads and continuous Web Worker clock preservation.

import { create } from 'zustand';

export type AppView = 
  | 'TRAIN'
  | 'TIMER'
  | 'STRENGTH'
  | 'COMBAT'
  | 'BUILDER'
  | 'ANALYTICS'
  | 'HISTORY'
  | 'SETTINGS'
  | 'SHOWCASE';

interface AppState {
  currentView: AppView;
  isLockedTraining: boolean;
  setCurrentView: (view: AppView) => void;
  setIsLockedTraining: (locked: boolean) => void;
  openTrainingConsole: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'TRAIN',
  isLockedTraining: false,
  setCurrentView: (view) => set({ currentView: view }),
  setIsLockedTraining: (locked) => set({ isLockedTraining: locked }),
  openTrainingConsole: () => set({ currentView: 'TRAIN', isLockedTraining: true })
}));
