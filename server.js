/**
 * @fileoverview Main entry point for the Fastify server application.
 * Sets up middleware, Vite integration (for development), and routes, then starts the server.
 */

import { register } from "node:module";
import { pathToFileURL } from "node:url";
register("./css-loader.mjs", pathToFileURL("./"));

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
import { setupRoutes } from "./routes/index.js";

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
    app.addHook("preHandler", (_request, reply, done) => {
      reply.header("Cross-Origin-Opener-Policy", "same-origin");
      reply.header("Cross-Origin-Embedder-Policy", "require-corp");
      done();
    });
  },
});
