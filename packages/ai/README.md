# @a11y-fixer/ai

The **AI-assisted** fixer layer behind [a11y-fixer](https://github.com/a11y-fixer/a11y-fixer).
Where [`@a11y-fixer/core`](../core) fixes everything computable from the source
alone, this package generates the human-meaningful text that needs an LLM — alt
text, link text, and accessible-name (`aria-label`) wording — and layers those
fixers ahead of the deterministic core ones.

> **Private, source-available (BSL).** Not published to npm. This is the paid
> differentiator; the free deterministic engine ships as `@a11y-fixer/core` /
> `@a11y-fixer/cli`. See the root [`LICENSE`](../../LICENSE).

## Providers (bring your own key)

Multi-provider via the [Vercel AI SDK](https://sdk.vercel.ai/), dynamically
imported so the SDK stays out of the load path (and the Action bundle) until a
generation actually runs. Supported providers and their default models:

| Provider | `A11Y_AI_PROVIDER` | Default model |
|---|---|---|
| Anthropic (default) | `anthropic` | `claude-haiku-4-5` |
| OpenAI | `openai` | `gpt-4o-mini` |
| Google | `google` | `gemini-1.5-flash` |

Bedrock and Vertex are intentionally excluded — they authenticate with IAM /
credential sets rather than a single key.

## Configuration (env vars)

`resolveAIConfig()` (in `src/provider/config.ts`) reads, in precedence order:

- **Provider** — `A11Y_AI_PROVIDER` (default `anthropic`).
- **Model** — `A11Y_AI_MODEL` (default = the provider's default above). Model ids
  are **not** portable across providers.
- **Key** — `A11Y_AI_API_KEY` (generic), else the provider-native var:
  `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or `GOOGLE_GENERATIVE_AI_API_KEY`.

An empty key means the provider is configured but unavailable — fixers then
**human-flag** the violation instead of guessing. The GitHub Action bridges its
`ai-provider` / `ai-model` / `ai-api-key` / `anthropic-api-key` inputs onto these
env vars.

## What's exported

- **Providers:** `AISDKProvider`, `AnthropicProvider`, `resolveAIConfig`,
  `DEFAULT_MODELS`, `SUPPORTED_PROVIDERS`, `isSupportedProvider`.
- **Wrappers:** `CachingProvider` (dedupes identical requests within a run, with
  optional cross-run JSON persistence) and `LearningProvider` (feeds accepted
  past fixes back as few-shot house-style examples).
- **Registry:** `buildFullRegistry`, which registers the AI fixers (`AltTextFixer`,
  `LinkTextFixer`, `LinkNameFixer`, `ButtonNameFixer`, `FormLabelFixer`,
  `SelectNameFixer`, the `aria-*-name` widget fixers, the Markdown alt/link
  fixers, …) and then appends all deterministic core fixers from
  `@a11y-fixer/core`.

The full fixer-to-WCAG coverage map lives in [`COVERAGE.md`](../../COVERAGE.md).

## License

Business Source License 1.1 (see the root [`LICENSE`](../../LICENSE)).
