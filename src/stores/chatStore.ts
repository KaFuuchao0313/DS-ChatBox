import { create } from 'zustand';
import { Message } from '../types/message';

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  currentCharacterId: string | null;

  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string, status?: Message['status']) => void;
  setTyping: (isTyping: boolean) => void;
  clearMessages: () => void;
  setCurrentCharacter: (id: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  currentCharacterId: null,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (id, content, status) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content, status: status || msg.status } : msg
      ),
    })),

  setTyping: (isTyping) => set({ isTyping }),

  clearMessages: () => set({ messages: [] }),

  setCurrentCharacter: (id) => set({ currentCharacterId: id }),
}));
