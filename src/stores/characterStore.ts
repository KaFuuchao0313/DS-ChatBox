import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CharacterCard, EmotionType } from '../types/character';
import { createDrSalmonCharacter } from '../defaultCharacter';

interface CharacterState {
  characters: CharacterCard[];
  currentCharacter: CharacterCard | null;
  currentEmotion: EmotionType;

  loadCharacters: (characters: CharacterCard[]) => void;
  addCharacter: (character: CharacterCard) => void;
  updateCharacter: (id: string, updates: Partial<CharacterCard>) => void;
  deleteCharacter: (id: string) => void;
  setCurrentCharacter: (character: CharacterCard | null) => void;
  setCurrentEmotion: (emotion: EmotionType) => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set) => ({
      // 启动时默认加载 Dr.Salmon
      characters: [createDrSalmonCharacter()],
      currentCharacter: createDrSalmonCharacter(),
      currentEmotion: 'neutral',

      loadCharacters: (characters) => set({ characters }),

      addCharacter: (character) =>
        set((state) => ({
          characters: [...state.characters, character],
        })),

      updateCharacter: (id, updates) =>
        set((state) => ({
          characters: state.characters.map((char) =>
            char.id === id ? { ...char, ...updates, updatedAt: new Date().toISOString() } : char
          ),
          currentCharacter:
            state.currentCharacter?.id === id
              ? { ...state.currentCharacter, ...updates, updatedAt: new Date().toISOString() }
              : state.currentCharacter,
        })),

      deleteCharacter: (id) =>
        set((state) => ({
          characters: state.characters.filter((char) => char.id !== id),
          currentCharacter: state.currentCharacter?.id === id ? null : state.currentCharacter,
        })),

      setCurrentCharacter: (character) =>
        set({
          currentCharacter: character,
          currentEmotion: 'neutral',
        }),

      setCurrentEmotion: (emotion) => set({ currentEmotion: emotion }),
    }),
    {
      name: 'drsalmon-characters',
      // 只持久化角色卡列表，不持久化当前表情（表情应每次启动重置为 neutral）
      partialize: (state) => ({
        characters: state.characters,
        currentCharacter: state.currentCharacter,
      }),
    }
  )
);
