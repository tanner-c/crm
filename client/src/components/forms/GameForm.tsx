import { useState } from 'react';
import type { Game, GamePlatform } from '../../types/index';

interface GameFormProps {
  game?: Game;
  onSubmit: (data: {
    name: string;
    platform: GamePlatform;
    genre?: string;
    description?: string;
    price: number;
    stockLevel: number;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function GameForm({ game, onSubmit, onCancel, loading }: GameFormProps) {
  const [formData, setFormData] = useState({
    name: game?.name || '',
    platform: (game?.platform || 'PC') as GamePlatform,
    genre: game?.genre || '',
    description: game?.description || '',
    price: game?.price || 29.99,
    stockLevel: game?.stockLevel || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : name === 'stockLevel' ? parseInt(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Game name is required';
    if (formData.price < 0) newErrors.price = 'Price must be non-negative';
    if (formData.stockLevel < 0) newErrors.stockLevel = 'Stock level must be non-negative';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      platform: formData.platform,
      genre: formData.genre || undefined,
      description: formData.description || undefined,
      price: formData.price,
      stockLevel: formData.stockLevel,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 my-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {game ? 'Edit Game' : 'Add New Game'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Game Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Enter game name"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Platform *</label>
            <select
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PC">PC</option>
              <option value="PLAYSTATION">PlayStation</option>
              <option value="XBOX">Xbox</option>
              <option value="NINTENDO">Nintendo</option>
              <option value="MOBILE">Mobile</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Genre</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., RPG, Action, Adventure"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter game description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Level *</label>
              <input
                type="number"
                name="stockLevel"
                value={formData.stockLevel}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.stockLevel ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.stockLevel && <p className="text-red-600 text-sm mt-1">{errors.stockLevel}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
