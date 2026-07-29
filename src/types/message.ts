/**
 * 消息角色
 */
export type MessageRole = 'user' | 'assistant';

/**
 * 消息状态
 */
export type MessageStatus = 'pending' | 'streaming' | 'completed' | 'error';

/**
 * 聊天消息
 */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  status?: MessageStatus;
  emotion?: string;
}

/**
 * 创建用户消息
 */
export const createUserMessage = (content: string): Message => ({
  id: crypto.randomUUID(),
  role: 'user',
  content,
  timestamp: new Date().toISOString(),
  status: 'completed',
});

/**
 * 创建助手消息
 */
export const createAssistantMessage = (content: string = '', emotion?: string): Message => ({
  id: crypto.randomUUID(),
  role: 'assistant',
  content,
  timestamp: new Date().toISOString(),
  status: 'pending',
  emotion,
});
