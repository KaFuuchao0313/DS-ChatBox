import React, { useState } from 'react';
import { useCharacterStore } from '../../stores/characterStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { createDefaultCharacter } from '../../types/character';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { characters, currentCharacter, setCurrentCharacter, addCharacter, deleteCharacter } =
    useCharacterStore();
  const { apiKey, setApiKey, theme, setTheme } = useSettingsStore();

  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCreateCharacter = () => {
    const newCharacter = createDefaultCharacter();
    addCharacter(newCharacter);
    setCurrentCharacter(newCharacter);
  };

  const handleSaveApiKey = () => {
    setApiKey(tempApiKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    // 应用主题
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // system
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDark);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 面板 */}
      <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold dark:text-white">设置</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* API 设置 */}
        <div className="p-4 border-b dark:border-gray-700">
          <h3 className="font-medium dark:text-white mb-3">API 设置</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Claude API Key</label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full px-3 py-2 pr-10 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveApiKey}
                  disabled={tempApiKey === apiKey}
                  className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveSuccess ? '✓ 已保存' : '保存'}
                </button>
                {apiKey && (
                  <button
                    onClick={() => {
                      setTempApiKey('');
                      setApiKey('');
                    }}
                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                  >
                    清除
                  </button>
                )}
              </div>
              {!apiKey && (
                <p className="text-xs text-gray-400 mt-2">
                  获取 API Key:{' '}
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    console.anthropic.com
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 主题设置 */}
        <div className="p-4 border-b dark:border-gray-700">
          <h3 className="font-medium dark:text-white mb-3">主题</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                theme === 'light'
                  ? 'bg-white border-blue-500 text-blue-500'
                  : 'bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              }`}
            >
              浅色
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-blue-500 text-blue-500'
                  : 'bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              }`}
            >
              深色
            </button>
            <button
              onClick={() => handleThemeChange('system')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                theme === 'system'
                  ? 'bg-gray-500 border-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              }`}
            >
              系统
            </button>
          </div>
        </div>

        {/* 角色列表 */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium dark:text-white">角色列表</h3>
            <button
              onClick={handleCreateCharacter}
              className="text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              + 新建
            </button>
          </div>

          {characters.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">还没有角色，创建一个吧！</p>
          ) : (
            <div className="space-y-2">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentCharacter?.id === char.id
                      ? 'bg-blue-100 dark:bg-blue-900 border border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setCurrentCharacter(char)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium dark:text-white">{char.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {char.personality.description}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`确定删除角色 "${char.name}" 吗？`)) {
                          deleteCharacter(char.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-600 text-sm ml-2"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
