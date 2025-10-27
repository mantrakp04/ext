import type { MutationCtx } from "../../_generated/server";
import { components } from "../../_generated/api";
import { serializeMessage } from "@convex-dev/agent";
import { convertToModelMessages, type UIMessage } from "ai";
import { PrepArgs } from "./types";
import { getOrCreateThread } from "../functions";

export async function prep(
  ctx: MutationCtx,
  args: PrepArgs
): Promise<{ promptMessageId: string, userId: string }> {
  const session = await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "session",
    where: [
      { field: "token", value: args.sessionToken, operator: "eq" }
    ],
  });
  if (!session || new Date(session.expiresAt) < new Date()) {
    throw new Error('Unauthorized: Session expired or not found');
  }

  const userId = session.userId;
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
    userId: userId,
    threadId: args.threadId,
  });

  return {
    promptMessageId: promptMessage._id,
    userId
  };
}
