import { Outlet } from "react-router-dom";

// Auth bypassed for UI preview — restore token check when backend is ready
export default function ProtectedRoute() {
  return <Outlet />;
}
