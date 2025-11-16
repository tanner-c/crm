import { Navigate, Outlet } from "react-router";
import { isLoggedIn } from "../lib/storage";

export default function RedirectLoggedIn() {
    if (isLoggedIn()) {
        return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
}