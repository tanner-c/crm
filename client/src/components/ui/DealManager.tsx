import { useState } from "react";
import { callAPIWithAuth } from "../../lib/api";
import type { Deal, User, DealManagerProps, DealFormData, Stage } from "../../types";

/**
 * DealManager Component
 *
 * Provides full CRUD functionality for managing deals associated with an account.
 * Features include:
 * - Adding new deals with stage tracking
 * - Editing existing deals inline
 * - Deleting deals with confirmation
 * - Owner assignment from user list
 * - Form validation and error handling
 * - Responsive design with modern UI
 */
export default function DealManager({ accountId, deals, users, onUpdate }: DealManagerProps) {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newDeal, setNewDeal] = useState<DealFormData>({
    name: '',
    amount: '',
    stage: 'NEW',
    closeDate: '',
    ownerId: ''
  });
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [editDeal, setEditDeal] = useState<DealFormData>({
    name: '',
    amount: '',
    stage: 'NEW',
    closeDate: '',
    ownerId: ''
  });
  const [message, setMessage] = useState<string>("");

  const stages: Stage[] = ['NEW', 'PROSPECTING', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dealData = {
        ...newDeal,
        amount: parseFloat(newDeal.amount),
        accountId: accountId,
        closeDate: newDeal.closeDate || null,
        ownerId: newDeal.ownerId || null
      };

      const res = await callAPIWithAuth('deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData)
      });

      if (!res.ok) {
        throw new Error('Failed to add deal');
      }

      setShowAddForm(false);
      setNewDeal({ name: '', amount: '', stage: 'NEW', closeDate: '', ownerId: '' });
      onUpdate();
      setMessage("Deal added successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to add deal.");
    }
  };

  /**
   * Initialize editing mode for a deal
   * @param deal - The deal object to edit
   */
  const handleEditDeal = (deal: Deal) => {
    setEditingDealId(deal.id);
    setEditDeal({
      name: deal.name,
      amount: deal.amount.toString(),
      stage: deal.stage,
      closeDate: deal.closeDate ? new Date(deal.closeDate).toISOString().split('T')[0] : '',
      ownerId: deal.ownerId || ''
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dealData = {
        ...editDeal,
        amount: parseFloat(editDeal.amount),
        closeDate: editDeal.closeDate || null,
        ownerId: editDeal.ownerId || null
      };

      const res = await callAPIWithAuth(`deals/${editingDealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData)
      });

      if (!res.ok) {
        throw new Error('Failed to update deal');
      }

      setEditingDealId(null);
      onUpdate();
      setMessage("Deal updated successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update deal.");
    }
  };

  const handleCancelEdit = () => {
    setEditingDealId(null);
    setEditDeal({ name: '', amount: '', stage: 'NEW', closeDate: '', ownerId: '' });
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) return;
    try {
      const res = await callAPIWithAuth(`deals/${dealId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete deal');
      }

      onUpdate();
      setMessage("Deal deleted successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete deal.");
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mt-8 mb-6 text-gray-800">💼 Associated Deals</h2>
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'} fade-in`}>
          {message}
        </div>
      )}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="mb-6 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-105"
      >
        {showAddForm ? '❌ Cancel Add' : '➕ Add Deal'}
      </button>
      {showAddForm && (
        <form onSubmit={handleAddDeal} className="mb-6 p-6 bg-white shadow-lg rounded-lg fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Deal Name"
              value={newDeal.name}
              onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={newDeal.amount}
              onChange={(e) => setNewDeal({ ...newDeal, amount: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              required
            />
            <select
              value={newDeal.stage}
              onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              required
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
            <input
              type="date"
              placeholder="Close Date"
              value={newDeal.closeDate}
              onChange={(e) => setNewDeal({ ...newDeal, closeDate: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <select
              value={newDeal.ownerId}
              onChange={(e) => setNewDeal({ ...newDeal, ownerId: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 md:col-span-2"
            >
              <option value="">Select Owner (Optional)</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105">
            ➕ Add Deal
          </button>
        </form>
      )}
      {deals.length === 0 ? (
        <p className="text-gray-500">No deals associated with this account.</p>
      ) : (
        <ul className="space-y-4">
          {deals.map((deal: any) => (
            <li key={deal.id} className="card-hover border border-gray-200 rounded-lg p-6 bg-white shadow-md fade-in">
              {editingDealId === deal.id ? (
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Deal Name"
                      value={editDeal.name}
                      onChange={(e) => setEditDeal({ ...editDeal, name: e.target.value })}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={editDeal.amount}
                      onChange={(e) => setEditDeal({ ...editDeal, amount: e.target.value })}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      required
                    />
                    <select
                      value={editDeal.stage}
                      onChange={(e) => setEditDeal({ ...editDeal, stage: e.target.value })}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      required
                    >
                      {stages.map(stage => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      placeholder="Close Date"
                      value={editDeal.closeDate}
                      onChange={(e) => setEditDeal({ ...editDeal, closeDate: e.target.value })}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    />
                    <select
                      value={editDeal.ownerId}
                      onChange={(e) => setEditDeal({ ...editDeal, ownerId: e.target.value })}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 md:col-span-2"
                    >
                      <option value="">Select Owner (Optional)</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105">
                      💾 Save
                    </button>
                    <button type="button" onClick={handleCancelEdit} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 transform hover:scale-105">
                      ❌ Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="font-semibold text-lg text-gray-800">{deal.name}</p>
                  <p className="text-sm text-gray-600">💰 Amount: {deal.amount ? `$${deal.amount.toFixed(2)}` : 'N/A'}</p>
                  <p className="text-sm text-gray-600">📊 Stage: {deal.stage}</p>
                  <p className="text-sm text-gray-600">📅 Close Date: {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : 'N/A'}</p>
                  <p className="text-sm text-gray-600">👤 Owner: {deal.owner ? deal.owner.name : 'N/A'}</p>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleEditDeal(deal)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200 transform hover:scale-105"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDeal(deal.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-105"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}