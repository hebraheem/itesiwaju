/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accounts from "../accounts.js";
import type * as actionNode_notifications from "../actionNode/notifications.js";
import type * as activities from "../activities.js";
import type * as auth_actions from "../auth/actions.js";
import type * as crons from "../crons.js";
import type * as events from "../events.js";
import type * as files from "../files.js";
import type * as notifications from "../notifications.js";
import type * as reports from "../reports.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  "actionNode/notifications": typeof actionNode_notifications;
  activities: typeof activities;
  "auth/actions": typeof auth_actions;
  crons: typeof crons;
  events: typeof events;
  files: typeof files;
  notifications: typeof notifications;
  reports: typeof reports;
  users: typeof users;
  utils: typeof utils;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
