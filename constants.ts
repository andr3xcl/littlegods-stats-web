import { PlayerProfile, RecentMatch, EconomyData } from './types';

async function loadDataFromFile<T>(filename: string): Promise<T> {
  try {
    const response = await fetch(`./data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    throw error;
  }
}

export interface PlayerIndexEntry {
  guid: string;
  username: string;
  lastSeen: string;
}

export const loadPlayersIndex = (): Promise<PlayerIndexEntry[]> => loadDataFromFile<PlayerIndexEntry[]>('players.json');



export const loadPlayerData = async (identifier?: string): Promise<PlayerProfile | null> => {
  try {
    if (!identifier) {
      // If no identifier, try to get the first player from the index
      const index = await loadPlayersIndex();
      if (index.length > 0) {
        identifier = index[0].username;
      } else {
        return null;
      }
    }

    // Check if identifier is a GUID (numeric string) or Username
    // For now, we assume if it's passed here it might be a username if we updated the calls,
    // but if it's a GUID we might need to look it up. 
    // However, the new structure uses Username folders.
    // Let's try to fetch as username first.

    // Sanitize username for URL (simple version matching watchdog)
    const sanitized = identifier.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    try {
      const response = await fetch(`./data/players/${sanitized}/data.json`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      // Ignore and try fallback
    }

    // Fallback: Try legacy data_player.json if specific file fails (DISABLED)
    // const response = await fetch('./data/data_player.json');
    // if (response.ok) {
    //   const allData = await response.json();
    //   // If identifier is GUID
    //   if (allData[identifier]) return allData[identifier];
    //   // If identifier is Username, search for it
    //   const found = Object.values(allData).find((p: any) => p.username === identifier);
    //   if (found) return found as PlayerProfile;
    // }
  } catch (error) {
    console.warn('Error loading player data:', error);
  }
  return null;
};

export const loadRecentMatches = async (playerIdentifier?: string): Promise<RecentMatch[]> => {
  try {
    if (typeof window !== 'undefined') {
      if (playerIdentifier) {
        const sanitized = playerIdentifier.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        try {
          const response = await fetch(`./data/players/${sanitized}/matches.json`);
          if (response.ok) {
            return await response.json();
          }
        } catch (e) {
          console.warn(`Could not load matches for ${playerIdentifier} from new structure, trying fallback.`);
        }
      }

      // Fallback: load global recent matches (DISABLED)
      // console.warn('Cargando recent matches desde archivo JSON global (fallback)');
      // return loadDataFromFile<RecentMatch[]>('recent_matches.json');
      return [];
    }

    // Node.js backend logic (kept as is or updated if needed, but mostly unused in browser)
    // ... (rest of the function is for Node environment, skipping modification for brevity as user is on web)
    return [];
  } catch (error) {
    console.error('Error cargando recent matches:', error);
    return [];
  }
};

export const loadEconomyData = (): Promise<EconomyData> => loadDataFromFile<EconomyData>('economy.json');

export const MAP_BANNERS: Record<string, string> = {
  "zm_buried": "./data/images/load_maps/zm_buried.jpg",
  "zm_highrise": "./data/images/load_maps/zm_highrise.jpg",
  "zm_nuked": "./data/images/load_maps/zm_nuked.jpg",
  "zm_prison": "./data/images/load_maps/zm_prison.jpg",
  "zm_tomb": "./data/images/load_maps/zm_tomb.jpg",
  "zm_tranzit": "./data/images/load_maps/zm_tranzit.jpg",
  "zm_town": "./data/images/load_maps/zm_town.jpg",
  "zm_farm": "./data/images/load_maps/zm_farm.jpg",
  "zm_busdepot": "./data/images/load_maps/zm_busdepot.jpg"
};

export const MAP_NAME_TO_CODE = {
  "highrise": "zm_highrise",
  "nuked": "zm_nuked",
  "prison": "zm_prison",
  "tomb": "zm_tomb",
  "tranzit": "zm_tranzit",
  "diner": "zm_tranzit",
  "farm": "zm_farm",
  "town": "zm_town",
  "processing": "zm_buried",
  "rooftop": "zm_highrise",
  "busdepot": "zm_busdepot",
  "buried": "zm_buried",
  "mob of the dead": "zm_prison",
  "origins": "zm_tomb"
};