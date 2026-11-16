import {
  type AIConfig,
  type AISDKProviderName,
  DEFAULT_MODELS,
  isSupportedProvider,
  SUPPORTED_PROVIDERS,
} from './ai-sdk.js';

/** The native env var each provider's SDK reads when no explicit key is passed. */
const NATIVE_KEY_ENV: Record<AISDKProviderName, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  google: 'GOOGLE_GENERATIVE_AI_API_KEY',
};

type Env = Record<string, string | undefined>;

/**
 * Resolve which provider, model, and key to use from the environment.
 *
 * Precedence:
 *  - provider: `A11Y_AI_PROVIDER` (default `anthropic`)
 *  - model:    `A11Y_AI_MODEL` (default = the provider's default model)
 *  - key:      `A11Y_AI_API_KEY` (generic) → else the provider's native env var
 *
 * The returned `apiKey` may be empty — that mirrors the old
 * `AnthropicProvider.available()` semantics (no key ⇒ AI simply unavailable),
 * so the default, key-less path behaves exactly as before.
 *
 * @throws if `A11Y_AI_PROVIDER` names an unsupported provider.
 */
export function resolveAIConfig(env: Env = process.env): AIConfig {
  const raw = (env['A11Y_AI_PROVIDER'] ?? 'anthropic').trim().toLowerCase();
  if (!isSupportedProvider(raw)) {
    throw new Error(
      `Unsupported A11Y_AI_PROVIDER "${raw}". Supported providers: ${SUPPORTED_PROVIDERS.join(', ')}.`,
    );
  }
  const provider = raw;
  const model = env['A11Y_AI_MODEL']?.trim() || DEFAULT_MODELS[provider];
  const apiKey = env['A11Y_AI_API_KEY']?.trim() || env[NATIVE_KEY_ENV[provider]]?.trim() || '';
  return { provider, model, apiKey };
}
