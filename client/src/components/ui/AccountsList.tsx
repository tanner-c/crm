import { useEffect, useState } from "react";
import { getCurrentUser } from "../../lib/storage";
import { callAPIWithAuth } from "../../lib/api";

export default function AccountsList() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
      {loading ? (<p>Loading...</p>) : message ? (<p>{message}</p>) : accounts.length === 0 ? (
      <p>No accounts found.</p>
      ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
          <th className="text-left px-4 py-2 border-b">Name</th>
          <th className="text-left px-4 py-2 border-b">Website</th>
          <th className="text-left px-4 py-2 border-b">Industry</th>
          <th className="text-left px-4 py-2 border-b">Created At</th>
          <th className="text-left px-4 py-2 border-b">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account: any) => (
          <tr key={account.id} className="hover:bg-gray-50">
            <td className="px-4 py-2 border-b">
              {account.name || "N/A"}
            </td>
            <td className="px-4 py-2 border-b">
            {account.website ? (
              <a
              className="text-blue-600 hover:underline"
              href={account.website}
              target="_blank"
              rel="noopener noreferrer"
              >
              {account.website}
              </a>
            ) : (
              "N/A"
            )}
            </td>
            <td className="px-4 py-2 border-b">{account.industry || "N/A"}</td>
            <td className="px-4 py-2 border-b">
              {account.createdAt
                ? new Date(account.createdAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </td>
            <td className="px-4 py-2 border-b">
              {account.updatedAt
                ? new Date(account.updatedAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </td>
          </tr>
          ))}
        </tbody>
        </table>
      </div>
      )}
    </div>
  );
};