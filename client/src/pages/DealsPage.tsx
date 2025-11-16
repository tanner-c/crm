import DealsList from "../components/ui/DealsList";

export default function DealsPage() {
  return (
    <div>
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Your Deals</h1>
        <DealsList />
      </div>
    </div>
  );
}