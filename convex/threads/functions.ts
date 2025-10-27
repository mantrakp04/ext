import { QueryCtx, MutationCtx } from "../_generated/server";
import { GetThreadArgs, GetOrCreateThreadArgs, UpdateThreadArgs, ListThreadsArgs, ListMessagesArgs } from "./types";
import { components } from "../_generated/api";
import { assert } from "convex-helpers";

export async function getThread(ctx: QueryCtx, args: GetThreadArgs) {
  const thread = await ctx.db
    .query("threads")
    .withIndex("by_user_id_and_thread_id", (q) =>
      q.eq("userId", args.userId).eq("threadId", args.threadId)
    )
    .first();
  
  return thread;
}

export async function getOrCreateThread(ctx: MutationCtx, args: GetOrCreateThreadArgs) {
  const { userId, threadId } = args;
  
  
  // Try to get existing thread
  const existingThread = await ctx.db
    .query("threads")
    .withIndex("by_user_id_and_thread_id", (q) =>
      q.eq("userId", userId).eq("threadId", threadId)
    )
    .first();
  
  if (existingThread) {
    return existingThread;
  }

  const thread = await ctx.runMutation(components.agent.threads.createThread, {
    userId,
    title: 'Untitled',
  })
  
  // Create new thread
  const newThreadId = await ctx.db.insert("threads", {
    userId,
    threadId: thread._id,
    updatedAt: Date.now(),
  });
  
  const newThread = await ctx.db.get(newThreadId);
  assert(newThread, "Thread not found");

  return newThread;
}

export async function updateThread(ctx: MutationCtx, args: UpdateThreadArgs) {
  const { userId, threadId, title, summary, ...rest } = args;
  
  const thread = await ctx.db
    .query("threads")
    .withIndex("by_user_id_and_thread_id", (q) =>
      q.eq("userId", userId).eq("threadId", threadId)
    )
    .first();
  
  if (!thread) {
    throw new Error("Thread not found");
  }
  
  await ctx.db.patch(thread._id, {
    updatedAt: Date.now(),
  });
  
  await ctx.runMutation(components.agent.threads.updateThread, {
    threadId: thread._id,
    patch: {
      ...(title ? { title } : {}),
      ...(summary ? { summary } : {}),
    }
  });

  return thread;
}

export async function listThreads(ctx: QueryCtx, args: ListThreadsArgs) {
  const threadDocsPromise = ctx.db
    .query("threads")
    .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
    .order("desc")
    .paginate(args.paginationOpts);

  const agentThreadsPromise = ctx.runQuery(components.agent.threads.listThreadsByUserId, {
    userId: args.userId,
    order: "desc",
    paginationOpts: args.paginationOpts,
  });

  const [threadDocs, agentThreads] = await Promise.all([threadDocsPromise, agentThreadsPromise]);

  return {
    ...threadDocs,
    page: threadDocs.page.map((doc, index) => {
      const agentThread = agentThreads.page[index];
      return {
        ...doc,
        ...agentThread,
      };
    })
  }
}

export async function listMessages(ctx: QueryCtx, args: ListMessagesArgs) {
  const thread = await getThread(ctx, {
    userId: args.userId,
    threadId: args.threadId,
  });
  if (!thread) {
    throw new Error("Thread not found");
  }
  
  const messages = await ctx.runQuery(components.agent.messages.listMessagesByThreadId, {
    threadId: args.threadId,
    order: "desc",
    paginationOpts: args.paginationOpts,
  });
  return messages;
}
