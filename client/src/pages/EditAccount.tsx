/**
 * This page displays an account's properties for editing, as well as list all of the contacts associated with the account.
 */

import { useEffect, useState } from "react"
import { useParams } from "react-router";
import { callAPIWithAuth } from "../lib/api";
import { toTitleCase } from "../lib/misc";

export default function EditAccount() {
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [formData, setFormData] = useState({ name: '', website: '', industry: '', ownerId: '' });
  const [users, setUsers] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newContact, setNewContact] = useState({ firstName: '', lastName: '', email: '', phone: '', title: '' });
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editContact, setEditContact] = useState({ firstName: '', lastName: '', email: '', phone: '', title: '' });

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

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await callAPIWithAuth(`accounts/${id}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact)
      });

      if (!res.ok) {
        throw new Error('Failed to add contact');
      }

      setShowAddForm(false);
      setNewContact({ firstName: '', lastName: '', email: '', phone: '', title: '' });
      // Refetch account
      const accountRes = await callAPIWithAuth(`accounts/${id}`);
      if (accountRes.ok) {
        const data = await accountRes.json();
        setAccount(data);
      }
      setMessage("Contact added successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to add contact.");
    }
  };

  const handleEditContact = (contact: any) => {
    setEditingContactId(contact.id);
    setEditContact({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email || '',
      phone: contact.phone || '',
      title: contact.title || ''
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await callAPIWithAuth(`contacts/${editingContactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editContact)
      });

      if (!res.ok) {
        throw new Error('Failed to update contact');
      }

      setEditingContactId(null);
      // Refetch account
      const accountRes = await callAPIWithAuth(`accounts/${id}`);
      if (accountRes.ok) {
        const data = await accountRes.json();
        setAccount(data);
      }
      setMessage("Contact updated successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update contact.");
    }
  };

  const handleCancelEdit = () => {
    setEditingContactId(null);
    setEditContact({ firstName: '', lastName: '', email: '', phone: '', title: '' });
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      const res = await callAPIWithAuth(`contacts/${contactId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete contact');
      }

      // Refetch account
      const accountRes = await callAPIWithAuth(`accounts/${id}`);
      if (accountRes.ok) {
        const data = await accountRes.json();
        setAccount(data);
      }
      setMessage("Contact deleted successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete contact.");
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
    <div className="max-w-4xl mx-auto mt-6 md:mt-10 p-4 md:p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Account</h1>
      {message && (
        <div className={`mb-4 p-3 md:p-4 rounded ${message.includes('successfully') ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Industry</label>
          <input
            type="text"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Owner</label>
          <select
            value={formData.ownerId}
            onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Owner</option>
            {users.map((user: any) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
      <h2 className="text-xl font-bold mt-8 mb-4">Associated Contacts</h2>
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {showAddForm ? 'Cancel Add' : 'Add Contact'}
      </button>
      {showAddForm && (
        <form onSubmit={handleAddContact} className="mb-4 p-4 border border-gray-200 rounded bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={newContact.firstName}
              onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
              className="p-2 border border-gray-300 rounded"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={newContact.lastName}
              onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
              className="p-2 border border-gray-300 rounded"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Title"
              value={newContact.title}
              onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
              className="p-2 border border-gray-300 rounded md:col-span-2"
            />
          </div>
          <button type="submit" className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Contact
          </button>
        </form>
      )}
      {account.contacts.length === 0 ? (
        <p className="text-gray-500">No contacts associated with this account.</p>
      ) : (
        <ul className="space-y-2">
          {account.contacts.map((contact: any) => (
            <li key={contact.id} className="border border-gray-200 rounded p-4">
              {editingContactId === contact.id ? (
                <form onSubmit={handleSaveEdit} className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={editContact.firstName}
                      onChange={(e) => setEditContact({ ...editContact, firstName: e.target.value })}
                      className="p-2 border border-gray-300 rounded"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={editContact.lastName}
                      onChange={(e) => setEditContact({ ...editContact, lastName: e.target.value })}
                      className="p-2 border border-gray-300 rounded"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={editContact.email}
                      onChange={(e) => setEditContact({ ...editContact, email: e.target.value })}
                      className="p-2 border border-gray-300 rounded"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={editContact.phone}
                      onChange={(e) => setEditContact({ ...editContact, phone: e.target.value })}
                      className="p-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Title"
                      value={editContact.title}
                      onChange={(e) => setEditContact({ ...editContact, title: e.target.value })}
                      className="p-2 border border-gray-300 rounded md:col-span-2"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Save
                    </button>
                    <button type="button" onClick={handleCancelEdit} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                  <p className="text-sm text-gray-600">Email: {contact.email || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Phone: {contact.phone || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Title: {contact.title || 'N/A'}</p>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleEditContact(contact)}
                      className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <h2 className="text-xl font-bold mt-8 mb-4">Associated Deals</h2>
      {account.deals.length === 0 ? (
        <p className="text-gray-500">No deals associated with this account.</p>
      ) : (
        <ul className="space-y-2">
          {account.deals.map((deal: any) => (
            <li key={deal.id} className="border border-gray-200 rounded p-4">
              <p className="font-medium">{deal.name}</p>
              <p className="text-sm text-gray-600">Amount: {deal.amount ? `$${deal.amount.toFixed(2)}` : 'N/A'}</p>
              <p className="text-sm text-gray-600">Stage: {deal.stage ? toTitleCase(deal.stage) : 'N/A'}</p>
              <p className="text-sm text-gray-600">Close Date: {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : 'N/A'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
