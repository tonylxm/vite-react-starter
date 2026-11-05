import { Navigate, Outlet, useLocation } from "react-router";
import { useSession } from "@/lib/session";

// Wraps every private route. This only hides UI: RLS and the API's JWT check are what protect data.
export function RequireAuth() {
  const session = useSession();
  const location = useLocation();

  if (session === undefined) return null;
  if (session === null) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
