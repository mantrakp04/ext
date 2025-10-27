import { internalUserQuery, userQuery } from "../functions";
import { getThreadArgs, listThreadsArgs } from "./types";
import * as threadFunctions from "./functions";
import { f } from "../functions";
import { api } from "../_generated/api";

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
