import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { httpAction } from "./_generated/server";
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { createOpenRouter, openrouter } from '@openrouter/ai-sdk-provider';
import { Agent } from "@convex-dev/agent";
import { components } from "./_generated/api";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth, { cors: true });

const createOptionsHandler = () => {
  return httpAction(async (_, request) => {
    const headers = request.headers;
    if (
      headers.get('Origin') !== null &&
      headers.get('Access-Control-Request-Method') !== null &&
      headers.get('Access-Control-Request-Headers') !== null
    ) {
      const origin = request.headers.get('Origin') || '*';
      // Mirror requested headers for preflight
      // const requestedHeaders = headers.get('Access-Control-Request-Headers') || 'content-type, authorization, better-auth-cookie, http-referer, x-title';
      return new Response(null, {
        headers: new Headers({
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Headers': '*',          
          'Access-Control-Max-Age': '86400',
          'Vary': 'Origin',
        }),
      });
    } else {
      return new Response();
    }
  });
};

http.route({
  path: '/proxy/llm',
  method: 'OPTIONS',
  handler: createOptionsHandler(),
})

http.route({
  path: '/proxy/llm',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    // const user = await ctx.auth.getUserIdentity();

    // if (!user) {
    //   return new Response(
    //     JSON.stringify({ error: 'Unauthorized' }),
    //     { status: 401 }
    //   );
    // }

    const body = await request.json();
    const messages = body?.messages as UIMessage[];

    const openRouterApiKey = process.env.OPENAI_API_KEY;
    if (!openRouterApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { status: 500 }
      );
    }

    try {
      const openrouter = createOpenRouter({
        apiKey: openRouterApiKey,
      });
      const modelId = 'openai/gpt-4o-mini';
      const model = openrouter(modelId);

      if (!Array.isArray(messages)) {
        return new Response(
          JSON.stringify({ error: 'Invalid request: messages missing' }),
          { status: 400 }
        );
      }

      // Stream using AI SDK and return UI-compatible stream
      const result = streamText({
        model,
        messages: convertToModelMessages(body.messages),
      });

      const streamResponse = await result.toUIMessageStreamResponse();

      const resultHeaders = new Headers(streamResponse.headers);
      resultHeaders.set('Access-Control-Allow-Origin', request.headers.get('Origin') || '*');
      resultHeaders.set('Access-Control-Allow-Credentials', 'true');
      resultHeaders.append('Vary', 'Origin');

      return new Response(streamResponse.body, {
        status: streamResponse.status,
        statusText: streamResponse.statusText,
        headers: resultHeaders,
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: `Failed to forward request: ${error}` }),
        { status: 502 }
      );
    }
  }),
})

// http.route({
//   path: '/agent',
//   method: 'POST',
//   handler: httpAction(async (ctx, request) => {
//     const body = await request.json();

//     const agent = new Agent(components.agent, {
//       name: "Barrel Agent",
//       languageModel: openrouter("openai/gpt-4o-mini"),
//       instructions: "You are a helpful assistant.",
//       tools: {
//       },
//       maxSteps: 50,
//     });

//     return new Response(JSON.stringify(result), { status: 200 });
//   }),
// })
export default http;
