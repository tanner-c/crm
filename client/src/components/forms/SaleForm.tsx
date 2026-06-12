import { useState, useEffect } from 'react';
import { fetchCustomers, fetchGames } from '../../lib/api';
import type { Sale, Customer, Game, SaleStatus } from '../../types/index';

interface SaleFormProps {
  sale?: Sale;
  onSubmit: (data: {
    customerId: string;
    lineItems: { gameId: string; quantity: number }[];
    status?: SaleStatus;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function SaleForm({ sale, onSubmit, onCancel, loading }: SaleFormProps) {
  const [formData, setFormData] = useState({
    customerId: sale?.customerId || '',
    status: (sale?.status || 'COMPLETED') as SaleStatus,
    lineItems: sale?.lineItems?.map((li) => ({ gameId: li.gameId, quantity: li.quantity })) || [],
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      const [customersRes, gamesRes] = await Promise.all([
        fetchCustomers(1, 100),
        fetchGames(1, 100),
      ]);
      if (customersRes?.data) setCustomers(customersRes.data);
      if (gamesRes?.data) setGames(gamesRes.data);
    };
    loadData();
  }, []);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      customerId: e.target.value,
    }));
    if (errors.customerId) {
      setErrors((prev) => ({ ...prev, customerId: '' }));
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.value as SaleStatus,
    }));
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { gameId: '', quantity: 1 }],
    }));
  };

  const removeLineItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  const updateLineItem = (index: number, field: 'gameId' | 'quantity', value: string | number) => {
    const newLineItems = [...formData.lineItems];
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: field === 'quantity' ? parseInt(value as string) : value,
    };
    setFormData((prev) => ({
      ...prev,
      lineItems: newLineItems,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (formData.lineItems.length === 0) newErrors.lineItems = 'At least one game must be added';
    for (let i = 0; i < formData.lineItems.length; i++) {
      if (!formData.lineItems[i].gameId) newErrors[`game_${i}`] = 'Game is required';
      if (formData.lineItems[i].quantity <= 0) newErrors[`qty_${i}`] = 'Quantity must be at least 1';
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      customerId: formData.customerId,
      lineItems: formData.lineItems,
      status: formData.status,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 my-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {sale ? 'Edit Sale' : 'Create New Sale'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Customer *</label>
              <select
                value={formData.customerId}
                onChange={handleCustomerChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.customerId ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {errors.customerId && <p className="text-red-600 text-sm mt-1">{errors.customerId}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">Items *</label>
              <button
                type="button"
                onClick={addLineItem}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                + Add Item
              </button>
            </div>
            {errors.lineItems && <p className="text-red-600 text-sm mb-2">{errors.lineItems}</p>}

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {formData.lineItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={item.gameId}
                    onChange={(e) => updateLineItem(index, 'gameId', e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`game_${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select game</option>
                    {games.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.name} ({game.platform})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                    min="1"
                    className={`w-20 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`qty_${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Qty"
                  />

                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Sale'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
