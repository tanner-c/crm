import DealsList from "../components/ui/DealsList";

export default function Deals() {
  return (
    <div className="min-h-screen gradient-bg p-4 md:p-6 fade-in">
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 md:p-8 card-hover">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">💼 Your Deals</h1>
        <DealsList />
      </div>
    </div>
  );
}