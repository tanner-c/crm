import { useEffect, useState } from 'react';
import { fetchSalesSummary } from '../lib/api';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await fetchSalesSummary();
        if (res.data) {
          setSummary(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch sales summary:', err);
      }
      setLoading(false);
    };
    loadSummary();
  }, []);

  return (
    <div className="min-h-screen gradient-bg p-4 md:p-6 fade-in">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">🎮 Game Store Dashboard</h1>

        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 card-hover">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Sales</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {summary?.totalSales || 0}
                </p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 card-hover">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-green-600">
                  ${summary?.totalRevenue?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 card-hover">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Avg. Sale Value</h3>
                <p className="text-3xl font-bold text-purple-600">
                  ${summary?.averageSaleValue?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 card-hover">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Customers</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {summary?.totalCustomers || 0}
                </p>
              </div>
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 card-hover">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">👥 Customers</h2>
                <p className="text-gray-600">Manage customer profiles and loyalty information.</p>
                <a href="/customers" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200">View Customers</a>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 card-hover">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎮 Inventory</h2>
                <p className="text-gray-600">Browse games, manage stock, and search IGDB.</p>
                <a href="/inventory" className="mt-4 inline-block bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-200">View Inventory</a>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 card-hover">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">💰 Sales</h2>
                <p className="text-gray-600">Record and track customer game purchases.</p>
                <a href="/sales" className="mt-4 inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200">View Sales</a>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 card-hover md:col-span-2 lg:col-span-1">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">📈 Reports</h2>
                <p className="text-gray-600">View sales analytics and performance metrics.</p>
                <a href="/reports" className="mt-4 inline-block bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200">View Reports</a>
              </div>
            </div>

            {/* Games Sold */}
            {summary?.totalGamiesSold && (
              <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 card-hover">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">🎯 Total Games Sold</h2>
                <p className="text-4xl font-bold text-indigo-600">{summary.totalGamiesSold}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}