#!/usr/bin/env node

// WATCHDOG PERFECTO - Versión Refactorizada
// Uso: node utils/watchdog.js

import fs from 'fs';
import path from 'path';

// --- Configuración y Constantes ---

const PLUTONIUM_BASE_DIR = path.join(process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Local'), 'Plutonium', 'storage', 't6', 'raw', 'scriptdata');
const BANK_DIR = path.join(PLUTONIUM_BASE_DIR, 'bank');
const RECENT_DIR = path.join(PLUTONIUM_BASE_DIR, 'recent');
const BANK_TRANSACTIONS_DIR = path.join(PLUTONIUM_BASE_DIR, 'bank_transactions');

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'data_player.json');
const RECENT_MATCHES_FILE = path.join(DATA_DIR, 'recent_matches.json');

const WATCHER_DELAY = 500; // Delay en ms para procesar cambios

// Mapeo de nombres técnicos/base de armas a nombres visuales
const WEAPON_NAME_MAPPING = {
  // Nombres técnicos directos
  'm1911_zm': 'M1911',
  'python_zm': 'Python',
  'judge_zm': 'Executioner',
  'kard_zm': 'KAP-40',
  'fiveseven_zm': 'Five-Seven',
  'fivesevendw_zm': 'Five-Seven Dual Wield',
  'beretta93r_zm': 'B93R',
  'beretta93r_extclip_zm': 'B93R',

  // Nombres base (después de remover sufijos)
  // Pistolas
  'm1911_zm': 'M1911',
  'python_zm': 'Python',
  'judge_zm': 'Executioner',
  'kard_zm': 'KAP-40',
  'fiveseven_zm': 'Five-Seven',
  'fivesevendw_zm': 'Five-Seven Dual Wield',
  'beretta93r_zm': 'B93R',
  'beretta93r_extclip_zm': 'B93R Extended Clip',

  // SMGs
  'mp5k_zm': 'MP5',
  'pdw57_zm': 'PDW-57',
  'ak74u_zm': 'AK-74u',
  'ak74u_extclip_zm': 'AK-74u Extended Clip',
  'qcw05_zm': 'Chicom CQB',
  'mp40_zm': 'MP40',
  'mp40_stalker_zm': 'MP40 Stalker',
  'evoskorpion_zm': 'Skorpion',
  'thompson_zm': 'Chicago Typewriter',
  'uzi_zm': 'UZI',

  // Rifles de Asalto
  'm14_zm': 'M14',
  'fnfal_zm': 'FAL',
  'galil_zm': 'Galil',
  'm16_zm': 'M16',
  'tar21_zm': 'TAR-21',
  'gl_tar21_zm': 'TAR-21 Grenade Launcher',
  'type95_zm': 'Type 25',
  'xm8_zm': 'M8A1',
  'an94_zm': 'AN-94',
  'scar_zm': 'SCAR-H',
  'ak47_zm': 'AK-47',
  'fnfal_zm': 'FAL',
  'hk416_zm': 'M27',

  // LMGs
  'rpd_zm': 'RPD',
  'lsat_zm': 'LSAT',
  'mg08_zm': 'MG08',
  'hamr_zm': 'HAMR',

  // Escopetas
  '870mcs_zm': 'Remington 870 MCS',
  'rottweil72_zm': 'Olympia',
  'saiga12_zm': 'S12',
  'srm1216_zm': 'SMR',
  'ksg_zm': 'KSG',

  // Snipers
  'dsr50_zm': 'DSR 50',
  'ballista_zm': 'Ballista',
  'barretm82_zm': 'Barrett M82A1',
  'svu_zm': 'SVU-AS',

  // Lanzadores
  'usrpg_zm': 'RPG',
  'm32_zm': 'War Machine',
  'minigun_alcatraz_zm': 'Death Machine',

  // Wonder Weapons
  'ray_gun_zm': 'Ray Gun',
  'raygun_mark2_zm': 'Ray Gun Mark II',
  'blundergat_zm': 'Blundergat',
  'blundersplat_zm': 'Acidgat',
  'slowgun_zm': 'Paralyzer',
  'slipgun_zm': 'Sliquifier',

  // Cuchillos
  'knife_ballistic_zm': 'Ballistic Knife',
  'knife_ballistic_bowie_zm': 'Ballistic Bowie Knife',
  'knife_ballistic_no_melee_zm': 'Ballistic Knife (No Melee)',
};

