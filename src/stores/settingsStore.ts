import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  apiKey: string;
  apiBaseUrl: string;
  model: string;
  theme: 'light' | 'dark' | 'system';

  setApiKey: (key: string) => void;
  setApiBaseUrl: (url: string) => void;
  setModel: (model: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  clearApiKey: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: '',
      // dev 模式下通过 Vite proxy 绕过 CORS（见 vite.config.ts）
      apiBaseUrl: 'http://localhost:1420/qianfan-api',
      model: 'qianfan-code-latest',
      theme: 'system',

      setApiKey: (key) => set({ apiKey: key }),
      setApiBaseUrl: (url) => set({ apiBaseUrl: url }),
      setModel: (model) => set({ model }),
      setTheme: (theme) => set({ theme }),
      clearApiKey: () => set({ apiKey: '' }),
    }),
    {
      name: 'drsalmon-settings',
    }
  )
);
