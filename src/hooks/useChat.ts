import { useCallback, useRef } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useCharacterStore } from '../stores/characterStore';
import { useSettingsStore } from '../stores/settingsStore';
import { createUserMessage, createAssistantMessage } from '../types/message';
import { claudeService } from '../services/claudeService';
import { EmotionType } from '../types/character';

interface UseChatOptions {
  onError?: (error: Error) => void;
  onEmotionChange?: (emotion: EmotionType) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const { onError, onEmotionChange } = options;
  const { messages, addMessage, updateMessage, setTyping, clearMessages, isTyping } = useChatStore();
  const { currentCharacter, setCurrentEmotion } = useCharacterStore();
  const { apiKey, apiBaseUrl, model } = useSettingsStore();

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 初始化 Claude 服务
   */
  const ensureInitialized = useCallback(() => {
    if (!apiKey) {
      throw new Error('请先在设置中配置 API Key');
    }
    if (!claudeService.isInitialized()) {
      claudeService.initialize(apiKey, apiBaseUrl, model);
    }
  }, [apiKey, apiBaseUrl, model]);

  /**
   * 发送消息（流式响应）
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentCharacter) {
        onError?.(new Error('请先选择一个角色'));
        return;
      }

      try {
        ensureInitialized();

        // 添加用户消息
        const userMsg = createUserMessage(content);
        addMessage(userMsg);

        // 创建助手消息占位
        const assistantMsg = createAssistantMessage();
        addMessage(assistantMsg);

        setTyping(true);

        // 取消之前的请求
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        // 获取对话历史（包含新消息）
        const conversationHistory = [...messages, userMsg].slice(
          -(currentCharacter.conversation.memoryTurns || 10) * 2
        );

        let fullContent = '';

        // 使用流式响应
        for await (const text of claudeService.sendMessageStream(
          currentCharacter,
          conversationHistory,
          (emotion) => {
            setCurrentEmotion(emotion);
            onEmotionChange?.(emotion);
          }
        )) {
          fullContent += text;
          updateMessage(assistantMsg.id, fullContent, 'streaming');
        }

        // 提取最终的情感和清理后的内容
        const { emotion, cleanContent } = claudeService.extractEmotion(fullContent);
        updateMessage(assistantMsg.id, cleanContent, 'completed');
        setCurrentEmotion(emotion);
        onEmotionChange?.(emotion);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('Chat error:', err);
        onError?.(err);

        // 更新最后一条消息为错误状态
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === 'assistant' && lastMessage.status === 'streaming') {
          updateMessage(lastMessage.id, '抱歉，发生了错误，请重试。', 'error');
        }
      } finally {
        setTyping(false);
      }
    },
    [
      currentCharacter,
      messages,
      addMessage,
      updateMessage,
      setTyping,
      setCurrentEmotion,
      ensureInitialized,
      onError,
      onEmotionChange,
    ]
  );

  /**
   * 停止生成
   */
  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setTyping(false);
  }, [setTyping]);

  /**
   * 清空对话
   */
  const clearChat = useCallback(() => {
    clearMessages();
    setCurrentEmotion('neutral');
  }, [clearMessages, setCurrentEmotion]);

  /**
   * 重新生成最后一条回复
   */
  const regenerateLastResponse = useCallback(async () => {
    // 找到最后一条用户消息
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMessage) return;

    // 删除最后的助手消息
    const lastAssistantIndex = messages.length - 1;
    if (messages[lastAssistantIndex]?.role === 'assistant') {
      // 创建新的消息列表（移除最后的助手消息）
      const newMessages = messages.slice(0, lastAssistantIndex);
      // 临时更新 store
      useChatStore.setState({ messages: newMessages });
    }

    // 重新发送
    await sendMessage(lastUserMessage.content);
  }, [messages, sendMessage]);

  return {
    messages,
    isTyping,
    sendMessage,
    stopGeneration,
    clearChat,
    regenerateLastResponse,
  };
}
