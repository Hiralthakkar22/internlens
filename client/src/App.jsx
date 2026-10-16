import { lazy } from "react";
import { Routes, Route } from "react-router";
import AppShell from "./components/layout/AppShell";
import RequireAuth from "./components/ui/RequireAuth";

// Each page is loaded only when someone opens it, so the first load is smaller
const HomePage = lazy(() => import("./pages/HomePage"));
const CompaniesPage = lazy(() => import("./pages/CompaniesPage"));
const CompanyPage = lazy(() => import("./pages/CompanyPage"));
const ExperiencePage = lazy(() => import("./pages/ExperiencePage"));
const SharePage = lazy(() => import("./pages/SharePage"));
const EditExperiencePage = lazy(() => import("./pages/EditExperiencePage"));
const SavedPage = lazy(() => import("./pages/SavedPage"));
const MyPostsPage = lazy(() => import("./pages/MyPostsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const AuthPage = lazy(() => import("./features/auth/AuthPage"));
const AdminPage = lazy(() => import("./features/admin/AdminPage"));

const authed = (page) => <RequireAuth>{page}</RequireAuth>;

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="companies/:slug" element={<CompanyPage />} />
        <Route path="experiences/:id" element={<ExperiencePage />} />
        <Route path="experiences/:id/edit" element={authed(<EditExperiencePage />)} />
        <Route path="share" element={authed(<SharePage />)} />
        <Route path="saved" element={authed(<SavedPage />)} />
        <Route path="my-posts" element={authed(<MyPostsPage />)} />
        <Route path="admin" element={<RequireAuth adminOnly><AdminPage /></RequireAuth>} />
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
