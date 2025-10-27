import { defineSchema } from 'convex/server';
import { v } from 'convex/values';
import { Table } from "convex-helpers/server";
import {
  literals, brandedString,
} from "convex-helpers/validators";
import { Infer } from "convex/values";

export const Threads = Table("threads", {
  userId: v.string(),
  threadId: v.string(),
  updatedAt: v.number(),
})

export default defineSchema({
  threads: Threads.table
    .index("by_user_id", ["userId", "updatedAt"])
    .index("by_user_id_and_thread_id", ["userId", "threadId"]),
});
