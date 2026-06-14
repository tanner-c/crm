// services/igdb.ts
import axios from 'axios';

const IGDB_API_BASE = 'https://api.igdb.com/v4';
const CLIENT_ID = process.env.IGDB_CLIENT_ID || 'h7mkem1xmcs5gkk42rf64z6yutty1o';
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET || 'vyowxdt0xvrge6jbdp286wvjqgzxln';

interface FormattedGame {
  mobyGameId: number; // Stored in the DB column named mobyGameId
  name: string;
  description?: string;
  platforms?: string[];
  genres?: string[];
  coverUrl?: string;
  releaseDate?: Date;
}

// Token Caching State
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Normalizes Twitch/IGDB platform names into valid database Platform enum strings.
 */
function normalizePlatform(name: string): string {
  const upper = name.toUpperCase();
  if (upper.includes('PC') || upper.includes('WINDOWS') || upper.includes('MAC') || upper.includes('LINUX')) return 'PC';
  if (upper.includes('PLAYSTATION') || upper.includes('PS1') || upper.includes('PS2') || upper.includes('PS3') || upper.includes('PS4') || upper.includes('PS5') || upper.includes('VITA') || upper.includes('PSP')) return 'PLAYSTATION';
  if (upper.includes('XBOX')) return 'XBOX';
  if (upper.includes('NINTENDO') || upper.includes('SWITCH') || upper.includes('WII') || upper.includes('GAMECUBE') || upper.includes('NES') || upper.includes('SNES') || upper.includes('GAME BOY') || upper.includes('DS') || upper.includes('3DS')) return 'NINTENDO';
  if (upper.includes('MOBILE') || upper.includes('ANDROID') || upper.includes('IOS') || upper.includes('IPHONE') || upper.includes('IPAD')) return 'MOBILE';
  return 'OTHER';
}

/**
 * Gets a valid OAuth2 Access Token from Twitch, using cache if still valid.
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials',
      },
    });

    const { access_token, expires_in } = response.data;
    cachedToken = access_token;
    // Buffer the expiration time by 60 seconds
    tokenExpiresAt = now + (expires_in * 1000) - 60000;
    return access_token;
  } catch (error) {
    console.error('Error fetching Twitch access token:', error);
    throw new Error('Failed to authenticate with IGDB service');
  }
}

/**
 * Search for games on IGDB API
 * @param query Search term (game name)
 * @returns Array of formatted game results
 */
export async function searchGames(query: string): Promise<FormattedGame[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const token = await getAccessToken();

    // Query using APICalypse syntax
    const queryBody = `search "${query.trim().replace(/"/g, '\\"')}"; fields id, name, summary, platforms.name, genres.name, cover.url, first_release_date; limit 10;`;

    const response = await axios.post(`${IGDB_API_BASE}/games`, queryBody, {
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      timeout: 5000,
    });

    const games = response.data || [];

    return games.map((game: any) => {
      // Process cover art URL
      let coverUrl = game.cover?.url;
      if (coverUrl) {
        if (coverUrl.startsWith('//')) {
          coverUrl = 'https:' + coverUrl;
        }
        // Upgrade thumbnail to higher quality cover art size
        coverUrl = coverUrl.replace('t_thumb', 't_cover_big');
      }

      // Convert Unix timestamp (seconds) to Date
      const releaseDate = game.first_release_date
        ? new Date(game.first_release_date * 1000)
        : undefined;

      // Extract and normalize platforms
      const platforms = Array.from(
        new Set(game.platforms?.map((p: any) => normalizePlatform(p.name)) || [])
      ) as string[];
      
      if (platforms.length === 0) {
        platforms.push('PC'); // default fallback
      }

      return {
        mobyGameId: game.id, // Store IGDB ID under mobyGameId column
        name: game.name,
        description: game.summary,
        platforms,
        genres: game.genres?.map((g: any) => g.name) || [],
        coverUrl,
        releaseDate,
      };
    });
  } catch (error) {
    console.error('IGDB search error:', error);
    // Return empty array on error instead of throwing
    return [];
  }
}

/**
 * Get detailed information for a specific game on IGDB API
 * @param gameId IGDB game ID
 * @returns Formatted game details
 */
export async function getGameDetails(gameId: number): Promise<FormattedGame | null> {
  try {
    const token = await getAccessToken();

    const queryBody = `fields id, name, summary, platforms.name, genres.name, cover.url, first_release_date; where id = ${gameId}; limit 1;`;

    const response = await axios.post(`${IGDB_API_BASE}/games`, queryBody, {
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      timeout: 5000,
    });

    const game = response.data?.[0];
    if (!game) {
      return null;
    }

    let coverUrl = game.cover?.url;
    if (coverUrl) {
      if (coverUrl.startsWith('//')) {
        coverUrl = 'https:' + coverUrl;
      }
      coverUrl = coverUrl.replace('t_thumb', 't_cover_big');
    }

    const releaseDate = game.first_release_date
      ? new Date(game.first_release_date * 1000)
      : undefined;

    const platforms = Array.from(
      new Set(game.platforms?.map((p: any) => normalizePlatform(p.name)) || [])
    ) as string[];

    if (platforms.length === 0) {
      platforms.push('PC');
    }

    return {
      mobyGameId: game.id,
      name: game.name,
      description: game.summary,
      platforms,
      genres: game.genres?.map((g: any) => g.name) || [],
      coverUrl,
      releaseDate,
    };
  } catch (error) {
    console.error('IGDB details fetch error:', error);
    return null;
  }
}

/**
 * Format an IGDB search result for inventory creation
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
    stockLevel: 0,
  };
}
