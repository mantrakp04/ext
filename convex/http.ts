import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { httpAction } from "./_generated/server";
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { createOpenRouter, openrouter } from '@openrouter/ai-sdk-provider';
import { Agent } from "@convex-dev/agent";
import { components, internal } from "./_generated/api";
import { openai } from "@ai-sdk/openai";

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
  path: '/agent',
  method: 'OPTIONS',
  handler: createOptionsHandler(),
})

http.route({
  path: '/agent',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const sessionToken = request.headers.get('Authorization')?.split(' ')[1] || '';

    const body : {
      threadId: string;
      model: string | undefined,
      message: UIMessage;
    } = await request.json();

    const { promptMessageId, userId } = await ctx.runMutation(internal.threads.agent.mutations.prepInternal, {
      sessionToken: sessionToken || '',
      threadId: body.threadId,
      message: JSON.stringify(body.message),
    });

    const agent = new Agent(components.agent, {
      name: "Barrel Agent",
      languageModel: openrouter("openai/gpt-4o-mini"),
      textEmbeddingModel: openai.embedding("text-embedding-3-small"),
      instructions: "You are a helpful assistant.",
      contextOptions: {
        excludeToolMessages: false,
        recentMessages: 100,
        searchOptions: {
          limit: 10,
          vectorSearch: true,
          messageRange: {
            before: 2,
            after: 1,
          }
        },
        searchOtherThreads: true,
      },
      storageOptions: {
        saveMessages: "all"
      },
      tools: {
      },
      maxSteps: 50,
    });
    
    const stream = await agent.streamText(ctx,
      {
        userId: userId,
        threadId: body.threadId
      },
      {
        promptMessageId: promptMessageId,
      },
      {
        saveStreamDeltas: false
      }
    )

    return stream.toUIMessageStreamResponse()
  }),
})

export default http;
