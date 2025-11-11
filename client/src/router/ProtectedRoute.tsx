import { Navigate, Outlet } from "react-router";
import { isLoggedIn } from "../lib/storage";

export default function ProtectedRoute() {
    if (!isLoggedIn()) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
}