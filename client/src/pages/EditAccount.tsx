/**
 * This page displays an account's properties for editing, as well as list all of the contacts associated with the account.
 */

import { useEffect, useState } from "react"
import { useParams } from "react-router";
import { callAPIWithAuth } from "../lib/api";
import { toTitleCase } from "../lib/misc";
import AccountForm from "../components/ui/AccountForm";
import ContactManager from "../components/ui/ContactManager";

export default function EditAccount() {
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [formData, setFormData] = useState({ name: '', website: '', industry: '', ownerId: '' });
  const [users, setUsers] = useState<any[]>([]);

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [accountRes, usersRes] = await Promise.all([
          callAPIWithAuth(`accounts/${id}`),
          callAPIWithAuth('users')
        ]);

        if (!accountRes.ok) {
          setMessage("Failed to fetch account.");
          console.error(accountRes.statusText);
          setLoading(false);
          return;
        }

        const accountData = await accountRes.json();
        setAccount(accountData);
        setFormData({
          name: accountData.name,
          website: accountData.website || '',
          industry: accountData.industry || '',
          ownerId: accountData.ownerId || ''
        });

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        } else {
          console.warn("Failed to fetch users for dropdown");
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setMessage("Failed to fetch data.");
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await callAPIWithAuth(`accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Failed to update account');
      }

      const updatedAccount = await res.json();
      setAccount(updatedAccount);
      setMessage("Account updated successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update account.");
    }
    setSaving(false);
  };

  const refetchAccount = async () => {
    const accountRes = await callAPIWithAuth(`accounts/${id}`);
    if (accountRes.ok) {
      const data = await accountRes.json();
      setAccount(data);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-4 md:p-6 fade-in">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 md:p-8 card-hover">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">✏️ Edit Account</h1>
        <AccountForm
          formData={formData}
          setFormData={setFormData}
          users={users}
          onSubmit={handleSubmit}
          saving={saving}
          message={message}
        />
        <ContactManager
          accountId={id}
          contacts={account.contacts}
          onUpdate={refetchAccount}
        />
        <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800">💼 Associated Deals</h2>
        {account.deals.length === 0 ? (
          <p className="text-gray-500">No deals associated with this account.</p>
        ) : (
          <ul className="space-y-2">
            {account.deals.map((deal: any) => (
              <li key={deal.id} className="border border-gray-200 rounded p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <p className="font-medium">{deal.name}</p>
                <p className="text-sm text-gray-600">Amount: {deal.amount ? `$${deal.amount.toFixed(2)}` : 'N/A'}</p>
                <p className="text-sm text-gray-600">Stage: {deal.stage ? toTitleCase(deal.stage) : 'N/A'}</p>
                <p className="text-sm text-gray-600">Close Date: {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : 'N/A'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
