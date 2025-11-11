import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/storage";

export default function AccountsList() {
  const [accounts, setAccounts] = useState([]);

  const user = getCurrentUser();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`/api/accounts/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch accounts");
        const data = await res.json();
        setAccounts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAccounts();
  }, [user.id]);



  return (
    <div>
    <h2>Your Accounts</h2>
      <ul>
        {accounts.map((account: any) => (
          <li key={account.id}>
            {account.name} - {account.website}
          </li>
        ))}
      </ul>
    </div>
  );
};