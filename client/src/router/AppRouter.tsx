import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import LoginPage from "../pages/LoginPage";

export default function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}