import { BrowserRouter } from "react-router-dom";
import { Router } from "./router";
import ReactDOM from "react-dom/client";
import i18n from "i18next";
import { Suspense } from "react";

import Layout from "./components/layout";
import { setI18n } from "@sun/i18n";
import { initClientBootstrap } from "@sun/ssr";
import "./utils/configure-framework";
import "@sun/components/style.css";

if (typeof window !== "undefined" && window.trustedTypes) {
  try {
    window.trustedTypes.createPolicy("default", {
      createHTML: (html: string) => html,
      createScriptURL: (url: string) => url,
    });
  } catch {
    // Policy already exists.
  }
}

setI18n(i18n);

initClientBootstrap({ i18n })
  .then(() => {
    ReactDOM.hydrateRoot(
      document.getElementById("app") as HTMLElement,
      <BrowserRouter>
        <Layout>
          <Suspense fallback={null}>
            <Router />
          </Suspense>
        </Layout>
      </BrowserRouter>,
    );
  })
  .catch((error) => {
    console.error("Client bootstrap failed", error);
  });
