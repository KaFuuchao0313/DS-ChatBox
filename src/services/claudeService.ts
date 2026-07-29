import OpenAI from 'openai';
import { CharacterCard, EmotionType } from '../types/character';
import { Message } from '../types/message';

/**
 * 情感标签正则表达式
 */
const EMOTION_TAG_REGEX = /\[EMOTION:(\w+)\]/g;

/**
 * AI 对话服务（OpenAI 兼容端点，对接千帆等）
 */
export class ClaudeService {
  private client: OpenAI | null = null;
  private model: string = 'qianfan-code-latest';

  /**
   * 初始化客户端
   */
  initialize(apiKey: string, baseUrl?: string, model?: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: baseUrl || undefined,
      dangerouslyAllowBrowser: true, // 桌面应用允许在浏览器端调用
    });
    if (model) {
      this.model = model;
    }
  }

  /**
   * 检查是否已初始化
   */
  isInitialized(): boolean {
    return this.client !== null;
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(character: CharacterCard): string {
    const { personality, systemPrompt } = character;

    let prompt = systemPrompt.basePrompt;

    // 添加人设信息
    prompt += `\n\n## 你的身份\n`;
    prompt += `你的名字是 ${character.name}。`;
    if (personality.description) {
      prompt += `\n${personality.description}`;
    }
    if (personality.personality) {
      prompt += `\n性格特点：${personality.personality}`;
    }
    if (personality.speakingStyle) {
      prompt += `\n说话风格：${personality.speakingStyle}`;
    }
    if (personality.catchphrases && personality.catchphrases.length > 0) {
      prompt += `\n口头禅：${personality.catchphrases.join('、')}`;
    }
    if (personality.background) {
      prompt += `\n背景故事：${personality.background}`;
    }

    // 添加情感指南
    if (systemPrompt.emotionalGuidelines) {
      prompt += `\n\n## 情感表达指南\n${systemPrompt.emotionalGuidelines}`;
    }

    // 添加表情标签说明
    prompt += `\n\n## 表情系统
你可以在回复中插入表情标签来控制你的表情显示。格式为 [EMOTION:情感类型]。
可用的情感类型包括：happy（开心）、sad（悲伤）、angry（生气）、surprised（惊讶）、thinking（思考）、confused（困惑）、shy（害羞）、excited（兴奋）、worried（担心）、neutral（平静）。

例如："太好了！[EMOTION:happy] 今天天气真不错！"

请根据对话内容自然地使用表情标签，让你的情感表达更加生动。`;

    // 添加自定义指令
    if (systemPrompt.customInstructions) {
      prompt += `\n\n## 自定义指令\n${systemPrompt.customInstructions}`;
    }

    // 添加响应风格
    if (systemPrompt.responseStyle) {
      prompt += `\n\n## 响应风格\n${systemPrompt.responseStyle}`;
    }

    return prompt;
  }

  /**
   * 转换消息格式
   */
  private convertMessages(messages: Message[]): OpenAI.Chat.ChatCompletionMessageParam[] {
    return messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));
  }

  /**
   * 从文本中提取情感标签
   */
  extractEmotion(content: string): { emotion: EmotionType; cleanContent: string } {
    const matches = content.match(EMOTION_TAG_REGEX);

    if (matches && matches.length > 0) {
      // 取最后一个情感标签
      const lastMatch = matches[matches.length - 1];
      const emotionMatch = lastMatch.match(/\[EMOTION:(\w+)\]/);

      if (emotionMatch) {
        const emotion = emotionMatch[1] as EmotionType;
        const cleanContent = content.replace(EMOTION_TAG_REGEX, '').trim();
        return { emotion, cleanContent };
      }
    }

    return { emotion: 'neutral', cleanContent: content };
  }

  /**
   * 发送消息并获取流式响应
   */
  async *sendMessageStream(
    character: CharacterCard,
    messages: Message[],
    onEmotionChange?: (emotion: EmotionType) => void
  ): AsyncGenerator<string, void, unknown> {
    if (!this.client) {
      throw new Error('AI 服务未初始化，请先配置 API Key');
    }

    const systemPrompt = this.buildSystemPrompt(character);
    const convertedMessages = this.convertMessages(messages);

    const stream = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: character.conversation.maxResponseLength || 1024,
      temperature: character.conversation.temperature || 0.8,
      messages: [
        { role: 'system', content: systemPrompt },
        ...convertedMessages,
      ],
      stream: true,
    });

    let fullContent = '';

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        fullContent += text;

        // 实时检测情感变化
        const { emotion } = this.extractEmotion(fullContent);
        if (emotion !== 'neutral') {
          onEmotionChange?.(emotion);
        }

        yield text;
      }
    }
  }

  /**
   * 发送消息并获取完整响应
   */
  async sendMessage(
    character: CharacterCard,
    messages: Message[]
  ): Promise<{ content: string; emotion: EmotionType }> {
    if (!this.client) {
      throw new Error('AI 服务未初始化，请先配置 API Key');
    }

    const systemPrompt = this.buildSystemPrompt(character);
    const convertedMessages = this.convertMessages(messages);

    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: character.conversation.maxResponseLength || 1024,
      temperature: character.conversation.temperature || 0.8,
      messages: [
        { role: 'system', content: systemPrompt },
        ...convertedMessages,
      ],
    });

    const content = response.choices[0]?.message?.content || '';

    const { emotion, cleanContent } = this.extractEmotion(content);

    return { content: cleanContent, emotion };
  }
}

// 单例导出
export const claudeService = new ClaudeService();
