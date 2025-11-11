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
      <LogoutButton />
      
      <h1>Dashboard</h1>
      <AccountsList />
    </div>
  );
}