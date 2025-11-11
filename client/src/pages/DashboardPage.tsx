import AccountsList from "../components/ui/AccountsList";
import LogoutButton from "../components/ui/LogoutButton";
import { isLoggedIn } from "../lib/storage";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function DashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div>
      {/* Logout Button - This will be added to the navbar later */}
      <LogoutButton />

      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <AccountsList />
      </div>
    </div>
  );
}