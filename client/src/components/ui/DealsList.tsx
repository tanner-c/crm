import { useEffect, useState } from "react";
import { callAPIWithAuth } from "../../lib/api";
import { getCurrentUser } from "../../lib/storage";
import { toTitleCase } from "../../lib/misc";

export default function DealsList() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const user = getCurrentUser();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const res = await callAPIWithAuth(`deals/user/${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch deals");
        const data = await res.json();
        console.log(data)
        setDeals(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setMessage("Failed to fetch deals.");
        setLoading(false);
      }
    };
    fetchDeals();
  }, [user.id]);

  return (
    <div>
      {loading ? (<p>Loading...</p>) : message ? (<p>{message}</p>) : deals.length === 0 ? (<p>No deals found.</p>) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="text-left px-4 py-2 border-b">Name</th>
                <th className="text-left px-4 py-2 border-b">Account</th>
                <th className="text-left px-4 py-2 border-b">Amount</th>
                <th className="text-left px-4 py-2 border-b">Stage</th>
                <th className="text-left px-4 py-2 border-b">Close Date</th>
                <th className="text-left px-4 py-2 border-b">Created Date</th>
                <th className="text-left px-4 py-2 border-b">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal: any) => (
                <tr key={deal.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">
                    {deal.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {deal.account ?
                      <a
                        href={deal.account.website}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer">
                        {deal.account.name}
                      </a>
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {deal.amount ? `$${deal.amount.toFixed(2)}` : "N/A"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {deal.stage ? toTitleCase(deal.stage) : "N/A"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {deal.closeDate
                      ? new Date(deal.closeDate).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {deal.createdAt
                      ? new Date(deal.createdAt).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {deal.updatedAt
                      ? new Date(deal.updatedAt).toLocaleString(undefined, {
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
}