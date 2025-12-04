/**
 * This is a generic item table component. It allows for a render prop to customize the rendering of the items.
 * It allows you to pass a list of table headers, and a render function for the table rows.
 * You can also pass a loading state and an optional empty state message.
 */

import React from "react";

interface ItemTableProps<T> {
  items: T[];
  headers: string[];
  renderRow: (item: T) => React.ReactNode;
  loading: boolean;
  emptyMessage?: string;
}

export default function ItemTable<T>({
  items,
  headers,
  renderRow,
  loading,
  emptyMessage = "No items found.",
}: ItemTableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {renderRow(item)}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}