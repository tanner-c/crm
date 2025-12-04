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
    <div>
      <div className="w-full xl:w-3/4 mx-auto mt-6 md:mt-10 p-4 md:p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Your Accounts</h1>
        <AccountsList accounts={accounts} loading={loading} message={message} />
      </div>
    </div>
  );
}