import React, { Suspense } from "react";
import { StaticRouter } from "react-router-dom/server";
import { Router, routes } from "./router";
import Layout from "./components/layout";
import NotFound from "./routes/not-found";
import { matchRoutes } from "react-router-dom";
import { createRenderer, autoDiscoverRegistrations } from "@sun/ssr/server";
import { createI18nInstance } from "./utils/i18n";
import { configureApi } from "@sun/api";
import { AUTH_COOKIE } from "./utils/auth";
import { clientId, clientSecret } from "../config.js";
import "./utils/configure-framework";
import "./utils/global-data";

configureApi({ authCookie: AUTH_COOKIE, clientId, clientSecret });

// Colocated mutation handlers self-register at boot.
autoDiscoverRegistrations(
  import.meta.glob("./server/**/*-registrations.ts", { eager: true }),
);

export async function render(options: {
  url: string;
  locale: string;
  pageName: string;
  clientJs: string;
  clientCss: string[];
  isProduction: boolean;
  frontendMode?: string;
}) {
  const renderer = createRenderer({
    title: "Emulator | Scarlet Sun",
    posthog: true,
    emitFrontendMode: true,
    initI18n(locale, translations) {
      const i18n = createI18nInstance();
      return i18n.init({
        lng: locale,
        fallbackLng: "en",
        resources: { [locale]: translations } as never,
        interpolation: { escapeValue: false },
      });
    },
  });

  const matches = matchRoutes(routes, options.url);
  const didMatch = Boolean(matches);
  const App = (
    <React.StrictMode>
      <StaticRouter location={options.url}>
        <Layout>
          <Suspense fallback={null}>
            <Router />
          </Suspense>
        </Layout>
      </StaticRouter>
    </React.StrictMode>
  );

  return renderer.render({
    app: didMatch ? App : <NotFound />,
    didMatch,
    url: options.url,
    locale: options.locale,
    pageName: options.pageName,
    clientJs: options.clientJs,
    clientCss: options.clientCss,
    isProduction: options.isProduction,
    frontendMode: options.frontendMode,
  });
}
