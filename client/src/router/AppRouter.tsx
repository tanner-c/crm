import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import { Navbar } from "../components/ui/Navbar";
import CustomersTable from "../pages/CustomersTable";
import Sales from "../pages/Sales";
import Inventory from "../pages/Inventory";
import Reports from "../pages/Reports";
import RedirectLoggedIn from "./RedirectLoggedIn";

export default function AppRouter() {
  ''
  return (
    <Router>
      <Navbar />
      <div className="pt-16">
        <Routes>
          <Route element={<RedirectLoggedIn />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<CustomersTable />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}