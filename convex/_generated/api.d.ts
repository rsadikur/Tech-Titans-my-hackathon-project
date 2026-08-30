/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as contact from "../contact.js";
import type * as dashboard from "../dashboard.js";
import type * as evidence from "../evidence.js";
import type * as ideas from "../ideas.js";
import type * as init from "../init.js";
import type * as issues from "../issues.js";
import type * as locations from "../locations.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as thoughts from "../thoughts.js";
import type * as typing from "../typing.js";
import type * as users from "../users.js";
import type * as visitors from "../visitors.js";
import type * as votes from "../votes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  contact: typeof contact;
  dashboard: typeof dashboard;
  evidence: typeof evidence;
  ideas: typeof ideas;
  init: typeof init;
  issues: typeof issues;
  locations: typeof locations;
  messages: typeof messages;
  notifications: typeof notifications;
  thoughts: typeof thoughts;
  typing: typeof typing;
  users: typeof users;
  visitors: typeof visitors;
  votes: typeof votes;
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
