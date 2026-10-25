import { RouteObject, useRoutes } from "react-router-dom";
import { Suspense } from "react";
import { preloadableLazy as lazy } from "@sun/ssr";
import MAMEPageSkeleton from "~/components/skeletons/mame-page-skeleton";
import NotesPageSkeleton from "~/routes/notes/skeletons/notes-page-skeleton";
import CreatePageSkeleton from "~/routes/notes/create/skeletons/create-page-skeleton";
import DetailPageSkeleton from "~/routes/notes/[id]/skeletons/detail-page-skeleton";
import EditPageSkeleton from "~/routes/notes/edit/skeletons/edit-page-skeleton";

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
    element: (
      <Suspense fallback={<MAMEPageSkeleton />}>
        <Index />
      </Suspense>
    ),
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<MAMEPageSkeleton />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "notes",
    element: (
      <Suspense fallback={<NotesPageSkeleton />}>
        <NotesLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<NotesPageSkeleton />}>
            <NotesList />
          </Suspense>
        ),
      },
      {
        path: "create",
        element: (
          <Suspense fallback={<CreatePageSkeleton />}>
            <NoteCreate />
          </Suspense>
        ),
      },
      {
        path: ":id/edit",
        element: (
          <Suspense fallback={<EditPageSkeleton />}>
            <NoteEdit />
          </Suspense>
        ),
      },
      {
        path: ":id",
        element: (
          <Suspense fallback={<DetailPageSkeleton />}>
            <NoteDetail />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<MAMEPageSkeleton />}>
        <NotFound />
      </Suspense>
    ),
  },
];

export const Router = () => {
  return useRoutes(routes);
};
