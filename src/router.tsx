import { RouteObject, useRoutes } from "react-router-dom";
import { lazy, Suspense } from "react";

const Index = lazy(() => import("~/routes/index"));
const NotFound = lazy(() => import("~/routes/not-found"));
const MamePage = lazy(() => import("~/routes/mame"));
const Login = lazy(() => import("~/routes/login"));

/**
 * List of routes.
 */
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/mame",
    element: <MamePage />,
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={null}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export const Router = () => {
  return useRoutes(routes);
};
