import { configurePageData } from "@sun/ssr";

configurePageData({
  perPatternTtl: {
    "/currentRoles": Infinity,
    mame: 30_000,
  },
});
