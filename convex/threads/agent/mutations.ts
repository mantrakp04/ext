import { internalMutation } from "../../_generated/server";
import { prep } from "./functions";
import { prepArgs } from "./types";

export const prepInternal = internalMutation({
  args: prepArgs,
  handler: async (ctx, args) => {
    return await prep(ctx, args);
  },
});