// Mapeo de nombres técnicos de perks a nombres visuales
const PERK_NAME_MAPPING = {
  'Juggernog': 'Juggernog',
  'Quick Revive': 'Quick Revive',
  'Speed Cola': 'Speed Cola',
  'Double Tap': 'Double Tap',
  'Stamin-Up': 'Stamin-Up',
  'PhD Flopper': 'PhD Flopper',
  'Deadshot Daiquiri': 'Deadshot Daiquiri',
  'Mule Kick': 'Mule Kick',
  'Electric Cherry': 'Electric Cherry',
  'Who\'s Who': 'Who\'s Who',
  'Tombstone': 'Tombstone',
  'Vulture Aid Elixir': 'Vulture Aid Elixir',
  'Widow\'s Wine': 'Widow\'s Wine'
};

// --- Funciones Helpers (Utilidades) ---

/**
 * Convierte un nombre técnico de arma a su nombre visual.
 * @param {string} weaponName - Nombre técnico del arma.
 * @returns {string} Nombre visual del arma.
 */
function _getWeaponDisplayName(weaponName) {
  // Si ya está mapeado, devolver el nombre visual
  if (WEAPON_NAME_MAPPING[weaponName]) {
    return WEAPON_NAME_MAPPING[weaponName];
  }

  // Si es un nombre ya formateado, devolverlo
  if (weaponName.includes(' ') && !weaponName.includes('_')) {
    return weaponName;
  }

  // Verificar si es un arma upgraded para agregar "Upgraded" al final
  const isUpgraded = weaponName.toLowerCase().includes('_upgraded_zm') ||
                     weaponName.toLowerCase().match(/upgraded\d*$/);

  // Procesar nombres técnicos con sufijos
  let cleanName = weaponName.toLowerCase().trim();

  // Remover sufijos técnicos
  const upgradeSuffixes = [
    /_upgraded_zm/gi,
    /_reflex_zm/gi,
    /_extclip_zm/gi,
    /_stalker_zm/gi,
    /_akimbo_zm/gi,
    /_steadyaim_zm/gi,
    /_dualclip_zm/gi,
    /_zm/gi,
    /upgraded\d*$/gi  // "upgraded" + números al final
  ];

  for (const suffix of upgradeSuffixes) {
    cleanName = cleanName.replace(suffix, '');
  }

  // Capitalizar el nombre base
  let baseName = cleanName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // Verificar si está mapeado después de limpiar
  if (WEAPON_NAME_MAPPING[baseName]) {
    baseName = WEAPON_NAME_MAPPING[baseName];
  } else {
    // Verificar si hay alguna variante mapeada
    for (const [key, value] of Object.entries(WEAPON_NAME_MAPPING)) {
      if (cleanName.includes(key.toLowerCase())) {
        baseName = value;
        break;
      }
    }
  }

  // Agregar "Upgraded" si era un arma upgraded
  if (isUpgraded) {
    baseName += ' Upgraded';
  }

  return baseName;
}

/**
 * Convierte un nombre técnico de perk a su nombre visual.
 * @param {string} perkName - Nombre técnico del perk.
 * @returns {string} Nombre visual del perk.
 */
function _getPerkDisplayName(perkName) {
  return PERK_NAME_MAPPING[perkName] || perkName;
}

/**
 * Asegura que un directorio exista. Si no, lo crea.
 * @param {string} dirPath - Ruta del directorio a verificar/crear.
 */
