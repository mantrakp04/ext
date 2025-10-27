import { internalUserMutation, f } from "../../functions";
import { prep } from "./functions";
import { prepArgs } from "./types";

export const prepInternal = internalUserMutation({
  args: f(prepArgs),
  handler: async (ctx, args) => {
    return await prep(ctx, args);
  },
});
