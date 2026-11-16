import type { AIProvider } from './index.js';

/**
 * Providers reachable with a single API key via the Vercel AI SDK. Bedrock and
 * Vertex are intentionally excluded here: they authenticate with IAM/credential
 * sets rather than one key, so they belong to a separate follow-up.
 */
export type AISDKProviderName = 'anthropic' | 'openai' | 'google';

export const SUPPORTED_PROVIDERS: readonly AISDKProviderName[] = ['anthropic', 'openai', 'google'];

export function isSupportedProvider(value: string): value is AISDKProviderName {
  return (SUPPORTED_PROVIDERS as readonly string[]).includes(value);
}

/**
 * Default model per provider. Cheap, widely-available models suited to the tiny
 * generation tasks here (short alt text, one vision call). Model IDs are NOT
 * portable across providers — each provider gets its own. Override with
 * `A11Y_AI_MODEL`.
 */
export const DEFAULT_MODELS: Record<AISDKProviderName, string> = {
  anthropic: 'claude-haiku-4-5',
  openai: 'gpt-4o-mini',
  google: 'gemini-1.5-flash',
};

export interface AIConfig {
  provider: AISDKProviderName;
  model: string;
  /** May be empty: an empty key means the provider is configured but unavailable. */
  apiKey: string;
}

// Structural stand-ins so this module does not need `ai`'s types at compile
// time — the SDK is dynamically imported so it stays out of the load path (and
// the action bundle) until a generation actually runs.
export type LanguageModel = unknown;

type ImagePart = { type: 'image'; image: string; mediaType: string };
type TextPart = { type: 'text'; text: string };
type UserMessage = { role: 'user'; content: string | Array<TextPart | ImagePart> };

export interface GenerateTextArgs {
  model: LanguageModel;
  prompt?: string;
  messages?: UserMessage[];
  maxOutputTokens: number;
}

export type GenerateTextFn = (args: GenerateTextArgs) => Promise<{ text: string }>;
export type ModelFactory = (config: AIConfig) => Promise<LanguageModel> | LanguageModel;

/** Injection seam for tests — fakes replace the SDK without module mocking. */
export interface AISDKProviderDeps {
  generateText?: GenerateTextFn;
  modelFactory?: ModelFactory;
}

async function defaultModelFactory(config: AIConfig): Promise<LanguageModel> {
  switch (config.provider) {
    case 'anthropic': {
      const { createAnthropic } = await import('@ai-sdk/anthropic');
      return createAnthropic({ apiKey: config.apiKey })(config.model);
    }
    case 'openai': {
      const { createOpenAI } = await import('@ai-sdk/openai');
      return createOpenAI({ apiKey: config.apiKey })(config.model);
    }
    case 'google': {
      const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
      return createGoogleGenerativeAI({ apiKey: config.apiKey })(config.model);
    }
    default: {
      const exhaustive: never = config.provider;
      throw new Error(`Unsupported AI provider: ${String(exhaustive)}`);
    }
  }
}

async function defaultGenerateText(args: GenerateTextArgs): Promise<{ text: string }> {
  const { generateText } = await import('ai');
  // The structural args line up with the SDK's shape (prompt | messages,
  // maxOutputTokens). Cast at this single boundary rather than depend on the
  // SDK's exported types across the whole module.
  const { text } = await generateText(args as unknown as Parameters<typeof generateText>[0]);
  return { text };
}

/**
 * One `AIProvider` for every API-key provider the AI SDK supports. The provider
 * is chosen by {@link AIConfig}, so swapping Claude for OpenAI/Gemini is config,
 * not code. Prompts are identical to the former Claude-only path for benchmark
 * parity.
 */
export class AISDKProvider implements AIProvider {
  private readonly config: AIConfig;
  private readonly generate: GenerateTextFn;
  private readonly makeModel: ModelFactory;
  private model: LanguageModel | null = null;

  constructor(config: AIConfig, deps: AISDKProviderDeps = {}) {
    this.config = config;
    this.generate = deps.generateText ?? defaultGenerateText;
    this.makeModel = deps.modelFactory ?? defaultModelFactory;
  }

  available(): boolean {
    return this.config.apiKey.length > 0 && this.config.model.length > 0;
  }

  // Build the model once and reuse it across calls (mirrors the old client cache).
  private async getModel(): Promise<LanguageModel> {
    if (this.model === null) this.model = await this.makeModel(this.config);
    return this.model;
  }

  private async complete(prompt: string, maxOutputTokens: number): Promise<string> {
    const model = await this.getModel();
    const { text } = await this.generate({ model, prompt, maxOutputTokens });
    return text.trim();
  }

  async describeImage(imageBuffer: Buffer, context: string): Promise<string> {
    const model = await this.getModel();
    const { text } = await this.generate({
      model,
      maxOutputTokens: 200,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Write a concise, descriptive alt text for this image. Context: ${context}. Return only the alt text string, no quotes, no explanation.`,
          },
          { type: 'image', image: imageBuffer.toString('base64'), mediaType: 'image/png' },
        ],
      }],
    });
    return text.trim();
  }

  async suggestAltText(context: string): Promise<string> {
    return this.complete(
      `Write concise, descriptive alt text for an image based on the surrounding code and context. Context: ${context}. Return only the alt text string, no quotes, no explanation.`,
      100,
    );
  }

  async rewriteLinkText(current: string, context: string): Promise<string> {
    return this.complete(
      `Rewrite this link text to be descriptive for screen reader users. Current text: "${current}". Context: ${context}. Return only the new link text, no quotes, no explanation.`,
      100,
    );
  }

  async suggestAccessibleName(element: string, context: string): Promise<string> {
    return this.complete(
      `Write a short, descriptive accessible name (for an aria-label) for this UI control, so screen reader users understand its purpose. Element: ${element}. Context: ${context}. Return only the accessible name, no quotes, no explanation.`,
      60,
    );
  }
}
