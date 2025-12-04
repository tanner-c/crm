import AccountsList from "../components/ui/AccountsList";

export default function AccountsTable() {
  return (
    <div>
      <div className="w-3/4 mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Your Accounts</h1>
        <AccountsList />
      </div>
    </div>
  );
}