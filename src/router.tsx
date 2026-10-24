import { RouteObject, useRoutes } from "react-router-dom";
import { lazy, Suspense } from "react";

const Index = lazy(() => import("~/routes/index"));
const NotFound = lazy(() => import("~/routes/not-found"));
const Login = lazy(() => import("~/routes/login"));
const NotesLayout = lazy(() => import("~/routes/notes/notes-layout"));
const NotesList = lazy(() => import("~/routes/notes"));
const NoteCreate = lazy(() => import("~/routes/notes/create"));
const NoteDetail = lazy(() => import("~/routes/notes/[id]"));
const NoteEdit = lazy(() => import("~/routes/notes/edit"));

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Index />,
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
    path: "notes",
    element: (
      <Suspense fallback={null}>
        <NotesLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={null}>
            <NotesList />
          </Suspense>
        ),
      },
      {
        path: "create",
        element: (
          <Suspense fallback={null}>
            <NoteCreate />
          </Suspense>
        ),
      },
      {
        path: ":id/edit",
        element: (
          <Suspense fallback={null}>
            <NoteEdit />
          </Suspense>
        ),
      },
      {
        path: ":id",
        element: (
          <Suspense fallback={null}>
            <NoteDetail />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export const Router = () => {
  return useRoutes(routes);
};
