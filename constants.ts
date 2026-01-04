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

      const index = await loadPlayersIndex();
      if (index.length > 0) {
        identifier = index[0].username;
      } else {
        return null;
      }
    }








    const sanitized = identifier.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    try {
      const response = await fetch(`./data/players/${sanitized}/data.json`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {

    }











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




      return [];
    }



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
  "zm_busdepot": "./data/images/load_maps/zm_busdepot.jpg",
  "zm_maze": "./data/images/load_maps/zm_maze.jpg",
  "zm_crazyplace": "./data/images/load_maps/zm_crazyplace.jpg",
  "zm_showers": "./data/images/load_maps/zm_showers.jpg",
  "zm_trenches": "./data/images/load_maps/zm_trenches.jpg",
  "zm_rooftop_mob": "./data/images/load_maps/zm_rooftop_mob.jpg",
  "zm_docks": "./data/images/load_maps/zm_docks.jpg",
  "zm_cellblock": "./data/images/load_maps/zm_cellblock.jpg",
  "zm_diner": "./data/images/load_maps/zm_diner.jpg",
  "zm_power": "./data/images/load_maps/zm_power.jpg",
  "zm_busdepot_b": "./data/images/load_maps/zm_busdepot_b.jpg",
  "zm_town_b": "./data/images/load_maps/zm_town_b.jpg",
  "zm_farm_b": "./data/images/load_maps/zm_farm_b.jpg",
  "zm_cornfield": "./data/images/load_maps/zm_cornfield.jpg",
  "zm_nuke": "./data/images/load_maps/zm_nuke.jpg",
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
  "origins": "zm_tomb",
  
  
  
  "diner bonus": "zm_diner",
  "power bonus": "zm_power",
  "cornfield bonus": "zm_cornfield",
  "tunnel bonus": "zm_tranzit",
  "house bonus": "zm_tranzit",
  "town bonus": "zm_town_b",
  "farm bonus": "zm_farm_b",
  "busdepot bonus": "zm_busdepot_b",
  "nuketown bonus": "zm_nuke",
  "showers bonus": "zm_showers",
  "docks bonus": "zm_docks",
  "cellblock bonus": "zm_cellblock",
  "rooftop bonus": "zm_rooftop_mob",
  "building1top bonus": "zm_highrise",
  "maze bonus": "zm_maze",
  "trenches bonus": "zm_trenches",
  "crazyplace bonus": "zm_crazyplace"
};