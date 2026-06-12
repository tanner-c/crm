import { useEffect, useState } from 'react';
import { fetchSales, createSale, updateSale, deleteSale } from '../lib/api';
import ItemTable from '../components/ui/ItemTable';
import SaleForm from '../components/forms/SaleForm';
import type { Sale, SaleStatus } from '../types/index';

export default function Sales() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [message, setMessage] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [selectedSale, setSelectedSale] = useState<Sale | undefined>();
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        loadSales();
    }, [page]);

    const loadSales = async () => {
        try {
            setLoading(true);
            const res = await fetchSales(page, 10);
            if (res.data) {
                setSales(res.data);
                setTotal(res.total);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setMessage('Failed to fetch sales.');
            setLoading(false);
        }
    };

    const handleEdit = (sale: Sale) => {
        setSelectedSale(sale);
        setShowForm(true);
    };

    const handleDelete = async (saleId: string) => {
        if (!confirm('Are you sure you want to delete this sale?')) return;
        try {
            await deleteSale(saleId);
            setMessage('Sale deleted successfully!');
            loadSales();
        } catch (err) {
            console.error(err);
            setMessage('Failed to delete sale.');
        }
    };

    const handleFormSubmit = async (data: {
        customerId: string;
        lineItems: { gameId: string; quantity: number }[];
        status?: SaleStatus;
    }) => {
        try {
            setSubmitting(true);
            if (selectedSale) {
                await updateSale(selectedSale.id, data);
                setMessage('Sale updated successfully!');
            } else {
                await createSale(data);
                setMessage('Sale created successfully!');
            }
            setShowForm(false);
            setSelectedSale(undefined);
            loadSales();
        } catch (err) {
            console.error(err);
            setMessage('Failed to save sale.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setSelectedSale(undefined);
    };

    const renderRow = (sale: Sale) => (
        <tr className="hover:bg-gray-50">
            <td className="px-4 md:px-6 py-4 text-sm font-mono text-gray-600">{sale.id.slice(0, 8)}</td>
            <td className="px-4 md:px-6 py-4 text-sm font-semibold text-green-600">${sale.totalAmount.toFixed(2)}</td>
            <td className="px-4 md:px-6 py-4 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sale.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        sale.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                    }`}>
                    {sale.status}
                </span>
            </td>
            <td className="px-4 md:px-6 py-4 text-sm text-gray-600">{new Date(sale.saleDate).toLocaleDateString()}</td>
            <td className="px-4 md:px-6 py-4 text-sm flex gap-2">
                <button
                    onClick={() => handleEdit(sale)}
                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                >
                    Edit
                </button>
                <button
                    onClick={() => handleDelete(sale.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                >
                    Delete
                </button>
            </td>
        </tr>
    );

    return (
        <div className="min-h-screen gradient-bg p-4 md:p-6 fade-in">
            <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 md:p-8 card-hover">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">💰 Sales</h1>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        + New Sale
                    </button>
                </div>

                {message && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {message}
                    </div>
                )}

                <ItemTable<Sale>
                    items={sales}
                    headers={['Sale ID', 'Amount', 'Status', 'Date', 'Actions']}
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
                    <SaleForm
                        sale={selectedSale}
                        onSubmit={handleFormSubmit}
                        onCancel={handleFormCancel}
                        loading={submitting}
                    />
                )}
            </div>
        </div>
    );
}
