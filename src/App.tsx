import { useState, useCallback } from 'react';
import { ChatWindow } from './components/chat/ChatWindow';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { useChat } from './hooks/useChat';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { sendMessage, isTyping } = useChat({
    onError: (err) => {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    },
    onEmotionChange: (emotion) => {
      console.log('Emotion changed:', emotion);
    },
  });

  const handleSendMessage = useCallback(
    async (content: string) => {
      setError(null);
      await sendMessage(content);
    },
    [sendMessage]
  );

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* 顶部栏 */}
      <header className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700">
        <h1 className="text-lg font-bold">桌面宠物</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          ⚙️
        </button>
      </header>

      {/* 错误提示 */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 主内容区 */}
      <main className="flex-1 overflow-hidden relative">
        <ChatWindow onSendMessage={handleSendMessage} isLoading={isTyping} />
      </main>

      {/* 设置面板 */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

export default App;
