import { useEffect, useState } from 'react';
import { fetchGames, searchGames, addGameFromSearch, createGame, updateGame, deleteGame } from '../lib/api';
import ItemTable from '../components/ui/ItemTable';
import GameForm from '../components/forms/GameForm';
import type { Game, GamePlatform, GameSearchResult } from '../types/index';

export default function Inventory() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'browse' | 'search' | 'low-stock'>('browse');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<Game | undefined>();
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<GameSearchResult[]>([]);
  const [searching, setSearching] = useState<boolean>(false);

  // Filter state
  const [platformFilter, setPlatformFilter] = useState<string>('');
  const [genreFilter, setGenreFilter] = useState<string>('');

  useEffect(() => {
    if (activeTab === 'browse' || activeTab === 'low-stock') {
      loadGames();
    }
  }, [page, activeTab, platformFilter, genreFilter]);

  const loadGames = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (platformFilter) filters.platform = platformFilter;
      if (genreFilter) filters.genre = genreFilter;

      const res = await fetchGames(page, 10, filters);
      if (res.data) {
        setGames(res.data);
        setTotal(res.total);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setMessage('Failed to fetch games.');
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      setMessage('Search query must be at least 2 characters.');
      return;
    }

    try {
      setSearching(true);
      const res = await searchGames(searchQuery);
      if (res.data) {
        setSearchResults(res.data);
        setMessage('');
      }
      setSearching(false);
    } catch (err) {
      console.error(err);
      setMessage('Failed to search games.');
      setSearching(false);
    }
  };

  const handleAddFromSearch = async (game: GameSearchResult) => {
    try {
      const gameData = {
        name: game.name,
        platform: (game.platforms?.[0] || 'PC') as GamePlatform,
        genre: game.genres?.[0],
        description: game.description,
        coverArtUrl: game.coverUrl,
        releaseDate: game.releaseDate,
        price: 29.99,
        stockLevel: 0,
        mobyGameId: game.mobyGameId,
      };

      await addGameFromSearch(gameData);
      setMessage(`Added ${game.name} to inventory!`);
      setSearchResults(searchResults.filter((g) => g.name !== game.name));
    } catch (err) {
      console.error(err);
      setMessage(`Failed to add ${game.name}.`);
    }
  };

  const handleEdit = (game: Game) => {
    setSelectedGame(game);
    setShowForm(true);
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;
    try {
      await deleteGame(gameId);
      setMessage('Game deleted successfully!');
      loadGames();
    } catch (err) {
      console.error(err);
      setMessage('Failed to delete game.');
    }
  };

  const handleFormSubmit = async (data: {
    name: string;
    platform: GamePlatform;
    genre?: string;
    description?: string;
    price: number;
    stockLevel: number;
  }) => {
    try {
      setSubmitting(true);
      if (selectedGame) {
        await updateGame(selectedGame.id, data);
        setMessage('Game updated successfully!');
      } else {
        await createGame(data);
        setMessage('Game created successfully!');
      }
      setShowForm(false);
      setSelectedGame(undefined);
      loadGames();
    } catch (err) {
      console.error(err);
      setMessage('Failed to save game.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedGame(undefined);
  };

  const renderGameRow = (game: Game) => (
    <tr className="hover:bg-gray-50">
      <td className="px-4 md:px-6 py-4 text-sm font-semibold text-gray-800">
        <div className="flex items-center gap-3">
          {game.coverArtUrl ? (
            <img
              src={game.coverArtUrl}
              alt={game.name}
              className="w-10 h-14 object-cover rounded shadow-xs shrink-0"
            />
          ) : (
            <div className="w-10 h-14 bg-gray-100 border border-gray-200 flex items-center justify-center rounded text-lg select-none shrink-0">
              🎮
            </div>
          )}
          <span>{game.name}</span>
        </div>
      </td>
      <td className="px-4 md:px-6 py-4 text-sm text-gray-600">{game.platform}</td>
      <td className="px-4 md:px-6 py-4 text-sm text-gray-600">{game.genre || '-'}</td>
      <td className="px-4 md:px-6 py-4 text-sm font-semibold text-green-600">${game.price.toFixed(2)}</td>
      <td className="px-4 md:px-6 py-4 text-sm">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${game.stockLevel > 5 ? 'bg-green-100 text-green-800' :
            game.stockLevel > 0 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
          }`}>
          {game.stockLevel} in stock
        </span>
      </td>
      <td className="px-4 md:px-6 py-4 text-sm flex gap-2">
        <button
          onClick={() => handleEdit(game)}
          className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(game.id)}
          className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
        >
          Delete
        </button>
      </td>
    </tr>
  );


  return (
    <div className="min-h-screen gradient-bg p-4 md:p-6 fade-in">
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 md:p-8 card-hover">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🎮 Game Inventory</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add Game
          </button>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded-lg">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b">
          <button
            onClick={() => { setActiveTab('browse'); setPage(1); }}
            className={`px-4 py-2 font-semibold border-b-2 ${activeTab === 'browse'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            Browse
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 font-semibold border-b-2 ${activeTab === 'search'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            Search MobyGames
          </button>
          <button
            onClick={() => { setActiveTab('low-stock'); setPage(1); }}
            className={`px-4 py-2 font-semibold border-b-2 ${activeTab === 'low-stock'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            Low Stock
          </button>
        </div>

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={platformFilter}
                onChange={(e) => { setPlatformFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Platforms</option>
                <option value="PC">PC</option>
                <option value="PLAYSTATION">PlayStation</option>
                <option value="XBOX">Xbox</option>
                <option value="NINTENDO">Nintendo</option>
                <option value="MOBILE">Mobile</option>
              </select>

              <input
                type="text"
                placeholder="Filter by genre..."
                value={genreFilter}
                onChange={(e) => { setGenreFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <ItemTable<Game>
              items={games}
              headers={['Game', 'Platform', 'Genre', 'Price', 'Stock', 'Actions']}
              renderRow={renderGameRow}
              loading={loading}
            />

            {!loading && (
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="py-2">
                  Page {page} of {Math.ceil(total / 10)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 10 >= total}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div>
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Search for a game..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((game) => (
                  <div key={`${game.mobyGameId}-${game.name}`} className="border rounded-lg p-4 flex gap-4">
                    {game.coverUrl ? (
                      <img
                        src={game.coverUrl}
                        alt={game.name}
                        className="w-16 h-20 object-cover rounded shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-gray-100 border border-gray-200 flex items-center justify-center rounded text-xl select-none shrink-0">
                        🎮
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-base mb-1 leading-tight">{game.name}</h3>
                        <p className="text-xs text-gray-500 mb-1">
                          {game.platforms?.join(', ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {game.genres?.join(', ')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddFromSearch(game)}
                        className="mt-3 w-full px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                      >
                        Add to Inventory
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Low Stock Tab */}
        {activeTab === 'low-stock' && (
          <div>
            <ItemTable<Game>
              items={games.filter((g) => g.stockLevel < 5)}
              headers={['Game', 'Platform', 'Genre', 'Price', 'Stock']}
              renderRow={renderGameRow}
              loading={loading}
              emptyMessage="No games with low stock!"
            />
          </div>
        )}
      </div>

      {showForm && (
        <GameForm
          game={selectedGame}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={submitting}
        />
      )}
    </div>
  );
}
