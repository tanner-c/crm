import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";
import { Navbar } from "../components/ui/Navbar";
import AccountsPage from "../pages/AccountsPage";
import DealsPage from "../pages/DealsPage";
import RedirectLoggedIn from "./RedirectLoggedIn";

export default function AppRouter() {''
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route element={<RedirectLoggedIn />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/deals" element={<DealsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}