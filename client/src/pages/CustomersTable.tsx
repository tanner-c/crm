import { useEffect, useState } from 'react';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../lib/api';
import ItemTable from '../components/ui/ItemTable';
import CustomerForm from '../components/forms/CustomerForm';
import type { Customer, LoyaltyTier } from '../types/index';

export default function CustomersTable() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await deleteCustomer(customerId);
      setMessage('Customer deleted successfully!');
      loadCustomers();
    } catch (err) {
      console.error(err);
      setMessage('Failed to delete customer.');
    }
  };

  const handleFormSubmit = async (data: { name: string; email?: string; phone?: string; loyaltyTier?: LoyaltyTier }) => {
    try {
      setSubmitting(true);
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, data);
        setMessage('Customer updated successfully!');
      } else {
        await createCustomer(data);
        setMessage('Customer created successfully!');
      }
      setShowForm(false);
      setSelectedCustomer(undefined);
      loadCustomers();
    } catch (err) {
      console.error(err);
      setMessage('Failed to save customer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedCustomer(undefined);
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetchCustomers(page, 10);
      if (res.data) {
        setCustomers(res.data);
        setTotal(res.total);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setMessage('Failed to fetch customers.');
      setLoading(false);
    }
  };

  const renderRow = (customer: Customer) => (
    <tr className="hover:bg-gray-50">
      <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{customer.name}</td>
      <td className="px-4 md:px-6 py-4 text-sm text-gray-600">{customer.email || '-'}</td>
      <td className="px-4 md:px-6 py-4 text-sm text-gray-600">{customer.phone || '-'}</td>
      <td className="px-4 md:px-6 py-4 text-sm text-gray-600">{customer.loyaltyTier || 'STANDARD'}</td>
      <td className="px-4 md:px-6 py-4 text-sm font-semibold text-green-600">${customer.totalSpent.toFixed(2)}</td>
      <td className="px-4 md:px-6 py-4 text-sm flex gap-2">
        <button
          onClick={() => handleEdit(customer)}
          className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(customer.id)}
          className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
        >
          Delete
        </button>
      </td>
    </tr>
  );

  useEffect(() => {
    loadCustomers();
  }, [page]);

  return (
    <div className="min-h-screen gradient-bg p-4 md:p-6 fade-in">
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 md:p-8 card-hover">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">👥 Customers</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add Customer
          </button>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {message}
          </div>
        )}

        <ItemTable<Customer>
          items={customers}
          headers={['Name', 'Email', 'Phone', 'Loyalty Tier', 'Total Spent', 'Actions']}
          renderRow={renderRow}
          loading={loading}
        />

        {!loading && (
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="py-2">
              Page {page} of {Math.ceil(total / 10)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 10 >= total}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {showForm && (
          <CustomerForm
            customer={selectedCustomer}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={submitting}
          />
        )}
      </div>
    </div>
  );
}
