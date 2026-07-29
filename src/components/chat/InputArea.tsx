import React, { useState, KeyboardEvent } from 'react';
import { useChatStore } from '../../stores/chatStore';

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const { isTyping } = useChatStore();

  const handleSend = () => {
    if (input.trim() && !disabled && !isTyping) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t dark:border-gray-700 p-4">
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息... (Enter发送, Shift+Enter换行)"
          className="flex-1 resize-none border dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          rows={1}
          disabled={disabled || isTyping}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled || isTyping}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isTyping ? (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
            </span>
          ) : (
            '发送'
          )}
        </button>
      </div>
    </div>
  );
};
