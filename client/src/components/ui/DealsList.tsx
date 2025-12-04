import { useEffect, useState } from "react";
import { callAPIWithAuth } from "../../lib/api";
import { getCurrentUser } from "../../lib/storage";
import { toTitleCase } from "../../lib/misc";
import ItemTable from "./ItemTable";

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

  const renderDealRow = (deal: any) => (
    <tr key={deal.id} className="hover:bg-gray-50 transition-colors duration-200">
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {deal.name || "N/A"}
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {deal.account ? (
          deal.account.website ? (
            <a
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
              href={deal.account.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {deal.account.name}
            </a>
          ) : (
            deal.account.name
          )
        ) : (
          "N/A"
        )}
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {deal.amount ? `$${deal.amount.toFixed(2)}` : "N/A"}
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {deal.stage ? toTitleCase(deal.stage) : "N/A"}
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
  );

  return (
    <div className="p-4 md:p-6">
      {message && (
        <div className="mb-4 p-3 md:p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {message}
        </div>
      )}
      <ItemTable
        items={deals}
        headers={["Name", "Account", "Amount", "Stage", "Close Date", "Created Date", "Last Updated"]}
        renderRow={renderDealRow}
        loading={loading}
        emptyMessage="No deals found."
      />
    </div>
  );
}