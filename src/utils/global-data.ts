import { defineLoader } from "@sun/ssr";
import { AUTH_COOKIE, getCookieValue } from "~/utils/auth";
import { executeDocument } from "@sun/api";
import { MyRolesDocument, type MyRolesQuery } from "~/generated/graphql";

/**
 * Resolves the current user's role key strings.
 */
defineLoader({
  pattern: "currentRoles",
  async loader(_params, context) {
    const token = getCookieValue(context?.cookie, AUTH_COOKIE);
    if (!token) return { currentRoles: [] };
    const res = await executeDocument<MyRolesQuery>(MyRolesDocument, {}, token);
    return { currentRoles: res.data?.gaiaQueries?.myRoles ?? [] };
  },
});
