// services/mobygames.ts
import axios from 'axios';

const MOBYGAMES_API_BASE = 'https://api.mobygames.com/v1';
const API_KEY = process.env.MOBYGAMES_API_KEY || '';

interface GameSearchResult {
  id: number;
  name: string;
  description?: string;
  platforms?: Array<{ name: string }>;
  genres?: Array<{ name: string }>;
  cover?: { image?: string };
  release_date?: string;
  sample_cover?: { image?: string };
}

interface FormattedGame {
  mobyGameId: number;
  name: string;
  description?: string;
  platforms?: string[];
  genres?: string[];
  coverUrl?: string;
  releaseDate?: Date;
}

/**
 * Search for games on MobyGames API
 * @param query Search term (game name)
 * @returns Array of formatted game results
 */
export async function searchGames(query: string): Promise<FormattedGame[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const params = new URLSearchParams({
      title: query.trim(),
      limit: '10',
    });

    if (API_KEY) {
      params.append('api_key', API_KEY);
    }

    const response = await axios.get(`${MOBYGAMES_API_BASE}/games`, {
      params: Object.fromEntries(params),
      timeout: 5000,
    });

    const games = response.data.games || [];

    return games.map((game: GameSearchResult) => ({
      mobyGameId: game.id,
      name: game.name,
      description: game.description,
      platforms: game.platforms?.map((p) => p.name),
      genres: game.genres?.map((g) => g.name),
      coverUrl: game.cover?.image || game.sample_cover?.image,
      releaseDate: game.release_date ? new Date(game.release_date) : undefined,
    }));
  } catch (error) {
    console.error('MobyGames search error:', error);
    // Return empty array on error instead of throwing
    return [];
  }
}

/**
 * Get detailed information for a specific game
 * @param gameId MobyGames game ID
 * @returns Formatted game details
 */
export async function getGameDetails(gameId: number): Promise<FormattedGame | null> {
  try {
    const params = new URLSearchParams({
      limit: '1',
    });

    if (API_KEY) {
      params.append('api_key', API_KEY);
    }

    const response = await axios.get(`${MOBYGAMES_API_BASE}/games/${gameId}`, {
      params: Object.fromEntries(params),
      timeout: 5000,
    });

    const game = response.data;

    return {
      mobyGameId: game.id,
      name: game.name,
      description: game.description,
      platforms: game.platforms?.map((p: { name: string }) => p.name),
      genres: game.genres?.map((g: { name: string }) => g.name),
      coverUrl: game.cover?.image || game.sample_cover?.image,
      releaseDate: game.release_date ? new Date(game.release_date) : undefined,
    };
  } catch (error) {
    console.error('MobyGames detail fetch error:', error);
    return null;
  }
}

/**
 * Format a MobyGames search result for inventory creation
 * @param game Formatted game from search
 * @returns Game data ready for database insertion
 */
export function formatGameForInventory(
  game: FormattedGame,
  platform?: string,
  price: number = 29.99
) {
  return {
    mobyGameId: game.mobyGameId,
    name: game.name,
    platform: platform || (game.platforms?.[0] || 'PC'),
    genre: game.genres?.[0] || 'Unknown',
    description: game.description,
    coverArtUrl: game.coverUrl,
    releaseDate: game.releaseDate,
    price,
    stockLevel: 0, // Start with no stock, manager adjusts
  };
}
