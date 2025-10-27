import { v, Infer } from "convex/values";

export const prepArgs = v.object({
  sessionToken: v.string(),
  threadId: v.string(),
  message: v.string(),
});
export type PrepArgs = Infer<typeof prepArgs>;
