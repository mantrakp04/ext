import { v, Infer } from "convex/values";
import { omit } from "convex-helpers";
import { Threads } from "../schema";
import { paginationOptsValidator } from "convex/server";

export const getThreadArgs = v.object({
  userId: v.string(),
  threadId: v.string(),
});
export type GetThreadArgs = Infer<typeof getThreadArgs>;

export const getOrCreateThreadArgs = v.object({
  ...omit(Threads.withoutSystemFields, ["updatedAt"]),
})
export type GetOrCreateThreadArgs = Infer<typeof getOrCreateThreadArgs>;

export const updateThreadArgs = v.object({
  ...omit(Threads.withoutSystemFields, ["updatedAt"]),
  title: v.optional(v.string()),
  summary: v.optional(v.string()),
})
export type UpdateThreadArgs = Infer<typeof updateThreadArgs>;

export const listThreadsArgs = v.object({
  userId: v.string(),
  paginationOpts: paginationOptsValidator,
})
export type ListThreadsArgs = Infer<typeof listThreadsArgs>;

export const listMessagesArgs = v.object({
  userId: v.string(),
  threadId: v.string(),
  paginationOpts: paginationOptsValidator,
})
export type ListMessagesArgs = Infer<typeof listMessagesArgs>;

export const searchThreadsArgs = v.object({
  userId: v.string(),
  query: v.string(),
  paginationOpts: paginationOptsValidator,
})
export type SearchThreadsArgs = Infer<typeof searchThreadsArgs>;