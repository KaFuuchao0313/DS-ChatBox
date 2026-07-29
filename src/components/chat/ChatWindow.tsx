import React from 'react';
import { PetDisplay } from '../character/PetDisplay';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { useCharacterStore } from '../../stores/characterStore';

interface ChatWindowProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onSendMessage, isLoading }) => {
  const { currentCharacter } = useCharacterStore();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 宠物显示区 */}
      <div className="flex justify-center py-4 border-b dark:border-gray-700">
        <PetDisplay size={160} />
      </div>

      {/* 消息列表 */}
      <MessageList />

      {/* 输入区域 */}
      <InputArea onSend={onSendMessage} disabled={!currentCharacter || isLoading} />

      {/* 未选择角色提示 */}
      {!currentCharacter && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-2">请先选择或创建一个角色</p>
            <p className="text-sm text-gray-400">点击右上角设置按钮</p>
          </div>
        </div>
      )}
    </div>
  );
};
