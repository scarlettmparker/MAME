import { executeDocument } from "@sun/api";
import { LoginDocument } from "~/generated/graphql";

export const AUTH_COOKIE = "emulator_auth";

export { getCookieValue } from "@sun/api";

/**
 * Builds the Set-Cookie value that stores the JWT.
 */
export function buildAuthCookie(
  token: string,
  maxAgeSeconds = 60 * 60 * 12,
): string {
  return `${AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAgeSeconds}`;
}

/**
 * Builds the Set-Cookie value that clears the JWT.
 */
export function clearAuthCookie(): string {
  return `${AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

/**
 * Logs in via gaia and returns the JWT, or null if rejected.
 */
export async function loginViaGaia(
  username: string,
  password: string,
): Promise<string | null> {
  const res = await executeDocument<{
    gaiaMutations: { login: { token: string } | null };
  }>(LoginDocument, { input: { username, password } });
  if (!res.success || !res.data) {
    return null;
  }
  return res.data.gaiaMutations.login?.token ?? null;
}
