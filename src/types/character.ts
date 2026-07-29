/**
 * 标准情感类型
 */
export type EmotionType =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'thinking'
  | 'confused'
  | 'shy'
  | 'excited'
  | 'worried'
  | 'neutral';

/**
 * 表情动画类型
 */
export type AnimationType = 'none' | 'bounce' | 'shake' | 'pulse' | 'fade';

/**
 * 表情配置
 */
export interface ExpressionConfig {
  imagePath: string;
  animation?: AnimationType;
  duration?: number;
}

/**
 * 角色人设
 */
export interface Personality {
  name?: string;
  description: string;
  personality: string;
  speakingStyle: string;
  catchphrases: string[];
  background?: string;
  traits?: string[];
}

/**
 * 系统提示词配置
 */
export interface SystemPromptConfig {
  basePrompt: string;
  emotionalGuidelines?: string;
  responseStyle?: string;
  customInstructions?: string;
}

/**
 * 表情系统配置
 */
export interface ExpressionsConfig {
  default: ExpressionConfig;
  emotions: Partial<Record<EmotionType, ExpressionConfig>>;
}

/**
 * 对话配置
 */
export interface ConversationConfig {
  greetingMessage: string;
  farewellMessage?: string;
  maxResponseLength?: number;
  temperature?: number;
  memoryEnabled?: boolean;
  memoryTurns?: number;
}

/**
 * 角色卡元数据
 */
export interface CharacterMetadata {
  author?: string;
  tags?: string[];
  rating?: 'safe' | 'moderate' | 'mature';
  language?: string;
  thumbnail?: string;
}

/**
 * 角色卡完整定义
 */
export interface CharacterCard {
  id: string;
  name: string;
  version?: string;
  createdAt: string;
  updatedAt: string;

  personality: Personality;
  systemPrompt: SystemPromptConfig;
  expressions: ExpressionsConfig;
  conversation: ConversationConfig;
  metadata?: CharacterMetadata;
}

/**
 * 创建角色卡的默认值
 */
export const createDefaultCharacter = (): CharacterCard => ({
  id: crypto.randomUUID(),
  name: '新角色',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  personality: {
    description: '一个友善的伙伴',
    personality: '温柔、善解人意',
    speakingStyle: '轻松友好的语气',
    catchphrases: [],
  },

  systemPrompt: {
    basePrompt: '你是一个友善的AI助手，用温和的语气回复用户。',
  },

  expressions: {
    default: {
      imagePath: '/default-expressions/neutral.png',
      animation: 'none',
    },
    emotions: {
      happy: { imagePath: '/default-expressions/happy.png', animation: 'bounce' },
      sad: { imagePath: '/default-expressions/sad.png' },
      thinking: { imagePath: '/default-expressions/thinking.png', animation: 'pulse' },
      surprised: { imagePath: '/default-expressions/surprised.png' },
    },
  },

  conversation: {
    greetingMessage: '你好！今天有什么想聊的吗？',
    temperature: 0.8,
    memoryEnabled: true,
    memoryTurns: 10,
  },
});
