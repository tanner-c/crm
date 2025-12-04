import { Link } from "react-router";
import ItemTable from "./ItemTable";

interface AccountsListProps {
  accounts: any[];
  loading: boolean;
  message: string;
}

export default function AccountsList({ accounts, loading, message }: AccountsListProps) {

  const renderAccountRow = (account: any) => (
    <tr key={account.id} className="hover:bg-gray-50 transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        <Link to={`/accounts/${account.id}`} className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200">
          {account.name || "N/A"}
        </Link>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {account.website ? (
          <a
            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
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
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {account.industry || "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
  );

  return (
    <div className="p-6">
      {message && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {message}
        </div>
      )}
      <ItemTable
        items={accounts}
        headers={["Name", "Website", "Industry", "Created At", "Last Updated"]}
        renderRow={renderAccountRow}
        loading={loading}
        emptyMessage="No accounts found."
      />
    </div>
  );
}