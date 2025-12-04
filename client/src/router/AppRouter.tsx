import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import { Navbar } from "../components/ui/Navbar";
import Accounts from "../pages/Accounts";
import Deals from "../pages/Deals";
import RedirectLoggedIn from "./RedirectLoggedIn";

export default function AppRouter() {
  ''
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route element={<RedirectLoggedIn />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/deals" element={<Deals />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}