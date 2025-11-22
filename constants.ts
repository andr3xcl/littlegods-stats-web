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

export const loadPlayersData = (): Promise<PlayerProfile[]> => loadDataFromFile<PlayerProfile[]>('players.json');

export const loadPlayerData = async (guid?: string): Promise<PlayerProfile | null> => {
  try {
    const response = await fetch('./data/data_player.json');
    if (response.ok) {
      const allData = await response.json();
      if (guid) {
        return allData[guid] || null;
      }
      // Si no hay GUID específico, devolver el primer jugador
      const guids = Object.keys(allData);
      return guids.length > 0 ? allData[guids[0]] : null;
    }
  } catch (error) {
    console.warn('Error loading player data:', error);
  }
  return null;
};

export const loadRecentMatches = async (playerGuid?: string): Promise<RecentMatch[]> => {
  try {
    // Ruta al directorio de recent matches
    const recentDir = '../../../AppData/Local/Plutonium/storage/t6/raw/scriptdata/recent';

    // Si estamos en el navegador, no podemos acceder al sistema de archivos
    // En producción, esto debería ser una API call a un backend Node.js
    if (typeof window !== 'undefined') {
      // Fallback: intentar cargar desde el archivo JSON existente
      console.warn('Cargando recent matches desde archivo JSON (fallback)');
      return loadDataFromFile<RecentMatch[]>('recent_matches.json');
    }

    // Código para Node.js (backend)
    const fs = require('fs');
    const path = require('path');

    const recentMatches: RecentMatch[] = [];
    const fullRecentDir = path.resolve(recentDir);

    if (!fs.existsSync(fullRecentDir)) {
      console.warn(`Directorio de recent matches no encontrado: ${fullRecentDir}`);
      return [];
    }

    // Leer todos los subdirectorios (cada uno es un GUID)
    const guidDirs = fs.readdirSync(fullRecentDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const guid of guidDirs) {
      // Si se especificó un GUID, solo procesar ese
      if (playerGuid && guid !== playerGuid) continue;

      const guidPath = path.join(fullRecentDir, guid);

      // Leer todos los archivos en el directorio del GUID
      const files = fs.readdirSync(guidPath)
        .filter(file => file.endsWith('.txt') || file.endsWith('.json'))
        .sort(); // Ordenar alfabéticamente

      for (const file of files) {
        try {
          const filePath = path.join(guidPath, file);
          const fileName = path.basename(file, path.extname(file));

          // Parsear el nombre del archivo
          // Formato esperado: mapa_recent_N
          // Ejemplo: rooftop_recent_1
          const parts = fileName.split('_recent_');
          if (parts.length !== 2) continue;

          const map = parts[0];
          const matchNumber = parseInt(parts[1]);

          // Leer contenido del archivo
          const content = fs.readFileSync(filePath, 'utf-8');
          const lines = content.split('\n');

          // Parsear datos del archivo
          let playerName = 'Unknown';
          let round = 1;
          let kills = 0;
          let headshots = 0;
          let revives = 0;
          let downs = 0;
          let score = 0;
          let timestamp = Date.now();

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.includes('Nombre:') || trimmed.includes('Jugador:')) {
              playerName = trimmed.split(':')[1]?.trim() || playerName;
            }
            if (trimmed.includes('Ronda:') || trimmed.includes('Round:')) {
              round = parseInt(trimmed.split(':')[1]?.trim()) || round;
            }
            if (trimmed.includes('Kills:') || trimmed.includes('Asesinatos:')) {
              kills = parseInt(trimmed.split(':')[1]?.trim()) || kills;
            }
            if (trimmed.includes('Headshots:')) {
              headshots = parseInt(trimmed.split(':')[1]?.trim()) || headshots;
            }
            if (trimmed.includes('Revives:') || trimmed.includes('Reanimaciones:')) {
              revives = parseInt(trimmed.split(':')[1]?.trim()) || revives;
            }
            if (trimmed.includes('Downs:') || trimmed.includes('Caídas:')) {
              downs = parseInt(trimmed.split(':')[1]?.trim()) || downs;
            }
            if (trimmed.includes('Score:') || trimmed.includes('Puntuación:')) {
              score = parseInt(trimmed.split(':')[1]?.trim()) || score;
            }
          }

          // Crear entrada de partida reciente
          recentMatches.push({
            id: `${guid}_${map}_${matchNumber}`,
            map: map,
            mode: 'Zombies', // Asumir zombies por defecto
            result: round >= 10 ? 'VICTORY' : 'DEFEAT', // Lógica simple
            kills: kills,
            deaths: downs, // Usar downs como deaths aproximado
            date: new Date(timestamp).toISOString().split('T')[0],
            // Propiedades adicionales del formato actual
            playerName,
            guid,
            round,
            headshots,
            revives,
            timestamp,
            fileName: file
          } as any);

        } catch (error) {
          console.warn(`Error procesando archivo ${file}:`, error);
        }
      }
    }

    // Ordenar por timestamp descendente (más reciente primero)
    recentMatches.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    // Mantener solo las últimas 20 partidas
    return recentMatches.slice(0, 20);

  } catch (error) {
    console.error('Error cargando recent matches desde directorio:', error);
    // Fallback al archivo JSON
    return loadDataFromFile<RecentMatch[]>('recent_matches.json');
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
  "zm_busdepot":"./data/images/load_maps/zm_busdepot.jpg"
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
  "busdepot": "zm_busdepot"
};