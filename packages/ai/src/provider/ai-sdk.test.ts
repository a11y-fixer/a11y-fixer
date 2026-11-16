import { describe, it, expect, vi } from 'vitest';
import {
  AISDKProvider,
  type AIConfig,
  type GenerateTextArgs,
} from './ai-sdk.js';

const cfg = (over: Partial<AIConfig> = {}): AIConfig => ({
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKey: 'test-key',
  ...over,
});

// A fake model instance the factory hands back; identity is all we assert on.
const FAKE_MODEL = { id: 'fake-model' };

describe('AISDKProvider', () => {
  it('available() is false with an empty key', () => {
    expect(new AISDKProvider(cfg({ apiKey: '' })).available()).toBe(false);
  });

  it('available() is false with an empty model', () => {
    expect(new AISDKProvider(cfg({ model: '' })).available()).toBe(false);
  });

  it('available() is true with key and model', () => {
    expect(new AISDKProvider(cfg()).available()).toBe(true);
  });

  it('builds the model from config and passes it to generateText', async () => {
    const modelFactory = vi.fn(async () => FAKE_MODEL);
    const generateText = vi.fn(async (_a: GenerateTextArgs) => ({ text: 'ok' }));
    const provider = new AISDKProvider(cfg({ provider: 'anthropic', model: 'claude-haiku-4-5' }), {
      modelFactory,
      generateText,
    });

    await provider.suggestAltText('header');

    expect(modelFactory).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'anthropic', model: 'claude-haiku-4-5', apiKey: 'test-key' }),
    );
    expect(generateText.mock.calls[0][0].model).toBe(FAKE_MODEL);
  });

  it('suggestAltText uses a prompt + maxOutputTokens and trims the result', async () => {
    const generateText = vi.fn(async (_a: GenerateTextArgs) => ({ text: '  Company logo  ' }));
    const provider = new AISDKProvider(cfg(), { modelFactory: async () => FAKE_MODEL, generateText });

    expect(await provider.suggestAltText('header')).toBe('Company logo');
    const args = generateText.mock.calls[0][0];
    expect(args.prompt).toContain('Context: header');
    expect(args.maxOutputTokens).toBe(100);
    expect(args.messages).toBeUndefined();
  });

  it('rewriteLinkText and suggestAccessibleName trim and map tokens', async () => {
    const generateText = vi
      .fn()
      .mockResolvedValueOnce({ text: ' View pricing ' })
      .mockResolvedValueOnce({ text: ' Close dialog ' });
    const provider = new AISDKProvider(cfg(), { modelFactory: async () => FAKE_MODEL, generateText });

    expect(await provider.rewriteLinkText('click here', 'pricing')).toBe('View pricing');
    expect(await provider.suggestAccessibleName('<button>', 'modal')).toBe('Close dialog');
    expect(generateText.mock.calls[0][0].maxOutputTokens).toBe(100);
    expect(generateText.mock.calls[1][0].maxOutputTokens).toBe(60);
  });

  it('describeImage sends an AI-SDK image part (base64 + mediaType) with the text', async () => {
    const generateText = vi.fn(async (_a: GenerateTextArgs) => ({ text: ' A red dial ' }));
    const provider = new AISDKProvider(cfg(), { modelFactory: async () => FAKE_MODEL, generateText });

    const alt = await provider.describeImage(Buffer.from('PNGDATA'), 'a thermostat');

    expect(alt).toBe('A red dial');
    const args = generateText.mock.calls[0][0];
    expect(args.maxOutputTokens).toBe(200);
    const content = args.messages![0].content as Array<Record<string, unknown>>;
    const imagePart = content.find((p) => p.type === 'image')!;
    expect(imagePart.image).toBe(Buffer.from('PNGDATA').toString('base64'));
    expect(imagePart.mediaType).toBe('image/png');
    const textPart = content.find((p) => p.type === 'text')!;
    expect(textPart.text).toContain('Context: a thermostat');
  });

  it('builds the model once and reuses it across calls', async () => {
    const modelFactory = vi.fn(async () => FAKE_MODEL);
    const generateText = vi.fn(async () => ({ text: 'x' }));
    const provider = new AISDKProvider(cfg(), { modelFactory, generateText });

    await provider.suggestAltText('a');
    await provider.suggestAltText('b');

    expect(modelFactory).toHaveBeenCalledTimes(1);
  });
});