function _ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Creado: ${dirPath}`);
    } catch (error) {
      console.warn(`⚠️ Error creando directorio ${dirPath}:`, error.message);
    }
  } else {
    console.log(`✓ Ya existe: ${dirPath}`);
  }
}

/**
 * Carga el archivo JSON de datos de jugadores.
 * @returns {object} Los datos de jugadores, o un objeto vacío si no existe/falla.
 */
function _loadPlayersData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (error) {
    console.warn('⚠️ No se pudo cargar data_player.json, se creará uno nuevo.', error.message);
  }
  return {};
}

/**
 * Guarda el objeto de datos de jugadores en el archivo JSON.
 * @param {object} data - El objeto de datos de jugadores a guardar.
 */
function _savePlayersData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    // console.log(`💾 Total guardado: ${Object.keys(data).length} jugadores`); // Log muy verboso para el watcher
  } catch (error) {
    console.error('❌ Error guardando data_player.json:', error);
  }
}

/**
 * Parsea el contenido de un archivo de estadísticas (recent match).
 * @param {string} content - El contenido de texto del archivo.
 * @returns {object} Un objeto con las estadísticas parseadas.
 */
function _parseStatsFromFileContent(content) {
  const stats = {
    playerName: 'Unknown',
    round: 1,
    kills: 0,
    headshots: 0,
    revives: 0,
    downs: 0,
    score: 0,
    weapons: {},
    perks: {},
    bestWeapon: null
  };
  
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes('Nombre:') || trimmed.includes('Jugador:')) {
      stats.playerName = trimmed.split(':')[1]?.trim() || stats.playerName;
    }
    if (trimmed.includes('Ronda:') || trimmed.includes('Round:')) {
      stats.round = parseInt(trimmed.split(':')[1]?.trim()) || stats.round;
    }
    if (trimmed.includes('Kills:') || trimmed.includes('Asesinatos:')) {
      stats.kills = parseInt(trimmed.split(':')[1]?.trim()) || stats.kills;
    }
    if (trimmed.includes('Headshots:')) {
      stats.headshots = parseInt(trimmed.split(':')[1]?.trim()) || stats.headshots;
    }
    if (trimmed.includes('Revives:') || trimmed.includes('Reanimaciones:')) {
      stats.revives = parseInt(trimmed.split(':')[1]?.trim()) || stats.revives;
    }
    if (trimmed.includes('Downs:') || trimmed.includes('Caídas:')) {
      stats.downs = parseInt(trimmed.split(':')[1]?.trim()) || stats.downs;
    }
    if (trimmed.includes('Score:') || trimmed.includes('Puntuación:') || trimmed.includes('Score Total:')) {
      stats.score = parseInt(trimmed.split(':')[1]?.trim()) || stats.score;
    }

    // Parsear armas
    if (trimmed.includes('ARMAS USADAS EN LA PARTIDA:')) {
      // El siguiente contenido son armas hasta la siguiente sección
      const weaponsSectionIndex = lines.indexOf(line);
      if (weaponsSectionIndex !== -1) {
        for (let i = weaponsSectionIndex + 1; i < lines.length; i++) {
          const weaponLine = lines[i].trim();
          if (weaponLine === '' || weaponLine.includes('PERKS') || weaponLine.includes('Fecha/Hora:')) break;

          // Parsear línea como "arma: X kills"
          const weaponMatch = weaponLine.match(/^(.+?):\s*(\d+)\s*kills$/);
          if (weaponMatch) {
            const weaponName = weaponMatch[1].trim();
            const killCount = parseInt(weaponMatch[2]);
            if (killCount > 0) {
              // Usar nombre técnico como key, pero almacenar también el nombre visual
              stats.weapons[weaponName] = {
                kills: killCount,
                displayName: _getWeaponDisplayName(weaponName)
              };
            }
          }
        }
      }
    }

    // Parsear perks
    if (trimmed.includes('PERKS USADOS EN LA PARTIDA:')) {
      // El siguiente contenido son perks hasta Fecha/Hora
      const perksSectionIndex = lines.indexOf(line);
      if (perksSectionIndex !== -1) {
        for (let i = perksSectionIndex + 1; i < lines.length; i++) {
          const perkLine = lines[i].trim();
          if (perkLine === '' || perkLine.includes('Fecha/Hora:')) break;

          // Parsear línea como "Perk Name: X uso(s)"
          const perkMatch = perkLine.match(/^(.+?):\s*(\d+)\s*usos?$/);
          if (perkMatch) {
            const perkName = perkMatch[1].trim();
            const useCount = parseInt(perkMatch[2]);
            if (useCount > 0) {
              stats.perks[perkName] = {
                uses: useCount,
                displayName: _getPerkDisplayName(perkName)
              };
            }
          }
        }
      }
    }
  }

  // Determinar la mejor arma (la que más kills tiene)
  if (Object.keys(stats.weapons).length > 0) {
    let maxKills = 0;
    let bestWeaponKey = null;

    for (const [weaponKey, weaponData] of Object.entries(stats.weapons)) {
      if (weaponData.kills > maxKills) {
        maxKills = weaponData.kills;
        bestWeaponKey = weaponKey;
      }
    }

    if (bestWeaponKey) {
      stats.bestWeapon = {
        name: bestWeaponKey,
        displayName: stats.weapons[bestWeaponKey].displayName,
        kills: maxKills
      };
    }
  }

  return stats;
}

/**
 * Parsea el contenido de un archivo de transacción bancaria.
 * @param {string} content - El contenido de texto del archivo.
 * @returns {object} Un objeto con los datos de la transacción.
 */
function _parseTransactionFileContent(content) {
  const transactionData = {
    type: '',
    number: 0,
    playerName: '',
    playerId: '',
    timestamp: 0,
    amount: 0,
    balanceBefore: 0,
    balanceAfter: 0,
    description: ''
  };

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes('Tipo: ')) {
      transactionData.type = trimmed.split(': ')[1];
    }
    if (trimmed.includes('Número: ')) {
      transactionData.number = parseInt(trimmed.split(': ')[1]) || 0;
    }
    if (trimmed.includes('Jugador: ')) {
      const playerNameRaw = trimmed.split(': ')[1] || '';
      // Si el nombre es "Jugador [GUID]", dejar vacío
      if (!playerNameRaw.startsWith('Jugador ')) {
        transactionData.playerName = playerNameRaw;
      }
    }
    if (trimmed.includes('Jugador ID: ')) {
      transactionData.playerId = trimmed.split(': ')[1];
    }
    if (trimmed.includes('Fecha/Hora: ')) {
      transactionData.timestamp = parseInt(trimmed.split(': ')[1]) || 0;
    }
    if (trimmed.includes('Monto: ')) {
      transactionData.amount = parseInt(trimmed.split(': ')[1]) || 0;
    }
    if (trimmed.includes('Balance Antes: ')) {
      transactionData.balanceBefore = parseInt(trimmed.split(': ')[1]) || 0;
    }
    if (trimmed.includes('Balance Después: ')) {
      transactionData.balanceAfter = parseInt(trimmed.split(': ')[1]) || 0;
    }
    if (trimmed.includes('Descripción: ')) {
      transactionData.description = trimmed.split(': ')[1] || '';
    }
  }
  return transactionData;
}

// --- Lógica de Estadísticas (Recent Matches) ---

/**
 * Obtiene el conteo de partidas jugadas desde el archivo de índice.
 */
function getGamesPlayedCount(guid, map) {
  try {
    const indexFile = path.join(RECENT_DIR, guid, `${map}_index.txt`);
    if (fs.existsSync(indexFile)) {
      const content = fs.readFileSync(indexFile, 'utf-8').trim();
      const count = parseInt(content);
      return isNaN(count) ? 0 : count;
    }
  } catch (error) {
    console.warn(`Error leyendo índice para ${map}:`, error);
  }
  return 0;
}

/**
 * Recalcula las estadísticas de un mapa específico leyendo todos sus archivos.
 */
function recalculateMapStats(guid, map) {
  const stats = {
    topRound: 1,
    totalKills: 0,
    totalHeadshots: 0,
    totalRevives: 0,
    totalDowns: 0,
    totalScore: 0
  };

  try {
    const guidPath = path.join(RECENT_DIR, guid);
    if (!fs.existsSync(guidPath)) {
      return stats;
    }

    const files = fs.readdirSync(guidPath)
      .filter(file => file.startsWith(`${map}_recent_`) && file.endsWith('.txt'))
      .sort();

    for (const file of files) {
      try {
        const filePath = path.join(guidPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsedStats = _parseStatsFromFileContent(content);
        
        // Acumular estadísticas
        stats.totalKills += parsedStats.kills;
        stats.totalHeadshots += parsedStats.headshots;
        stats.totalRevives += parsedStats.revives;
        stats.totalDowns += parsedStats.downs;
        stats.totalScore += parsedStats.score;

        if (parsedStats.round > stats.topRound) {
          stats.topRound = parsedStats.round;
        }
      } catch (error) {
        console.warn(`Error procesando archivo ${file}:`, error);
      }
    }
    console.log(`📊 ${map}: ${files.length} archivos → ${stats.totalKills} kills, ${stats.totalDowns} downs`);
  } catch (error) {
    console.warn(`Error recalculando estadísticas para ${map}:`, error);
  }
  return stats;
}

/**
 * Recalcula las estadísticas totales de un jugador sumando las de todos sus mapas.
 */
function recalculatePlayerTotalStats(maps) {
  const totalStats = {
    kills: 0,
    downs: 0,
    revives: 0,
    headshots: 0
  };

  for (const mapName in maps) {
    const mapStats = maps[mapName];
    totalStats.kills += mapStats.totalKills || 0;
    totalStats.downs += mapStats.totalDowns || 0;
    totalStats.revives += mapStats.totalRevives || 0;
    totalStats.headshots += mapStats.totalHeadshots || 0;
  }
  return totalStats;
}

/**
 * Asegura que el subdirectorio 'recent' de un jugador exista.
 */
function ensurePlayerRecentDir(guid) {
  const playerRecentDir = path.join(RECENT_DIR, guid);
  if (!fs.existsSync(playerRecentDir)) {
    try {
      fs.mkdirSync(playerRecentDir, { recursive: true });
      console.log(`📁 Creado directorio de recent matches para GUID: ${guid}`);
    } catch (error) {
      console.warn(`⚠️ Error creando directorio de recent matches para ${guid}:`, error.message);
    }
  }
  return playerRecentDir;
}

/**
 * Procesa y actualiza las estadísticas de un jugador en data_player.json.
 * Esta función LEE y GUARDA el archivo DATA_FILE en cada llamada.
 */
function processPlayerStats(guid, playerName, map, round, kills, headshots, revives, downs, score) {
  ensurePlayerRecentDir(guid);

  let playersData = _loadPlayersData();

  // Crear jugador si no existe
  if (!playersData[guid]) {
    playersData[guid] = {
      username: playerName,
      guid: guid,
      stats: { kills: 0, downs: 0, revives: 0, headshots: 0 },
      maps: {},
      economy: { balance: 0, transactions: [] }
    };
    console.log(`👤 Nuevo: ${playerName} (${guid})`);
  }

  // Actualizar username si es válido
  if (playerName && playerName !== 'Unknown' && playerName !== playersData[guid].username) {
    console.log(`📝 Actualizando username: ${playersData[guid].username} → ${playerName}`);
    playersData[guid].username = playerName;
  }

  const gamesPlayed = getGamesPlayedCount(guid, map);
  if (gamesPlayed === 0) {
    console.log(`⚠️ Sin datos de índice para ${map}, saltando...`);
    return; // No guardar si no hay índice
  }

  // Recalcular TODAS las estadísticas del mapa desde cero
  const recalculatedStats = recalculateMapStats(guid, map);

  playersData[guid].maps[map] = {
    ...recalculatedStats,
    gamesPlayed: gamesPlayed,
    lastPlayed: new Date().toISOString().split('T')[0]
  };

  const mapStats = playersData[guid].maps[map];

  // Recalcular estadísticas TOTALES del jugador
  playersData[guid].stats = recalculatePlayerTotalStats(playersData[guid].maps);

  console.log(`📊 Actualizado: ${playersData[guid].username} - ${map} (${gamesPlayed} partidas, ${mapStats.totalKills}K total, ${mapStats.totalDowns}D total)`);

  _savePlayersData(playersData);
}

/**
 * Función principal que procesa el directorio 'recent', actualiza data_player.json
 * y genera el archivo recent_matches.json.
 */
function processRecentMatchesFromDir() {
  try {
    const recentMatches = [];

    if (!fs.existsSync(RECENT_DIR)) {
      console.log('❌ Directorio de recent matches no encontrado:', RECENT_DIR);
      return;
    }

    const guidDirs = fs.readdirSync(RECENT_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`🔍 Procesando recent matches para ${guidDirs.length} jugadores...`);

    for (const guid of guidDirs) {
      const guidPath = path.join(RECENT_DIR, guid);
      const files = fs.readdirSync(guidPath)
        .filter(file => file.endsWith('.txt'))
        .sort(); // Ordenar alfabéticamente

      for (const file of files) {
        try {
          const filePath = path.join(guidPath, file);
          const fileName = path.basename(file, '.txt');

          const parts = fileName.split('_recent_');
          if (parts.length !== 2) {
            if (!fileName.endsWith('_index.txt')) { // Ignorar archivos de índice
                console.log(`⚠️ Nombre de archivo inválido: ${fileName}`);
            }
            continue;
          }

          const map = parts[0];
          const matchNumber = parseInt(parts[1]);

          if (isNaN(matchNumber)) {
            console.log(`⚠️ Número de partida inválido en: ${fileName}`);
            continue;
          }

          const content = fs.readFileSync(filePath, 'utf-8');
          const stats = _parseStatsFromFileContent(content);

          // Obtener la fecha real de creación del archivo
          const fileStats = fs.statSync(filePath);
          const realTimestamp = Math.floor(fileStats.birthtime.getTime());

          // Procesar estadísticas del jugador (actualiza data_player.json)
          processPlayerStats(guid, stats.playerName, map, stats.round, stats.kills, stats.headshots, stats.revives, stats.downs, stats.score);

          // Crear entrada de partida reciente para recent_matches.json
          const matchData = {
            ...stats,
            guid,
            map,
            timestamp: realTimestamp,
            fileName: file
          };

          recentMatches.push(matchData);
          console.log(`✅ Procesada: ${stats.playerName} (${guid}) - ${map} - Partida ${matchNumber} - Ronda ${stats.round} - ${stats.kills} kills`);

        } catch (error) {
          console.warn(`❌ Error procesando archivo ${file}:`, error.message);
        }
      }
    }

    if (recentMatches.length === 0) {
      console.log('⚠️ No se encontraron partidas recientes para procesar');
      return;
    }

    // Ordenar por timestamp descendente (más reciente primero)
    recentMatches.sort((a, b) => b.timestamp - a.timestamp);

    // Mantener solo las últimas 50 partidas (funcionalidad original)
    const finalMatches = recentMatches.slice(0, 50);

    // Guardar en el archivo JSON
    fs.writeFileSync(RECENT_MATCHES_FILE, JSON.stringify(finalMatches, null, 2));
    console.log(`💾 Guardadas ${finalMatches.length} partidas recientes en ${RECENT_MATCHES_FILE}`);

  } catch (error) {
    console.error('❌ Error procesando recent matches:', error);
  }
}

// --- Lógica de Banco (Bank) ---

/**
 * Asegura que el subdirectorio 'bank_transactions' de un jugador exista.
 */
function ensurePlayerTransactionDir(guid) {
  const playerTransactionsDir = path.join(BANK_TRANSACTIONS_DIR, guid);
  if (!fs.existsSync(playerTransactionsDir)) {
    try {
      fs.mkdirSync(playerTransactionsDir, { recursive: true });
      console.log(`📁 Creado directorio de transacciones para GUID: ${guid}`);
    } catch (error) {
      console.warn(`⚠️ Error creando directorio de transacciones para ${guid}:`, error.message);
    }
  }
  return playerTransactionsDir;
}

/**
 * Procesa los archivos de transacciones bancarias de un jugador (nuevo formato por carpetas).
 */
function processBankTransactionsFile(guid, playersData) {
  const playerTransactionsDir = ensurePlayerTransactionDir(guid);

  if (!fs.existsSync(playerTransactionsDir)) {
    return; // No hay directorio de transacciones
  }

  try {
    if (!playersData[guid].economy.transactions) {
      playersData[guid].economy.transactions = [];
    }

    const transactionFiles = fs.readdirSync(playerTransactionsDir)
      .filter(file => 
        file.endsWith('.txt') && 
        file !== 'bank_index.txt' &&
        (file.startsWith('deposit_') ||
         file.startsWith('withdraw_') ||
         file.startsWith('deposit_from_player_') ||
         file.startsWith('pay_to_player_'))
      )
      .sort();

    for (const transactionFile of transactionFiles) {
      try {
        const filePath = path.join(playerTransactionsDir, transactionFile);
        const content = fs.readFileSync(filePath, 'utf-8');
        const transactionData = _parseTransactionFileContent(content);

        // Si el jugador no tiene nombre, usar el de la transacción
        if ((!playersData[guid].username || playersData[guid].username === 'Unknown') && transactionData.playerName) {
          playersData[guid].username = transactionData.playerName;
          console.log(`📝 Nombre actualizado desde transacción: ${transactionData.playerName} (${guid})`);
        }

        const transactionId = `txn_${guid}_${transactionData.type}_${transactionData.number}`;
        const exists = playersData[guid].economy.transactions.some(t => t.id === transactionId);

        if (!exists && transactionData.timestamp > 0) {
          playersData[guid].economy.transactions.push({
            id: transactionId,
            type: transactionData.type,
            amount: transactionData.amount,
            balanceBefore: transactionData.balanceBefore,
            balanceAfter: transactionData.balanceAfter,
            description: transactionData.description,
            date: new Date(transactionData.timestamp).toISOString(),
            timestamp: transactionData.timestamp,
            number: transactionData.number
          });
        }
      } catch (error) {
        console.warn(`⚠️ Error procesando archivo de transacción ${transactionFile}:`, error);
      }
    }

    playersData[guid].economy.transactions.sort((a, b) => b.timestamp - a.timestamp);
    console.log(`💸 Procesadas ${playersData[guid].economy.transactions.length} transacciones para ${playersData[guid].username || guid}`);

  } catch (error) {
    console.warn(`⚠️ Error procesando directorio de transacciones bancarias para ${guid}:`, error);
  }
}

/**
 * Procesa un archivo individual del directorio 'bank'.
 * Esta función LEE y GUARDA el archivo DATA_FILE en cada llamada.
 */
function processBankFile(filePath) {
  const filename = path.basename(filePath, '.txt');
  const guid = filename;

  if (!guid) {
    console.log(`⚠️ Sin GUID en archivo bank: ${path.basename(filePath)}`);
    return;
  }

  let playersData = _loadPlayersData();

  // Crear jugador si no existe
  if (!playersData[guid]) {
    playersData[guid] = {
      username: 'Unknown',
      guid: guid,
      stats: { kills: 0, downs: 0, revives: 0, headshots: 0 },
      maps: {},
      economy: { balance: 0, transactions: [] }
    };
    console.log(`👤 Nuevo (bank): ${guid}`);
  }

  // Leer balance del archivo
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let realBalance = 0;

    for (const line of lines) {
      if (line.includes('Balance:')) {
        realBalance = parseInt(line.split(':')[1].trim()) || 0;
        break;
      }
    }

    if (realBalance > 0) {
      playersData[guid].economy.balance = realBalance;
      console.log(`💰 Balance actualizado: ${playersData[guid].username || guid} - $${realBalance}`);
    }
  } catch (error) {
    console.log(`⚠️ Error leyendo balance de ${path.basename(filePath)}`);
  }

  // Procesar transacciones bancarias
  processBankTransactionsFile(guid, playersData);

  _savePlayersData(playersData);
}

// --- API (No usada por el Watchdog, pero sí por el código original) ---

/**
 * API Endpoint para obtener transacciones bancarias (lógica duplicada del original).
 */
function getBankTransactionsAPI(playerGuid) {
  const playerTransactionsDir = ensurePlayerTransactionDir(playerGuid);

  if (!fs.existsSync(playerTransactionsDir)) {
    return { transactions: [], summary: { totalDeposits: 0, totalWithdrawals: 0, netBalance: 0 } };
  }

  try {
    const transactions = [];
    let totalDeposits = 0;
    let totalWithdrawals = 0;

    const transactionFiles = fs.readdirSync(playerTransactionsDir)
      .filter(file => 
        file.endsWith('.txt') && 
        file !== 'bank_index.txt' &&
        (file.startsWith('deposit_') ||
         file.startsWith('withdraw_') ||
         file.startsWith('deposit_from_player_') ||
         file.startsWith('pay_to_player_'))
      )
      .sort();

    for (const transactionFile of transactionFiles) {
      try {
        const filePath = path.join(playerTransactionsDir, transactionFile);
        const content = fs.readFileSync(filePath, 'utf-8');
        const transactionData = _parseTransactionFileContent(content);

        const transactionId = `txn_${playerGuid}_${transactionData.type}_${transactionData.number}`;

        if (transactionData.timestamp > 0) {
          transactions.push({
            id: transactionId,
            type: transactionData.type,
            amount: transactionData.amount,
            balanceBefore: transactionData.balanceBefore,
            balanceAfter: transactionData.balanceAfter,
            description: transactionData.description,
            date: new Date(transactionData.timestamp).toISOString(),
            timestamp: transactionData.timestamp,
            number: transactionData.number
          });
          
          if (transactionData.type === 'deposit' || transactionData.type === 'deposit_from_player') {
            totalDeposits += transactionData.amount;
          } else if (transactionData.type === 'withdraw' || transactionData.type === 'pay_to_player') {
            totalWithdrawals += transactionData.amount;
          }
        }
      } catch (error) {
        console.warn(`⚠️ Error procesando archivo de transacción ${transactionFile}:`, error);
      }
    }

    transactions.sort((a, b) => b.timestamp - a.timestamp);

    const summary = {
      totalDeposits,
      totalWithdrawals,
      netBalance: totalDeposits - totalWithdrawals,
      transactionCount: transactions.length
    };

    return { transactions, summary };

  } catch (error) {
    console.warn(`⚠️ Error procesando directorio de transacciones bancarias para ${playerGuid}:`, error);
    return { transactions: [], summary: { totalDeposits: 0, totalWithdrawals: 0, netBalance: 0 } };
  }
}

// --- Bloque Principal de Ejecución (Watchdog) ---

function main() {
  console.log('🎯 WATCHDOG COMPLETO - RECENT MATCHES + BANK ACTIVADO');
  console.log(`💾 Data: ${DATA_FILE}`);
  console.log(`📁 Recent: ${RECENT_DIR}`);
  console.log(`📁 Bank: ${BANK_DIR}`);
  console.log(`📁 Bank Transactions: ${BANK_TRANSACTIONS_DIR}`);
  console.log(`📄 Recent JSON: ${RECENT_MATCHES_FILE}`);

  // 1. Crear directorios necesarios
  console.log('\n🏗️ Creando directorios necesarios...');
  const dirsToCreate = [
    PLUTONIUM_BASE_DIR,
    RECENT_DIR,
    BANK_DIR,
    BANK_TRANSACTIONS_DIR,
    DATA_DIR // Directorio 'data' local
  ];
  dirsToCreate.forEach(_ensureDirExists);
  console.log('🏗️ Directorios verificados/creados\n');

  // 2. Procesamiento inicial de archivos de bank existentes
  if (fs.existsSync(BANK_DIR)) {
    const bankFiles = fs.readdirSync(BANK_DIR).filter(file => file.endsWith('.txt'));
    console.log(`\n🔍 Procesando ${bankFiles.length} archivos de bank...`);
    for (const file of bankFiles) {
      processBankFile(path.join(BANK_DIR, file));
    }
    console.log(`✅ Archivos de bank procesados.\n`);
  }

  // 3. Procesamiento inicial desde recent matches
  processRecentMatchesFromDir();

  console.log('\n🚀 Modo: Cambios en tiempo real activado\n');

  // 4. Watchers
  let timer;

  // Función para procesar cambios en el directorio de bank
  function onBankChange(event, filename) {
    if (!filename || !filename.endsWith('.txt')) return;

    console.log(`\n🎯 Archivo bank cambió: ${filename}`);
    clearTimeout(timer);
    timer = setTimeout(() => {
      processBankFile(path.join(BANK_DIR, filename));
      console.log('✅ Archivo bank procesado\n');
    }, WATCHER_DELAY);
  }

  // Función para procesar cambios en el directorio de recent matches
  function onRecentChange(event, filename) {
    if (!filename) return;

    console.log(`🎯 Archivo recent cambió: ${filename}`);
    clearTimeout(timer);
    timer = setTimeout(() => {
      processRecentMatchesFromDir();
      console.log('✅ Recent matches procesados\n');
    }, WATCHER_DELAY);
  }

  // Monitorear directorio de bank
  if (fs.existsSync(BANK_DIR)) {
    fs.watch(BANK_DIR, onBankChange);
    console.log('👁️ Monitoreando banco...');
  }

  // Monitorear directorio de recent matches (recursivo)
  if (fs.existsSync(RECENT_DIR)) {
    fs.watch(RECENT_DIR, { recursive: true }, onRecentChange);
    console.log('👁️ Monitoreando recent matches...');
  }

  // 5. Mensajes finales
  console.log('\n🎉 WATCHDOG COMPLETO LISTO');
  console.log('💡 Lee datos REALES del directorio AppData/Local/Plutonium/');
  console.log('💡 CREA AUTOMÁTICAMENTE las carpetas necesarias');
  console.log('💡 Procesa balances del directorio bank/');
  console.log('💡 Registra transacciones en carpetas organizadas por GUID');
  console.log('💡 Estadísticas se ACUMULAN correctamente');
  console.log('💡 Genera recent_matches.json automáticamente');
  console.log('💡 Monitoreo continuo de cambios');
  console.log('💡 Ctrl+C para detener\n');

  // Mantener vivo
  process.on('SIGINT', () => {
    console.log('\n👋 Watchdog Recent Matches + Bank detenido');
    process.exit(0);
  });
}

// Iniciar el script
main();