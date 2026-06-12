import { useState, useEffect } from 'react';
import {
  fetchSalesSummary,
  fetchRevenueByCustomer,
  fetchTopSellingGames,
  fetchUserPerformance,
} from '../lib/api';

export default function Reports() {
  const [summary, setSummary] = useState<any>(null);
  const [revenueReport, setRevenueReport] = useState<any[]>([]);
  const [topGames, setTopGames] = useState<any[]>([]);
  const [performanceReport, setPerformanceReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, revenueRes, topGamesRes, performanceRes] = await Promise.all([
        fetchSalesSummary(),
        fetchRevenueByCustomer(),
        fetchTopSellingGames(20),
        fetchUserPerformance(),
      ]);

      if (summaryRes?.data) setSummary(summaryRes.data);
      if (revenueRes?.data) setRevenueReport(revenueRes.data);
      if (topGamesRes?.data) setTopGames(topGamesRes.data);
      if (performanceRes?.data) setPerformanceReport(performanceRes.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">📈 Reports</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Loading reports...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">📈 Reports</h1>
          <button
            onClick={fetchReports}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Sales Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 card-hover">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Sales</h3>
              <p className="text-3xl font-bold text-blue-600">{summary.totalSales}</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 card-hover">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600">${summary.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 card-hover">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Avg Sale Value</h3>
              <p className="text-3xl font-bold text-purple-600">${summary.averageSaleValue.toFixed(2)}</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 card-hover">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Customers</h3>
              <p className="text-3xl font-bold text-orange-600">{summary.totalCustomers}</p>
            </div>
          </div>
        )}

        {/* Top Selling Games Report */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-6 card-hover">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Top Selling Games</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Game</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Platform</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Qty Sold</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Revenue</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {topGames && topGames.length > 0 ? (
                  topGames.map((game, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{game.gameName}</td>
                      <td className="px-4 py-3 text-gray-600">{game.platform}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{game.quantitySold}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">
                        ${game.totalRevenue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        ${game.averagePricePerUnit.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No sales data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue by Customer Report */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-6 card-hover">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">💰 Revenue by Customer</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-green-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Customer</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Sales</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Total Revenue</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Avg Sale</th>
                </tr>
              </thead>
              <tbody>
                {revenueReport && revenueReport.length > 0 ? (
                  revenueReport.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{row.customerName}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{row.saleCount}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">
                        ${row.totalRevenue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        ${row.averageSaleValue.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No customer data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Performance Report */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 card-hover">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">👤 Sales Staff Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-purple-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Staff Member</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Sales</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Games Sold</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Total Revenue</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Avg Sale</th>
                </tr>
              </thead>
              <tbody>
                {performanceReport && performanceReport.length > 0 ? (
                  performanceReport.map((user, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{user.userName}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{user.saleCount}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{user.gamesSold}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">
                        ${user.totalRevenue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        ${user.averageSaleValue.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No performance data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
