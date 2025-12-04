export default function Dashboard() {
  return (
    <div className="min-h-screen gradient-bg p-4 md:p-6 fade-in">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 card-hover">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🏢 Accounts</h2>
            <p className="text-gray-600">Manage your customer accounts and relationships.</p>
            <a href="/accounts" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200">View Accounts</a>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 card-hover">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">💼 Deals</h2>
            <p className="text-gray-600">Track your sales deals and opportunities.</p>
            <a href="/deals" className="mt-4 inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200">View Deals</a>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 card-hover md:col-span-2 lg:col-span-1">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">📈 Analytics</h2>
            <p className="text-gray-600">Coming soon: Insights and reports.</p>
          </div>
        </div>
      </div>
    </div>
  );
}