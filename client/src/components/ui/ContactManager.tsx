import { useState } from "react";
import { callAPIWithAuth } from "../../lib/api";

interface ContactManagerProps {
  accountId: string | undefined;
  contacts: any[];
  onUpdate: () => void;
}

export default function ContactManager({ accountId, contacts, onUpdate }: ContactManagerProps) {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newContact, setNewContact] = useState({ firstName: '', lastName: '', email: '', phone: '', title: '' });
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editContact, setEditContact] = useState({ firstName: '', lastName: '', email: '', phone: '', title: '' });
  const [message, setMessage] = useState<string>("");

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await callAPIWithAuth(`accounts/${accountId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact)
      });

      if (!res.ok) {
        throw new Error('Failed to add contact');
      }

      setShowAddForm(false);
      setNewContact({ firstName: '', lastName: '', email: '', phone: '', title: '' });
      onUpdate();
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
      onUpdate();
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

      onUpdate();
      setMessage("Contact deleted successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete contact.");
    }
  };

  return (
    <>
      <h2 className="text-xl font-bold mt-8 mb-4">Associated Contacts</h2>
      {message && (
        <div className={`mb-4 p-3 md:p-4 rounded ${message.includes('successfully') ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
          {message}
        </div>
      )}
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
      {contacts.length === 0 ? (
        <p className="text-gray-500">No contacts associated with this account.</p>
      ) : (
        <ul className="space-y-2">
          {contacts.map((contact: any) => (
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
    </>
  );
}