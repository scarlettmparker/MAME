/**
 * @fileoverview Main entry point for the Fastify server application.
 * Sets up middleware, Vite integration (for development), and routes, then starts the server.
 */

import { createServer } from "@sun/ssr/server";
import {
  port,
  host,
  base,
  isProduction,
  backendHost,
  backendPort,
  clientSecret,
  clientId,
} from "./config.js";
import { configureApi } from "@sun/api";
import { setupRoutes } from "./routes/index.js";
import { AUTH_COOKIE } from "./src/utils/auth.ts";

configureApi({ authCookie: AUTH_COOKIE, clientId, clientSecret });

await createServer({
  config: {
    port,
    host,
    base,
    isProduction,
    backendHost,
    backendPort,
    clientSecret,
    clientId,
    ipWhitelist: {
      backendUrl: `http://${backendHost}:${backendPort}`,
      exemptPaths: ["/login", "/__login", "/__logout"],
    },
  },
  setupRoutes,
  configure: async (app) => {
    const { default: formbody } = await import("@fastify/formbody");
    await app.register(formbody);
    app.addHook("preHandler", (_request, reply) => {
      reply.header("Cross-Origin-Opener-Policy", "same-origin");
      reply.header("Cross-Origin-Embedder-Policy", "require-corp");
    });
  },
  analytics: {
    app: "emulator",
    authCookie: AUTH_COOKIE,
  },
});
