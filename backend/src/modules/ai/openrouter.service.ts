import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OpenRouterConfig } from '../../config/configuration';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json_object' | 'text';
}

interface OpenRouterResponse {
  model?: string;
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

export interface ChatCompletionResult {
  content: string;
  model: string;
}

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);

  constructor(private readonly configService: ConfigService) {}

  get isConfigured(): boolean {
    return this.config.apiKey.length > 0;
  }

  get model(): string {
    return this.config.model;
  }

  async chat(messages: ChatMessage[], options: ChatCompletionOptions = {}): Promise<ChatCompletionResult> {
    const config = this.config;

    if (!config.apiKey) {
      throw new ServiceUnavailableException(
        'OpenRouter API anahtarı tanımlı değil, AI özellikleri kullanılamıyor',
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': config.referer,
          'X-Title': config.title,
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 4000,
          ...(options.responseFormat === 'json_object'
            ? { response_format: { type: 'json_object' } }
            : {}),
        }),
      });

      const payload = (await response.json()) as OpenRouterResponse;

      if (!response.ok) {
        this.logger.error(`OpenRouter hatası (${response.status}): ${payload.error?.message ?? ''}`);
        throw new ServiceUnavailableException('AI servisine şu anda ulaşılamıyor');
      }

      const content = payload.choices?.[0]?.message?.content;

      if (!content) {
        throw new ServiceUnavailableException('AI servisinden boş yanıt alındı');
      }

      return { content, model: payload.model ?? config.model };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ServiceUnavailableException('AI servisi zaman aşımına uğradı');
      }

      this.logger.error('OpenRouter isteği başarısız', error instanceof Error ? error.stack : String(error));
      throw new ServiceUnavailableException('AI servisine bağlanılamadı');
    } finally {
      clearTimeout(timeout);
    }
  }

  private get config(): OpenRouterConfig {
    return this.configService.getOrThrow<OpenRouterConfig>('openRouter');
  }
}
