import { internalUserQuery, userQuery } from "../functions";
import { getThreadArgs, listMessagesArgs, listThreadsArgs } from "./types";
import * as threadFunctions from "./functions";
import { f } from "../functions";

export const get = userQuery({
  args: f(getThreadArgs),
  handler: async (ctx, args) => {
    return await threadFunctions.getThread(ctx, args);
  },
});

export const list = userQuery({
  args: f(listThreadsArgs),
  handler: async (ctx, args) => {
    return await threadFunctions.listThreads(ctx, args);
  },
});

export const listMessages = userQuery({
  args: f(listMessagesArgs),
  handler: async (ctx, args) => {
    return await threadFunctions.listMessages(ctx, args);
  },
});

export const listInternal = internalUserQuery({
  args: f(listThreadsArgs),
  handler: async (ctx, args) => {
    return await threadFunctions.listThreads(ctx, args);
  },
});

export const getInternal = internalUserQuery({
  args: f(getThreadArgs),
  handler: async (ctx, args) => {
    return await threadFunctions.getThread(ctx, args);
  },
});
