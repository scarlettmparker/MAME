import { RouteObject, useRoutes } from "react-router-dom";
import { lazy } from "react";

const Index = lazy(() => import("~/routes/index"));
const NotFound = lazy(() => import("~/routes/not-found"));
const MamePage = lazy(() => import("~/routes/mame"));

/**
 * List of routes.
 */
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/mame",
    element: <MamePage />,
  },
];

export const Router = () => {
  return useRoutes(routes);
};
