import type { MutationCtx } from "../../_generated/server";
import { components } from "../../_generated/api";
import { serializeMessage } from "@convex-dev/agent";
import { convertToModelMessages, type UIMessage } from "ai";
import { PrepArgs } from "./types";
import { getOrCreateThread } from "../functions";

export async function prep(
  ctx: MutationCtx,
  args: PrepArgs
): Promise<{ promptMessageId: string }> {
  // Parse incoming UIMessage
  const uiMessage = JSON.parse(args.message) as UIMessage;
  const coreMessage = convertToModelMessages([uiMessage])[0];

  // Serialize and add to thread
  const serialized = await serializeMessage(ctx, components.agent, coreMessage);
  const added = await ctx.runMutation(components.agent.messages.addMessages, {
    threadId: args.threadId,
    messages: [serialized],
  });

  const promptMessage = added.messages[0];

  await getOrCreateThread(ctx, {
    userId: args.userId,
    threadId: args.threadId,
  });

  return {
    promptMessageId: promptMessage._id,
  };
}
