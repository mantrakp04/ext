import { customAction, customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { action, internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { v } from "convex/values";
import { omit } from "convex-helpers";
import type { PropertyValidators, Validator, VObject, VUnion, OptionalProperty } from "convex/values";
import type { BetterOmit, Expand } from "convex-helpers";

export const userQuery = customQuery(query, {
  args: {},
  input: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");
    return {
      ctx: { user: authUser },
      args: { ...args, userId: authUser._id },
    };
  },
});

export const userMutation = customMutation(mutation, {
  args: {},
  input: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");
    return {
      ctx: { user: authUser },
      args: { ...args, userId: authUser._id },
    };
  },
});

export const userAction = customAction(action, {
  args: {},
  input: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");
    return {
      ctx: { user: authUser },
      args: { ...args, userId: authUser._id },
    };
  },
});

export const internalUserQuery = customQuery(internalQuery, {
  args: { userId: v.string() },
  input: async (ctx, args) => {
    const authUser = await authComponent.getAnyUserById(ctx, args.userId);
    if (!authUser) throw new Error("Not authenticated");
    return {
      ctx: { user: authUser },
      args: { ...args, userId: authUser._id },
    };
  },
});

export const internalUserMutation = customMutation(internalMutation, {
  args: { userId: v.string() },
  input: async (ctx, args) => {
    const authUser = await authComponent.getAnyUserById(ctx, args.userId);
    if (!authUser) throw new Error("Not authenticated");
    return {
      ctx: { user: authUser },
      args: { ...args, userId: authUser._id },
    };
  },
});

export const internalUserAction = customAction(internalAction, {
  args: { userId: v.string() },
  input: async (ctx, args) => {
    const authUser = await authComponent.getAnyUserById(ctx, args.userId);
    if (!authUser) throw new Error("Not authenticated");
    return {
      ctx: { user: authUser },
      args: { ...args, userId: authUser._id },
    };
  },
});

function omitField(input: any, field: string): any {
  if (input?.isConvexValidator) {
    const vld = input as Validator<any, any, any> & { kind: string; isOptional?: string };
    if (vld.kind === "object") {
      const obj: any = vld as any;
      const newFields = omit(obj.fields as PropertyValidators, [field]);
      const out = v.object(newFields);
      return (obj.isOptional === "optional") ? v.optional(out) : out;
    }
    if (vld.kind === "union") {
      const u: any = vld as any;
      const members = (u.members as Validator<any, any, any>[]).map((m) => omitField(m, field));
      const out = v.union(...members as any);
      return (u.isOptional === "optional") ? v.optional(out) : out;
    }
    return input;
  }
  return omit(input as PropertyValidators, [field]);
}

export function f<T, V extends PropertyValidators, O extends OptionalProperty>(
  validator: VObject<T, V, O>
): VObject<Expand<Omit<T, "userId">>, Expand<BetterOmit<V, "userId">>, O>;
export function f<Vs extends PropertyValidators>(
  fields: Vs
): Expand<BetterOmit<Vs, "userId">>;
export function f<T, M extends Validator<T, "required", any>[], O extends OptionalProperty>(
  validator: VUnion<T, M, O>
): VUnion<any, any[], O>;
export function f<V extends Validator<any, any, any>>(validator: V): V;
export function f(input: any): any {
  return omitField(input, "userId");
}
