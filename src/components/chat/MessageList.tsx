import React from 'react';
import { useChatStore } from '../../stores/chatStore';

export const MessageList: React.FC = () => {
  const { messages } = useChatStore();

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-400 dark:text-gray-500 py-8">
          开始和宠物聊天吧！
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              {message.status === 'streaming' && (
                <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
