import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export function getOpenRouterProvider(apiKey: string) {
  return createOpenRouter({
    apiKey,
  });
}

export function getOpenRouterChatModel(apiKey: string, model: string = 'openai/gpt-4o-mini') {
  const provider = getOpenRouterProvider(apiKey);
  return provider.chat(model);
}
