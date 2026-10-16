import { Navigate, useLocation } from "react-router";
import { useUser } from "../../hooks/useAuth";
import { Loading } from "./States";

// Wrap a page with this to make it login-only. adminOnly for the admin panel.
export default function RequireAuth({ children, adminOnly = false }) {
  const { user, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
