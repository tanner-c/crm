import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/storage";
import { callAPIWithAuth } from "../lib/api";
import AccountsList from "../components/ui/AccountsList";

export default function AccountsTable() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");

  const user = getCurrentUser();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const res = await callAPIWithAuth(`accounts/user/${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch accounts");
        const data = await res.json();
        setAccounts(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setMessage("Failed to fetch accounts.");
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [user.id]);

  return (
    <div className="min-h-screen gradient-bg p-4 md:p-6 fade-in">
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 md:p-8 card-hover">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🏢 Your Accounts</h1>
        <AccountsList accounts={accounts} loading={loading} message={message} />
      </div>
    </div>
  );
}