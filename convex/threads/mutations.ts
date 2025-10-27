import { internalUserMutation, userMutation } from "../functions";
import { getOrCreateThreadArgs, updateThreadArgs } from "./types";
import { f } from "../functions";
import * as threadFunctions from "./functions";

export const getOrCreate = userMutation({
  args: f(getOrCreateThreadArgs),
  handler: async (ctx, args) => {
    return await threadFunctions.getOrCreateThread(ctx, args);
  },
});

export const update = userMutation({
  args: f(updateThreadArgs),
  handler: async (ctx, args) => {
    return await threadFunctions.updateThread(ctx, args);
  },
});

export const getOrCreateInternal = internalUserMutation({
  args: f(getOrCreateThreadArgs),
  handler: async (ctx, args) => {
    return await threadFunctions.getOrCreateThread(ctx, args);
  },
});

export const updateInternal = internalUserMutation({
  args: f(updateThreadArgs),
  handler: async (ctx, args) => {
    return await threadFunctions.updateThread(ctx, args);
  },
});
